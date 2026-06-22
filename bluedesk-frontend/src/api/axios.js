import axios from 'axios';
import { store } from '../store';
import { setAccessToken, setCredentials, logout } from '../store/authSlice';

const API_URL = '/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const state = store.getState().auth;
  if (state.accessToken) {
    config.headers.Authorization = `Bearer ${state.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshFailed = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    refreshFailed = false;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      !refreshFailed
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const { user, accessToken, permissions } = response.data.data;

        refreshFailed = false;
        store.dispatch(setCredentials({ user, accessToken, permissions }));
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        refreshFailed = true;
        processQueue(error, null);
        store.dispatch(logout());
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const silentRefresh = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
    const { user, accessToken, permissions } = response.data.data;
    store.dispatch(setCredentials({ user, accessToken, permissions }));
    refreshFailed = false;
    return true;
  } catch {
    store.dispatch(logout());
    return false;
  }
};

export default axiosInstance;
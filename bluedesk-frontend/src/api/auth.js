import axiosInstance from './axios';

export const loginApi = (credentials) => axiosInstance.post('/auth/login', credentials);
export const refreshTokenApi = () => axiosInstance.post('/auth/refresh-token', {}, { withCredentials: true });
export const logoutApi = () => axiosInstance.post('/auth/logout', {}, { withCredentials: true });
export const getProfileApi = () => axiosInstance.get('/auth/profile');
export const changePasswordApi = (data) => axiosInstance.post('/auth/change-password', data);

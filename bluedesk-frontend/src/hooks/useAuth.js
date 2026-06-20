import { useSelector, useDispatch } from 'react-redux';
import { setCredentials, logout as logoutAction, selectAuth } from '../store/authSlice';
import { loginApi } from '../api/auth';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);

  const login = async (email, password) => {
    const response = await loginApi({ email, password });
    const { user, accessToken } = response.data.data;
    dispatch(setCredentials({ user, accessToken }));
    return response.data;
  };

  const logout = () => {
    axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
    dispatch(logoutAction());
  };

  return { user: auth.user, isAuthenticated: auth.isAuthenticated, accessToken: auth.accessToken, login, logout };
};
import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
  try { return JSON.parse(sessionStorage.getItem('bluedesk-user') || 'null'); } catch { return null; }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStoredUser(),
    accessToken: null,
    isAuthenticated: !!getStoredUser(),
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, permissions } = action.payload;
      state.user = { ...user, permissions };
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      sessionStorage.setItem('bluedesk-user', JSON.stringify(state.user));
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('bluedesk-user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      sessionStorage.setItem('bluedesk-user', JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, setAccessToken, logout, updateUser } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export default authSlice.reducer;
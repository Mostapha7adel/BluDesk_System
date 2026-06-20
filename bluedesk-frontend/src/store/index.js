import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import directionReducer from './directionSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    direction: directionReducer,
    auth: authReducer,
  },
});

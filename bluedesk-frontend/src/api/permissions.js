import axiosInstance from './axios';

export const getPermissionsApi = (params) => axiosInstance.get('/permissions', { params });

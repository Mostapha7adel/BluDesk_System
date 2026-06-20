import axiosInstance from './axios';

export const getUsersApi = (params) => axiosInstance.get('/users', { params });
export const getUserApi = (id) => axiosInstance.get(`/users/${id}`);
export const createUserApi = (data) => axiosInstance.post('/users', data);
export const updateUserApi = (id, data) => axiosInstance.put(`/users/${id}`, data);
export const deleteUserApi = (id) => axiosInstance.delete(`/users/${id}`);
export const restoreUserApi = (id) => axiosInstance.put(`/users/${id}/restore`);

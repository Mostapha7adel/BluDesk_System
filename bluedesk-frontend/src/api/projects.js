import axiosInstance from './axios';

export const getProjectsApi = (params) => axiosInstance.get('/projects', { params });
export const getProjectApi = (id) => axiosInstance.get(`/projects/${id}`);
export const createProjectApi = (data) => axiosInstance.post('/projects', data);
export const updateProjectApi = (id, data) => axiosInstance.put(`/projects/${id}`, data);
export const deleteProjectApi = (id) => axiosInstance.delete(`/projects/${id}`);
export const getProjectStatusHistoryApi = (id) => axiosInstance.get(`/projects/${id}/status-history`);

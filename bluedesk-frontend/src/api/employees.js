import axiosInstance from './axios';

export const getEmployeesApi = (params) => axiosInstance.get('/employees', { params });
export const getEmployeeApi = (id) => axiosInstance.get(`/employees/${id}`);
export const createEmployeeApi = (data) =>
  data instanceof FormData
    ? axiosInstance.post('/employees', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : axiosInstance.post('/employees', data);
export const updateEmployeeApi = (id, data) =>
  data instanceof FormData
    ? axiosInstance.put(`/employees/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : axiosInstance.put(`/employees/${id}`, data);
export const deleteEmployeeApi = (id) => axiosInstance.delete(`/employees/${id}`);
export const archiveEmployeeApi = (id) => axiosInstance.put(`/employees/${id}/archive`);
export const restoreEmployeeApi = (id) => axiosInstance.put(`/employees/${id}/restore`);

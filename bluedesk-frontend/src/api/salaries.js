import axiosInstance from './axios';

export const getSalariesApi = (params) => axiosInstance.get('/salaries', { params });
export const getSalaryApi = (id) => axiosInstance.get(`/salaries/${id}`);
export const createSalaryApi = (data) => axiosInstance.post('/salaries', data);
export const approveSalaryApi = (id, notes) => axiosInstance.put(`/salaries/${id}/approve`, { notes });
export const paySalaryApi = (id, notes) => axiosInstance.put(`/salaries/${id}/pay`, { notes });
export const cancelSalaryApi = (id, notes) => axiosInstance.put(`/salaries/${id}/cancel`, { notes });
export const updateSalaryApi = (id, data) => axiosInstance.put(`/salaries/${id}`, data);
export const getPendingSalariesApi = () => axiosInstance.get('/salaries/pending');

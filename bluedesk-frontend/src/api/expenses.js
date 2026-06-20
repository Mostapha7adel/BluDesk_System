import axiosInstance from './axios';

export const getExpensesApi = (params) => axiosInstance.get('/expenses', { params });
export const getExpenseApi = (id) => axiosInstance.get(`/expenses/${id}`);
export const createExpenseApi = (data) => axiosInstance.post('/expenses', data);
export const updateExpenseApi = (id, data) => axiosInstance.put(`/expenses/${id}`, data);
export const deleteExpenseApi = (id) => axiosInstance.delete(`/expenses/${id}`);
export const getMonthlyReportApi = (params) => axiosInstance.get('/expenses/reports/monthly', { params });

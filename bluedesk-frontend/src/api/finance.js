import axiosInstance from './axios';

export const getTreasuriesApi = (params) => axiosInstance.get('/finance/treasuries', { params });
export const getTreasuryApi = (id) => axiosInstance.get(`/finance/treasuries/${id}`);
export const createTreasuryApi = (data) => axiosInstance.post('/finance/treasuries', data);
export const updateTreasuryApi = (id, data) => axiosInstance.put(`/finance/treasuries/${id}`, data);
export const getTransactionsApi = (params) => axiosInstance.get('/finance/transactions', { params });
export const createTransactionApi = (data) => axiosInstance.post('/finance/transactions', data);
export const getFinancialReportApi = (params) => axiosInstance.get('/finance/reports', { params });
export const cancelTransactionApi  = (id)     => axiosInstance.put(`/finance/transactions/${id}/cancel`);
export const updateTransactionApi  = (id, data) => axiosInstance.put(`/finance/transactions/${id}`, data);

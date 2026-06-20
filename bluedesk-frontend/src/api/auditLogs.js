import axiosInstance from './axios';

export const getAuditLogsApi = (params) => axiosInstance.get('/audit-logs', { params });
export const getAuditLogApi = (id) => axiosInstance.get(`/audit-logs/${id}`);

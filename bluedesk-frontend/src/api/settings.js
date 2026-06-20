import axiosInstance from './axios';

export const getSystemHealthApi = () => axiosInstance.get('/settings/system-health');
export const createBackupApi = () => axiosInstance.get('/settings/backup', { responseType: 'blob' });

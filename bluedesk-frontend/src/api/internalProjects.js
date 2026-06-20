import axiosInstance from './axios';

export const getInternalProjectsApi = (params) => axiosInstance.get('/internal-projects', { params });
export const getInternalProjectApi = (id) => axiosInstance.get(`/internal-projects/${id}`);
export const createInternalProjectApi = (data) => axiosInstance.post('/internal-projects', data);
export const updateInternalProjectApi = (id, data) => axiosInstance.put(`/internal-projects/${id}`, data);
export const deleteInternalProjectApi = (id) => axiosInstance.delete(`/internal-projects/${id}`);
export const addNoteApi = (id, content) => axiosInstance.post(`/internal-projects/${id}/notes`, { content });
export const addTeamMemberApi = (id, data) => axiosInstance.post(`/internal-projects/${id}/team-members`, data);
export const removeTeamMemberApi = (id, memberId) => axiosInstance.delete(`/internal-projects/${id}/team-members/${memberId}`);

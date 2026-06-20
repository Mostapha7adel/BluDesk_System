import axiosInstance from './axios';

export const getRolesApi = (params) => axiosInstance.get('/roles', { params });
export const getRoleApi = (id) => axiosInstance.get(`/roles/${id}`);
export const createRoleApi = (data) => axiosInstance.post('/roles', data);
export const updateRoleApi = (id, data) => axiosInstance.put(`/roles/${id}`, data);
export const deleteRoleApi = (id) => axiosInstance.delete(`/roles/${id}`);
export const getRolePermissionsApi = (id) => axiosInstance.get(`/roles/${id}/permissions`);
export const assignPermissionsApi = (id, permissionIds) => axiosInstance.put(`/roles/${id}/permissions`, { permissionIds });
export const removePermissionApi = (roleId, permissionId) => axiosInstance.delete(`/roles/${roleId}/permissions/${permissionId}`);

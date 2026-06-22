import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployeesApi, createEmployeeApi, updateEmployeeApi, deleteEmployeeApi, archiveEmployeeApi, restoreEmployeeApi } from '../../api/employees';
import { getProjectsApi, createProjectApi, updateProjectApi, deleteProjectApi } from '../../api/projects';
import { getInternalProjectsApi, createInternalProjectApi, updateInternalProjectApi, deleteInternalProjectApi } from '../../api/internalProjects';
import { getTreasuriesApi, createTreasuryApi, getTransactionsApi, createTransactionApi, getFinancialReportApi, cancelTransactionApi, updateTransactionApi } from '../../api/finance';
import { getRolesApi, getRolePermissionsApi, assignPermissionsApi, removePermissionApi, deleteRoleApi, createRoleApi } from '../../api/roles';
import { getPermissionsApi } from '../../api/permissions';
import { getAuditLogsApi } from '../../api/auditLogs';
import { getProfileApi } from '../../api/auth';
import { getSalariesApi, createSalaryApi, approveSalaryApi, paySalaryApi, cancelSalaryApi, updateSalaryApi, getPendingSalariesApi } from '../../api/salaries';
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi } from '../../api/users';
import { getSystemHealthApi, createBackupApi } from '../../api/settings';
import { getExpensesApi, getMonthlyReportApi } from '../../api/expenses';

const unwrapData = (res) => res.data.data;
const unwrapPaginated = (res) => ({ data: res.data.data, pagination: res.data.pagination, summary: res.data.summary });

export function useEmployees(params) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployeesApi(params).then(unwrapPaginated),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createEmployeeApi(data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateEmployeeApi(id, data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteEmployeeApi(id).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useArchiveEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => archiveEmployeeApi(id).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useRestoreEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreEmployeeApi(id).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useProjects(params) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjectsApi(params).then(unwrapPaginated),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createProjectApi(data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProjectApi(id, data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteProjectApi(id).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useInternalProjects(params) {
  return useQuery({
    queryKey: ['internalProjects', params],
    queryFn: () => getInternalProjectsApi(params).then(unwrapPaginated),
  });
}

export function useCreateInternalProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createInternalProjectApi(data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internalProjects'] }),
  });
}

export function useUpdateInternalProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateInternalProjectApi(id, data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internalProjects'] }),
  });
}

export function useDeleteInternalProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteInternalProjectApi(id).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internalProjects'] }),
  });
}

export function useTreasuries(params) {
  return useQuery({
    queryKey: ['treasuries', params],
    queryFn: () => getTreasuriesApi(params).then(unwrapPaginated),
  });
}

export function useCreateTreasury() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createTreasuryApi(data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['treasuries'] }),
  });
}

export function useTransactions(params) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactionsApi(params).then(unwrapPaginated),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createTransactionApi(data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTransactionApi(id, data).then(unwrapData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['financialReport'] });
    },
  });
}

export function useCancelTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelTransactionApi(id).then(unwrapData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['financialReport'] });
    },
  });
}

export function useFinancialReport(params) {
  return useQuery({
    queryKey: ['financialReport', params],
    queryFn: () => getFinancialReportApi(params).then(unwrapData),
  });
}

export function useRoles(params) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => getRolesApi(params).then(unwrapPaginated),
  });
}

export function useRolePermissions(roleId) {
  return useQuery({
    queryKey: ['rolePermissions', roleId],
    queryFn: () => getRolePermissionsApi(roleId).then(unwrapData),
    enabled: !!roleId,
  });
}

export function useAssignPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissionIds }) => assignPermissionsApi(id, permissionIds).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rolePermissions'] }),
  });
}

export function useRemovePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionId }) => removePermissionApi(roleId, permissionId).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rolePermissions'] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteRoleApi(id).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => getPermissionsApi().then(unwrapData),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createRoleApi(data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useAuditLogs(params) {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => getAuditLogsApi(params).then(unwrapPaginated),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfileApi().then(unwrapData),
  });
}

export function useSalaries(params) {
  return useQuery({
    queryKey: ['salaries', params],
    queryFn: () => getSalariesApi(params).then(unwrapPaginated),
  });
}

export function useCreateSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createSalaryApi(data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salaries'] }),
  });
}

export function useApproveSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }) => approveSalaryApi(id, notes).then(unwrapData),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salaries'] }); qc.invalidateQueries({ queryKey: ['pendingSalaries'] }); },
  });
}

export function usePaySalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }) => paySalaryApi(id, notes).then(unwrapData),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salaries'] }); qc.invalidateQueries({ queryKey: ['pendingSalaries'] }); },
  });
}

export function useUpdateSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSalaryApi(id, data).then(unwrapData),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salaries'] }); },
  });
}

export function useCancelSalary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }) => cancelSalaryApi(id, notes).then(unwrapData),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['salaries'] }); qc.invalidateQueries({ queryKey: ['pendingSalaries'] }); qc.invalidateQueries({ queryKey: ['transactions'] }); qc.invalidateQueries({ queryKey: ['financialReport'] }); },
  });
}

export function usePendingSalaries() {
  return useQuery({
    queryKey: ['pendingSalaries'],
    queryFn: () => getPendingSalariesApi().then(unwrapData),
  });
}

export function useUsers(params) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsersApi(params).then(unwrapPaginated),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createUserApi(data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updateUserApi(id, data).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUserApi(id).then(unwrapData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: () => getSystemHealthApi().then(unwrapData),
    refetchInterval: 30000,
  });
}

export function useCreateBackup() {
  return useMutation({
    mutationFn: () => createBackupApi(),
  });
}

export function useExpenses(params) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => getExpensesApi(params).then(unwrapPaginated),
  });
}

export function useMonthlyReport(params) {
  return useQuery({
    queryKey: ['monthlyReport', params],
    queryFn: () => getMonthlyReportApi(params).then(unwrapData),
  });
}

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack, MenuItem, Avatar, Chip, Alert, IconButton, Switch, FormControlLabel } from '@mui/material';
import { Shield, UserPlus, Edit2, Trash2, Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/tables/DataTable';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { useRoles, usePermissions, useRolePermissions, useUsers, useCreateUser, useUpdateUser, useDeleteUser, useAssignPermissions, useRemovePermission } from '../../hooks/api';
import useTranslate from '../../utils/useTranslate';

export default function Permissions() {
  const t = useTranslate();
  const user = useSelector(selectUser);
  const perms = user?.permissions || [];
  const isSuperAdmin = user?.role?.slug === 'super_admin';
  const canCreateUser = isSuperAdmin || perms.includes('users.create');
  const canUpdateUser = isSuperAdmin || perms.includes('users.update');
  const canDeleteUser = isSuperAdmin || perms.includes('users.delete');
  const canAssignPerms = isSuperAdmin || perms.includes('permissions.assign');
  const [tab, setTab] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { document.title = t('roles.title'); }, [t]);

  const { data: rolesData } = useRoles({ limit: 100 });
  const { data: permsData } = usePermissions();
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 100 });
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const roles = rolesData?.data || [];
  const allPermissions = permsData?.data || [];
  const users = usersData?.data || [];

  const selectedRoleObj = selectedRole || roles[0];
  const selectedRoleId = selectedRoleObj?.id;

  const { data: rolePerms, refetch: refetchRolePerms } = useRolePermissions(selectedRoleId);
  const assignPermsMutation = useAssignPermissions();
  const removePermMutation = useRemovePermission();

  const assignedSlugs = new Set((rolePerms || []).map(p => p.slug));
  const [localAssigned, setLocalAssigned] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalAssigned({});
    setHasChanges(false);
  }, [selectedRoleId]);

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) setSelectedRole(roles[0]);
  }, [roles, selectedRole]);

  const permissionGroups = {};
  allPermissions.forEach((p) => {
    if (!permissionGroups[p.group]) permissionGroups[p.group] = [];
    permissionGroups[p.group].push(p);
  });

  const isPermissionChecked = (slug) => {
    if (slug in localAssigned) return localAssigned[slug];
    return assignedSlugs.has(slug);
  };

  const handleTogglePermission = (slug) => {
    setLocalAssigned((prev) => ({ ...prev, [slug]: !isPermissionChecked(slug) }));
    setHasChanges(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    const permIdsToAdd = [];
    const permIdsToRemove = [];
    for (const perm of allPermissions) {
      const wasAssigned = assignedSlugs.has(perm.slug);
      const nowAssigned = isPermissionChecked(perm.slug);
      if (!wasAssigned && nowAssigned) permIdsToAdd.push(perm.id);
      if (wasAssigned && !nowAssigned) permIdsToRemove.push(perm.id);
    }
    try {
      if (permIdsToAdd.length > 0) {
        await assignPermsMutation.mutateAsync({ id: selectedRoleId, permissionIds: permIdsToAdd });
      }
      for (const permId of permIdsToRemove) {
        await removePermMutation.mutateAsync({ roleId: selectedRoleId, permissionId: permId });
      }
      setLocalAssigned({});
      setHasChanges(false);
      refetchRolePerms();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const userColumns = [
    {
      key: 'user', label: t('employees.name'), render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 600 }}>{row.name?.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
          </Box>
        </Box>
      )
    },
    { key: 'role', label: t('roles.role'), render: (row) => <Chip label={row.role?.name} size="small" variant="outlined" /> },
    { key: 'phone', label: t('employees.phone'), render: (row) => row.phone || '—' },
    {
      key: 'status', label: t('common.status'), render: (row) => (
        <Chip label={row.status} size="small" color={row.status === 'ACTIVE' ? 'success' : row.status === 'INACTIVE' ? 'default' : 'warning'} />
      )
    },
    ...((canUpdateUser || canDeleteUser) ? [{
      key: 'actions', label: '', render: (row) => (
        <Stack direction="row" spacing={0.5}>
          {canUpdateUser && <IconButton size="small" onClick={() => { setEditUser(row); setOpenDialog(true); }}><Edit2 size={14} /></IconButton>}
          {canDeleteUser && <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><Trash2 size={14} /></IconButton>}
        </Stack>
      )
    }] : []),
  ];

  const handleSubmit = async (form) => {
    setError('');
    if (!form.name || !form.email || !form.roleId) {
      setError(t('common.requiredFields'));
      return;
    }
    try {
      if (editUser) {
        const payload = { name: form.name, email: form.email, phone: form.phone || '', roleId: parseInt(form.roleId), status: form.status };
        if (form.password) payload.password = form.password;
        await updateUserMutation.mutateAsync({ id: editUser.id, ...payload });
      } else {
        if (!form.password) { setError(t('common.requiredFields')); return; }
        await createUserMutation.mutateAsync({ name: form.name, email: form.email, password: form.password, phone: form.phone || '', roleId: parseInt(form.roleId) });
      }
      setOpenDialog(false);
      setEditUser(null);
    } catch (err) {
      const errData = err?.response?.data;
      if (errData?.errors?.length) {
        setError(errData.errors.map(e => e.message).join(' • '));
      } else {
        setError(errData?.message || err?.message || t('common.error'));
      }
    }
  };

  return (
    <Box>
      <PageHeader title={t('roles.title')} subtitle={t('roles.subtitle')} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        {roles.map((role) => (
          <Box
            key={role.id}
            onClick={() => setSelectedRole(role)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRole(role); }}
            role="button"
            tabIndex={0}
            sx={{
              flex: '1 1 120px', p: 2, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
              border: selectedRoleObj?.id === role.id ? 2 : 1,
              borderColor: selectedRoleObj?.id === role.id ? 'primary.main' : 'divider',
              transition: 'all 0.2s',
              bgcolor: selectedRoleObj?.id === role.id ? 'action.selected' : 'background.paper',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: (theme) => `0 8px 25px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}` },
            }}
          >
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
              <Shield size={18} color="white" />
            </Box>
            <Typography variant="body2" fontWeight={600}>{role.name}</Typography>
            <Typography variant="caption" color="text.secondary">{role._count?.users || 0} {t('roles.usersCount')}</Typography>
          </Box>
        ))}
      </Box>

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={t('roles.permissions')} />
          <Tab label={t('roles.users')} />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                {selectedRoleObj?.name} — {t('roles.permissions')}
              </Typography>
              {hasChanges && canAssignPerms && (
                <Button variant="contained" size="small" startIcon={<Save size={16} />} sx={{ borderRadius: 2 }} onClick={handleSavePermissions}>
                  {t('common.save')}
                </Button>
              )}
            </Box>
            {error && <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error}</Alert>}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Stack spacing={2.5}>
                {Object.entries(permissionGroups).map(([group, perms]) => (
                  <Box key={group}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t(`permissions.${group}Group`) || group}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {perms.map(p => (
                        <Chip
                          key={p.id}
                          label={p.name}
                          size="small"
                          color={isPermissionChecked(p.slug) ? 'success' : 'default'}
                          variant={isPermissionChecked(p.slug) ? 'filled' : 'outlined'}
                          onClick={() => handleTogglePermission(p.slug)}
                          sx={{ cursor: 'pointer', fontWeight: 500, '&:hover': { opacity: 0.8 } }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pt: 2 }}>
              {canCreateUser && <Button variant="contained" size="small" startIcon={<UserPlus size={16} />} sx={{ borderRadius: 2 }} onClick={() => { setEditUser(null); setOpenDialog(true); }}>{t('users.addUser')}</Button>}
            </Box>
            <DataTable columns={userColumns} data={users} loading={usersLoading} />
          </Box>
        )}
      </Paper>

      <UserDialog open={openDialog} onClose={() => { setOpenDialog(false); setEditUser(null); setError(''); }} t={t} roles={roles} editUser={editUser} onSubmit={handleSubmit} error={error} />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">{t('users.deleteConfirm').replace('{name}', deleteTarget?.name || '')}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" sx={{ borderRadius: 2 }} onClick={() => { deleteUserMutation.mutate(deleteTarget.id, { onError: () => {} }); setDeleteTarget(null); }}>{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function UserDialog({ open, onClose, t, roles, editUser, onSubmit, error }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', roleId: roles[0]?.id || '', status: 'ACTIVE' });
  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  useEffect(() => {
    if (open) {
      if (editUser) {
        setForm({ name: editUser.name || '', email: editUser.email || '', password: '', phone: editUser.phone || '', roleId: editUser.roleId || roles[0]?.id || '', status: editUser.status || 'ACTIVE' });
      } else {
        setForm({ name: '', email: '', password: '', phone: '', roleId: roles[0]?.id || '', status: 'ACTIVE' });
      }
    }
  }, [open, editUser, roles]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{editUser ? t('users.editUser') : t('users.addUser')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('employees.name')} size="small" fullWidth value={form.name} onChange={handleChange('name')} />
            <TextField label={t('employees.email')} type="email" size="small" fullWidth value={form.email} onChange={handleChange('email')} />
          </Box>
          <TextField label={t('employees.phone')} size="small" fullWidth value={form.phone} onChange={handleChange('phone')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('auth.password')} type="password" size="small" fullWidth value={form.password} onChange={handleChange('password')} helperText={editUser ? t('users.passwordHelper') : t('auth.passwordRequirements')} />
            <TextField label={t('roles.role')} select size="small" fullWidth value={form.roleId} onChange={handleChange('roleId')}>
              {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </TextField>
          </Box>
          {editUser && (
            <TextField label={t('common.status')} select size="small" fullWidth value={form.status} onChange={handleChange('status')}>
              <MenuItem value="ACTIVE">{t('common.active')}</MenuItem>
              <MenuItem value="INACTIVE">{t('common.inactive')}</MenuItem>
            </TextField>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" sx={{ borderRadius: 2 }} onClick={() => onSubmit(form)}>{editUser ? t('common.update') : t('common.create')}</Button>
      </DialogActions>
    </Dialog>
  );
}

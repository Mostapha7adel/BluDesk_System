import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack, MenuItem, Avatar, Chip, Alert, IconButton } from '@mui/material';
import { Shield, Plus, Check, X, UserPlus, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/tables/DataTable';
import { useRoles, usePermissions, useRolePermissions, useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/api';
import useTranslate from '../../utils/useTranslate';

export default function Permissions() {
  const t = useTranslate();
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

  const { data: rolePerms } = useRolePermissions(selectedRoleId);
  const assignedSlugs = new Set((rolePerms || []).map(p => p.slug));

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) setSelectedRole(roles[0]);
  }, [roles, selectedRole]);

  const permissionGroups = {};
  allPermissions.forEach((p) => {
    if (!permissionGroups[p.group]) permissionGroups[p.group] = [];
    permissionGroups[p.group].push(p);
  });

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
    {
      key: 'actions', label: '', render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => { setEditUser(row); setOpenDialog(true); }}><Edit2 size={14} /></IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><Trash2 size={14} /></IconButton>
        </Stack>
      )
    },
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
              transition: 'all 0.2s', bgcolor: 'background.paper',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' },
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
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textTransform: 'capitalize' }}>
              {selectedRoleObj?.name} {t('roles.permissions')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('common.total')}</TableCell>
                    {allPermissions.map((perm) => (
                      <TableCell key={perm.id} sx={{ fontWeight: 600, textAlign: 'center', fontSize: 11 }}>{perm.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(permissionGroups).map(([group, perms]) => (
                    <TableRow key={group}>
                      <TableCell sx={{ fontWeight: 500 }}>{t(`permissions.${group}Group`) || group}</TableCell>
                      {allPermissions.map((perm) => (
                        <TableCell key={perm.id} sx={{ textAlign: 'center' }}>
                          {perms.some(p => p.id === perm.id) ? (
                            assignedSlugs.has(perm.slug) ? <Check size={16} color="#10B981" style={{ display: 'inline' }} /> : <X size={16} color="#CBD5E1" style={{ display: 'inline', opacity: 0.3 }} />
                          ) : <span style={{ opacity: 0.1 }}>—</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 3, pt: 2 }}>
              <Button variant="contained" size="small" startIcon={<UserPlus size={16} />} sx={{ borderRadius: 2 }} onClick={() => { setEditUser(null); setOpenDialog(true); }}>{t('users.addUser')}</Button>
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
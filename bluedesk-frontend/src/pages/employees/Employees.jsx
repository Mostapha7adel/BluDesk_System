import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Avatar, IconButton, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Stack, ToggleButtonGroup, ToggleButton, Alert, Badge
} from '@mui/material';
import { Edit2, Trash2, LayoutGrid, List, UserPlus, Users, UserCheck, UserX, Briefcase, Camera } from 'lucide-react';
import { Container as Grid, Item as GridItem } from '../../components/ui/Grid';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable from '../../components/tables/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, formatCurrency } from '../../utils/format';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../../hooks/api';
import useTranslate from '../../utils/useTranslate';

import axios from '../../api/axios';
const API_BASE = axios.defaults.baseURL?.replace('/api/v1', '') || 'http://localhost:5000';

export default function Employees() {
  const t = useTranslate();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { document.title = t('employees.title'); }, [t]);

  const { data, isLoading } = useEmployees({ page, limit: 10, search });
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const employees = data?.data || [];
  const pagination = data?.pagination || {};

  const imgUrl = (img) => img ? `${API_BASE}/uploads/${img}` : null;

  const columns = [
    { key: 'name', label: t('employees.name'), render: (row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src={imgUrl(row.image)} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 12, fontWeight: 600 }}>{(row.name || 'U').charAt(0)}</Avatar>
        <Box><Typography variant="body2" fontWeight={500}>{row.name}</Typography><Typography variant="caption" color="text.secondary">{row.employeeNumber}</Typography></Box>
      </Box>
    )},
    { key: 'nationalId', label: t('employees.nationalId') },
    { key: 'position', label: t('employees.position') },
    { key: 'department', label: t('employees.department') },
    { key: 'email', label: t('employees.email') },
    { key: 'salary', label: t('employees.salary'), render: (row) => formatCurrency(parseFloat(row.salary || 0)) },
    { key: 'hireDate', label: t('employees.hireDate'), render: (row) => formatDate(row.hireDate) },
    { key: 'status', label: t('common.status'), render: (row) => <StatusBadge status={row.status} /> },
    { key: 'actions', label: '', render: (row) => (
      <Stack direction="row" spacing={0.5}>
        <IconButton size="small" onClick={() => { setEditEmployee(row); setOpenDialog(true); }}><Edit2 size={14} /></IconButton>
        <IconButton size="small" color="error" onClick={() => {
          if (window.confirm(t('common.confirmDelete'))) {
            deleteMutation.mutate(row.id, { onError: () => {} });
          }
        }}><Trash2 size={14} /></IconButton>
      </Stack>
    )},
  ];

  const handleSubmit = async (form) => {
    setError('');
    if (!form.name || !form.employeeNumber || !form.position || !form.department || !form.salary || !form.hireDate) {
      setError(t('common.requiredFields'));
      return;
    }
    const fd = new FormData();
    if (form.imageFile) fd.append('image', form.imageFile);
    fd.append('employeeNumber', form.employeeNumber);
    fd.append('nationalId', form.nationalId || '');
    fd.append('name', form.name);
    fd.append('email', form.email || '');
    fd.append('phone', form.phone || '');
    fd.append('position', form.position);
    fd.append('department', form.department);
    fd.append('salary', String(parseFloat(form.salary)));
    fd.append('hireDate', `${form.hireDate}T00:00:00.000Z`);
    fd.append('status', form.status || 'ACTIVE');
    try {
      if (editEmployee) {
        await updateMutation.mutateAsync({ id: editEmployee.id, data: fd });
      } else {
        await createMutation.mutateAsync(fd);
      }
      setOpenDialog(false);
      setEditEmployee(null);
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
      <PageHeader title={t('employees.title')} subtitle={`${pagination.total || employees.length} ${t('employees.total')}`} actionLabel={t('employees.addEmployee')} onAction={() => { setEditEmployee(null); setOpenDialog(true); }} actionIcon={UserPlus} />

      <Grid spacing={2.5} sx={{ mb: 3 }}>
        <GridItem xs={6} sm={3}><StatCard title={t('common.total')} value={pagination.total || employees.length} icon={Users} color="primary" /></GridItem>
        <GridItem xs={6} sm={3}><StatCard title={t('common.active')} value={employees.filter(e => e.status === 'ACTIVE').length} icon={UserCheck} color="success" /></GridItem>
        <GridItem xs={6} sm={3}><StatCard title={t('employees.onLeave')} value={employees.filter(e => e.status === 'ON_LEAVE').length} icon={Briefcase} color="warning" /></GridItem>
        <GridItem xs={6} sm={3}><StatCard title={t('employees.departments')} value={new Set(employees.map(e => e.department)).size} icon={UserX} color="info" /></GridItem>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, gap: 2, flexWrap: 'wrap' }}>
        <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t('employees.search')} />
        <ToggleButtonGroup value={view} exclusive onChange={(e, v) => v && setView(v)} size="small">
          <ToggleButton value="grid"><LayoutGrid size={16} /></ToggleButton>
          <ToggleButton value="list"><List size={16} /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Typography color="text.secondary">{t('common.loading')}</Typography>
      ) : view === 'grid' ? (
        employees.length === 0 ? (
          <EmptyState title={t('employees.noResults')} description={t('common.noData')} />
        ) : (
          <Grid spacing={2}>
            {employees.map((emp) => (
              <GridItem xs={12} sm={6} md={4} lg={3} key={emp.id}>
                <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' } }}>
                  <Avatar src={imgUrl(emp.image)} sx={{ width: 56, height: 56, mx: 'auto', mb: 1.5, bgcolor: 'primary.main', fontSize: 20, fontWeight: 600 }}>{(emp.name || 'U').charAt(0)}</Avatar>
                  <Typography variant="body1" fontWeight={600}>{emp.name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>{emp.position}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>{emp.department}</Typography>
                  <StatusBadge status={emp.status} size="small" />
                  <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => { setEditEmployee(emp); setOpenDialog(true); }}><Edit2 size={14} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                      if (window.confirm(t('common.confirmDelete'))) {
                        deleteMutation.mutate(emp.id, { onError: () => {} });
                      }
                    }}><Trash2 size={14} /></IconButton>
                  </Box>
                </Paper>
              </GridItem>
            ))}
          </Grid>
        )
      ) : (
        <DataTable columns={columns} data={employees} page={page} rowsPerPage={10} total={pagination.total || employees.length} onPageChange={setPage} loading={isLoading} />
      )}

      <EmployeeDialog open={openDialog} onClose={() => { setOpenDialog(false); setEditEmployee(null); setError(''); }} edit={editEmployee} t={t} onSubmit={handleSubmit} error={error} />
    </Box>
  );
}

function EmployeeDialog({ open, onClose, edit, t, onSubmit, error }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState({ employeeNumber: '', nationalId: '', name: '', email: '', phone: '', position: '', department: '', salary: '', hireDate: '', status: 'ACTIVE', imageFile: null, preview: null });
  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  useEffect(() => {
    if (edit) {
      setForm({
        employeeNumber: edit.employeeNumber || '',
        nationalId: edit.nationalId || '',
        name: edit.name || '',
        email: edit.email || '',
        phone: edit.phone || '',
        position: edit.position || '',
        department: edit.department || '',
        salary: edit.salary ? String(edit.salary) : '',
        hireDate: edit.hireDate ? edit.hireDate.slice(0, 10) : '',
        status: edit.status || 'ACTIVE',
        imageFile: null,
        preview: edit.image ? `${API_BASE}/uploads/${edit.image}` : null,
      });
    } else {
      setForm({ employeeNumber: '', nationalId: '', name: '', email: '', phone: '', position: '', department: '', salary: '', hireDate: '', status: 'ACTIVE', imageFile: null, preview: null });
    }
  }, [edit, open]);

  useEffect(() => {
    return () => { if (form.preview?.startsWith('blob:')) URL.revokeObjectURL(form.preview); };
  }, [form.preview]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (form.preview?.startsWith('blob:')) URL.revokeObjectURL(form.preview);
      setForm({ ...form, imageFile: file, preview: URL.createObjectURL(file) });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{edit ? t('employees.editEmployee') : t('employees.addEmployee')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  onClick={() => fileRef.current?.click()}
                  sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Camera size={16} color="white" />
                </Box>
              }
            >
              <Avatar src={form.preview} sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 28, fontWeight: 600 }}>
                {form.name?.charAt(0) || 'U'}
              </Avatar>
            </Badge>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('employees.employeeNumber')} size="small" fullWidth value={form.employeeNumber} onChange={handleChange('employeeNumber')} />
            <TextField label={t('employees.nationalId')} size="small" fullWidth value={form.nationalId} onChange={handleChange('nationalId')} />
          </Box>
          <TextField label={t('employees.name')} size="small" fullWidth value={form.name} onChange={handleChange('name')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('employees.email')} size="small" fullWidth value={form.email} onChange={handleChange('email')} />
            <TextField label={t('employees.phone')} size="small" fullWidth value={form.phone} onChange={handleChange('phone')} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('employees.position')} size="small" fullWidth value={form.position} onChange={handleChange('position')} />
            <TextField label={t('employees.department')} size="small" fullWidth value={form.department} onChange={handleChange('department')} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('employees.salary')} type="number" size="small" fullWidth value={form.salary} onChange={handleChange('salary')} />
            <TextField label={t('employees.hireDate')} type="date" size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.hireDate} onChange={handleChange('hireDate')} />
          </Box>
          <TextField label={t('common.status')} select size="small" fullWidth value={form.status} onChange={handleChange('status')}>
            {['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'].map((s) => <MenuItem key={s} value={s}>{t('statuses.' + s) || s}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" sx={{ borderRadius: 2 }} onClick={() => onSubmit(form)}>{edit ? t('common.update') : t('common.create')}</Button>
      </DialogActions>
    </Dialog>
  );
}
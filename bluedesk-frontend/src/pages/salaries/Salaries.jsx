import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, MenuItem, TextField, Avatar, Alert, IconButton
} from '@mui/material';
import { Plus, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import { Container as Grid, Item as GridItem } from '../../components/ui/Grid';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { useSalaries, useCreateSalary, useApproveSalary, usePaySalary, useCancelSalary, usePendingSalaries, useEmployees, useUpdateSalary } from '../../hooks/api';
import useTranslate from '../../utils/useTranslate';

import axios from '../../api/axios';
const API_BASE = axios.defaults.baseURL?.replace('/api/v1', '') || '';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function Salaries() {
  const t = useTranslate();
  const user = useSelector(selectUser);
  const perms = user?.permissions || [];
  const isSuperAdmin = user?.role?.slug === 'super_admin';
  const canCreate = isSuperAdmin || perms.includes('salaries.create');
  const canApprove = isSuperAdmin || perms.includes('salaries.approve');
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { document.title = t('salaries.title'); }, [t]);

  const { data, isLoading } = useSalaries({ page, limit: 50 });
  const { data: employeesData } = useEmployees({ limit: 100 });
  const { data: pendingData } = usePendingSalaries();
  const createMutation = useCreateSalary();
  const updateMutation = useUpdateSalary();
  const approveMutation = useApproveSalary();
  const payMutation = usePaySalary();
  const cancelMutation = useCancelSalary();

  const salaries = data?.data || [];
  const employees = employeesData?.data || [];
  const pendingCount = pendingData?.length || 0;

  const imgUrl = (img) => img ? `${API_BASE}/uploads/${img}` : null;

  const columns = [
    {
      key: 'employee', label: t('employees.name'), render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={imgUrl(row.employee?.image)} sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 600 }}>
            {(row.employee?.name || 'U').charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>{row.employee?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.employee?.position} · {row.employee?.department}</Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'total', label: t('salaries.total'), render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{formatCurrency(parseFloat(row.totalAmount || row.amount))}</Typography>
          <Typography variant="caption" color="text.secondary" display="block">{t('salaries.basic')}: {formatCurrency(parseFloat(row.amount))}</Typography>
          {parseFloat(row.deduction || 0) > 0 && <Typography variant="caption" color="error.main" display="block">{t('salaries.deduction')}: -{formatCurrency(parseFloat(row.deduction))}</Typography>}
        </Box>
      )
    },
    { key: 'month', label: t('salaries.month'), render: (row) => `${MONTHS[row.month - 1]} ${row.year}` },
    { key: 'status', label: t('common.status'), render: (row) => <StatusBadge status={row.status} /> },
    ...((canApprove || canCreate) ? [{
      key: 'actions', label: '', render: (row) => (
        <Stack direction="row" spacing={0.5}>
          {canApprove && (row.status === 'PENDING' || row.status === 'APPROVED') && (
            <IconButton size="small" color="primary" onClick={() => setEditTarget(row)} title={t('common.edit')}>
              <Edit2 size={16} />
            </IconButton>
          )}
          {canApprove && row.status === 'PENDING' && (
            <>
              <IconButton size="small" color="success" onClick={() => approveMutation.mutate({ id: row.id }, { onError: () => {} })} title={t('salaries.approve')}>
                <CheckCircle size={16} />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => cancelMutation.mutate({ id: row.id }, { onError: () => {} })} title={t('salaries.cancel')}>
                <XCircle size={16} />
              </IconButton>
            </>
          )}
          {canApprove && row.status === 'APPROVED' && (
            <>
              <Button size="small" variant="outlined" color="success" sx={{ borderRadius: 2, fontSize: 12 }} onClick={() => payMutation.mutate({ id: row.id }, { onError: () => {} })}>
                {t('salaries.pay')}
              </Button>
              <IconButton size="small" color="error" onClick={() => cancelMutation.mutate({ id: row.id }, { onError: () => {} })} title={t('salaries.cancel')}>
                <XCircle size={16} />
              </IconButton>
            </>
          )}
          {canApprove && row.status === 'PAID' && (
            <IconButton size="small" color="error" onClick={() => cancelMutation.mutate({ id: row.id }, { onError: () => {} })} title={t('salaries.cancel')}>
              <XCircle size={16} />
            </IconButton>
          )}
        </Stack>
      )
    }] : []),
  ];

  const filtered = tab === 0 ? salaries : tab === 1 ? salaries.filter(s => s.status === 'PENDING') : tab === 2 ? salaries.filter(s => s.status === 'APPROVED') : salaries.filter(s => s.status === 'PAID');

  const handleSubmit = async (form) => {
    setError('');
    if (!form.employeeId || !form.amount) {
      setError(t('common.requiredFields'));
      return;
    }
    try {
      await createMutation.mutateAsync({
        employeeId: parseInt(form.employeeId),
        amount: parseFloat(form.amount),
        transportAllowance: parseFloat(form.transportAllowance || 0),
        bonus: parseFloat(form.bonus || 0),
        loan: parseFloat(form.loan || 0),
        deduction: parseFloat(form.deduction || 0),
        month: parseInt(form.month),
        year: parseInt(form.year),
        notes: form.notes || '',
      });
      setOpenDialog(false);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const handleEditSubmit = async (form) => {
    setError('');
    try {
      await updateMutation.mutateAsync({
        id: editTarget.id,
        data: {
          amount: parseFloat(form.amount),
          transportAllowance: parseFloat(form.transportAllowance || 0),
          bonus: parseFloat(form.bonus || 0),
          loan: parseFloat(form.loan || 0),
          deduction: parseFloat(form.deduction || 0),
          notes: form.notes || '',
        },
      });
      setEditTarget(null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('salaries.title')}
        subtitle={pendingCount > 0 ? `${pendingCount} ${t('salaries.pendingApprovals')}` : t('salaries.subtitle')}
        {...(canCreate ? { actionLabel: t('salaries.addSalary'), onAction: () => setOpenDialog(true), actionIcon: Plus } : {})}
      />

      <Grid spacing={2.5} sx={{ mb: 3 }}>
        <GridItem xs={6} sm={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700}>{salaries.length}</Typography>
            <Typography variant="body2" color="text.secondary">{t('common.total')}</Typography>
          </Paper>
        </GridItem>
        <GridItem xs={6} sm={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="warning.main">{salaries.filter(s => s.status === 'PENDING').length}</Typography>
            <Typography variant="body2" color="text.secondary">{t('salaries.pending')}</Typography>
          </Paper>
        </GridItem>
        <GridItem xs={6} sm={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="primary.main">{salaries.filter(s => s.status === 'APPROVED').length}</Typography>
            <Typography variant="body2" color="text.secondary">{t('salaries.approved')}</Typography>
          </Paper>
        </GridItem>
        <GridItem xs={6} sm={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="success.main">{salaries.filter(s => s.status === 'PAID').length}</Typography>
            <Typography variant="body2" color="text.secondary">{t('salaries.paid')}</Typography>
          </Paper>
        </GridItem>
      </Grid>

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={t('common.all')} />
          <Tab label={t('salaries.pending')} />
          <Tab label={t('salaries.approved')} />
          <Tab label={t('salaries.paid')} />
        </Tabs>
        <Box sx={{ p: 0 }}>
          <DataTable
            columns={columns}
            data={filtered}
            page={page}
            rowsPerPage={10}
            total={salaries.length}
            onPageChange={setPage}
            loading={isLoading}
          />
        </Box>
      </Paper>

      <SalaryDialog open={openDialog} onClose={() => { setOpenDialog(false); setError(''); }} t={t} employees={employees} onSubmit={handleSubmit} error={error} />
      <EditSalaryDialog open={!!editTarget} salary={editTarget} onClose={() => { setEditTarget(null); setError(''); }} t={t} onSubmit={handleEditSubmit} error={error} />
    </Box>
  );
}

function SalaryDialog({ open, onClose, t, employees, onSubmit, error }) {
  const [form, setForm] = useState({ employeeId: '', amount: '', transportAllowance: '', bonus: '', loan: '', deduction: '', month: String(currentMonth), year: String(currentYear), notes: '' });
  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const emp = employees.find((x) => x.id === parseInt(empId));
    setForm({ ...form, employeeId: empId, amount: emp ? String(emp.salary) : '' });
  };

  useEffect(() => {
    if (!open) setForm({ employeeId: '', amount: '', transportAllowance: '', bonus: '', loan: '', deduction: '', month: String(currentMonth), year: String(currentYear), notes: '' });
  }, [open]);

  const base = parseFloat(form.amount || 0);
  const transport = parseFloat(form.transportAllowance || 0);
  const bonus = parseFloat(form.bonus || 0);
  const loan = parseFloat(form.loan || 0);
  const deduction = parseFloat(form.deduction || 0);
  const total = base + transport + bonus + loan - deduction;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{t('salaries.addSalary')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <TextField label={t('employees.name')} select size="small" fullWidth value={form.employeeId} onChange={handleEmployeeChange}>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.name} ({emp.position}) - {formatCurrency(parseFloat(emp.salary || 0))}/month
              </MenuItem>
            ))}
          </TextField>
          <TextField label={t('salaries.basicSalary')} type="number" size="small" fullWidth value={form.amount} onChange={handleChange('amount')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('salaries.transportAllowance')} type="number" size="small" fullWidth value={form.transportAllowance} onChange={handleChange('transportAllowance')} />
            <TextField label={t('salaries.bonus')} type="number" size="small" fullWidth value={form.bonus} onChange={handleChange('bonus')} />
            <TextField label={t('salaries.loan')} type="number" size="small" fullWidth value={form.loan} onChange={handleChange('loan')} />
            <TextField label={t('salaries.deduction')} type="number" size="small" fullWidth value={form.deduction} onChange={handleChange('deduction')} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('salaries.month')} select size="small" fullWidth value={form.month} onChange={handleChange('month')}>
              {MONTHS.map((m, i) => <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>)}
            </TextField>
            <TextField label={t('salaries.year')} type="number" size="small" fullWidth value={form.year} onChange={handleChange('year')} />
          </Box>
          <Typography variant="body2" fontWeight={600} color="primary">
            {t('salaries.total')}: {formatCurrency(total)}
          </Typography>
          <TextField label={t('salaries.notes')} size="small" fullWidth multiline rows={2} value={form.notes} onChange={handleChange('notes')} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" sx={{ borderRadius: 2 }} onClick={() => onSubmit(form)}>{t('common.create')}</Button>
      </DialogActions>
    </Dialog>
  );
}

function EditSalaryDialog({ open, salary, onClose, t, onSubmit, error }) {
  const [form, setForm] = useState({ amount: '', transportAllowance: '', bonus: '', loan: '', deduction: '', notes: '' });
  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  useEffect(() => {
    if (salary) {
      setForm({
        amount: salary.amount?.toString() || '',
        transportAllowance: salary.transportAllowance?.toString() || '',
        bonus: salary.bonus?.toString() || '',
        loan: salary.loan?.toString() || '',
        deduction: salary.deduction?.toString() || '',
        notes: salary.notes || '',
      });
    }
  }, [salary]);

  const base = parseFloat(form.amount || 0);
  const transport = parseFloat(form.transportAllowance || 0);
  const bonus = parseFloat(form.bonus || 0);
  const loan = parseFloat(form.loan || 0);
  const deduction = parseFloat(form.deduction || 0);
  const total = base + transport + bonus + loan - deduction;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{t('common.edit')} {t('salaries.salary')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <TextField label={t('salaries.basicSalary')} type="number" size="small" fullWidth value={form.amount} onChange={handleChange('amount')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('salaries.transportAllowance')} type="number" size="small" fullWidth value={form.transportAllowance} onChange={handleChange('transportAllowance')} />
            <TextField label={t('salaries.bonus')} type="number" size="small" fullWidth value={form.bonus} onChange={handleChange('bonus')} />
            <TextField label={t('salaries.loan')} type="number" size="small" fullWidth value={form.loan} onChange={handleChange('loan')} />
            <TextField label={t('salaries.deduction')} type="number" size="small" fullWidth value={form.deduction} onChange={handleChange('deduction')} />
          </Box>
          <Typography variant="body2" fontWeight={600} color="primary">
            {t('salaries.total')}: {formatCurrency(total)}
          </Typography>
          <TextField label={t('salaries.notes')} size="small" fullWidth multiline rows={2} value={form.notes} onChange={handleChange('notes')} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" sx={{ borderRadius: 2 }} onClick={() => onSubmit(form)}>{t('common.update')}</Button>
      </DialogActions>
    </Dialog>
  );
}

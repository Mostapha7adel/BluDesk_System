import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, IconButton, Button, Stack, Card, CardContent, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Tabs, Tab, Select, Chip, Tooltip } from '@mui/material';
import { Plus, Edit2, Trash2, Wallet, History } from 'lucide-react';
import { Container as Grid, Item as GridItem } from '../../components/ui/Grid';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../../hooks/api';
import api from '../../api/axios';
import useTranslate from '../../utils/useTranslate';

const KANBAN_STATUSES = ['NEW', 'ANALYSIS', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'COMPLETED', 'CANCELLED'];
const TAB_STATUSES = { active: ['NEW', 'ANALYSIS', 'DESIGN', 'DEVELOPMENT', 'TESTING'], completed: ['COMPLETED'], cancelled: ['CANCELLED'] };

export default function Projects() {
  const t = useTranslate();
  const user = useSelector(selectUser);
  const perms = user?.permissions || [];
  const isSuperAdmin = user?.role?.slug === 'super_admin';
  const canCreate = isSuperAdmin || perms.includes('projects.create');
  const canUpdate = isSuperAdmin || perms.includes('projects.update');
  const canDelete = isSuperAdmin || perms.includes('projects.delete');
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [installmentTarget, setInstallmentTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  useEffect(() => { document.title = t('projects.title'); }, [t]);

  const { data, isLoading, refetch } = useProjects({ page, limit: 100 });
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const projects = data?.data || [];
  const filtered = tab === 0 ? projects : projects.filter(p => TAB_STATUSES[[null, 'active', 'completed', 'cancelled'][tab]]?.includes(p.status));

  const handleSubmit = async (form) => {
    const payload = {
      name: form.name,
      clientName: form.clientName,
      description: form.description || '',
      totalCost: parseFloat(form.totalCost),
      depositAmount: parseFloat(form.depositAmount || 0),
      startDate: form.startDate ? `${form.startDate}T00:00:00.000Z` : undefined,
      deliveryDate: form.deliveryDate ? `${form.deliveryDate}T00:00:00.000Z` : undefined,
      status: form.status || 'NEW',
    };
    if (!editProject) payload.employeeIds = form.employeeIds || [];
    setError('');
    try {
      if (editProject) {
        await updateMutation.mutateAsync({ id: editProject.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setOpenDialog(false);
      setEditProject(null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const handleStatusChange = async (project, newStatus) => {
    try {
      await api.patch(`/projects/${project.id}/status`, { status: newStatus });
      refetch();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
    setStatusTarget(null);
  };

  const handleAddInstallment = async (projectId, form) => {
    try {
      await api.post(`/projects/${projectId}/installments`, {
        amount: parseFloat(form.amount),
        date: form.date ? `${form.date}T00:00:00.000Z` : undefined,
        notes: form.notes || '',
      });
      refetch();
      setInstallmentTarget(null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const isReadOnly = (project) => project.status === 'COMPLETED' || project.status === 'CANCELLED';

  return (
    <Box>
      <PageHeader title={t('projects.title')} subtitle={`${projects.length} ${t('common.total').toLowerCase()}`} {...(canCreate ? { actionLabel: t('projects.newProject'), onAction: () => { setEditProject(null); setOpenDialog(true); }, actionIcon: Plus } : {})} />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={t('common.all')} />
        <Tab label={t('projects.active')} />
        <Tab label={t('projects.completed')} />
        <Tab label={t('projects.cancelled')} />
      </Tabs>

      <Grid spacing={2.5} sx={{ mb: 3 }}>
        <GridItem xs={6} sm={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700}>{projects.length}</Typography>
            <Typography variant="body2" color="text.secondary">{t('common.total')}</Typography>
          </Paper>
        </GridItem>
        <GridItem xs={6} sm={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="success.main">{projects.filter(p => p.status === 'COMPLETED').length}</Typography>
            <Typography variant="body2" color="text.secondary">{t('internalProjects.completed')}</Typography>
          </Paper>
        </GridItem>
        <GridItem xs={6} sm={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="primary.main">{projects.filter(p => p.status === 'DEVELOPMENT' || p.status === 'TESTING').length}</Typography>
            <Typography variant="body2" color="text.secondary">{t('internalProjects.inProgress')}</Typography>
          </Paper>
        </GridItem>
        <GridItem xs={6} sm={3}>
          <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="error.main">{projects.filter(p => p.status === 'CANCELLED').length}</Typography>
            <Typography variant="body2" color="text.secondary">{t('projects.cancelled')}</Typography>
          </Paper>
        </GridItem>
      </Grid>

      {isLoading ? (
        <Typography color="text.secondary">{t('common.loading')}</Typography>
      ) : (
        <Grid spacing={2}>
          {filtered.length === 0 ? (
            <GridItem xs={12}><Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>{t('common.noData')}</Typography></GridItem>
          ) : (
            filtered.map((project) => (
              <GridItem xs={12} sm={6} lg={4} key={project.id}>
                <Card sx={{ borderRadius: 3, opacity: isReadOnly(project) ? 0.75 : 1, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Typography variant="h6" fontWeight={600}>{project.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!isReadOnly(project) && canUpdate ? (
                          <Select
                            value={project.status}
                            size="small"
                            onChange={(e) => handleStatusChange(project, e.target.value)}
                            sx={{ fontSize: 12, height: 28, '& .MuiSelect-select': { py: 0 } }}
                          >
                            {KANBAN_STATUSES.filter(s => s !== 'CANCELLED').map((s) => (
                              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{t('statuses.' + s) || s}</MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <StatusBadge status={project.status} size="small" />
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{project.clientName}</Typography>
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2, maxHeight: 64, overflow: 'hidden' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: 12, wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description || '—'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">{t('projects.budget')}</Typography>
                        <Typography variant="caption" fontWeight={600}>{formatCurrency(parseFloat(project.totalCost || 0))}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">{t('projects.remaining')}</Typography>
                        <Typography variant="caption" fontWeight={600} color="warning.main">{formatCurrency(parseFloat(project.remainingAmount || 0))}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">{t('projects.deposit')}</Typography>
                        <Typography variant="caption" fontWeight={600} color="success.main">{formatCurrency(parseFloat(project.depositAmount || 0))}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">{t('projects.startDate')}</Typography>
                        <Typography variant="caption" fontWeight={500}>{project.startDate ? formatDate(project.startDate) : '—'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">{t('projects.deliveryDate')}</Typography>
                        <Typography variant="caption" fontWeight={500}>{project.deliveryDate ? formatDate(project.deliveryDate) : '—'}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {(project.assignedEmployees || []).slice(0, 4).map((m, i) => (
                          <Avatar key={i} sx={{ width: 28, height: 28, fontSize: 10, bgcolor: 'primary.main' }}>
                            {(m.employee?.name || '?').charAt(0)}
                          </Avatar>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!isReadOnly(project) && canUpdate && (
                          <>
                            <Tooltip title={t('projects.addPayment')}>
                              <IconButton size="small" onClick={() => setInstallmentTarget(project)}><Wallet size={16} /></IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={() => { setEditProject(project); setOpenDialog(true); }}><Edit2 size={16} /></IconButton>
                          </>
                        )}
                        {canDelete && <IconButton size="small" color="error" onClick={() => setDeleteTarget(project)}><Trash2 size={16} /></IconButton>}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </GridItem>
            ))
          )}
        </Grid>
      )}

      <ProjectDialog open={openDialog} onClose={() => { setOpenDialog(false); setEditProject(null); setError(''); }} edit={editProject} t={t} onSubmit={handleSubmit} error={error} />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('projects.deleteConfirm')} <strong>{deleteTarget?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2 }}>{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>

      <InstallmentDialog open={!!installmentTarget} project={installmentTarget} onClose={() => setInstallmentTarget(null)} t={t} onSubmit={handleAddInstallment} error={error} />
    </Box>
  );
}

function ProjectDialog({ open, onClose, edit, t, onSubmit, error }) {
  const [form, setForm] = useState({ name: '', clientName: '', description: '', totalCost: '', depositAmount: '0', status: 'NEW', startDate: '', deliveryDate: '' });
  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  useEffect(() => {
    if (edit) {
      setForm({
        name: edit.name || '',
        clientName: edit.clientName || '',
        description: edit.description || '',
        totalCost: edit.totalCost ? String(edit.totalCost) : '',
        depositAmount: edit.depositAmount ? String(edit.depositAmount) : '0',
        status: edit.status || 'NEW',
        startDate: edit.startDate ? edit.startDate.slice(0, 10) : '',
        deliveryDate: edit.deliveryDate ? edit.deliveryDate.slice(0, 10) : '',
      });
    } else {
      setForm({ name: '', clientName: '', description: '', totalCost: '', depositAmount: '0', status: 'NEW', startDate: '', deliveryDate: '' });
    }
  }, [edit, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{edit ? t('projects.editProject') : t('projects.newProject')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <TextField label={t('projects.projectName')} size="small" fullWidth value={form.name} onChange={handleChange('name')} />
          {!edit && <TextField label={t('projects.clientName')} size="small" fullWidth value={form.clientName} onChange={handleChange('clientName')} />}
          <TextField label={t('projects.description')} size="small" fullWidth multiline rows={3} value={form.description} onChange={handleChange('description')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('projects.totalCost')} type="number" size="small" fullWidth value={form.totalCost} onChange={handleChange('totalCost')} />
            <TextField label={t('projects.deposit')} type="number" size="small" fullWidth value={form.depositAmount} onChange={handleChange('depositAmount')} />
            <TextField label={t('common.status')} select size="small" fullWidth value={form.status} onChange={handleChange('status')}>
              {KANBAN_STATUSES.map((s) => <MenuItem key={s} value={s}>{t('statuses.' + s) || s}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('projects.startDate')} type="date" size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.startDate} onChange={handleChange('startDate')} />
            <TextField label={t('projects.deliveryDate')} type="date" size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.deliveryDate} onChange={handleChange('deliveryDate')} />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" sx={{ borderRadius: 2 }} onClick={() => onSubmit(form)}>{edit ? t('common.update') : t('common.create')}</Button>
      </DialogActions>
    </Dialog>
  );
}

function InstallmentDialog({ open, project, onClose, t, onSubmit, error }) {
  const [form, setForm] = useState({ amount: '', date: new Date().toISOString().slice(0, 10), notes: '' });
  const [installments, setInstallments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  useEffect(() => {
    if (open) {
      setForm({ amount: '', date: new Date().toISOString().slice(0, 10), notes: '' });
      setLoadingHistory(true);
      api.get(`/projects/${project.id}/installments`).then(res => {
        setInstallments(res.data?.data?.installments || []);
      }).catch(() => {}).finally(() => setLoadingHistory(false));
    }
  }, [open, project]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{t('projects.addPayment')} — {project?.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('finance.amount')} type="number" size="small" fullWidth value={form.amount} onChange={handleChange('amount')} />
            <TextField label={t('finance.date')} type="date" size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.date} onChange={handleChange('date')} />
          </Box>
          <TextField label={t('salaries.notes')} size="small" fullWidth multiline rows={2} value={form.notes} onChange={handleChange('notes')} />

          {installments.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{t('projects.paymentHistory')}</Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {installments.map((inst, i) => (
                  <Box key={inst.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, px: 1.5, borderRadius: 1, bgcolor: i % 2 === 0 ? 'action.hover' : 'transparent' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{formatCurrency(parseFloat(inst.amount))}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDateTime(inst.createdAt)}</Typography>
                      {inst.notes && <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>{inst.notes}</Typography>}
                    </Box>
                    <Typography variant="caption" color="text.secondary">{formatDate(inst.date)}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" sx={{ borderRadius: 2 }} onClick={() => onSubmit(project?.id, form)}>{t('common.add')}</Button>
      </DialogActions>
    </Dialog>
  );
}
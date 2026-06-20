import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, IconButton, Button, Stack, Card, CardContent, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Tabs, Tab } from '@mui/material';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Container as Grid, Item as GridItem } from '../../components/ui/Grid';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../../hooks/api';
import useTranslate from '../../utils/useTranslate';

const KANBAN_STATUSES = ['NEW', 'ANALYSIS', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'COMPLETED', 'CANCELLED'];
const TAB_STATUSES = { active: ['NEW', 'ANALYSIS', 'DESIGN', 'DEVELOPMENT', 'TESTING'], completed: ['COMPLETED'], cancelled: ['CANCELLED'] };

export default function Projects() {
  const t = useTranslate();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { document.title = t('projects.title'); }, [t]);

  const { data, isLoading } = useProjects({ page, limit: 100 });
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
      <PageHeader title={t('projects.title')} subtitle={`${projects.length} ${t('common.total').toLowerCase()}`} actionLabel={t('projects.newProject')} onAction={() => { setEditProject(null); setOpenDialog(true); }} actionIcon={Plus} />

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
                      <StatusBadge status={project.status} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{project.clientName}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>{project.description || '—'}</Typography>
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
                        {!isReadOnly(project) && (
                          <IconButton size="small" onClick={() => { setEditProject(project); setOpenDialog(true); }}><Edit2 size={16} /></IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(project)}><Trash2 size={16} /></IconButton>
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
    </Box>
  );
}

function ProjectDialog({ open, onClose, edit, t, onSubmit, error }) {
  const [form, setForm] = useState(edit || { name: '', clientName: '', description: '', totalCost: '', depositAmount: '0', status: 'NEW', startDate: '', deliveryDate: '' });
  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  useEffect(() => {
    setForm(edit || { name: '', clientName: '', description: '', totalCost: '', depositAmount: '0', status: 'NEW', startDate: '', deliveryDate: '' });
  }, [edit, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{edit ? t('projects.editProject') : t('projects.newProject')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <TextField label={t('projects.projectName')} size="small" fullWidth value={form.name} onChange={handleChange('name')} />
          <TextField label={t('projects.clientName')} size="small" fullWidth value={form.clientName} onChange={handleChange('clientName')} />
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
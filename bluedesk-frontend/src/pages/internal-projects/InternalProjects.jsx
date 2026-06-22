import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Card, CardContent, LinearProgress, Avatar, Stack, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Alert, Tabs, Tab, Select, Slider, Tooltip } from '@mui/material';
import { Plus, Edit2, Trash2, Percent, FileText } from 'lucide-react';
import { Container as Grid, Item as GridItem } from '../../components/ui/Grid';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { useInternalProjects, useCreateInternalProject, useUpdateInternalProject, useDeleteInternalProject } from '../../hooks/api';
import api from '../../api/axios';
import { formatDate } from '../../utils/format';
import useTranslate from '../../utils/useTranslate';

const INTERNAL_STATUSES = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
const TAB_STATUSES = { active: ['PLANNING', 'IN_PROGRESS', 'ON_HOLD'], completed: ['COMPLETED'], cancelled: ['CANCELLED'] };

export default function InternalProjects() {
  const t = useTranslate();
  const user = useSelector(selectUser);
  const perms = user?.permissions || [];
  const isSuperAdmin = user?.role?.slug === 'super_admin';
  const canCreate = isSuperAdmin || perms.includes('internal_projects.create');
  const canUpdate = isSuperAdmin || perms.includes('internal_projects.update');
  const canDelete = isSuperAdmin || perms.includes('internal_projects.delete');
  const [tab, setTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [progressTarget, setProgressTarget] = useState(null);
  const [descriptionTarget, setDescriptionTarget] = useState(null);

  useEffect(() => { document.title = t('internalProjects.title'); }, [t]);

  const { data, isLoading, refetch } = useInternalProjects({ limit: 100 });
  const createMutation = useCreateInternalProject();
  const updateMutation = useUpdateInternalProject();
  const deleteMutation = useDeleteInternalProject();

  const projects = data?.data || [];
  const filtered = tab === 0 ? projects : projects.filter(p => TAB_STATUSES[[null, 'active', 'completed', 'cancelled'][tab]]?.includes(p.status));

  const handleSubmit = async (form) => {
    setError('');
    const payload = {
      name: form.name,
      description: form.description,
      status: form.status || 'PLANNING',
      progress: parseInt(form.progress) || 0,
      startDate: form.startDate ? `${form.startDate}T00:00:00.000Z` : null,
      endDate: form.endDate ? `${form.endDate}T00:00:00.000Z` : null,
    };
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
      await api.patch(`/internal-projects/${project.id}/status`, { status: newStatus });
      refetch();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  const handleProgressChange = async (projectId, progress) => {
    try {
      await api.patch(`/internal-projects/${projectId}/progress`, { progress });
      refetch();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
    setProgressTarget(null);
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
      <PageHeader title={t('internalProjects.title')} subtitle={t('internalProjects.subtitle')} {...(canCreate ? { actionLabel: t('internalProjects.newProject'), onAction: () => { setEditProject(null); setOpenDialog(true); }, actionIcon: Plus } : {})} />

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
            <Typography variant="body2" color="text.secondary">{t('internalProjects.totalProjects')}</Typography>
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
            <Typography variant="h4" fontWeight={700} color="primary.main">{projects.filter(p => p.status === 'IN_PROGRESS').length}</Typography>
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
                            {INTERNAL_STATUSES.filter(s => s !== 'CANCELLED').map((s) => (
                              <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{t('statuses.' + s) || s}</MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <StatusBadge status={project.status} size="small" />
                        )}
                      </Box>
                    </Box>
                    <Box onClick={() => setDescriptionTarget(project)} sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2, maxHeight: 80, overflow: 'hidden', cursor: 'pointer', '&:hover': { bgcolor: 'action.selected' } }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.5, fontSize: 13, wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description || '—'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">{t('internalProjects.progress')}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" fontWeight={600}>{project.progress || 0}%</Typography>
                          {!isReadOnly(project) && canUpdate && (
                            <IconButton size="small" onClick={() => setProgressTarget(project)}><Percent size={14} /></IconButton>
                          )}
                        </Box>
                      </Box>
                      <LinearProgress variant="determinate" value={project.progress || 0} sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { borderRadius: 3 } }} />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">{t('projects.startDate')}</Typography>
                        <Typography variant="caption" fontWeight={500}>{project.startDate ? formatDate(project.startDate) : '—'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">{t('internalProjects.endDate')}</Typography>
                        <Typography variant="caption" fontWeight={500}>{project.endDate ? formatDate(project.endDate) : '—'}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {(project.teamMembers || []).slice(0, 4).map((m, i) => (
                          <Avatar key={i} sx={{ width: 28, height: 28, fontSize: 10, bgcolor: 'primary.main' }}>
                            {(m.name || '?').charAt(0)}
                          </Avatar>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!isReadOnly(project) && canUpdate && (
                          <IconButton size="small" onClick={() => { setEditProject(project); setOpenDialog(true); }}><Edit2 size={16} /></IconButton>
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

      <InternalProjectDialog open={openDialog} onClose={() => { setOpenDialog(false); setEditProject(null); setError(''); }} edit={editProject} t={t} onSubmit={handleSubmit} error={error} />

      <DescriptionDialog open={!!descriptionTarget} project={descriptionTarget} onClose={() => setDescriptionTarget(null)} t={t} />

      <ProgressDialog open={!!progressTarget} project={progressTarget} onClose={() => setProgressTarget(null)} t={t} onSubmit={handleProgressChange} />

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

function InternalProjectDialog({ open, onClose, edit, t, onSubmit, error }) {
  const [form, setForm] = useState({ name: '', description: '', status: 'PLANNING', progress: '0', startDate: '', endDate: '' });
  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  useEffect(() => {
    if (edit) {
      setForm({
        name: edit.name || '',
        description: edit.description || '',
        status: edit.status || 'PLANNING',
        progress: String(edit.progress || 0),
        startDate: edit.startDate ? edit.startDate.slice(0, 10) : '',
        endDate: edit.endDate ? edit.endDate.slice(0, 10) : '',
      });
    } else {
      setForm({ name: '', description: '', status: 'PLANNING', progress: '0', startDate: '', endDate: '' });
    }
  }, [edit, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{edit ? t('common.edit') : t('internalProjects.newProject')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <TextField label={t('projects.projectName')} size="small" fullWidth value={form.name} onChange={handleChange('name')} />
          <TextField label={t('projects.description')} size="small" fullWidth multiline rows={3} value={form.description} onChange={handleChange('description')} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('internalProjects.progress')} type="number" size="small" fullWidth value={form.progress} onChange={handleChange('progress')} slotProps={{ htmlInput: { min: 0, max: 100 } }} />
            <TextField label={t('common.status')} select size="small" fullWidth value={form.status} onChange={handleChange('status')}>
              {INTERNAL_STATUSES.map((s) => <MenuItem key={s} value={s}>{t('statuses.' + s) || s}</MenuItem>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('projects.startDate')} type="date" size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.startDate} onChange={handleChange('startDate')} />
            <TextField label={t('internalProjects.endDate')} type="date" size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.endDate} onChange={handleChange('endDate')} />
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

function DescriptionDialog({ open, project, onClose, t }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{project?.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {project?.description || '—'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

function ProgressDialog({ open, project, onClose, t, onSubmit }) {
  const [progress, setProgress] = useState(50);

  useEffect(() => {
    if (project) setProgress(project.progress || 0);
  }, [project, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{t('internalProjects.progress')} — {project?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ px: 1, py: 3 }}>
          <Slider value={progress} onChange={(e, v) => setProgress(v)} min={0} max={100} step={5} valueLabelDisplay="on" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" sx={{ borderRadius: 2 }} onClick={() => { onSubmit(project?.id, progress); onClose(); }}>{t('common.save')}</Button>
      </DialogActions>
    </Dialog>
  );
}
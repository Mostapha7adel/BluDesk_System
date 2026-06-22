import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Card, CardContent, Chip, LinearProgress, Stack, Alert } from '@mui/material';
import { Download, HardDrive, Database, Activity, Clock, Cpu, Server, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import PageHeader from '../../components/ui/PageHeader';
import { useSystemHealth, useCreateBackup } from '../../hooks/api';
import useTranslate from '../../utils/useTranslate';
import axiosInstance from '../../api/axios';

function MetricCard({ icon: Icon, label, value, color = 'primary' }) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: `${color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
            <Icon size={18} color="white" />
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
        </Box>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export default function Settings() {
  const t = useTranslate();
  const user = useSelector(selectUser);
  const perms = user?.permissions || [];
  const isSuperAdmin = user?.role?.slug === 'super_admin';
  const canBackup = isSuperAdmin || perms.includes('settings.backup');
  const [backupStatus, setBackupStatus] = useState('');
  const { data: health, isLoading } = useSystemHealth();
  const backupMutation = useCreateBackup();

  useEffect(() => { document.title = t('settings.title'); }, [t]);

  const handleBackup = async () => {
    setBackupStatus(t('settings.backingUp'));
    try {
      const response = await axiosInstance.get('/settings/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const disposition = response.headers['content-disposition'];
      const filename = disposition ? disposition.split('filename=')[1]?.replace(/"/g, '') : `bluedesk_backup_${Date.now()}.sql`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setBackupStatus(t('settings.backupSuccess'));
    } catch {
      setBackupStatus(t('settings.backupError'));
    }
  };

  return (
    <Box>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Server size={20} /> {t('settings.systemHealth')}
      </Typography>

      {isLoading ? (
        <LinearProgress sx={{ borderRadius: 1, mb: 3 }} />
      ) : health ? (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}>
            <MetricCard icon={Clock} label={t('settings.uptime')} value={formatUptime(health.uptime)} color="info" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <MetricCard icon={Cpu} label={t('settings.cpuCores')} value={health.cpu.cores} color="primary" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <MetricCard icon={HardDrive} label={t('settings.memoryUsage')} value={`${health.memory.usagePercent}%`} color={health.memory.usagePercent > 80 ? 'error' : 'success'} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <MetricCard icon={Database} label={t('settings.dbStatus')} value={health.database.connected ? t('common.active') : t('common.inactive')} color={health.database.connected ? 'success' : 'error'} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <MetricCard icon={Activity} label={t('settings.dbLatency')} value={`${health.database.latencyMs}ms`} color="warning" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <MetricCard icon={Server} label={t('settings.nodeVersion')} value={health.nodeVersion} color="secondary" />
          </Grid>
        </Grid>
      ) : null}

      {health?.cpu?.coresUsage && (
        <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cpu size={20} /> {t('settings.cpuUsage')}
          </Typography>
          <Stack spacing={1.5}>
            {health.cpu.coresUsage.slice(0, 8).map((core) => (
              <Box key={core.core}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">{t('settings.core')} {core.core}</Typography>
                  <Typography variant="caption" fontWeight={600}>{core.usage}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={core.usage} sx={{ borderRadius: 1, height: 6 }} color={core.usage > 80 ? 'error' : core.usage > 50 ? 'warning' : 'primary'} />
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {health?.records && (
        <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Database size={20} /> {t('settings.recordCounts')}
          </Typography>
          <Grid container spacing={1.5}>
            {Object.entries(health.records).map(([model, count]) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={model}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">{model}</Typography>
                  <Typography variant="h6" fontWeight={700}>{count}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {canBackup && (<>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Download size={20} /> {t('settings.backup')}
      </Typography>

      <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('settings.backupDesc')}</Typography>
        {backupStatus && (
          <Alert severity={backupStatus.includes(t('settings.backupSuccess')) ? 'success' : backupStatus.includes(t('settings.backingUp')) ? 'info' : 'error'} sx={{ mb: 2, borderRadius: 2 }}>
            {backupStatus}
          </Alert>
        )}
        <Button variant="contained" startIcon={<Download size={16} />} sx={{ borderRadius: 2 }} onClick={handleBackup} disabled={backupMutation.isPending}>
          {backupMutation.isPending ? t('settings.backingUp') : t('settings.downloadBackup')}
        </Button>
      </Paper>
      </>)}
    </Box>
  );
}

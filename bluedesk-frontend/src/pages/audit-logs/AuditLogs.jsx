import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Avatar, Chip, TextField, MenuItem } from '@mui/material';
import { History, LogIn, LogOut, Plus, Edit3, Trash2, Shield } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import SearchInput from '../../components/ui/SearchInput';
import DataTable from '../../components/tables/DataTable';
import { formatDateTime } from '../../utils/format';
import { useAuditLogs } from '../../hooks/api';
import useTranslate from '../../utils/useTranslate';

const actionIcons = {
  LOGIN: { icon: LogIn, color: '#10B981' },
  LOGOUT: { icon: LogOut, color: '#64748B' },
  CREATE: { icon: Plus, color: '#3B82F6' },
  UPDATE: { icon: Edit3, color: '#F59E0B' },
  DELETE: { icon: Trash2, color: '#EF4444' },
  PERMISSION_CHANGE: { icon: Shield, color: '#8B5CF6' },
  PASSWORD_CHANGE: { icon: Shield, color: '#8B5CF6' },
};

export default function AuditLogs() {
  const t = useTranslate();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { document.title = t('auditLogs.title'); }, [t]);

  const { data, isLoading } = useAuditLogs({ page, limit: 10, search, action: filterAction || undefined });
  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  const columns = [
    { key: 'createdAt', label: t('auditLogs.time'), render: (row) => (
      <Typography variant="body2" fontWeight={500}>{formatDateTime(row.createdAt)}</Typography>
    )},
    { key: 'user', label: t('auditLogs.user'), render: (row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'grey.100', color: 'text.secondary' }}>
          {(row.user?.name || 'S').charAt(0)}
        </Avatar>
        <Typography variant="body2">{row.user?.name || 'System'}</Typography>
      </Box>
    )},
    { key: 'action', label: t('auditLogs.action'), render: (row) => {
      const action = actionIcons[row.action] || { icon: History, color: '#64748B' };
      const ActionIcon = action.icon;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${action.color}15` }}>
            <ActionIcon size={14} style={{ color: action.color }} />
          </Box>
          <Typography variant="body2">{row.action.replace(/_/g, ' ')}</Typography>
        </Box>
      );
    }},
    { key: 'entity', label: t('auditLogs.entity'), render: (row) => (
      <Chip label={row.entity} size="small" variant="outlined" sx={{ borderRadius: 1, fontSize: 11 }} />
    )},
    { key: 'ipAddress', label: t('auditLogs.ipAddress'), render: (row) => <Typography variant="body2" color="text.secondary">{row.ipAddress || '—'}</Typography> },
  ];

  return (
    <Box>
      <PageHeader title={t('auditLogs.title')} subtitle={t('auditLogs.subtitle')} />

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t('auditLogs.search')} />
        <TextField select size="small" value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }} sx={{ minWidth: 160 }}>
          <MenuItem value="">{t('auditLogs.allActions')}</MenuItem>
          {Object.keys(actionIcons).map((a) => (
            <MenuItem key={a} value={a}>{a.replace(/_/g, ' ')}</MenuItem>
          ))}
        </TextField>
      </Paper>

      <DataTable
        columns={columns}
        data={logs}
        page={page}
        rowsPerPage={10}
        total={pagination.total || logs.length}
        onPageChange={setPage}
        loading={isLoading}
      />
    </Box>
  );
}

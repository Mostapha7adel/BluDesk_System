import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack, MenuItem, Alert, IconButton } from '@mui/material';
import { Plus, Wallet, TrendingUp, TrendingDown, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { Container as Grid, Item as GridItem } from '../../components/ui/Grid';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/tables/DataTable';
import RevenueChart from '../../components/charts/RevenueChart';
import ExpensesChart from '../../components/charts/ExpensesChart';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { useTransactions, useFinancialReport, useCreateTransaction, useCancelTransaction } from '../../hooks/api';
import useTranslate from '../../utils/useTranslate';

export default function Finance() {
  const t = useTranslate();
  const user = useSelector(selectUser);
  const isSuperAdmin = user?.role?.slug === 'super_admin';
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => { document.title = t('finance.title'); }, [t]);

  const { data: txData, isLoading } = useTransactions({ page, limit: 50 });
  const { data: report } = useFinancialReport();
  const createMutation = useCreateTransaction();
  const cancelMutation = useCancelTransaction();

  const transactions = txData?.data || [];
  const txSummary = txData?.summary || {};
  const finSummary = report?.summary || {};

  const totalIncome = txSummary.totalIncome || finSummary.totalIncome || 0;
  const totalExpense = txSummary.totalExpense || finSummary.totalExpense || 0;
  const totalBalance = txSummary.netBalance || finSummary.netBalance || 0;

  const incomeByMonth = {};
  const expenseByMonth = {};
  const expenseByCategory = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const m = d.getMonth();
    if (tx.type === 'INCOME' || tx.type === 'DEPOSIT') incomeByMonth[m] = (incomeByMonth[m] || 0) + parseFloat(tx.amount);
    if (tx.type === 'EXPENSE') {
      expenseByMonth[m] = (expenseByMonth[m] || 0) + parseFloat(tx.amount);
      const cat = tx.description?.split(' - ')[0] || 'Other';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + parseFloat(tx.amount);
    }
  });

  const labels = monthNames.slice(0, Math.max(new Date().getMonth() + 1, 1));
  const chartRevenueData = {
    labels,
    income: labels.map((_, i) => incomeByMonth[i] || 0),
    expenses: labels.map((_, i) => expenseByMonth[i] || 0),
  };

  const expLabels = Object.keys(expenseByCategory).slice(0, 6);
  const chartExpensesData = expLabels.length > 0 ? {
    labels: expLabels,
    values: Object.values(expenseByCategory).slice(0, 6),
  } : null;

  const columns = [
    { key: 'date', label: t('finance.date'), render: (row) => formatDateTime(row.date) },
    { key: 'description', label: t('finance.description') },
    { key: 'treasury', label: t('finance.account'), render: () => t('finance.accountName') },
    { key: 'type', label: t('finance.type'), render: (row) => (
      <Typography variant="body2" color={row.type === 'INCOME' || row.type === 'DEPOSIT' ? 'success.main' : 'error.main'} fontWeight={500}>
        {row.type === 'INCOME' ? t('finance.income') : row.type === 'EXPENSE' ? t('finance.expenses') : row.type === 'DEPOSIT' ? t('finance.deposit') : row.type}
      </Typography>
    )},
    { key: 'amount', label: t('finance.amount'), render: (row) => (
      <Typography variant="body2" fontWeight={600} color={row.type === 'INCOME' || row.type === 'DEPOSIT' ? 'success.main' : 'error.main'}>
        {row.type === 'INCOME' || row.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(parseFloat(row.amount || 0))}
      </Typography>
    )},
    { key: 'reference', label: t('finance.reference') },
    ...(isSuperAdmin ? [{
      key: 'actions', label: '', render: (row) => (
        row.cancelledAt ? (
          <Typography variant="caption" color="text.disabled">{t('finance.cancelled')}</Typography>
        ) : (
          <IconButton size="small" color="error" onClick={() => setCancelTarget(row)} title={t('finance.cancelTransaction')}>
            <XCircle size={16} />
          </IconButton>
        )
      ),
    }] : []),
  ];

  const filtered = tab === 0 ? transactions : tab === 1 ? transactions.filter(t => t.type === 'INCOME' || t.type === 'DEPOSIT') : tab === 2 ? transactions.filter(t => t.type === 'EXPENSE') : transactions.filter(t => t.type === 'DEPOSIT');

  const handleSubmit = async (form) => {
    setError('');
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError(t('finance.requiredFields'));
      return;
    }
    try {
      await createMutation.mutateAsync({
        treasuryId: 1,
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description || '',
        reference: form.reference || undefined,
      });
      setOpenDialog(false);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'));
    }
  };

  return (
    <Box>
      <PageHeader
        title={t('finance.title')}
        subtitle={t('finance.subtitle')}
        actionLabel={t('finance.addTransaction')}
        onAction={() => setOpenDialog(true)}
        actionIcon={Plus}
      />

      <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Wallet size={24} />
        <Box>
          <Typography variant="body2" color="text.secondary">{t('finance.accountName')}</Typography>
          <Typography variant="h5" fontWeight={700}>{formatCurrency(totalBalance)}</Typography>
        </Box>
      </Paper>

      <Grid spacing={2.5} sx={{ mb: 3 }}>
        <GridItem xs={12} sm={6} md={3}><StatCard title={t('finance.totalIncome')} value={formatCurrency(totalIncome)} icon={TrendingUp} color="success" /></GridItem>
        <GridItem xs={12} sm={6} md={3}><StatCard title={t('finance.totalExpenses')} value={formatCurrency(totalExpense)} icon={TrendingDown} color="error" /></GridItem>
        <GridItem xs={12} sm={6} md={3}><StatCard title={t('finance.netProfit')} value={formatCurrency(totalIncome - totalExpense)} icon={Wallet} color="info" /></GridItem>
        <GridItem xs={12} sm={6} md={3}><StatCard title={t('finance.totalTransactions')} value={txSummary.totalTransactions || transactions.length || 0} icon={Plus} color="primary" /></GridItem>
      </Grid>

      <Grid spacing={2.5} sx={{ mb: 3 }}>
        <GridItem xs={12} lg={8}><RevenueChart data={chartRevenueData} title={t('finance.totalIncome') + ' vs ' + t('finance.totalExpenses')} /></GridItem>
        <GridItem xs={12} lg={4}><ExpensesChart data={chartExpensesData} title={t('dashboard.expensesBreakdown')} /></GridItem>
      </Grid>

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={t('finance.allTransactions')} />
          <Tab label={t('finance.income')} />
          <Tab label={t('finance.expenses')} />
          <Tab label={t('finance.deposit')} />
        </Tabs>
        <Box sx={{ p: 0 }}>
          <DataTable
            columns={columns}
            data={filtered}
            page={page}
            rowsPerPage={10}
            total={txSummary.totalTransactions || filtered.length}
            onPageChange={setPage}
            loading={isLoading}
          />
        </Box>
      </Paper>

      <TransactionDialog open={openDialog} onClose={() => { setOpenDialog(false); setError(''); }} t={t} onSubmit={handleSubmit} error={error} />

      <Dialog open={!!cancelTarget} onClose={() => setCancelTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{t('finance.confirmCancel')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {cancelTarget && t('finance.cancelWarning').replace('{amount}', formatCurrency(parseFloat(cancelTarget.amount))).replace('{type}', cancelTarget?.type === 'INCOME' ? t('finance.income') : cancelTarget?.type === 'EXPENSE' ? t('finance.expenses') : t('finance.deposit'))}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelTarget(null)} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
          <Button color="error" variant="contained" sx={{ borderRadius: 2 }} onClick={() => { cancelMutation.mutate(cancelTarget.id, { onError: () => {} }); setCancelTarget(null); }}>{t('finance.confirmCancelBtn')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function TransactionDialog({ open, onClose, t, onSubmit, error }) {
  const [form, setForm] = useState({ type: 'INCOME', amount: '', description: '', reference: '' });
  const handleChange = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  useEffect(() => {
    if (!open) setForm({ type: 'INCOME', amount: '', description: '', reference: '' });
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{t('finance.addTransaction')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <TextField label={t('finance.account')} size="small" fullWidth value={t('finance.accountName')} slotProps={{ input: { readOnly: true } }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('finance.type')} select size="small" fullWidth value={form.type} onChange={handleChange('type')}>
              <MenuItem value="INCOME">{t('finance.income')}</MenuItem>
              <MenuItem value="EXPENSE">{t('finance.expenses')}</MenuItem>
              <MenuItem value="DEPOSIT">{t('finance.deposit')}</MenuItem>
            </TextField>
            <TextField label={t('finance.amount')} type="number" size="small" fullWidth value={form.amount} onChange={handleChange('amount')} />
          </Box>
          <TextField label={t('finance.description')} size="small" fullWidth value={form.description} onChange={handleChange('description')} />
          <TextField label={t('finance.reference')} size="small" fullWidth value={form.reference} onChange={handleChange('reference')} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>{t('common.cancel')}</Button>
        <Button variant="contained" sx={{ borderRadius: 2 }} onClick={() => onSubmit(form)}>{t('common.create')}</Button>
      </DialogActions>
    </Dialog>
  );
}
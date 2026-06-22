import { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, Paper, Button, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Chip } from '@mui/material';
import { Printer } from 'lucide-react';
import { Container as Grid, Item as GridItem } from '../../components/ui/Grid';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import RevenueChart from '../../components/charts/RevenueChart';
import ExpensesChart from '../../components/charts/ExpensesChart';
import { formatCurrency, formatDate } from '../../utils/format';
import { useFinancialReport, useTransactions, useProjects } from '../../hooks/api';
import useTranslate from '../../utils/useTranslate';

export default function Reports() {
  const t = useTranslate();
  const printRef = useRef(null);
  const [tab, setTab] = useState(0);
  const [month, setMonth] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => { document.title = t('reports.title'); }, [t]);

  const firstDay = month + '-01';
  const lastDay = new Date(new Date(month + '-01').getFullYear(), new Date(month + '-01').getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data: report } = useFinancialReport({ startDate: firstDay, endDate: lastDay, includeCancelled: 'true' });
  const { data: txData } = useTransactions({ limit: 500, includeCancelled: 'true' });
  const { data: projData } = useProjects({ limit: 200 });

  const transactions = report?.transactions || txData?.data || [];
  const projects = projData?.data || [];
  const summary = report?.summary || txData?.summary || {};

  const projectStatusCounts = {};
  projects.forEach(p => { projectStatusCounts[p.status] = (projectStatusCounts[p.status] || 0) + 1; });

  const activeTxns = useMemo(() => (txData?.data || []).filter(t => !t.cancelledAt), [txData]);

  const incomeByMonth = {};
  const expenseByMonth = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  activeTxns.forEach((tx) => {
    const d = new Date(tx.date);
    const m = d.getMonth();
    if (tx.type === 'INCOME' || tx.type === 'DEPOSIT') incomeByMonth[m] = (incomeByMonth[m] || 0) + parseFloat(tx.amount);
    if (tx.type === 'EXPENSE') expenseByMonth[m] = (expenseByMonth[m] || 0) + parseFloat(tx.amount);
  });

  const labels = monthNames.slice(0, Math.max(new Date().getMonth() + 1, 1));
  const chartRevenueData = {
    labels,
    income: labels.map((_, i) => incomeByMonth[i] || 0),
    expenses: labels.map((_, i) => expenseByMonth[i] || 0),
  };

  const expLabels = Object.keys(projectStatusCounts);
  const chartProjectsData = expLabels.length > 0 ? { labels: expLabels, values: Object.values(projectStatusCounts) } : null;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const content = printRef.current?.innerHTML || '';
    win.document.write(`
      <html dir="rtl"><head><title>${t('reports.title')}</title>
      <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1a1a2e; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: right; font-size: 13px; }
        th { background: #f8fafc; font-weight: 600; }
        h2 { color: #0f172a; margin-top: 25px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        h3 { color: #334155; margin-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { color: #64748b; margin: 5px 0 0; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        .cancelled { background: #fef2f2; color: #dc2626; }
      </style></head><body>
        <div class="header"><h1>${t('app.name')}</h1><p>${t('reports.title')} - ${month}</p></div>
        ${content}
        <div class="footer">${t('reports.generatedAt')} ${new Date().toLocaleDateString('ar-EG')}</div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  const transactionColumns = [
    { label: t('finance.date'), field: (tx) => formatDate(tx.date) },
    { label: t('finance.description'), field: (tx) => tx.description || '—' },
    { label: t('finance.type'), field: (tx) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color={tx.type === 'INCOME' || tx.type === 'DEPOSIT' ? 'success.main' : 'error.main'} fontWeight={500}>
          {tx.type === 'INCOME' ? t('finance.income') : tx.type === 'EXPENSE' ? t('finance.expenses') : t('finance.deposit')}
        </Typography>
        {tx.cancelledAt && <Chip label={t('finance.cancelled')} size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
      </Box>
    )},
    { label: t('finance.amount'), field: (tx) => (
      <Typography fontWeight={600} color={tx.type === 'INCOME' || tx.type === 'DEPOSIT' ? 'success.main' : 'error.main'}>
        {tx.type === 'INCOME' || tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount || 0))}
      </Typography>
    )},
  ];

  return (
    <Box>
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} actions={
        <Button variant="outlined" startIcon={<Printer size={16} />} onClick={handlePrint} sx={{ borderRadius: 2 }}>{t('reports.print')}</Button>
      } />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField label={t('reports.month')} type="month" size="small" value={month} onChange={(e) => setMonth(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      </Paper>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={t('reports.financial')} />
        <Tab label={t('reports.projects')} />
        <Tab label={t('reports.monthlyActivity')} />
      </Tabs>

      <div ref={printRef}>
        {tab === 0 && (
          <Box>
            <Grid spacing={2.5} sx={{ mb: 3 }}>
              <GridItem xs={12} sm={4}><StatCard title={t('finance.totalIncome')} value={formatCurrency(summary.totalIncome || 0)} color="success" /></GridItem>
              <GridItem xs={12} sm={4}><StatCard title={t('finance.totalExpenses')} value={formatCurrency(summary.totalExpense || 0)} color="error" /></GridItem>
              <GridItem xs={12} sm={4}><StatCard title={t('finance.netProfit')} value={formatCurrency((summary.totalIncome || 0) - (summary.totalExpense || 0))} color="info" /></GridItem>
            </Grid>

            <Paper sx={{ borderRadius: 3, mb: 3 }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{t('reports.transactionDetails')}</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {transactionColumns.map((col, i) => (
                          <TableCell key={i} sx={{ fontWeight: 600 }}>{col.label}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow><TableCell colSpan={transactionColumns.length} align="center">{t('common.noData')}</TableCell></TableRow>
                      ) : transactions.map((tx) => (
                        <TableRow key={tx.id} sx={{ bgcolor: tx.cancelledAt ? 'action.hover' : 'inherit', opacity: tx.cancelledAt ? 0.6 : 1 }}>
                          {transactionColumns.map((col, i) => (
                            <TableCell key={i}>{typeof col.field === 'function' ? col.field(tx) : tx[col.field]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>

            <Grid spacing={2.5}>
              <GridItem xs={12} lg={8}><RevenueChart data={chartRevenueData} title={t('reports.revenueVsExpenses')} /></GridItem>
            </Grid>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Grid spacing={2.5} sx={{ mb: 3 }}>
              <GridItem xs={12} sm={3}><StatCard title={t('common.total')} value={projects.length} color="primary" /></GridItem>
              <GridItem xs={12} sm={3}><StatCard title={t('internalProjects.completed')} value={projects.filter(p => p.status === 'COMPLETED').length} color="success" /></GridItem>
              <GridItem xs={12} sm={3}><StatCard title={t('internalProjects.inProgress')} value={projects.filter(p => !['COMPLETED', 'CANCELLED'].includes(p.status)).length} color="info" /></GridItem>
              <GridItem xs={12} sm={3}><StatCard title={t('projects.cancelled')} value={projects.filter(p => p.status === 'CANCELLED').length} color="error" /></GridItem>
            </Grid>

            <Paper sx={{ borderRadius: 3, mb: 3 }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{t('reports.projectDetails')}</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>{t('projects.projectName')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('projects.clientName')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('common.status')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('projects.budget')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('projects.remaining')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projects.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center">{t('common.noData')}</TableCell></TableRow>
                      ) : projects.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.clientName}</TableCell>
                          <TableCell>{t('statuses.' + p.status) || p.status}</TableCell>
                          <TableCell>{formatCurrency(parseFloat(p.totalCost || 0))}</TableCell>
                          <TableCell>{formatCurrency(parseFloat(p.remainingAmount || 0))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>

            <Grid spacing={2.5}>
              <GridItem xs={12} sm={6}><ExpensesChart data={chartProjectsData} title={t('dashboard.projectStatus')} /></GridItem>
            </Grid>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Grid spacing={2.5} sx={{ mb: 3 }}>
              <GridItem xs={12} sm={4}><StatCard title={t('finance.totalIncome')} value={formatCurrency(summary.totalIncome || 0)} color="success" /></GridItem>
              <GridItem xs={12} sm={4}><StatCard title={t('finance.totalExpenses')} value={formatCurrency(summary.totalExpense || 0)} color="error" /></GridItem>
              <GridItem xs={12} sm={4}><StatCard title={t('reports.transactionCount')} value={transactions.length} color="primary" /></GridItem>
            </Grid>

            <Paper sx={{ borderRadius: 3 }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{t('reports.monthlyActivity')} — {month}</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>{t('finance.date')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('finance.description')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('finance.type')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('finance.amount')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('common.status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center">{t('common.noData')}</TableCell></TableRow>
                      ) : transactions.map((tx) => (
                        <TableRow key={tx.id} sx={{ bgcolor: tx.cancelledAt ? 'action.hover' : 'inherit', opacity: tx.cancelledAt ? 0.6 : 1 }}>
                          <TableCell>{formatDate(tx.date)}</TableCell>
                          <TableCell>{tx.description || '—'}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color={tx.type === 'INCOME' || tx.type === 'DEPOSIT' ? 'success.main' : 'error.main'} fontWeight={500}>
                              {tx.type === 'INCOME' ? t('finance.income') : tx.type === 'EXPENSE' ? t('finance.expenses') : t('finance.deposit')}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatCurrency(parseFloat(tx.amount || 0))}</TableCell>
                          <TableCell>{tx.cancelledAt ? <Chip label={t('finance.cancelled')} size="small" color="error" variant="outlined" /> : '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </Box>
        )}
      </div>
    </Box>
  );
}

import { Box, Typography, Paper, CircularProgress, Stack } from '@mui/material';
import { Container as Grid, Item as GridItem } from '../../components/ui/Grid';
import { Users, Briefcase, Wallet, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import RevenueChart from '../../components/charts/RevenueChart';
import ExpensesChart from '../../components/charts/ExpensesChart';
import ProjectsChart from '../../components/charts/ProjectsChart';
import { formatCurrency } from '../../utils/format';
import useTranslate from '../../utils/useTranslate';
import { useEffect, useMemo } from 'react';
import { useEmployees } from '../../hooks/api';
import { useProjects, useTransactions, useFinancialReport } from '../../hooks/api';

export default function Dashboard() {
  const t = useTranslate();

  useEffect(() => { document.title = t('nav.dashboard'); }, [t]);

  const { data: empData, isLoading: empLoading } = useEmployees({ limit: 100 });
  const { data: projData, isLoading: projLoading } = useProjects({ limit: 100 });
  const { data: txData, isLoading: txLoading } = useTransactions({ limit: 100 });
  const { data: report, isLoading: reportLoading } = useFinancialReport();

  const employees = empData?.data || [];
  const projects = projData?.data || [];
  const txns = txData?.data || [];
  const summary = txData?.summary || {};
  const finReport = report?.summary || {};

  const totalIncome = summary.totalIncome || finReport.totalIncome || 0;
  const totalExpense = summary.totalExpense || finReport.totalExpense || 0;
  const netBalance = summary.netBalance || finReport.netBalance || 0;

  const activeProjects = projects.filter(p => p.status !== 'COMPLETED' && p.status !== 'CANCELLED');

  const stats = [
    { title: t('dashboard.totalEmployees'), value: String(employees.length), icon: Users, color: 'primary', trend: 'up', trendValue: employees.length + ' ' + t('common.total') },
    { title: t('dashboard.activeProjects'), value: String(activeProjects.length), icon: Briefcase, color: 'secondary', trend: 'up', trendValue: activeProjects.length + ' ' + t('common.active') },
    { title: t('dashboard.treasuryBalance'), value: formatCurrency(netBalance), icon: Wallet, color: 'success', trend: 'up' },
    { title: t('dashboard.monthlyExpenses'), value: formatCurrency(totalExpense), icon: CreditCard, color: 'warning', trend: 'down' },
    { title: t('dashboard.totalRevenue'), value: formatCurrency(totalIncome), icon: TrendingUp, color: 'info', trend: 'up' },
    { title: t('dashboard.pendingInvoices'), value: '—', icon: DollarSign, color: 'error' },
  ];

  const incomeByMonth = {};
  const expenseByMonth = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  txns.forEach((tx) => {
    const d = new Date(tx.date);
    const m = d.getMonth();
    if (tx.type === 'INCOME') incomeByMonth[m] = (incomeByMonth[m] || 0) + parseFloat(tx.amount);
    if (tx.type === 'EXPENSE') expenseByMonth[m] = (expenseByMonth[m] || 0) + parseFloat(tx.amount);
  });

  const labels = monthNames.slice(0, new Date().getMonth() + 1);
  const revenueData = {
    labels,
    income: labels.map((_, i) => incomeByMonth[i] || 0),
    expenses: labels.map((_, i) => expenseByMonth[i] || 0),
  };

  const expenseByCategory = useMemo(() => {
    const cat = {};
    txns.filter(t => t.type === 'EXPENSE').forEach((tx) => {
      const c = tx.category || 'Other';
      cat[c] = (cat[c] || 0) + parseFloat(tx.amount);
    });
    return cat;
  }, [txns]);

  const expensesData = useMemo(() => ({
    labels: Object.keys(expenseByCategory).slice(0, 6),
    values: Object.values(expenseByCategory).slice(0, 6),
  }), [expenseByCategory]);

  const statusCounts = useMemo(() => {
    const sc = {};
    projects.forEach((p) => { sc[p.status] = (sc[p.status] || 0) + 1; });
    return sc;
  }, [projects]);

  const projectsData = useMemo(() => ({
    labels: Object.keys(statusCounts),
    values: Object.values(statusCounts),
  }), [statusCounts]);

  const isLoading = empLoading || projLoading || txLoading || reportLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>{t('dashboard.title')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{t('dashboard.subtitle')}</Typography>
      </Box>

      <Grid spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((stat, i) => (
          <GridItem xs={12} sm={6} md={4} lg={2} key={i}>
            <StatCard {...stat} />
          </GridItem>
        ))}
      </Grid>

      <Grid spacing={2.5} sx={{ mb: 3 }}>
        <GridItem xs={12} lg={7}><RevenueChart data={revenueData} title={t('dashboard.revenueOverview')} /></GridItem>
        <GridItem xs={12} sm={6} lg={2.5}><ExpensesChart data={expensesData} title={t('dashboard.expensesBreakdown')} /></GridItem>
        <GridItem xs={12} sm={6} lg={2.5}><ProjectsChart data={projectsData} title={t('dashboard.projectStatus')} /></GridItem>
      </Grid>

      <Grid spacing={2.5}>
        <GridItem xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{t('dashboard.financialSummary')}</Typography>
            <Stack spacing={2}>
              {[
                { label: t('dashboard.totalRevenue'), value: formatCurrency(totalIncome), color: '#10B981' },
                { label: t('dashboard.totalExpenses'), value: formatCurrency(totalExpense), color: '#EF4444' },
                { label: t('dashboard.netProfit'), value: formatCurrency(totalIncome - totalExpense), color: '#0F172A' },
                { label: t('dashboard.treasuryBalance'), value: formatCurrency(netBalance), color: '#06B6D4' },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: item.color }}>{item.value}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </GridItem>
      </Grid>
    </Box>
  );
}

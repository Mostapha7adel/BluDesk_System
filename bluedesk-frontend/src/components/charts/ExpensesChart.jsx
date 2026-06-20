import { useTheme, Paper, Box, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import './ChartSetup';

export default function ExpensesChart({ data, loading, title = 'Expenses Breakdown' }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        data: data?.values || [],
        backgroundColor: isDark
          ? ['#38BDF8', '#FBBF24', '#34D399', '#FB923C', '#F87171', '#A78BFA']
          : ['#0F172A', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, padding: 16, color: isDark ? '#94A3B8' : '#64748B', font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#0F172A',
        padding: 12,
        cornerRadius: 8,
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{title}</Typography>
      <Box sx={{ height: 280, display: 'flex', justifyContent: 'center' }}>
        <Doughnut data={chartData} options={options} />
      </Box>
    </Paper>
  );
}

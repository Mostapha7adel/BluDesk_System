import { useTheme, Paper, Box, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import './ChartSetup';

export default function RevenueChart({ data, loading, title = 'Revenue Overview' }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        label: 'Income',
        data: data?.income || [],
        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.8)' : 'rgba(15, 23, 42, 0.8)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: data?.expenses || [],
        backgroundColor: isDark ? 'rgba(251, 191, 36, 0.7)' : 'rgba(6, 182, 212, 0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#0F172A',
        titleColor: '#F1F5F9',
        bodyColor: '#CBD5E1',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8' } },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
        ticks: { color: '#94A3B8', callback: (v) => '$' + v.toLocaleString() },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>{title}</Typography>
      <Box sx={{ height: 280 }}>
        <Bar data={chartData} options={options} />
      </Box>
    </Paper>
  );
}

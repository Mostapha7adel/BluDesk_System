import { Paper, Box, Typography } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import './ChartSetup';

export default function ProjectsChart({ data, loading, title = 'Project Status' }) {
  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        data: data?.values || [],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#06B6D4', '#EF4444'],
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
        labels: { usePointStyle: true, padding: 16, color: '#64748B', font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 12,
        cornerRadius: 8,
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

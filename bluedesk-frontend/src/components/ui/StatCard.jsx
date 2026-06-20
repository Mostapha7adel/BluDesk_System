import { Box, Typography, Paper } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color = 'primary', trend, trendValue, subtitle, loading }) {
  if (loading) {
    return (
      <Paper sx={{ p: 2.5, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ '@keyframes shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } }, background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 1, height: 100 }} />
      </Paper>
    );
  }

  const trendColor = trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>{value}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
          )}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <TrendIcon size={14} style={{ color: trendColor }} />
              <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>{trendValue}</Typography>
            </Box>
          )}
        </Box>
        {Icon && (
          <Box sx={{
            width: 44, height: 44, borderRadius: 2.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `${color}.main`,
            color: 'white',
            opacity: 0.9,
          }}>
            <Icon size={20} />
          </Box>
        )}
      </Box>
    </Paper>
  );
}

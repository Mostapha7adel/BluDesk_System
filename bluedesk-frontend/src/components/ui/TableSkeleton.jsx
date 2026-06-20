import { Box, Skeleton, Paper } from '@mui/material';

export default function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
      </Box>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, borderBottom: i < rows - 1 ? 1 : 0, borderColor: 'divider' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} variant="rectangular" height={20} sx={{ flex: 1, borderRadius: 1 }} />
          ))}
        </Box>
      ))}
    </Paper>
  );
}

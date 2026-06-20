import { Box, Typography, Button, useTheme } from '@mui/material';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, subtitle, actionLabel, onAction, actionIcon: ActionIcon, actions }) {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  return (
    <Box sx={{ display: 'flex', flexDirection: isRtl ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {actions}
        {actionLabel && !actions && (
          <Button
            variant="contained"
            onClick={onAction}
            startIcon={ActionIcon ? <ActionIcon size={16} /> : <Plus size={16} />}
            sx={{ borderRadius: 2, height: 40, whiteSpace: 'nowrap' }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}
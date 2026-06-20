import { Box, Typography, Button } from '@mui/material';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', description = 'No records available yet.', actionLabel, onAction }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, px: 2 }}>
      <Box sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Icon size={28} style={{ opacity: 0.4 }} />
      </Box>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, opacity: 0.7 }}>{description}</Typography>
      {actionLabel && <Button variant="contained" onClick={onAction}>{actionLabel}</Button>}
    </Box>
  );
}

import { Chip } from '@mui/material';
import { getStatusColor } from '../../utils/format';

export default function StatusBadge({ status, size = 'small' }) {
  const color = getStatusColor(status);

  const labels = {
    ACTIVE: 'Active', INACTIVE: 'Inactive', SUSPENDED: 'Suspended',
    ON_LEAVE: 'On Leave', TERMINATED: 'Terminated',
    NEW: 'New', ANALYSIS: 'Analysis', DESIGN: 'Design',
    DEVELOPMENT: 'Development', TESTING: 'Testing',
    COMPLETED: 'Completed', CANCELLED: 'Cancelled',
    PLANNING: 'Planning', IN_PROGRESS: 'In Progress', ON_HOLD: 'On Hold',
  };

  return (
    <Chip
      label={labels[status] || status}
      size={size}
      color={color !== 'default' ? color : undefined}
      variant={color === 'default' ? 'outlined' : 'filled'}
      sx={{
        fontWeight: 500,
        fontSize: size === 'small' ? 11 : 12,
        height: size === 'small' ? 24 : 28,
        borderRadius: 1.5,
      }}
    />
  );
}

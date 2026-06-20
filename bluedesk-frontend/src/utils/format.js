export const formatCurrency = (amount, locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date, locale = 'en-US') => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date, locale = 'en-US') => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const map = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    SUSPENDED: 'error',
    ON_LEAVE: 'warning',
    TERMINATED: 'error',
    NEW: 'info',
    ANALYSIS: 'warning',
    DESIGN: 'secondary',
    DEVELOPMENT: 'primary',
    TESTING: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
    PLANNING: 'info',
    IN_PROGRESS: 'primary',
    ON_HOLD: 'warning',
  };
  return map[status] || 'default';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
};

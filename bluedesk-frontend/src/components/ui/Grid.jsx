import { Box } from '@mui/material';

const breakpoints = { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 };

const getWidth = (val) => {
  if (!val || val === true) return '100%';
  if (val === 'auto') return 'auto';
  return `${(val / 12) * 100}%`;
};

export function Container({ children, spacing = 2.5, sx = {}, ...props }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -spacing / 2, width: `calc(100% + ${spacing}px)`, ...sx }}>
      {children}
    </Box>
  );
}

export function Item({ children, xs, sm, md, lg, xl, sx = {}, ...props }) {
  const styles = {
    flexBasis: getWidth(xs),
    maxWidth: getWidth(xs),
    padding: 1.25,
    flexGrow: 0,
    minWidth: 0,
    ...sx,
  };

  if (sm) { styles['@media (min-width: 640px)'] = { flexBasis: getWidth(sm), maxWidth: getWidth(sm) }; }
  if (md) { styles['@media (min-width: 768px)'] = { flexBasis: getWidth(md), maxWidth: getWidth(md) }; }
  if (lg) { styles['@media (min-width: 1024px)'] = { flexBasis: getWidth(lg), maxWidth: getWidth(lg) }; }
  if (xl) { styles['@media (min-width: 1280px)'] = { flexBasis: getWidth(xl), maxWidth: getWidth(xl) }; }

  return <Box sx={styles}>{children}</Box>;
}

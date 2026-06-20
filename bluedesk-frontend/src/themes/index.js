import { createTheme } from '@mui/material/styles';

const common = {
  typography: {
    fontFamily: '"Inter", "Cairo", "Noto Sans Arabic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.125rem', fontWeight: 600 },
    h5: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8125rem' },
    caption: { fontSize: '0.75rem' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 10 },
  breakpoints: {
    values: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280 },
  },
};

const componentOverrides = {
  MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  MuiButton: { styleOverrides: { root: { borderRadius: 8, padding: '8px 16px', fontSize: '0.875rem' }, contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' } } } },
  MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
  MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } } },
  MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } } },
  MuiTableHead: { styleOverrides: { root: { '& .MuiTableCell-head': { fontWeight: 600 } } } },
  MuiDrawer: { styleOverrides: { paper: { border: 'none' } } },
  MuiDialog: { styleOverrides: { paper: { borderRadius: 12 } } },
};

export const lightTheme = createTheme({
  ...common,
  palette: {
    mode: 'light',
    primary: { main: '#0F172A', light: '#1E293B', dark: '#020617', contrastText: '#FFFFFF' },
    secondary: { main: '#06B6D4', light: '#22D3EE', dark: '#0891B2', contrastText: '#FFFFFF' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#475569' },
    divider: '#E2E8F0',
    grey: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' },
    success: { main: '#10B981', light: '#D1FAE5', dark: '#059669' },
    warning: { main: '#F59E0B', light: '#FEF3C7', dark: '#D97706' },
    error: { main: '#EF4444', light: '#FEE2E2', dark: '#DC2626' },
    info: { main: '#3B82F6', light: '#DBEAFE', dark: '#2563EB' },
  },
  components: {
    ...componentOverrides,
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)' } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' } } },
    MuiTableHead: { styleOverrides: { root: { '& .MuiTableCell-head': { fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC' } } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 12, boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' } } },
  },
});

export const darkTheme = createTheme({
  ...common,
  palette: {
    mode: 'dark',
    primary: { main: '#E2E8F0', light: '#F1F5F9', dark: '#CBD5E1', contrastText: '#0F172A' },
    secondary: { main: '#22D3EE', light: '#67E8F9', dark: '#06B6D4', contrastText: '#0F172A' },
    background: { default: '#0B1121', paper: '#111827' },
    text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    divider: '#1E293B',
    grey: { 50: '#0F172A', 100: '#1E293B', 200: '#334155', 300: '#475569', 400: '#64748B', 500: '#94A3B8', 600: '#CBD5E1', 700: '#E2E8F0', 800: '#F1F5F9', 900: '#F8FAFC' },
    success: { main: '#10B981', light: '#064E3B', dark: '#34D399' },
    warning: { main: '#F59E0B', light: '#78350F', dark: '#FBBF24' },
    error: { main: '#EF4444', light: '#7F1D1D', dark: '#F87171' },
    info: { main: '#3B82F6', light: '#1E3A5F', dark: '#60A5FA' },
  },
  components: {
    ...componentOverrides,
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.3)' } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #1E293B', borderRadius: 12, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.2)' } } },
    MuiTableHead: { styleOverrides: { root: { '& .MuiTableCell-head': { fontWeight: 600, color: '#94A3B8', backgroundColor: '#111827' } } } },
  },
});

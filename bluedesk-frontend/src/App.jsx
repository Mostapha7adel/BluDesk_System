import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { lightTheme, darkTheme } from './themes';
import { selectThemeMode } from './store/themeSlice';
import { selectDirection } from './store/directionSlice';
import { silentRefresh } from './api/axios';
import { selectIsAuthenticated } from './store/authSlice';
import ErrorBoundary from './components/ui/ErrorBoundary';
import AppRoutes from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

function AppContent() {
  const mode = useSelector(selectThemeMode);
  const dir = useSelector(selectDirection);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    silentRefresh().finally(() => setInitializing(false));
  }, []);

  const cache = useMemo(() => {
    if (dir === 'rtl') {
      return createCache({
        key: 'muirtl',
        stylisPlugins: [prefixer, rtlPlugin],
      });
    }
    return createCache({ key: 'mui' });
  }, [dir]);

  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  if (initializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={{ ...theme, direction: dir }}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: dir === 'rtl' ? 'left' : 'right' }}
          autoHideDuration={3000}
          dense
        >
          <ErrorBoundary><AppRoutes /></ErrorBoundary>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/authSlice';
import { useAuth } from '../../hooks/useAuth';
import useTranslate from '../../utils/useTranslate';

export default function Login() {
  const t = useTranslate();
  const navigate = useNavigate();
  const { login } = useAuth();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = t('auth.login'); }, [t]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img src="/logo.jpg" alt="logo" style={{ width: 48, height: 48, borderRadius: 16, margin: '0 auto 16px', objectFit: 'cover', display: 'block' }} />
          <Typography variant="h5" fontWeight={700}>{t('auth.login')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{t('app.tagline')}</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth size="small" label={t('auth.email')} type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }}
          />
          <TextField
            fullWidth size="small" label={t('auth.password')} type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 3 }}
          />
          <Button
            type="submit" fullWidth variant="contained" size="large" disabled={loading}
            sx={{ borderRadius: 2, height: 44 }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : t('auth.login')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

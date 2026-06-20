import { useState } from 'react';
import { Box, IconButton, Avatar, Menu, MenuItem, Divider, ListItemIcon, Typography, useTheme } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, selectThemeMode } from '../../store/themeSlice';
import { selectDirection } from '../../store/directionSlice';
import { Menu as MenuIcon, Sun, Moon, Bell, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ar from '../../utils/translations';

export default function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const mode = useSelector(selectThemeMode);
  const dir = useSelector(selectDirection);

  const t = (key) => {
    const keys = key.split('.');
    let val = ar;
    for (const k of keys) val = val?.[k];
    return val || key;
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: { xs: 2, md: 3 },
      height: 64,
      borderBottom: 1,
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
          <MenuIcon size={20} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton onClick={() => dispatch(toggleTheme())} sx={{ color: 'text.secondary' }}>
          {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>

        <IconButton sx={{ color: 'text.secondary' }}>
          <Bell size={18} />
        </IconButton>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 600 }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: dir === 'rtl' ? 'left' : 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: dir === 'rtl' ? 'left' : 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 2, boxShadow: '0 10px 40px rgba(0,0,0,0.15)' } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
            <ListItemIcon><Settings size={16} /></ListItemIcon> {t('auth.settings')}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogOut size={16} /></ListItemIcon> {t('auth.logout')}
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

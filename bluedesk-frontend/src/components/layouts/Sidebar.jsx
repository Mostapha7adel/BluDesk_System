import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import {
  LayoutDashboard, Users, Briefcase, FolderGit2, Wallet, DollarSign, Shield, History, Settings, X, ChevronLeft, ChevronRight, BarChart3
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectIsRtl } from '../../store/directionSlice';
import { selectUser } from '../../store/authSlice';
import ar from '../../utils/translations';

const NAV_ITEMS = [
  { labelKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, perm: null },
  { labelKey: 'nav.employees', path: '/employees', icon: Users, perm: 'employees.read' },
  { labelKey: 'nav.projects', path: '/projects', icon: Briefcase, perm: 'projects.read' },
  { labelKey: 'nav.internalProjects', path: '/internal-projects', icon: FolderGit2, perm: 'internal_projects.read' },
  { labelKey: 'nav.finance', path: '/finance', icon: Wallet, perm: 'finance.read' },
  { labelKey: 'nav.reports', path: '/reports', icon: BarChart3, perm: 'finance.generate_report' },
  { labelKey: 'nav.salaries', path: '/salaries', icon: DollarSign, perm: 'salaries.read' },
  { labelKey: 'nav.roles', path: '/permissions', icon: Shield, perm: 'roles.read' },
  { labelKey: 'nav.auditLogs', path: '/audit-logs', icon: History, perm: 'audit_logs.read' },
  { labelKey: 'nav.settings', path: '/settings', icon: Settings, perm: 'settings.read' },
];

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export default function Sidebar({ open, onClose, collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isRtl = useSelector(selectIsRtl);
  const user = useSelector(selectUser);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const perms = user?.permissions || [];
  const isSuperAdmin = user?.role?.slug === 'super_admin';
  const visibleItems = NAV_ITEMS.filter(item => !item.perm || isSuperAdmin || perms.includes(item.perm));

  const t = (key) => {
    const keys = key.split('.');
    let val = ar;
    for (const k of keys) val = val?.[k];
    return val || key;
  };

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', px: collapsed ? 1 : 2.5, py: 2, height: 64, position: 'relative' }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img src="/logo.jpg" alt="logo" style={{ width: 32, height: 32, borderRadius: 12, objectFit: 'cover' }} />
            <Typography sx={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{t('app.name')}</Typography>
          </Box>
        )}
        {collapsed && (
          <img src="/logo.jpg" alt="logo" style={{ width: 32, height: 32, borderRadius: 12, objectFit: 'cover' }} />
        )}
        {isMobile && (
          <IconButton onClick={onClose} size="small"><X size={18} /></IconButton>
        )}
      </Box>

      {!isMobile && (
        <IconButton
          onClick={onToggle}
          sx={{
            alignSelf: 'center',
            mb: 1,
            color: 'text.secondary',
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' },
            width: 28, height: 28,
          }}
          size="small"
        >
          {collapsed ? (isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />) : (isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)}
        </IconButton>
      )}

      <List sx={{ px: collapsed ? 1 : 1.5, flex: 1 }}>
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); if (isMobile) onClose(); }}
              selected={isActive}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                minHeight: 44,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 1.5,
                '&.Mui-selected': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.06)',
                  '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(6, 182, 212, 0.18)' : 'rgba(15, 23, 42, 0.1)' },
                  '& .MuiListItemIcon-root': { color: theme.palette.mode === 'dark' ? '#22D3EE' : '#0F172A' },
                  '& .MuiListItemText-primary': { color: theme.palette.mode === 'dark' ? '#F1F5F9' : '#0F172A', fontWeight: 600 },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: 'center', color: isActive ? 'primary.main' : 'text.secondary' }}>
                <Icon size={20} />
              </ListItemIcon>
              {!collapsed && <ListItemText primary={t(item.labelKey)} slotProps={{ primary: { fontSize: 14, fontWeight: isActive ? 600 : 400 } }} />}
            </ListItemButton>
          );
        })}
      </List>

      {!collapsed && (
        <Box sx={{ px: 2.5, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">{t('app.name')} ERP v1.0</Typography>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        variant="temporary"
        anchor={isRtl ? 'right' : 'left'}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderRight: isRtl ? 'none' : 1,
            borderLeft: isRtl ? 1 : 'none',
            borderColor: 'divider',
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      anchor={isRtl ? 'right' : 'left'}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          bgcolor: 'background.paper',
          borderRight: isRtl ? 'none' : 1,
          borderLeft: isRtl ? 1 : 'none',
          borderColor: 'divider',
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {content}
    </Drawer>
  );
}

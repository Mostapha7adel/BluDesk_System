import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { selectIsAuthenticated } from '../store/authSlice';
import MainLayout from '../components/layouts/MainLayout';

const Login = lazy(() => import('../pages/auth/Login'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Employees = lazy(() => import('../pages/employees/Employees'));
const Projects = lazy(() => import('../pages/projects/Projects'));
const InternalProjects = lazy(() => import('../pages/internal-projects/InternalProjects'));
const Finance = lazy(() => import('../pages/finance/Finance'));
const Permissions = lazy(() => import('../pages/permissions/Permissions'));
const AuditLogs = lazy(() => import('../pages/audit-logs/AuditLogs'));
const Salaries = lazy(() => import('../pages/salaries/Salaries'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const Reports = lazy(() => import('../pages/reports/Reports'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress size={32} />
  </Box>
);

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><Suspense fallback={<PageLoader />}><Login /></Suspense></AuthRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></MainLayout></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><Employees /></Suspense></MainLayout></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><Projects /></Suspense></MainLayout></ProtectedRoute>} />
      <Route path="/internal-projects" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><InternalProjects /></Suspense></MainLayout></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><Finance /></Suspense></MainLayout></ProtectedRoute>} />
      <Route path="/permissions" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><Permissions /></Suspense></MainLayout></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><AuditLogs /></Suspense></MainLayout></ProtectedRoute>} />
      <Route path="/salaries" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><Salaries /></Suspense></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><Settings /></Suspense></MainLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><MainLayout><Suspense fallback={<PageLoader />}><Reports /></Suspense></MainLayout></ProtectedRoute>} />
    </Routes>
  );
}

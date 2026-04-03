import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { LoadingScreen } from '../components/shared/LoadingScreen';

// Public views
import PublicDisplayView from '../views/public/PublicDisplayView';
import FixtureBoardView from '../views/public/FixtureBoardView';

// Auth
import LoginView from '../views/auth/LoginView';

// Coordinator
import CoordinatorDashboard from '../views/coordinator/CoordinatorDashboard';
import CoordinatorMatchPanel from '../views/coordinator/CoordinatorMatchPanel';
import CoordinatorCulturalPanel from '../views/coordinator/CoordinatorCulturalPanel';

// Admin
import AdminDashboard from '../views/admin/AdminDashboard';
import AdminCoordinatorsView from '../views/admin/AdminCoordinatorsView';
import AdminFranchisesView from '../views/admin/AdminFranchisesView';
import AdminSportsView from '../views/admin/AdminSportsView';
import AdminFixtureBuilder from '../views/admin/AdminFixtureBuilder';
import AdminVideoControlView from '../views/admin/AdminVideoControlView';
import AdminHeadlinesView from '../views/admin/AdminHeadlinesView';
import AdminBrandingView from '../views/admin/AdminBrandingView';

// ── Route Guards ────────────────────────────────────────────────

function CoordinatorGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (user.role === 'admin') { navigate('/admin', { replace: true }); return; }
  }, [user, loading, navigate]);

  if (loading) return <LoadingScreen message="Authenticating..." />;
  if (!user || user.role !== 'coordinator') return null;
  return <Outlet />;
}

function AdminGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (user.role === 'coordinator') { navigate('/coordinator', { replace: true }); return; }
  }, [user, loading, navigate]);

  if (loading) return <LoadingScreen message="Authenticating..." />;
  if (!user || user.role !== 'admin') return null;
  return <Outlet />;
}

// ── Router ──────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicDisplayView />,
  },
  {
    path: '/fixtures',
    element: <FixtureBoardView />,
  },
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/coordinator',
    element: <CoordinatorGuard />,
    children: [
      { index: true, element: <CoordinatorDashboard /> },
      { path: 'match/:matchId', element: <CoordinatorMatchPanel /> },
      { path: 'event/:eventId', element: <CoordinatorCulturalPanel /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'coordinators', element: <AdminCoordinatorsView /> },
      { path: 'franchises', element: <AdminFranchisesView /> },
      { path: 'sports', element: <AdminSportsView /> },
      { path: 'fixtures', element: <AdminFixtureBuilder /> },
      { path: 'video', element: <AdminVideoControlView /> },
      { path: 'headlines', element: <AdminHeadlinesView /> },
      { path: 'branding', element: <AdminBrandingView /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

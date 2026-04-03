import { createBrowserRouter, Navigate } from 'react-router';
import { WelcomePage } from './pages/WelcomePage';
import { PublicDisplay } from './pages/PublicDisplay';
import { CoordinatorLogin } from './pages/CoordinatorLogin';
import { CoordinatorDashboard } from './pages/CoordinatorDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { VideoControl } from './pages/admin/VideoControl';
import { Headlines } from './pages/admin/Headlines';
import { Coordinators } from './pages/admin/Coordinators';
import { Franchises } from './pages/admin/Franchises';
import { Sports } from './pages/admin/Sports';
import { Fixtures } from './pages/admin/Fixtures';
import { Branding } from './pages/admin/Branding';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomePage />,
  },
  {
    path: '/display',
    element: <PublicDisplay />,
  },
  {
    path: '/coordinator',
    children: [
      {
        index: true,
        element: <Navigate to="/coordinator/login" replace />,
      },
      {
        path: 'login',
        element: <CoordinatorLogin />,
      },
      {
        path: 'dashboard',
        element: <CoordinatorDashboard />,
      },
    ],
  },
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <Navigate to="/admin/login" replace />,
      },
      {
        path: 'login',
        element: <AdminLogin />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'video-control',
        element: <VideoControl />,
      },
      {
        path: 'headlines',
        element: <Headlines />,
      },
      {
        path: 'coordinators',
        element: <Coordinators />,
      },
      {
        path: 'franchises',
        element: <Franchises />,
      },
      {
        path: 'sports',
        element: <Sports />,
      },
      {
        path: 'fixtures',
        element: <Fixtures />,
      },
      {
        path: 'branding',
        element: <Branding />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
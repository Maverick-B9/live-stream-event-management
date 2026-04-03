import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useEvent } from '../contexts/EventContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  LogOut, 
  Users, 
  Flag, 
  Trophy, 
  Calendar,
  Video,
  MessageSquare,
  Palette,
  Settings,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { 
    matches, 
    coordinators, 
    streamRequests,
    franchises,
    sports,
    branding,
  } = useEvent();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    navigate('/admin/login');
    return null;
  }

  const liveMatches = matches.filter(m => m.status === 'live').length;
  const onlineCoordinators = coordinators.filter(c => c.online).length;
  const pendingRequests = streamRequests.filter(r => r.status === 'pending').length;

  const modules = [
    {
      title: 'Coordinators',
      description: 'Manage coordinators and assignments',
      icon: Users,
      path: '/admin/coordinators',
      color: 'bg-blue-500',
      count: coordinators.length,
    },
    {
      title: 'Franchises',
      description: 'Manage franchises, logos, and colors',
      icon: Flag,
      path: '/admin/franchises',
      color: 'bg-purple-500',
      count: franchises.length,
    },
    {
      title: 'Sports & Events',
      description: 'Configure sports and cultural events',
      icon: Trophy,
      path: '/admin/sports',
      color: 'bg-green-500',
      count: sports.length,
    },
    {
      title: 'Fixtures',
      description: 'Create and manage match fixtures',
      icon: Calendar,
      path: '/admin/fixtures',
      color: 'bg-orange-500',
      count: matches.length,
    },
    {
      title: 'Video Control',
      description: 'Manage streams and approve requests',
      icon: Video,
      path: '/admin/video-control',
      color: 'bg-red-500',
      badge: pendingRequests > 0 ? pendingRequests : undefined,
    },
    {
      title: 'Headlines',
      description: 'Manage global and event ticker',
      icon: MessageSquare,
      path: '/admin/headlines',
      color: 'bg-cyan-500',
    },
    {
      title: 'Branding',
      description: 'Logos, colors, and animations',
      icon: Palette,
      path: '/admin/branding',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="bg-gray-900 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Admin Control Panel</h1>
            <Badge variant="outline" className="border-white/20 text-white">
              {user.name}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => { logout(); navigate('/admin/login'); }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Matches</p>
                  <p className="text-3xl font-bold">{liveMatches}</p>
                </div>
                <Activity className="w-10 h-10 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Online Coordinators</p>
                  <p className="text-3xl font-bold">{onlineCoordinators}</p>
                </div>
                <Users className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold">{pendingRequests}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Matches</p>
                  <p className="text-3xl font-bold">{matches.length}</p>
                </div>
                <Trophy className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Control Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => (
              <motion.div
                key={module.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={module.path}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`${module.color} p-3 rounded-lg text-white`}>
                          <module.icon className="w-6 h-6" />
                        </div>
                        {module.badge !== undefined && (
                          <Badge variant="destructive">{module.badge}</Badge>
                        )}
                        {module.count !== undefined && (
                          <Badge variant="secondary">{module.count}</Badge>
                        )}
                      </div>
                      <CardTitle className="mt-4">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/admin/video-control">
                  <Video className="w-4 h-4 mr-2" />
                  Manage Streams
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/fixtures">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Match
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/headlines">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Headline
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/display">
                  <Activity className="w-4 h-4 mr-2" />
                  View Public Display
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
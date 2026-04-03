import React from 'react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { EventLogo } from '../components/shared/EventLogo';
import { useEvent } from '../contexts/EventContext';
import { Tv, UserCircle2, Shield, Info } from 'lucide-react';
import { motion } from 'motion/react';

export function WelcomePage() {
  const { branding } = useEvent();

  const portals = [
    {
      title: 'Public Display',
      description: 'Broadcast-grade live event display with scores, video, and news ticker',
      icon: Tv,
      path: '/display',
      color: 'from-blue-500 to-blue-700',
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Coordinator Portal',
      description: 'Manage scores, video streams, and event-level headlines',
      icon: UserCircle2,
      path: '/coordinator/login',
      color: 'from-green-500 to-green-700',
      iconBg: 'bg-green-500',
      credentials: 'coordinator1@sportsevent.com / password',
    },
    {
      title: 'Admin Control Panel',
      description: 'Full access to all events, coordinators, fixtures, and video control',
      icon: Shield,
      path: '/admin/login',
      color: 'from-purple-500 to-purple-700',
      iconBg: 'bg-purple-500',
      credentials: 'admin@sportsevent.com / password',
    },
  ];

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` 
      }}
    >
      <div className="w-full max-w-5xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <EventLogo size="xl" className="mx-auto mb-6" animate />
          <h1 className="text-5xl font-bold text-white mb-3">{branding.eventName}</h1>
          <p className="text-xl text-white/80">
            Live Sports & Cultural Event Management Platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={portal.path}>
                <Card className="hover:shadow-2xl transition-all hover:scale-105 cursor-pointer h-full">
                  <CardHeader>
                    <div className={`${portal.iconBg} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4`}>
                      <portal.icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl mb-2">{portal.title}</CardTitle>
                    <CardDescription className="text-base">
                      {portal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" size="lg">
                      Access Portal
                    </Button>
                    {portal.credentials && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                        <p className="font-medium text-gray-600 mb-1">Demo Login:</p>
                        <p className="font-mono text-gray-800">{portal.credentials}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white"
        >
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Platform Features</h3>
              <ul className="space-y-1 text-sm text-white/90">
                <li>• Real-time score updates and live match tracking</li>
                <li>• Multi-sport support with customizable scoring schemas</li>
                <li>• Video stream management with coordinator request/admin approval workflow</li>
                <li>• Dual-layer news ticker (global + event-level)</li>
                <li>• 11 franchises with custom colors and branding</li>
                <li>• Coordinator-specific dashboards with role-based permissions</li>
                <li>• Fixture management, branding controls, and animated transitions</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-8 text-white/60 text-sm">
          <p>Championship Series 2026 • Live Event Management Platform</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import { EventLogo } from '../../components/shared/EventLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import {
  LogOut, Users, Wifi, AlertCircle, BarChart2, Video, Calendar,
  Tv, FileText, Palette, Music, Trophy, Check, X, ChevronRight, Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import type { StreamRequest } from '../../types';

function StreamRequestCard({ req }: { req: StreamRequest }) {
  const { approveStreamRequest, rejectStreamRequest } = useEvent();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState('');

  const handleApprove = async () => {
    setLoading('approve');
    try {
      await approveStreamRequest(req, note);
      toast.success('Stream request approved!');
    } catch { toast.error('Failed.'); }
    setLoading('');
  };

  const handleReject = async () => {
    if (!note.trim()) { toast.error('Please add a note when rejecting.'); return; }
    setLoading('reject');
    try {
      await rejectStreamRequest(req, note);
      toast.success('Request rejected.');
    } catch { toast.error('Failed.'); }
    setLoading('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{req.coordinatorName}</div>
          <div className="text-xs text-gray-400">
            {req.eventType === 'match' ? '⚽' : '🎭'} {req.eventName || req.eventId}
          </div>
          <div className="text-xs text-blue-400 mt-1 break-all">{req.requestedUrl}</div>
          <div className="text-xs text-gray-500 mt-0.5">{format(req.createdAt, 'MMM d, h:mm a')}</div>
        </div>
      </div>
      <Input
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Admin note (required for reject)..."
        className="bg-gray-800 border-gray-600 text-white text-xs h-8"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleApprove}
          disabled={!!loading}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm h-8"
        >
          {loading === 'approve' ? '...' : <><Check className="w-3.5 h-3.5 mr-1" />Approve</>}
        </Button>
        <Button
          onClick={handleReject}
          disabled={!!loading}
          className="flex-1 bg-red-700 hover:bg-red-600 text-white text-sm h-8"
        >
          {loading === 'reject' ? '...' : <><X className="w-3.5 h-3.5 mr-1" />Reject</>}
        </Button>
      </div>
    </motion.div>
  );
}

const NAV_ITEMS = [
  { to: '/admin/coordinators', icon: Users, label: 'Coordinators' },
  { to: '/admin/franchises', icon: Trophy, label: 'Franchises' },
  { to: '/admin/sports', icon: BarChart2, label: 'Sports' },
  { to: '/admin/fixtures', icon: Calendar, label: 'Fixture Builder' },
  { to: '/admin/video', icon: Video, label: 'Video Control' },
  { to: '/admin/headlines', icon: FileText, label: 'Headlines' },
  { to: '/admin/branding', icon: Palette, label: 'Branding' },
];

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { matches, culturalEvents, streamRequests, activityLog, branding } = useEvent();
  const navigate = useNavigate();

  const pendingRequests = streamRequests.filter(r => r.status === 'pending');
  const liveMatches = matches.filter(m => m.status === 'live');
  const liveCultural = culturalEvents.filter(e => e.status === 'live');

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 sticky top-0 z-10"
        style={{ backgroundColor: branding.primaryColor }}>
        <div className="flex items-center gap-3">
          <EventLogo size="sm" />
          <div>
            <div className="text-sm font-bold">{branding.eventName}</div>
            <div className="text-xs text-white/50">Admin Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70">{user?.name}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Live Matches', value: liveMatches.length, color: 'text-red-400', icon: '⚡' },
            { label: 'Live Events', value: liveCultural.length, color: 'text-purple-400', icon: '🎭' },
            { label: 'Pending Requests', value: pendingRequests.length, color: 'text-amber-400', icon: '🔔', highlight: pendingRequests.length > 0 },
            { label: 'Total Matches', value: matches.length, color: 'text-blue-400', icon: '📅' },
          ].map(c => (
            <div key={c.label}
              className={`bg-gray-900 border rounded-xl p-4 ${c.highlight ? 'border-amber-500/50' : 'border-gray-700'}`}>
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Pending stream requests */}
        {pendingRequests.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                Pending Stream Requests ({pendingRequests.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map(req => (
                <StreamRequestCard key={req.id} req={req} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nav grid */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Admin Modules</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {NAV_ITEMS.map(item => (
                <Link key={item.to} to={item.to}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl p-4 cursor-pointer transition-colors"
                  >
                    <item.icon className="w-6 h-6 mb-2" style={{ color: branding.secondaryColor }} />
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 mt-1" />
                  </motion.div>
                </Link>
              ))}
              <a href="/" target="_blank">
                <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl p-4 cursor-pointer transition-colors">
                  <Tv className="w-6 h-6 mb-2 text-green-400" />
                  <div className="text-sm font-medium text-white">Public Display</div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 mt-1" />
                </motion.div>
              </a>
            </div>
          </div>

          {/* Activity log */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Activity</h2>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2.5 max-h-80 overflow-y-auto">
              {activityLog.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">No recent activity</p>
              )}
              {activityLog.map(entry => (
                <div key={entry.id} className="flex items-start gap-2.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-gray-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-300">{entry.userName}</span>{' '}
                    <span className="text-gray-400">{entry.action}</span>
                    <div className="text-gray-600">{format(entry.timestamp, 'MMM d, HH:mm')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

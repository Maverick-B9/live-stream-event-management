import React from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EventLogo } from '../../components/shared/EventLogo';
import { LogOut, Calendar, Music } from 'lucide-react';
import * as Icons from 'lucide-react';
import { format } from 'date-fns';

export default function CoordinatorDashboard() {
  const { user, signOut } = useAuth();
  const { matches, culturalEvents, franchises, sports, branding } = useEvent();
  const navigate = useNavigate();

  const assignedMatchIds = user?.assignedEventIds || [];

  // Get assigned matches and cultural events
  const myMatches = matches.filter(m => assignedMatchIds.includes(m.id));
  const myCultural = culturalEvents.filter(e => assignedMatchIds.includes(e.id));

  // Group matches by sport
  const bySport = sports.map(sport => ({
    sport,
    matches: myMatches.filter(m => m.sportId === sport.id),
  })).filter(g => g.matches.length > 0);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0"
        style={{ backgroundColor: branding.primaryColor }}
      >
        <div className="flex items-center gap-3">
          <EventLogo size="sm" />
          <div>
            <div className="text-sm font-bold text-white">{branding.eventName}</div>
            <div className="text-xs text-white/60">Coordinator Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-white">{user?.name}</div>
            <div className="text-xs text-white/50">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {myMatches.length === 0 && myCultural.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Calendar className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg">No events assigned yet.</p>
            <p className="text-sm mt-1">Contact your admin to get events assigned.</p>
          </div>
        ) : (
          <>
            {/* Sports matches */}
            {bySport.map(({ sport, matches: sportMatches }) => {
              // @ts-ignore
              const Icon = Icons[sport.icon] || Icons.Trophy;
              return (
                <div key={sport.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                      {sport.name} · {sport.gender === 'men' ? 'Men' : 'Women'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sportMatches.map(m => {
                      const fa = franchises.find(f => f.id === m.franchiseAId);
                      const fb = franchises.find(f => f.id === m.franchiseBId);
                      return (
                        <motion.div
                          key={m.id}
                          whileHover={{ scale: 1.01 }}
                          className="bg-gray-900 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-gray-500 transition-colors"
                          onClick={() => navigate(`/coordinator/match/${m.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">
                              {format(m.dateTime, 'MMM d, h:mm a')}
                            </span>
                            <StatusBadge status={m.status} />
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: fa?.color }} />
                            <span className="text-white font-medium truncate">{fa?.name}</span>
                            <span className="text-gray-500 shrink-0">vs</span>
                            <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: fb?.color }} />
                            <span className="text-white font-medium truncate">{fb?.name}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">📍 {m.venue}</div>
                          {m.pendingStreamRequest && (
                            <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 rounded px-2 py-0.5">
                              ⏳ Stream request pending
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Cultural events */}
            {myCultural.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Music className="w-5 h-5 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Cultural Events</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {myCultural.map(ev => (
                    <motion.div
                      key={ev.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gray-900 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-gray-500 transition-colors"
                      onClick={() => navigate(`/coordinator/event/${ev.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{ev.type}</span>
                        <StatusBadge status={ev.status as any} />
                      </div>
                      <div className="text-white font-medium">{ev.name}</div>
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        <div>📍 {ev.venue}</div>
                        <div>🕐 {format(ev.scheduledAt, 'MMM d, h:mm a')}</div>
                      </div>
                      {ev.pendingStreamRequest && (
                        <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 rounded px-2 py-0.5">
                          ⏳ Stream request pending
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

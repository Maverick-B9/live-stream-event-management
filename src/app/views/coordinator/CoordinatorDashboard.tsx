import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EventLogo } from '../../components/shared/EventLogo';
import { LogOut, Calendar, Music, MessageSquare, Plus, Trash2, Tag, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';
import { format } from 'date-fns';

export default function CoordinatorDashboard() {
  const { user, signOut } = useAuth();
  const { matches, culturalEvents, franchises, sports, branding, updateBranding, updateMatch } = useEvent();
  const navigate = useNavigate();

  const [newGlobalHeadline, setNewGlobalHeadline] = useState('');
  const [matchHeadlines, setMatchHeadlines] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState(false);

  const assignedMatchIds = user?.assignedEventIds || [];
  const assignedSportIds = user?.assignedSportIds || [];

  // Get assigned matches and cultural events
  const myMatches = matches.filter(m => {
    // Check by clear ID match
    if (assignedMatchIds.includes(m.id)) return true;
    if (assignedSportIds.includes(m.sportId)) return true;
    
    // Fallback for existing coordinators/duplicates: Check by Sport Name + Gender
    const mSport = sports.find(s => s.id === m.sportId);
    if (mSport) {
      const isAssignedByName = sports
        .filter(s => assignedSportIds.includes(s.id))
        .some(s => s.name === mSport.name && s.gender === mSport.gender);
      if (isAssignedByName) return true;
    }
    return false;
  });
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
            {/* Headlines Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-white/10">
              {/* Global Headlines */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white">Global Event Ticker</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    value={newGlobalHeadline}
                    onChange={e => setNewGlobalHeadline(e.target.value)}
                    placeholder="Add global headline..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    onKeyDown={e => e.key === 'Enter' && handleAddGlobalHeadline()}
                  />
                  <button
                    onClick={handleAddGlobalHeadline}
                    disabled={!newGlobalHeadline.trim() || updating}
                    className="bg-amber-500 hover:bg-amber-400 text-black p-2 rounded-lg disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {branding.globalTickerHeadlines.map((h, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-300 truncate mr-2">{h}</span>
                      <button
                        onClick={() => handleRemoveGlobalHeadline(i)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {branding.globalTickerHeadlines.length === 0 && (
                    <p className="text-xs text-gray-600 text-center py-4">No global headlines active</p>
                  )}
                </div>
              </div>

              {/* Live Match Headlines */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-white">Live Match Updates</h3>
                </div>
                
                {myMatches.filter(m => m.status === 'live').length === 0 ? (
                  <p className="text-sm text-gray-600 py-4 text-center">No matches currently live</p>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {myMatches.filter(m => m.status === 'live').map(m => {
                      const fa = franchises.find(f => f.id === m.franchiseAId);
                      const fb = franchises.find(f => f.id === m.franchiseBId);
                      return (
                        <div key={m.id} className="space-y-2 bg-gray-800/30 p-3 rounded-lg border border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-500 uppercase">
                              {fa?.shortCode} vs {fb?.shortCode}
                            </span>
                            <MessageSquare className="w-3 h-3 text-gray-600" />
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={matchHeadlines[m.id] || ''}
                              onChange={e => setMatchHeadlines(p => ({ ...p, [m.id]: e.target.value }))}
                              placeholder="Match headline..."
                              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                              onKeyDown={e => e.key === 'Enter' && handleAddMatchHeadline(m.id)}
                            />
                            <button
                              onClick={() => handleAddMatchHeadline(m.id)}
                              disabled={!matchHeadlines[m.id]?.trim() || updating}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(m.tickerHeadlines || []).map((h, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5 text-[10px] text-blue-400">
                                <span className="truncate max-w-[100px]">{h}</span>
                                <button onClick={() => handleRemoveMatchHeadline(m.id, idx)} className="hover:text-white">×</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  async function handleAddGlobalHeadline() {
    if (!newGlobalHeadline.trim()) return;
    setUpdating(true);
    try {
      await updateBranding({ 
        globalTickerHeadlines: [...branding.globalTickerHeadlines, newGlobalHeadline.trim()] 
      });
      setNewGlobalHeadline('');
      toast.success('Global headline added');
    } catch { toast.error('Failed to update ticker'); }
    finally { setUpdating(true); }
  }

  async function handleRemoveGlobalHeadline(idx: number) {
    setUpdating(true);
    try {
      await updateBranding({ 
        globalTickerHeadlines: branding.globalTickerHeadlines.filter((_, i) => i !== idx) 
      });
    } catch { toast.error('Failed to remove'); }
    finally { setUpdating(true); }
  }

  async function handleAddMatchHeadline(matchId: string) {
    const text = matchHeadlines[matchId]?.trim();
    if (!text) return;
    setUpdating(true);
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      await updateMatch(matchId, {
        tickerHeadlines: [...(match.tickerHeadlines || []), text]
      });
      setMatchHeadlines(p => ({ ...p, [matchId]: '' }));
      toast.success('Update sent to ticker');
    } catch { toast.error('Failed to update match ticker'); }
    finally { setUpdating(true); }
  }

  async function handleRemoveMatchHeadline(matchId: string, idx: number) {
    setUpdating(true);
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      await updateMatch(matchId, {
        tickerHeadlines: match.tickerHeadlines.filter((_, i) => i !== idx)
      });
    } catch { toast.error('Failed to remove'); }
    finally { setUpdating(true); }
  }
}

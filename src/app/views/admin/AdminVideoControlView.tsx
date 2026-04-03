import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useEvent } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Check, X, Tv, Send } from 'lucide-react';
import { format } from 'date-fns';
import type { StreamRequest } from '../../types';

function StreamRequestCard({ req }: { req: StreamRequest }) {
  const { approveStreamRequest, rejectStreamRequest } = useEvent();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState('');

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
      <div>
        <div className="font-medium text-white text-sm">{req.coordinatorName}</div>
        <div className="text-xs text-gray-400">{req.eventType === 'match' ? 'Match' : 'Cultural'}: {req.eventName || req.eventId}</div>
        <div className="text-xs text-blue-400 mt-1 break-all">{req.requestedUrl}</div>
        <div className="text-xs text-gray-600">{format(req.createdAt, 'MMM d, h:mm a')}</div>
      </div>
      <Input value={note} onChange={e => setNote(e.target.value)} placeholder="Admin note..." className="bg-gray-800 border-gray-600 text-white text-xs h-8" />
      <div className="flex gap-2">
        <Button onClick={async () => { setLoading('a'); await approveStreamRequest(req, note); setLoading(''); toast.success('Approved!'); }}
          disabled={!!loading} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm h-8">
          {loading === 'a' ? '...' : <><Check className="w-3 h-3 mr-1" />Approve</>}
        </Button>
        <Button onClick={async () => { if (!note.trim()) { toast.error('Add a note'); return; } setLoading('r'); await rejectStreamRequest(req, note); setLoading(''); toast.success('Rejected.'); }}
          disabled={!!loading} className="flex-1 bg-red-700 hover:bg-red-600 text-white text-sm h-8">
          {loading === 'r' ? '...' : <><X className="w-3 h-3 mr-1" />Reject</>}
        </Button>
      </div>
    </div>
  );
}

export default function AdminVideoControlView() {
  const { matches, culturalEvents, franchises, sports, updateMatch, updateCulturalEvent, forceSetActiveStream, streamRequests, branding } = useEvent();
  const { user } = useAuth();
  const [editUrls, setEditUrls] = useState<Record<string, string>>({});

  const pendingRequests = streamRequests.filter(r => r.status === 'pending');

  const allEvents = [
    ...matches.map(m => {
      const fa = franchises.find(f => f.id === m.franchiseAId);
      const fb = franchises.find(f => f.id === m.franchiseBId);
      const sp = sports.find(s => s.id === m.sportId);
      return { id: m.id, type: 'match' as const, label: `${sp?.name}: ${fa?.shortCode} vs ${fb?.shortCode}`, streamUrl: m.streamUrl, status: m.status };
    }),
    ...culturalEvents.map(e => ({ id: e.id, type: 'cultural' as const, label: `Cultural: ${e.name}`, streamUrl: e.streamUrl, status: e.status })),
  ];

  const handleUpdateUrl = async (id: string, type: 'match' | 'cultural') => {
    const url = editUrls[id];
    if (!url) return;
    if (type === 'match') await updateMatch(id, { streamUrl: url });
    else await updateCulturalEvent(id, { streamUrl: url });
    toast.success('Stream URL updated!');
    setEditUrls(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleForcePush = async (id: string) => {
    await forceSetActiveStream(id);
    toast.success('Stream pushed to public display!');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <Link to="/admin" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-bold text-white">Video Control</h1>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-amber-400 mb-3">⏳ Pending Requests ({pendingRequests.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map(r => <StreamRequestCard key={r.id} req={r} />)}
            </div>
          </div>
        )}

        {/* Stream table */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">All Event Streams</h2>
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="text-left px-4 py-3">Event</th>
                  <th className="text-left px-4 py-3">Stream URL</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allEvents.map(ev => {
                  const isActive = branding.activeStreamEventId === ev.id;
                  return (
                    <tr key={ev.id} className={`border-b border-gray-800 ${isActive ? 'bg-green-500/5' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded">
                              <Tv className="w-3 h-3" /> ON AIR
                            </span>
                          )}
                          <span className="text-white text-sm">{ev.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editUrls[ev.id] !== undefined ? (
                          <div className="flex gap-1">
                            <Input
                              value={editUrls[ev.id]}
                              onChange={e => setEditUrls(prev => ({ ...prev, [ev.id]: e.target.value }))}
                              className="bg-gray-800 border-gray-600 text-white text-xs h-7 w-56"
                            />
                            <button onClick={() => handleUpdateUrl(ev.id, ev.type)} className="text-green-400 hover:text-green-300 px-1">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditUrls(prev => { const n = { ...prev }; delete n[ev.id]; return n; })} className="text-gray-500 hover:text-gray-300 px-1">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onClick={() => setEditUrls(prev => ({ ...prev, [ev.id]: ev.streamUrl || '' }))}
                            className="text-xs text-blue-400 hover:underline cursor-pointer truncate block max-w-xs"
                          >
                            {ev.streamUrl || <span className="text-gray-600">No stream URL</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-400">{ev.status}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => handleForcePush(ev.id)}
                          size="sm"
                          className={`text-xs h-7 ${isActive ? 'bg-gray-700 text-gray-400' : 'bg-amber-500 text-black hover:bg-amber-400'}`}
                          disabled={isActive}
                        >
                          <Send className="w-3 h-3 mr-1" />{isActive ? 'Active' : 'Force Push'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

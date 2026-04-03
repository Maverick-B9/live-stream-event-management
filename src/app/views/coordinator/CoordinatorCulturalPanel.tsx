import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import { EventLogo } from '../../components/shared/EventLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, Plus, Send, Tag, Video } from 'lucide-react';
import { format } from 'date-fns';
import type { CulturalEvent } from '../../types';

type CulturalStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';
const STATUS_FLOW: CulturalStatus[] = ['upcoming', 'live', 'completed', 'cancelled'];
const STATUS_COLORS: Record<CulturalStatus, string> = {
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  live: 'bg-red-500/20 text-red-400 border-red-500/40',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  cancelled: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
};

export default function CoordinatorCulturalPanel() {
  const { eventId } = useParams<{ eventId: string }>();
  const { culturalEvents, updateCulturalEvent, submitStreamRequest, branding } = useEvent();
  const { user } = useAuth();
  const navigate = useNavigate();

  const event = culturalEvents.find(e => e.id === eventId);

  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');
  const [newHeadline, setNewHeadline] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (event) {
      setResult(event.result || '');
      setNotes(event.notes || '');
    }
  }, [event?.id]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Event not found.</p>
          <Link to="/coordinator" className="text-amber-400 underline text-sm">← Back</Link>
        </div>
      </div>
    );
  }

  const pending = event.pendingStreamRequest;

  const handleStatusChange = async (status: CulturalStatus) => {
    await updateCulturalEvent(event.id, { status });
    toast.success(`Status → ${status}`);
  };

  const handleSaveDetails = async () => {
    await updateCulturalEvent(event.id, { result, notes });
    toast.success('Details saved!');
  };

  const handleStreamRequest = async () => {
    if (!streamUrl.trim() || !user) return;
    setSending(true);
    try {
      await submitStreamRequest({
        coordinatorId: user.uid,
        coordinatorName: user.name,
        eventId: event.id,
        eventType: 'cultural',
        eventName: event.name,
        requestedUrl: streamUrl.trim(),
      });
      setStreamUrl('');
      toast.success('Stream request sent!');
    } catch { toast.error('Failed to send request.'); }
    finally { setSending(false); }
  };

  const handleAddHeadline = async () => {
    if (!newHeadline.trim()) return;
    const updated = [...(event.tickerHeadlines || []), newHeadline.trim()];
    await updateCulturalEvent(event.id, { tickerHeadlines: updated });
    setNewHeadline('');
  };

  const handleRemoveHeadline = async (idx: number) => {
    const updated = event.tickerHeadlines.filter((_, i) => i !== idx);
    await updateCulturalEvent(event.id, { tickerHeadlines: updated });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 z-10 bg-gray-950">
        <button onClick={() => navigate('/coordinator')} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="font-semibold text-white">{event.name}</div>
          <div className="text-xs text-gray-400">{event.type} · {event.venue}</div>
        </div>
        <div className="ml-auto text-xs text-gray-400">{format(event.scheduledAt, 'MMM d, h:mm a')}</div>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-5">
        {/* Status */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Event Status</h3>
          <div className="flex flex-wrap gap-2">
            {STATUS_FLOW.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-4 py-1.5 rounded-full text-sm border font-medium transition-all ${
                  event.status === s ? STATUS_COLORS[s] + ' ring-1 ring-current' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Result & Notes */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Event Details</h3>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Result</label>
            <Input
              value={result}
              onChange={e => setResult(e.target.value)}
              placeholder="e.g. 1st Place: Team Alpha"
              className="bg-gray-800 border-gray-600 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Internal notes..."
              className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 resize-none placeholder:text-gray-600"
            />
          </div>
          <Button onClick={handleSaveDetails} className="w-full text-black font-semibold" style={{ backgroundColor: branding.secondaryColor }}>
            Save Details
          </Button>
        </div>

        {/* Stream & Ticker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stream request */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Video className="w-4 h-4 text-gray-400" /> Live Stream
            </h3>
            {event.streamUrl && !pending && (
              <div className="text-xs text-gray-400 mb-3 break-all">
                Current: <span className="text-blue-400">{event.streamUrl}</span>
              </div>
            )}
            <AnimatePresence mode="wait">
              {pending?.status === 'pending' ? (
                <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 py-4">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <EventLogo size="sm" animate={false} />
                  </motion.div>
                  <p className="text-sm text-amber-400">Waiting for approval...</p>
                </motion.div>
              ) : pending?.status === 'approved' ? (
                <motion.div key="approved" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2 py-4">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                  <p className="text-sm text-green-400">Approved!</p>
                </motion.div>
              ) : pending?.status === 'rejected' ? (
                <motion.div key="rejected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-2">
                  <div className="flex items-center gap-2 text-red-400 mb-1">
                    <XCircle className="w-4 h-4" /><span className="text-sm">Rejected</span>
                  </div>
                  {pending.adminNote && <p className="text-xs text-gray-400">{pending.adminNote}</p>}
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <Input
                    value={streamUrl}
                    onChange={e => setStreamUrl(e.target.value)}
                    placeholder="https://stream-url.com/live"
                    className="bg-gray-800 border-gray-600 text-white text-sm"
                  />
                  <Button onClick={handleStreamRequest} disabled={sending || !streamUrl.trim()} className="w-full text-black text-sm" style={{ backgroundColor: '#F59E0B' }}>
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Request Stream Switch
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ticker headlines */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-400" /> Ticker Headlines
            </h3>
            <div className="flex gap-2 mb-3">
              <Input
                value={newHeadline}
                onChange={e => setNewHeadline(e.target.value)}
                placeholder="Add headline..."
                className="bg-gray-800 border-gray-600 text-white text-sm"
                onKeyDown={e => e.key === 'Enter' && handleAddHeadline()}
              />
              <Button onClick={handleAddHeadline} disabled={!newHeadline.trim()} className="bg-gray-700 hover:bg-gray-600 text-white shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {(event.tickerHeadlines || []).map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2 text-sm">
                  <span className="text-gray-300 truncate">{h}</span>
                  <button onClick={() => handleRemoveHeadline(i)} className="text-gray-500 hover:text-red-400 ml-2">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

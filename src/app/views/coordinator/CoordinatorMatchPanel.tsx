import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { useEvent } from '../../contexts/EventContext';
import { EventLogo } from '../../components/shared/EventLogo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Plus, Minus, Send, Check, Video, Tag, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import type { Match, MatchEvent, MatchStatus } from '../../types';

const SPORT_EVENT_TYPES: Record<string, string[]> = {
  'cricket': ['Boundary (4)', 'Six', 'Wicket', 'Wide', 'No Ball', 'Run Out'],
  'kabaddi': ['Raid Point', 'Tackle Point', 'All Out', 'Super Raid', 'Super Tackle'],
  'football': ['Goal', 'Yellow Card', 'Red Card', 'Corner', 'Free Kick', 'Penalty'],
  'tug of war': ['Round Won (Team A)', 'Round Won (Team B)'],
  'volleyball': ['Set Won (Team A)', 'Set Won (Team B)', 'Point'],
  'throwball': ['Set Won (Team A)', 'Set Won (Team B)', 'Point'],
};

const STATUS_FLOW: MatchStatus[] = ['upcoming', 'live', 'halftime', 'completed', 'postponed'];
const STATUS_COLORS: Record<MatchStatus, string> = {
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  live: 'bg-red-500/20 text-red-400 border-red-500/40',
  halftime: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  postponed: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
};

// ── Number stepper ─────────────────────────────────────
function NumberStepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center justify-center"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          value={value}
          onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-16 text-center bg-gray-800 border border-gray-600 rounded text-white text-sm h-8"
          min={0}
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Stream request panel ──────────────────────────────
function StreamRequestPanel({ match }: { match: Match }) {
  const { user } = useAuth();
  const { submitStreamRequest } = useEvent();
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);

  const pending = match.pendingStreamRequest;
  const isPending = pending?.status === 'pending';
  const isApproved = pending?.status === 'approved';
  const isRejected = pending?.status === 'rejected';

  const handleRequest = async () => {
    if (!url.trim() || !user) return;
    setSending(true);
    try {
      await submitStreamRequest({
        coordinatorId: user.uid,
        coordinatorName: user.name,
        eventId: match.id,
        eventType: 'match',
        eventName: `${match.id}`,
        requestedUrl: url.trim(),
      });
      setUrl('');
      toast.success('Stream request sent!');
    } catch { toast.error('Failed to send request.'); }
    finally { setSending(false); }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
        <Video className="w-4 h-4 text-gray-400" /> Live Stream
      </h3>

      {match.streamUrl && !isPending && (
        <div className="text-xs text-gray-400 mb-3 break-all">
          Current: <span className="text-blue-400">{match.streamUrl}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <EventLogo size="sm" animate={false} />
            </motion.div>
            <p className="text-sm text-amber-400">Waiting for admin approval...</p>
            <p className="text-xs text-gray-500 break-all">{pending.requestedUrl}</p>
          </motion.div>
        ) : isApproved ? (
          <motion.div
            key="approved"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-2 py-4"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
            <p className="text-sm text-green-400 font-medium">Stream Approved!</p>
          </motion.div>
        ) : isRejected ? (
          <motion.div key="rejected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-3">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <XCircle className="w-4 h-4" /> <span className="text-sm font-medium">Request Rejected</span>
            </div>
            {pending?.adminNote && (
              <p className="text-xs text-gray-400">{pending.adminNote}</p>
            )}
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://stream-url.com/live"
              className="bg-gray-800 border-gray-600 text-white text-sm"
            />
            <Button
              onClick={handleRequest}
              disabled={sending || !url.trim()}
              className="w-full text-black text-sm"
              style={{ backgroundColor: '#F59E0B' }}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Request Stream Switch
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────
export default function CoordinatorMatchPanel() {
  const { matchId } = useParams<{ matchId: string }>();
  const { matches, sports, franchises, updateMatch, logActivity, branding } = useEvent();
  const { user } = useAuth();
  const navigate = useNavigate();
  const basePath = user?.role === 'admin' ? '/admin/fixtures' : '/coordinator';

  const match = matches.find(m => m.id === matchId);
  const sport = match ? sports.find(s => s.id === match.sportId) : null;
  const franchiseA = match ? franchises.find(f => f.id === match.franchiseAId) : null;
  const franchiseB = match ? franchises.find(f => f.id === match.franchiseBId) : null;

  const [scoreA, setScoreA] = useState<Record<string, any>>({});
  const [scoreB, setScoreB] = useState<Record<string, any>>({});
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newHeadline, setNewHeadline] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventFranchiseId, setEventFranchiseId] = useState('');

  useEffect(() => {
    if (match) {
      setScoreA(match.scoreA || {});
      setScoreB(match.scoreB || {});
      setCurrentPeriod(match.currentPeriod || '');
      setWinnerId(match.winnerId);
      setNotes(match.notes || '');
    }
  }, [match?.id]);

  if (!match || !sport || !franchiseA || !franchiseB) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Match not found or still loading...</p>
          <Link to={basePath} className="text-amber-400 underline text-sm">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const schema = sport.scoringSchema;
  const sportEvTypes = SPORT_EVENT_TYPES[sport.name.toLowerCase()] || ['Point', 'Event'];
  const periodOptions = Array.from({ length: schema.maxPeriods }, (_, i) => `${schema.periodLabel} ${i + 1}`);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMatch(match.id, {
        scoreA,
        scoreB,
        currentPeriod,
        winnerId,
        notes,
      });
      if (user) await logActivity(user.uid, user.name, `Updated score for match`, match.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      toast.success('Score updated!');
    } catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (status: MatchStatus) => {
    await updateMatch(match.id, { status });
    if (user) await logActivity(user.uid, user.name, `Changed match status to ${status}`, match.id);
    toast.success(`Status → ${status}`);
  };

  const handleAddHeadline = async () => {
    if (!newHeadline.trim()) return;
    const updated = [...(match.tickerHeadlines || []), newHeadline.trim()];
    await updateMatch(match.id, { tickerHeadlines: updated });
    setNewHeadline('');
  };

  const handleRemoveHeadline = async (idx: number) => {
    const updated = match.tickerHeadlines.filter((_, i) => i !== idx);
    await updateMatch(match.id, { tickerHeadlines: updated });
  };

  const handleAddEvent = async () => {
    if (!eventType) return;
    const newEvent: MatchEvent = {
      id: `ev_${Date.now()}`,
      type: eventType,
      description: eventDescription || eventType,
      timestamp: new Date(),
      franchiseId: eventFranchiseId,
    };
    const updated = [...(match.matchEvents || []), newEvent];
    await updateMatch(match.id, { matchEvents: updated });
    setEventType('');
    setEventDescription('');
    setEventFranchiseId('');
    toast.success('Event logged!');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 z-10 bg-gray-950">
        <button onClick={() => navigate(basePath)} className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="font-semibold text-white">
            {franchiseA.name} <span className="text-gray-500">vs</span> {franchiseB.name}
          </div>
          <div className="text-xs text-gray-400">{sport.name} · {match.venue}</div>
        </div>
        <div className="ml-auto text-xs text-gray-400">{format(match.dateTime, 'MMM d, h:mm a')}</div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Status toggle */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Match Status</h3>
          <div className="flex flex-wrap gap-2">
            {STATUS_FLOW.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-4 py-1.5 rounded-full text-sm border font-medium transition-all ${
                  match.status === s ? STATUS_COLORS[s] + ' ring-1 ring-current' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Score input */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Score Update</h3>
            <div className="flex items-center gap-2">
              <Input
                list={`periods-${match.id}`}
                value={currentPeriod}
                onChange={e => setCurrentPeriod(e.target.value)}
                placeholder={`Status / ${schema.periodLabel}...`}
                className="bg-gray-800 border-gray-600 text-white text-sm h-8 w-40"
              />
              <datalist id={`periods-${match.id}`}>
                {periodOptions.map(p => <option key={p} value={p} />)}
                <option value="Final" />
                <option value="Halftime" />
                <option value="Innings Break" />
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Team A */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: franchiseA.color }} />
                <span className="text-sm font-semibold text-white">{franchiseA.name}</span>
              </div>
              <div className="space-y-3">
                {schema.fields.map(field =>
                  field.type === 'number' ? (
                    <NumberStepper
                      key={field.key}
                      label={field.label}
                      value={scoreA[field.key] ?? 0}
                      onChange={v => setScoreA(prev => ({ ...prev, [field.key]: v }))}
                    />
                  ) : (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs text-gray-400">{field.label}</label>
                      <Input
                        value={scoreA[field.key] ?? ''}
                        onChange={e => setScoreA(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white text-sm h-8"
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Team B */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: franchiseB.color }} />
                <span className="text-sm font-semibold text-white">{franchiseB.name}</span>
              </div>
              <div className="space-y-3">
                {schema.fields.map(field =>
                  field.type === 'number' ? (
                    <NumberStepper
                      key={field.key}
                      label={field.label}
                      value={scoreB[field.key] ?? 0}
                      onChange={v => setScoreB(prev => ({ ...prev, [field.key]: v }))}
                    />
                  ) : (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs text-gray-400">{field.label}</label>
                      <Input
                        value={scoreB[field.key] ?? ''}
                        onChange={e => setScoreB(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white text-sm h-8"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Winner select */}
          {match.status === 'completed' && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <label className="text-xs text-gray-400 block mb-2">Winner</label>
              <div className="flex gap-3">
                {[franchiseA, franchiseB].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setWinnerId(f.id === winnerId ? null : f.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                      winnerId === f.id
                        ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: f.color }} />
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 w-full font-semibold text-black"
            style={{ backgroundColor: branding.secondaryColor }}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="saved" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Saved!
                </motion.span>
              ) : saving ? (
                <motion.span key="saving">Saving...</motion.span>
              ) : (
                <motion.span key="save">Update Score</motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Match notes */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-gray-400" /> Match Notes (Private)
          </h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes (not visible on public display)"
            className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 resize-none placeholder:text-gray-600"
            onBlur={() => updateMatch(match.id, { notes })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stream request */}
          <StreamRequestPanel match={match} />

          {/* Match events log */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" /> Match Events Log
            </h3>
            <div className="space-y-2 mb-3">
              <select
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-1.5"
              >
                <option value="">Select event type...</option>
                {sportEvTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={eventFranchiseId}
                onChange={e => setEventFranchiseId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-1.5"
              >
                <option value="">Team (optional)</option>
                <option value={franchiseA.id}>{franchiseA.name}</option>
                <option value={franchiseB.id}>{franchiseB.name}</option>
              </select>
              <Input
                value={eventDescription}
                onChange={e => setEventDescription(e.target.value)}
                placeholder="Description (optional)"
                className="bg-gray-800 border-gray-600 text-white text-sm"
              />
              <Button onClick={handleAddEvent} disabled={!eventType} size="sm" className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                <Plus className="w-3.5 h-3.5 mr-1" /> Log Event
              </Button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {(match.matchEvents || []).slice().reverse().map(ev => (
                <div key={ev.id} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-gray-600 shrink-0">
                    {format(ev.timestamp, 'HH:mm')}
                  </span>
                  <span className="text-amber-400">[{ev.type}]</span>
                  <span>{ev.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticker headlines */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-gray-400" /> Event Ticker Headlines
          </h3>
          <div className="flex gap-2 mb-3">
            <Input
              value={newHeadline}
              onChange={e => setNewHeadline(e.target.value)}
              placeholder="Add a headline..."
              className="bg-gray-800 border-gray-600 text-white text-sm"
              onKeyDown={e => e.key === 'Enter' && handleAddHeadline()}
            />
            <Button onClick={handleAddHeadline} disabled={!newHeadline.trim()} className="bg-gray-700 hover:bg-gray-600 text-white shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            {(match.tickerHeadlines || []).map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2 text-sm">
                <span className="text-gray-300 truncate">{h}</span>
                <button onClick={() => handleRemoveHeadline(i)} className="text-gray-500 hover:text-red-400 ml-2">✕</button>
              </div>
            ))}
            {(match.tickerHeadlines || []).length === 0 && (
              <p className="text-xs text-gray-600 text-center py-2">No headlines added</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

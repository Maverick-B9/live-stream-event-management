import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useEvent } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Edit2, Trash2, Activity } from 'lucide-react';
import { format } from 'date-fns';
import type { Match, MatchStatus, MatchEvent } from '../../types';
import { deleteMatch } from '../../lib/firestore';

const EMPTY_MATCH = {
  sportId: '',
  franchiseAId: '',
  franchiseBId: '',
  venue: '',
  dateTime: new Date(),
  coordinatorId: '',
  status: 'upcoming' as MatchStatus,
  scoreA: {},
  scoreB: {},
  currentPeriod: '',
  tickerHeadlines: [] as string[],
  matchEvents: [] as MatchEvent[],
  pendingStreamRequest: null as any,
  streamUrl: null as any,
  winnerId: null as any,
};

export default function AdminFixtureBuilder() {
  const { matches, sports, franchises, coordinators, createMatch, updateMatch, logActivity, branding } = useEvent();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editMatch, setEditMatch] = useState<Partial<Match> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_MATCH>({ ...EMPTY_MATCH });
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditMatch(null);
    setForm({ ...EMPTY_MATCH });
    setDateStr('');
    setTimeStr('');
    setShowModal(true);
  };

  const openEdit = (match: Match) => {
    setEditMatch(match);
    setForm({ ...match });
    const d = new Date(match.dateTime);
    setDateStr(format(d, 'yyyy-MM-dd'));
    setTimeStr(format(d, 'HH:mm'));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.sportId || !form.franchiseAId || !form.franchiseBId || !dateStr) {
      toast.error('Fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const dateTime = new Date(`${dateStr}T${timeStr || '00:00'}`);
      const { id, ...pureData } = { ...form, dateTime } as any;
      
      if (editMatch?.id) {
        await updateMatch(editMatch.id, pureData);
        toast.success('Match updated!');
      } else {
        await createMatch(pureData as Omit<Match, 'id'>);
        toast.success('Match created!');
      }
      if (user) await logActivity(user.uid, user.name, editMatch?.id ? 'Updated match' : 'Created match');
      setShowModal(false);
    } catch { toast.error('Failed to save.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMatch(id);
      toast.success('Match deleted.');
    } catch { toast.error('Delete failed.'); }
    setDeleteConfirm(null);
  };

  const sortedMatches = [...matches].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <Link to="/admin" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-bold text-white">Fixture Builder</h1>
        <div className="ml-auto">
          <Button onClick={openCreate} size="sm" className="bg-amber-500 text-black hover:bg-amber-400">
            <Plus className="w-4 h-4 mr-1" /> Create Match
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-gray-700">
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left px-4 py-3">Sport</th>
                <th className="text-left px-4 py-3">Match</th>
                <th className="text-left px-4 py-3">Date & Time</th>
                <th className="text-left px-4 py-3">Venue</th>
                <th className="text-left px-4 py-3">Coordinator</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedMatches.map(m => {
                const fa = franchises.find(f => f.id === m.franchiseAId);
                const fb = franchises.find(f => f.id === m.franchiseBId);
                const sp = sports.find(s => s.id === m.sportId);
                return (
                  <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-medium text-xs">{sp?.name || '—'}</span>
                        {sp && (
                          <span className={`text-[9px] font-bold uppercase ${
                            sp.gender === 'men' ? 'text-blue-400' : sp.gender === 'women' ? 'text-rose-400' : 'text-amber-400'
                          }`}>
                            {sp.gender}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-white text-sm">
                        <span style={{ color: fa?.color }}>{fa?.shortCode || '—'}</span>
                        <span className="text-gray-600">vs</span>
                        <span style={{ color: fb?.color }}>{fb?.shortCode || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{format(m.dateTime, 'MMM d, h:mm a')}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{m.venue}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {coordinators.find(c => c.uid === m.coordinatorId)?.name || 'Auto (By Sport)'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/match/${m.id}`} title="Manage Score" className="text-amber-400 hover:text-amber-300 p-1 rounded hover:bg-amber-900/20">
                          <Activity className="w-4 h-4" />
                        </Link>
                        <button onClick={() => openEdit(m)} title="Edit Details" className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(m.id)} className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedMatches.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-500 py-10">No matches yet. Click "Create Match" to add one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{editMatch ? 'Edit Match' : 'Create Match'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Sport *</label>
              <select value={form.sportId} onChange={e => setForm(p => ({ ...p, sportId: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-1.5">
                <option value="">Select sport...</option>
                {sports.map(s => <option key={s.id} value={s.id}>{s.name} ({s.gender})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Franchise A *</label>
                <select value={form.franchiseAId} onChange={e => setForm(p => ({ ...p, franchiseAId: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-1.5">
                  <option value="">Select...</option>
                  {franchises.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Franchise B *</label>
                <select value={form.franchiseBId} onChange={e => setForm(p => ({ ...p, franchiseBId: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-2 py-1.5">
                  <option value="">Select...</option>
                  {franchises.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Date *</label>
                <Input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="bg-gray-800 border-gray-600 text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Time</label>
                <Input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} className="bg-gray-800 border-gray-600 text-white text-sm" />
              </div>
            </div>

            <Input
              value={form.venue}
              onChange={e => setForm(p => ({ ...p, venue: e.target.value }))}
              placeholder="Venue"
              className="bg-gray-800 border-gray-600 text-white"
            />

            <div>
              <label className="text-xs text-gray-400 block mb-1">Coordinator (Optional)</label>
              <select value={form.coordinatorId} onChange={e => setForm(p => ({ ...p, coordinatorId: e.target.value }))}
                className="w-full bg-gray-800 border-gray-600 text-white text-sm rounded px-2 py-1.5">
                <option value="">Auto-Allot (By Sport)</option>
                {coordinators.map(c => <option key={c.uid} value={c.uid}>{c.name}</option>)}
              </select>
              <p className="text-[10px] text-gray-500 mt-1">If left unassigned, all coordinators for this sport will see this match.</p>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold">
              {loading ? 'Saving...' : editMatch ? 'Update Match' : 'Create Match'}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-900 border border-red-500/50 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-white">Delete Match?</h3>
            <p className="text-sm text-gray-400">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white">Cancel</Button>
              <Button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-500 text-white">Delete</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

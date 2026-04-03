import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useEvent } from '../../contexts/EventContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Edit2, Wifi, WifiOff } from 'lucide-react';
import type { AppUser } from '../../types';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function AdminCoordinatorsView() {
  const { franchises, matches, culturalEvents, updateFranchise } = useEvent();
  const [coordinators, setCoordinators] = useState<AppUser[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoordEmail, setNewCoordEmail] = useState('');
  const [newCoordName, setNewCoordName] = useState('');
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Subscribe to coordinators
  React.useEffect(() => {
    const { onSnapshot, collection: col, query, where } = require('firebase/firestore');
    const unsub = onSnapshot(
      query(col(db, 'users'), where('role', '==', 'coordinator')),
      (snap: any) => {
        setCoordinators(snap.docs.map((d: any) => ({ uid: d.id, ...d.data() })));
      }
    );
    return unsub;
  }, []);

  const allEvents = [
    ...matches.map(m => ({ id: m.id, label: `Match: ${franchises.find(f => f.id === m.franchiseAId)?.name} vs ${franchises.find(f => f.id === m.franchiseBId)?.name}` })),
    ...culturalEvents.map(e => ({ id: e.id, label: `Cultural: ${e.name}` })),
  ];

  const handleCreateCoordinator = async () => {
    if (!newCoordEmail || !newCoordName) return;
    setLoading(true);
    try {
      // Create Firestore user doc (admin must create Firebase Auth user separately)
      await addDoc(collection(db, 'users'), {
        email: newCoordEmail,
        name: newCoordName,
        role: 'coordinator',
        assignedFranchiseIds: selectedFranchises,
        assignedEventIds: selectedEvents,
        isOnline: false,
      });
      toast.success('Coordinator added! Note: You must create their Firebase Auth account separately.');
      setShowAddModal(false);
      setNewCoordEmail(''); setNewCoordName('');
      setSelectedFranchises([]); setSelectedEvents([]);
    } catch { toast.error('Failed to add coordinator.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <Link to="/admin" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-bold text-white">Coordinators</h1>
        <div className="ml-auto">
          <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-amber-500 text-black hover:bg-amber-400">
            <Plus className="w-4 h-4 mr-1" /> Add Coordinator
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Franchises</th>
                <th className="text-left px-4 py-3">Events</th>
                <th className="text-center px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {coordinators.map(c => (
                <tr key={c.uid} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400">{c.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(c.assignedFranchiseIds || []).map(fid => franchises.find(f => f.id === fid)?.shortCode || fid).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{(c.assignedEventIds || []).length} events</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${c.isOnline ? 'bg-green-400' : 'bg-gray-600'}`} />
                  </td>
                </tr>
              ))}
              {coordinators.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-500 py-8">No coordinators found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Add Coordinator</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded p-2">
              ⚠️ This creates the Firestore profile. Create the Firebase Auth account via Firebase Console.
            </p>
            <Input value={newCoordName} onChange={e => setNewCoordName(e.target.value)} placeholder="Name" className="bg-gray-800 border-gray-600 text-white" />
            <Input value={newCoordEmail} onChange={e => setNewCoordEmail(e.target.value)} placeholder="Email" type="email" className="bg-gray-800 border-gray-600 text-white" />
            <div>
              <label className="text-xs text-gray-400 block mb-1">Assign Franchises</label>
              <div className="flex flex-wrap gap-1.5">
                {franchises.map(f => (
                  <button key={f.id} onClick={() => setSelectedFranchises(prev => prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id])}
                    className={`px-2 py-0.5 rounded text-xs border ${selectedFranchises.includes(f.id) ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-gray-700 text-gray-400'}`}>
                    {f.shortCode}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateCoordinator} disabled={loading || !newCoordEmail || !newCoordName} className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold">
              {loading ? 'Adding...' : 'Add Coordinator'}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

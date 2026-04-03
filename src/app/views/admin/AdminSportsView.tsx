import React, { useState } from 'react';
import { Link } from 'react-router';
import { useEvent } from '../../contexts/EventContext';
import { ArrowLeft, Plus, Edit2, X, Trash2, Save } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import type { Sport, SportScoringSchema, ScoringField } from '../../types';

const EMPTY_SPORT: Omit<Sport, 'id'> = {
  name: '',
  gender: 'men',
  icon: 'Trophy',
  scoringSchema: {
    teamALabel: 'Team A',
    teamBLabel: 'Team B',
    fields: [{ key: 'score', label: 'Score', type: 'number', showInCard: true, isPrimary: true }],
    periodLabel: 'Half',
    maxPeriods: 2,
  }
};

export default function AdminSportsView() {
  const { sports, updateSport, createSport } = useEvent();
  const [showModal, setShowModal] = useState(false);
  const [editSport, setEditSport] = useState<Sport | null>(null);
  const [form, setForm] = useState<Omit<Sport, 'id'>>({ ...EMPTY_SPORT });
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setEditSport(null);
    setForm({ ...EMPTY_SPORT, scoringSchema: { ...EMPTY_SPORT.scoringSchema, fields: [...EMPTY_SPORT.scoringSchema.fields] } });
    setShowModal(true);
  };

  const openEdit = (sport: Sport) => {
    setEditSport(sport);
    setForm(JSON.parse(JSON.stringify(sport)));
    setShowModal(true);
  };

  const addField = () => {
    setForm(p => ({
      ...p,
      scoringSchema: {
        ...p.scoringSchema,
        fields: [...p.scoringSchema.fields, { key: `field${p.scoringSchema.fields.length}`, label: 'New Field', type: 'number', showInCard: false, isPrimary: false }]
      }
    }));
  };

  const removeField = (index: number) => {
    setForm(p => {
      const newFields = [...p.scoringSchema.fields];
      newFields.splice(index, 1);
      return { ...p, scoringSchema: { ...p.scoringSchema, fields: newFields } };
    });
  };

  const updateField = (index: number, changes: Partial<ScoringField>) => {
    setForm(p => {
      const newFields = [...p.scoringSchema.fields];
      newFields[index] = { ...newFields[index], ...changes };
      return { ...p, scoringSchema: { ...p.scoringSchema, fields: newFields } };
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.icon || !form.scoringSchema.periodLabel) return;
    setLoading(true);
    try {
      if (editSport?.id) {
        await updateSport(editSport.id, form);
        toast.success('Sport updated successfully!');
      } else {
        await createSport(form);
        toast.success('Sport created successfully!');
      }
      setShowModal(false);
    } catch (e) {
      toast.error('Failed to save sport.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <Link to="/admin" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-bold text-white">Sports & Scoring Schemas</h1>
        <div className="ml-auto">
          <Button onClick={openCreate} size="sm" className="bg-amber-500 text-black hover:bg-amber-400">
            <Plus className="w-4 h-4 mr-1" /> Add Sport
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {sports.map(sport => {
          // @ts-ignore
          const Icon = Icons[sport.icon] || Icons.Trophy;
          const schema = sport.scoringSchema;
          return (
            <div key={sport.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5 group relative">
              <button title="Edit Schema" onClick={() => openEdit(sport)} className="absolute top-4 right-4 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-semibold text-white">{sport.name}</h3>
                  <span className="text-xs text-gray-400">{sport.gender === 'men' ? 'Men' : sport.gender === 'women' ? 'Women' : 'Mixed'}</span>
                </div>
                <div className="ml-auto flex items-center gap-4 text-xs text-gray-500 mr-8">
                  <span>{schema.periodLabel} × {schema.maxPeriods}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-gray-700 text-gray-500 uppercase">
                    <tr>
                      <th className="text-left pb-2 pr-4">Key</th>
                      <th className="text-left pb-2 pr-4">Label</th>
                      <th className="text-left pb-2 pr-4">Type</th>
                      <th className="text-center pb-2 pr-4">Primary</th>
                      <th className="text-center pb-2">Show in Card</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schema.fields.map(field => (
                      <tr key={field.key} className="border-b border-gray-800">
                        <td className="py-2 pr-4 font-mono text-gray-400">{field.key}</td>
                        <td className="py-2 pr-4 text-gray-300">{field.label}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${field.type === 'number' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {field.type}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-center">
                          {field.isPrimary ? <span className="text-amber-400">★</span> : <span className="text-gray-700">—</span>}
                        </td>
                        <td className="py-2 text-center">
                          {field.showInCard ? <span className="text-green-400">✓</span> : <span className="text-gray-700">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {sports.length === 0 && (
          <div className="text-center text-gray-500 py-12">Sports loading from Firestore...</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 py-8 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl space-y-4 my-auto relative"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-white text-lg">{editSport ? 'Edit Sport Schema' : 'Add Sport Schema'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Sport Name</label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Lucide Icon name</label>
                <Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Gender Category</label>
                <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value as any }))} className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-2">
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 mt-6">
              <h4 className="text-sm font-semibold text-amber-400 mb-3">Schema Configuration</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Period Label (e.g. Half, Set)</label>
                  <Input value={form.scoringSchema.periodLabel} onChange={e => setForm(p => ({ ...p, scoringSchema: { ...p.scoringSchema, periodLabel: e.target.value } }))} className="bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Max Periods</label>
                  <Input type="number" min={1} value={form.scoringSchema.maxPeriods} onChange={e => setForm(p => ({ ...p, scoringSchema: { ...p.scoringSchema, maxPeriods: parseInt(e.target.value) || 1 } }))} className="bg-gray-800 border-gray-600 text-white" />
                </div>
              </div>
              
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-300">Scoring Fields</span>
                <button onClick={addField} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Field</button>
              </div>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                {form.scoringSchema.fields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-gray-800 p-2 rounded border border-gray-700">
                    <Input placeholder="Key (e.g. score)" value={field.key} onChange={e => updateField(idx, { key: e.target.value })} className="bg-gray-900 border-gray-600 text-white text-xs w-28" />
                    <Input placeholder="Label" value={field.label} onChange={e => updateField(idx, { label: e.target.value })} className="bg-gray-900 border-gray-600 text-white text-xs flex-1" />
                    <select value={field.type} onChange={e => updateField(idx, { type: e.target.value as 'number' | 'text' })} className="bg-gray-900 border border-gray-600 text-white text-xs rounded px-2 py-1.5 w-24">
                      <option value="number">Number</option>
                      <option value="text">Text</option>
                    </select>
                    <label className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={field.isPrimary} onChange={e => updateField(idx, { isPrimary: e.target.checked })} className="accent-amber-500" /> Primary
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={field.showInCard} onChange={e => updateField(idx, { showInCard: e.target.checked })} className="accent-amber-500" /> Show List
                    </label>
                    <button onClick={() => removeField(idx)} className="text-gray-500 hover:text-red-400 ml-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold mt-4">
              {loading ? 'Saving...' : 'Save Sport Schema'}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

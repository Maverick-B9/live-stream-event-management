import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useEvent } from '../../contexts/EventContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ImageWithFallback } from '../../components/shared/ImageWithFallback';
import { toast } from 'sonner';
import { ArrowLeft, Edit2, X, Check, Upload, Plus } from 'lucide-react';
import type { Franchise } from '../../types';

// ── All local franchise logos (served from public/logos/franchises/) ──────────
const LOCAL_FRANCHISE_LOGOS = [
  // Named logos (Civil Force, Panthers, Young Challengers, Mitra Tigers, Dronas)
  '/logos/franchises/civil_force.jpg',
  '/logos/franchises/panthers.jpg',
  '/logos/franchises/young_challengers.jpg',
  '/logos/franchises/mitra_tigers.jpg',
  '/logos/franchises/dronas.jpg',
  // Original numbered logos
  ...Array.from({ length: 9 }, (_, i) => `/logos/franchises/franchise_${i + 1}.jpeg`),
];

const EMPTY_FORM = { name: '', shortCode: '', color: '#6366F1', logoUrl: '' };

export default function AdminFranchisesView() {
  const { franchises, updateFranchise, createFranchise, uploadFile, branding } = useEvent();
  const [editId, setEditId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Partial<Franchise>>(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoTab, setLogoTab] = useState<'pick' | 'upload'>('pick');

  const openCreate = () => {
    setIsCreating(true);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setLogoFile(null);
    setLogoTab('pick');
  };

  const openEdit = (f: Franchise) => {
    setIsCreating(false);
    setEditId(f.id);
    setForm({ name: f.name, color: f.color, shortCode: f.shortCode, logoUrl: f.logoUrl });
    setLogoFile(null);
    setLogoTab('pick');
  };

  const closeModal = () => { setEditId(null); setIsCreating(false); };

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const logoUrl = form.logoUrl || '';
      if (isCreating) {
        await createFranchise({ name: form.name || '', shortCode: form.shortCode || '', color: form.color || '#6366F1', logoUrl });
        toast.success('Franchise created!');
      } else if (editId) {
        await updateFranchise(editId, { ...form, logoUrl });
        toast.success('Franchise updated!');
      }
      closeModal();
    } catch {
      toast.error('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const modalOpen = isCreating || (editId !== null && franchises.some(f => f.id === editId));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <Link to="/admin" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-white">Franchises</h1>
        <span className="text-xs text-gray-500 ml-2">Click any franchise to edit</span>
        <div className="ml-auto">
          <Button onClick={openCreate} size="sm" className="bg-amber-500 text-black hover:bg-amber-400">
            <Plus className="w-4 h-4 mr-1" /> Create Franchise
          </Button>
        </div>
      </div>

      {/* Franchise grid */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {franchises.map(f => (
            <motion.div
              key={f.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl p-4 cursor-pointer relative group transition-colors"
              onClick={() => openEdit(f)}
            >
              <div className="flex flex-col items-center gap-3">
                <ImageWithFallback
                  src={f.logoUrl}
                  alt={f.name}
                  shortCode={f.shortCode}
                  color={f.color}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
                />
                <div className="text-center">
                  <div className="font-semibold text-white text-sm truncate w-full">{f.name}</div>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: f.color }} />
                    <span className="text-xs text-gray-400">{f.shortCode}</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 rounded p-1">
                <Edit2 className="w-3.5 h-3.5 text-gray-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg space-y-5 my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-lg">{isCreating ? 'Create Franchise' : 'Edit Franchise'}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current logo preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <ImageWithFallback
                    src={form.logoUrl || ''}
                    alt={form.name || 'Franchise'}
                    shortCode={form.shortCode || ''}
                    color={form.color || '#6366F1'}
                    className="w-24 h-24 rounded-full object-cover border-4"
                    style={{ borderColor: form.color || '#6366F1' } as React.CSSProperties}
                  />
                  {form.logoUrl && (
                    <button
                      onClick={() => setForm(p => ({ ...p, logoUrl: '' }))}
                      className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-0.5 text-gray-400 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Logo tabs */}
              <div>
                <div className="flex border-b border-gray-700 mb-3">
                  <button
                    onClick={() => setLogoTab('pick')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      logoTab === 'pick' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Pick from Library
                  </button>
                  <button
                    onClick={() => setLogoTab('upload')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      logoTab === 'upload' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Upload New
                  </button>
                </div>

                {logoTab === 'pick' ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Select from your franchise logo library:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {LOCAL_FRANCHISE_LOGOS.map((path) => {
                        const isSelected = form.logoUrl === path;
                        return (
                          <motion.button
                            key={path}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => {
                              setForm(p => ({ ...p, logoUrl: path }));
                              setLogoFile(null);
                            }}
                            className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                              isSelected ? 'border-amber-500 ring-2 ring-amber-500/40' : 'border-gray-700 hover:border-gray-500'
                            }`}
                          >
                            <img
                              src={path}
                              alt={`Franchise logo option`}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                <Check className="w-5 h-5 text-amber-400 drop-shadow" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Upload a new logo (PNG/JPG):</p>
                    <label className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-3 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {logoFile ? logoFile.name : 'Choose image...'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          setLogoFile(file);
                          if (file) {
                            // Show preview via object URL
                            setForm(p => ({ ...p, logoUrl: URL.createObjectURL(file) }));
                          }
                        }}
                      />
                    </label>
                    {logoFile && (
                      <p className="text-xs text-amber-400 mt-1.5">
                        ⚠️ Upload requires Firebase Storage (Blaze plan). The local preview shows selected logo.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Name & shortcode */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 block mb-1">Franchise Name</label>
                  <Input
                    value={form.name || ''}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Thanjavur Kings"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Short Code</label>
                  <Input
                    value={form.shortCode || ''}
                    onChange={e => setForm(p => ({ ...p, shortCode: e.target.value.toUpperCase().slice(0, 4) }))}
                    placeholder="THK"
                    className="bg-gray-800 border-gray-600 text-white font-mono text-center"
                  />
                </div>
              </div>

              {/* Color */}
              <div className="flex items-center gap-4">
                <label className="text-xs text-gray-400">Franchise Color</label>
                <input
                  type="color"
                  value={form.color || '#6366F1'}
                  onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  className="bg-transparent border-none cursor-pointer w-10 h-10 rounded"
                />
                <div
                  className="flex-1 h-8 rounded-lg border border-gray-700"
                  style={{ background: `linear-gradient(to right, ${form.color || '#6366F1'}, transparent)` }}
                />
                <span className="text-sm text-gray-400 font-mono">{form.color}</span>
              </div>

              {/* Save */}
              <Button
                onClick={handleSave}
                disabled={saving || !form.name?.trim()}
                className="w-full font-semibold h-11 text-black"
                style={{ backgroundColor: branding.secondaryColor }}
              >
                {saving ? 'Saving...' : isCreating ? 'Create Franchise' : 'Save Changes'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

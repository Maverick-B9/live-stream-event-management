import React, { useState } from 'react';
import { Link } from 'react-router';
import { useEvent } from '../../contexts/EventContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { EventLogo } from '../../components/shared/EventLogo';
import { LoadingScreen } from '../../components/shared/LoadingScreen';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';

export default function AdminBrandingView() {
  const { branding, updateBranding, franchises, updateFranchise, uploadFile } = useEvent();
  const [form, setForm] = useState({ ...branding });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [showLoadingPreview, setShowLoadingPreview] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = form.eventLogoUrl;
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, `branding/event_logo_${Date.now()}`);
      }
      await updateBranding({ ...form, eventLogoUrl: logoUrl });
      toast.success('Branding updated!');
    } catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showLoadingPreview && (
        <div className="fixed inset-0 z-50 cursor-pointer" onClick={() => setShowLoadingPreview(false)}>
          <LoadingScreen message="Event loading... (click to close)" />
        </div>
      )}

      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <Link to="/admin" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-bold text-white">Branding</h1>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Event name */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Event Identity</h3>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Event Name</label>
            <Input
              value={form.eventName}
              onChange={e => setForm(p => ({ ...p, eventName: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Event Logo</label>
            <div className="flex items-center gap-4">
              <EventLogo size="lg" />
              <label className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-500 text-sm text-gray-400">
                <Upload className="w-4 h-4" />
                {logoFile ? logoFile.name : 'Upload logo...'}
                <input type="file" accept="image/*" className="hidden" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">Color Palette</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'primaryColor', label: 'Primary Color' },
              { key: 'secondaryColor', label: 'Secondary / Accent Color' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={(form as any)[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="bg-transparent border-none cursor-pointer w-10 h-10 rounded"
                />
                <div>
                  <div className="text-xs text-gray-400">{label}</div>
                  <div className="text-sm text-white">{(form as any)[key]}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase mb-3">Preview</h4>
            <div
              className="rounded-lg p-4 flex items-center gap-3"
              style={{ backgroundColor: form.primaryColor }}
            >
              <EventLogo size="sm" />
              <span className="font-bold" style={{ color: form.secondaryColor }}>{form.eventName}</span>
            </div>
          </div>

          <button
            onClick={() => setShowLoadingPreview(true)}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Preview Loading Screen →
          </button>
        </div>

        {/* Franchise colors */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Franchise Colors</h3>
          <div className="space-y-2.5">
            {franchises.map(f => (
              <div key={f.id} className="flex items-center gap-3">
                <input
                  type="color"
                  value={f.color}
                  onChange={async e => await updateFranchise(f.id, { color: e.target.value })}
                  className="bg-transparent border-none cursor-pointer w-8 h-8 rounded"
                />
                <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: f.color }}>
                  {f.shortCode?.slice(0, 2)}
                </div>
                <span className="text-sm text-white">{f.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{f.color}</span>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold h-11">
          {saving ? 'Saving...' : 'Save Branding'}
        </Button>
      </div>
    </div>
  );
}

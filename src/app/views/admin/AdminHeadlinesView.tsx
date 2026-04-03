import React, { useState } from 'react';
import { Link } from 'react-router';
import { useEvent } from '../../contexts/EventContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { NewsTicker } from '../../components/shared/NewsTicker';
import { toast } from 'sonner';
import { ArrowLeft, Plus, ChevronUp, ChevronDown, Trash2, Pause, Play } from 'lucide-react';

export default function AdminHeadlinesView() {
  const { branding, updateBranding } = useEvent();
  const [newHeadline, setNewHeadline] = useState('');

  const headlines = branding.globalTickerHeadlines || [];

  const addHeadline = async () => {
    if (!newHeadline.trim()) return;
    await updateBranding({ globalTickerHeadlines: [...headlines, newHeadline.trim()] });
    setNewHeadline('');
    toast.success('Headline added!');
  };

  const removeHeadline = async (idx: number) => {
    await updateBranding({ globalTickerHeadlines: headlines.filter((_, i) => i !== idx) });
  };

  const moveUp = async (idx: number) => {
    if (idx === 0) return;
    const updated = [...headlines];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    await updateBranding({ globalTickerHeadlines: updated });
  };

  const moveDown = async (idx: number) => {
    if (idx === headlines.length - 1) return;
    const updated = [...headlines];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    await updateBranding({ globalTickerHeadlines: updated });
  };

  const togglePause = async () => {
    await updateBranding({ globalTickerPaused: !branding.globalTickerPaused });
  };

  const setSpeed = async (speed: number) => {
    await updateBranding({ globalTickerSpeed: speed });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <Link to="/admin" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-bold text-white">Global Headlines</h1>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Add headline */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Add Headline</h3>
          <div className="flex gap-2">
            <Input
              value={newHeadline}
              onChange={e => setNewHeadline(e.target.value)}
              placeholder="Enter headline text..."
              className="bg-gray-800 border-gray-600 text-white"
              onKeyDown={e => e.key === 'Enter' && addHeadline()}
            />
            <Button onClick={addHeadline} disabled={!newHeadline.trim()} className="bg-amber-500 text-black hover:bg-amber-400 shrink-0">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* Headline queue */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Headline Queue ({headlines.length})</h3>
          {headlines.length === 0 && (
            <p className="text-sm text-gray-600 text-center py-6">No headlines yet.</p>
          )}
          <div className="space-y-2">
            {headlines.map((h, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2.5">
                <span className="text-gray-600 text-xs w-5 shrink-0">{i + 1}</span>
                <span className="text-sm text-gray-200 flex-1 truncate">{h}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="text-gray-500 hover:text-white disabled:opacity-30 p-0.5">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === headlines.length - 1} className="text-gray-500 hover:text-white disabled:opacity-30 p-0.5">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeHeadline(i)} className="text-gray-500 hover:text-red-400 p-0.5 ml-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">Ticker Controls</h3>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Ticker Pause</span>
            <button
              onClick={togglePause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${
                branding.globalTickerPaused
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-green-500/20 border-green-500/40 text-green-400'
              }`}
            >
              {branding.globalTickerPaused ? <><Pause className="w-3.5 h-3.5" /> Paused</> : <><Play className="w-3.5 h-3.5" /> Running</>}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Speed: {branding.globalTickerSpeed}</span>
              <span className="text-xs text-gray-600">slow ↔ fast</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              value={branding.globalTickerSpeed}
              onChange={e => setSpeed(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Live Preview</h3>
          <div className="rounded-lg overflow-hidden">
            <NewsTicker
              headlines={headlines.length > 0 ? headlines : ['No headlines yet']}
              backgroundColor={branding.primaryColor}
              textColor="#FFFFFF"
              speed={branding.globalTickerSpeed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEvent } from '../../contexts/EventContext';
import { MatchCard } from '../../components/shared/MatchCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { EventLogo } from '../../components/shared/EventLogo';
import * as Icons from 'lucide-react';
import { format } from 'date-fns';

export default function FixtureBoardView() {
  const { sports, matches, culturalEvents, franchises, branding } = useEvent();
  const [activeTab, setActiveTab] = useState<string>(sports[0]?.id || 'cultural');

  const sportMatches = matches.filter(m => m.sportId === activeTab);
  const activeSport = sports.find(s => s.id === activeTab);

  const tabs = [
    ...sports.map(s => ({ id: s.id, label: `${s.name} (${s.gender === 'men' ? 'M' : 'W'})` })),
    { id: 'cultural', label: 'Cultural' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Header */}
      <div
        className="flex items-center gap-4 px-8 py-4 border-b border-white/10"
        style={{ backgroundColor: branding.primaryColor }}
      >
        <EventLogo size="sm" />
        <h1 className="text-xl font-bold">{branding.eventName}</h1>
        <span className="text-gray-400 mx-2">—</span>
        <span className="text-gray-300">Fixtures & Results</span>
        <div className="ml-auto">
          <a href="/" className="text-xs text-gray-400 hover:text-white underline">← Live Display</a>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 pt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const sport = sports.find(s => s.id === tab.id);
            // @ts-ignore
            const Icon = sport ? (Icons[sport.icon] || Icons.Trophy) : Icons.Star;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive ? 'text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
                style={isActive ? { backgroundColor: branding.secondaryColor } : {}}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'cultural' ? (
            <motion.div
              key="cultural"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {culturalEvents.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-12">No cultural events scheduled.</p>
              )}
              {culturalEvents.map(ev => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 bg-gray-800 rounded px-2 py-0.5">{ev.type}</span>
                    <StatusBadge status={ev.status as any} />
                  </div>
                  <h3 className="text-white font-semibold text-lg">{ev.name}</h3>
                  <div className="text-sm text-gray-400 mt-2 space-y-1">
                    <div>📍 {ev.venue}</div>
                    <div>🕐 {format(ev.scheduledAt, 'MMM d, h:mm a')}</div>
                    {ev.result && <div className="text-amber-400">🏆 {ev.result}</div>}
                    {ev.notes && <div className="text-gray-500 text-xs">{ev.notes}</div>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {sportMatches.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-12">No matches scheduled for this sport.</p>
              )}
              {sportMatches.map((m, i) => {
                const fa = franchises.find(f => f.id === m.franchiseAId);
                const fb = franchises.find(f => f.id === m.franchiseBId);
                if (!fa || !fb || !activeSport) return null;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <MatchCard
                      match={m}
                      franchiseA={fa}
                      franchiseB={fb}
                      sport={activeSport}
                      variant="full"
                      showShare
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

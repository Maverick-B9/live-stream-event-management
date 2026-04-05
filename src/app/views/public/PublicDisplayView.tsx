import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEvent } from '../../contexts/EventContext';
import { VideoPlayer } from '../../components/shared/VideoPlayer';
import { NewsTicker } from '../../components/shared/NewsTicker';
import { MatchCard } from '../../components/shared/MatchCard';
import { EventLogo } from '../../components/shared/EventLogo';
import { Wifi, WifiOff, Trophy, BarChart2, Share2, Users, Clock } from 'lucide-react';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import { ScoreBug } from '../../components/shared/ScoreBug';

// ── Countdown timer widget ────────────────────────────────────────
function CountdownWidget({ match, franchiseA, franchiseB }: {
  match: any; franchiseA: any; franchiseB: any;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, match.dateTime.getTime() - now.getTime());
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center bg-[#050810] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      
      <div className="relative z-10 text-center space-y-12 max-w-4xl px-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-4 py-1 rounded-full border border-amber-500/20 tracking-[0.4em] uppercase">Upcoming Premiere</div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter font-['Bebas_Neue'] mt-2">Match Countdown</h2>
        </motion.div>

        <div className="flex items-center justify-center gap-8 md:gap-16">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center gap-4">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl border-4 border-white/10 overflow-hidden" style={{ backgroundColor: franchiseA.color }}>
                <span className="text-4xl md:text-5xl font-black text-white -rotate-12 font-['Bebas_Neue']">{franchiseA.shortCode || franchiseA.name[0]}</span>
             </div>
             <span className="text-lg font-bold text-white uppercase tracking-widest font-['Rajdhani']">{franchiseA.name}</span>
          </motion.div>

          <div className="flex flex-col items-center">
             <div className="text-6xl md:text-8xl font-black text-white/5 font-['Bebas_Neue'] absolute -translate-y-4">VS</div>
             <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>

          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center gap-4">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl -rotate-12 flex items-center justify-center shadow-2xl border-4 border-white/10 overflow-hidden" style={{ backgroundColor: franchiseB.color }}>
                <span className="text-4xl md:text-5xl font-black text-white rotate-12 font-['Bebas_Neue']">{franchiseB.shortCode || franchiseB.name[0]}</span>
             </div>
             <span className="text-lg font-bold text-white uppercase tracking-widest font-['Rajdhani']">{franchiseB.name}</span>
          </motion.div>
        </div>

        <div className="flex gap-4 md:gap-8 justify-center">
           {[
             { label: 'Hours', value: hours },
             { label: 'Minutes', value: mins },
             { label: 'Seconds', value: secs }
           ].map(t => (
             <div key={t.label} className="flex flex-col items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 min-w-[100px] md:min-w-[140px] shadow-2xl">
                <span className="text-4xl md:text-6xl font-black text-white font-['Bebas_Neue'] tabular-nums leading-none">{String(t.value).padStart(2, '0')}</span>
                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">{t.label}</span>
             </div>
           ))}
        </div>

        <div className="text-gray-500 text-xs font-bold uppercase tracking-[0.5em]">{match.venue} • {match.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </motion.div>
  );
}

// ── Standings overlay ─────────────────────────────────────────────
function StandingsOverlay({ onClose }: { onClose: () => void }) {
  const { matches, franchises, sports } = useEvent();
  const [selectedSportId, setSelectedSportId] = React.useState<string>('all');
  
  const completed = matches.filter(m => m.status === 'completed' && (selectedSportId === 'all' || m.sportId === selectedSportId));

  const standings = franchises.map(f => {
    const gamesA = completed.filter(m => m.franchiseAId === f.id);
    const gamesB = completed.filter(m => m.franchiseBId === f.id);
    const played = gamesA.length + gamesB.length;
    const won = completed.filter(m => m.winnerId === f.id).length;
    const lost = played - won;
    return { franchise: f, played, won, lost, points: won * 2 };
  }).filter(s => s.played > 0).sort((a, b) => b.points - a.points || b.won - a.won);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/85 backdrop-blur-sm z-40 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" /> Franchise Standings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
          <button 
            onClick={() => setSelectedSportId('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${selectedSportId === 'all' ? 'bg-amber-500 text-black border-amber-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'}`}
          >
            Global Overall
          </button>
          {sports.map(sport => (
             <button 
                key={sport.id}
                onClick={() => setSelectedSportId(sport.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${selectedSportId === sport.id ? 'bg-amber-500 text-black border-amber-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'}`}
             >
                {sport.name}
             </button>
          ))}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-700">
              <th className="text-left py-2 pr-4">#</th>
              <th className="text-left py-2">Franchise</th>
              <th className="text-center py-2 px-3">P</th>
              <th className="text-center py-2 px-3">W</th>
              <th className="text-center py-2 px-3">L</th>
              <th className="text-center py-2 px-3">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.franchise.id} className="border-b border-gray-800">
                <td className="py-2.5 pr-4 text-gray-400">{i + 1}</td>
                <td className="py-2.5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ backgroundColor: s.franchise.color }}>
                    {s.franchise.shortCode?.slice(0, 2)}
                  </div>
                  <span className="text-white">{s.franchise.name}</span>
                </td>
                <td className="py-2.5 text-center text-gray-300">{s.played}</td>
                <td className="py-2.5 text-center text-green-400">{s.won}</td>
                <td className="py-2.5 text-center text-red-400">{s.lost}</td>
                <td className="py-2.5 text-center font-bold text-amber-400">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {standings.length === 0 && (
          <p className="text-center text-gray-500 py-6">No completed matches yet</p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Winner announcement ───────────────────────────────────────────
function WinnerAnnouncement({ match, franchise }: { match: any; franchise: any }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ 
                y: [0, 800], 
                opacity: [0, 1, 0],
                x: [Math.random() * 1000, Math.random() * 1000] 
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              className="absolute text-2xl"
              style={{ left: `${Math.random() * 100}%` }}
            >
              ✨
            </motion.div>
         ))}
      </div>

      <div className="text-center space-y-8 relative z-10">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[12rem] leading-none mb-10 drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]"
        >
          🏆
        </motion.div>
        
        <div className="space-y-2">
           <motion.div 
             initial={{ scale: 0.5, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }}
             className="text-[#f0b429] text-xl font-black uppercase tracking-[0.5em]"
           >
             Match Champions
           </motion.div>
           <motion.h2
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="text-9xl font-black uppercase text-white font-['Bebas_Neue'] tracking-widest filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
           >
             {franchise.name}
           </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-lg shadow-2xl"
        >
          VICTORY!
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function PublicDisplayView() {
  const { matches, franchises, sports, branding, culturalEvents, isOffline } = useEvent();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStandings, setShowStandings] = useState(false);
  const [winnerMatchId, setWinnerMatchId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'cricket' | 'football'>('all');
  const [activeTab, setActiveTab] = useState<'live' | 'scorecard' | 'upcoming' | 'info'>('live');
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const prevStatusesRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const checkLayout = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsLandscape(window.innerWidth > window.innerHeight && mobile);
    };
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Detect match completion for winner announcement
  useEffect(() => {
    matches.forEach(m => {
      const prev = prevStatusesRef.current[m.id];
      if (prev && prev !== 'completed' && m.status === 'completed' && m.winnerId) {
        setWinnerMatchId(m.id);
        setTimeout(() => setWinnerMatchId(null), 4000);
      }
      prevStatusesRef.current[m.id] = m.status;
    });
  }, [matches]);

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const liveMatches = matches.filter(m => m.status === 'live');

  const activeEventId = branding.activeStreamEventId;
  const activeMatch = activeEventId ? matches.find(m => m.id === activeEventId) : null;
  let activeStreamUrl: string | null = null;
  let activeEventTicker: string[] = [];

  if (activeEventId) {
    const activeCultural = culturalEvents.find(e => e.id === activeEventId);
    activeStreamUrl = activeMatch?.streamUrl || activeCultural?.streamUrl || null;
    activeEventTicker = activeMatch?.tickerHeadlines || activeCultural?.tickerHeadlines || [];
  }

  const activeFranchiseA = activeMatch ? franchises.find(f => f.id === activeMatch.franchiseAId) : null;
  const activeFranchiseB = activeMatch ? franchises.find(f => f.id === activeMatch.franchiseBId) : null;
  const activeSport = activeMatch ? sports.find(s => s.id === activeMatch.sportId) : null;

  const soonMatch = !activeStreamUrl
    ? upcomingMatches.find(m => differenceInMinutes(m.dateTime, new Date()) <= 60 && differenceInMinutes(m.dateTime, new Date()) > 0)
    : null;

  const winnerMatch = winnerMatchId ? matches.find(m => m.id === winnerMatchId) : null;
  const winnerFranchise = winnerMatch?.winnerId ? franchises.find(f => f.id === winnerMatch.winnerId) : null;

  const soonFranchiseA = soonMatch ? franchises.find(f => f.id === soonMatch.franchiseAId) : null;
  const soonFranchiseB = soonMatch ? franchises.find(f => f.id === soonMatch.franchiseBId) : null;

  const effectiveTicker = activeEventTicker.length > 0 ? activeEventTicker : branding.globalTickerHeadlines;

  const filteredLiveMatches = matches.filter(m => {
    if (m.status !== 'live') return false;
    if (filter === 'all') return true;
    const sp = sports.find(s => s.id === m.sportId);
    return sp?.name.toLowerCase() === filter;
  });

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Broadcast Link Copied", {
      description: "You can now share this live relay with others.",
      duration: 3000,
    });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#050810] text-white relative font-['Rajdhani'] overflow-hidden selection:bg-[#f0b429]/30">
      {/* Winner announcement overlay */}
      <AnimatePresence>
        {winnerMatch && winnerFranchise && (
          <WinnerAnnouncement match={winnerMatch} franchise={winnerFranchise} />
        )}
      </AnimatePresence>

      {/* Standings overlay */}
      <AnimatePresence>
        {showStandings && <StandingsOverlay onClose={() => setShowStandings(false)} />}
      </AnimatePresence>

      {/* Top bar (Desktop only) */}
      {!isMobile && !isLandscape && (
        <div className="flex items-center justify-between px-8 py-3 border-b border-white/5 z-10 shrink-0 bg-[#060b18]/60 backdrop-blur-xl relative">
          <div className="flex items-center gap-3">
            <EventLogo size="sm" />
            <h1 className="text-xl font-bold tracking-tight uppercase">{branding.eventName}</h1>
            <div className="bg-red-600/20 text-red-500 text-[10px] font-black px-2 py-0.5 rounded border border-red-500/20 animate-pulse ml-2">LIVE BROADCAST</div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowStandings(true)}
              className="text-xs font-bold text-[#f0b429] hover:bg-[#f0b429]/10 rounded px-4 py-2 transition-all uppercase tracking-widest border border-[#f0b429]/20"
            >
              Standings
            </button>
            <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                  {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                </div>
                <div className="text-lg font-bold font-['Bebas_Neue'] tracking-wider leading-none">
                  {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 w-full flex ${isMobile && !isLandscape ? 'flex-col' : 'flex-row'} overflow-hidden relative z-10`}>
        {soonMatch && soonFranchiseA && soonFranchiseB && !activeStreamUrl ? (
          <div className="w-full h-full">
            <CountdownWidget match={soonMatch} franchiseA={soonFranchiseA} franchiseB={soonFranchiseB} />
          </div>
        ) : (
          <>
            {/* Video Canvas Section */}
            <div className={`relative flex flex-col min-w-0 bg-black ${isMobile ? 'w-full aspect-video shrink-0 shadow-2xl z-20' : 'flex-1'}`}>
              <div className="flex-1 relative w-full overflow-hidden">
                <VideoPlayer
                  streamUrl={activeStreamUrl}
                  status={activeStreamUrl ? 'playing' : 'idle'}
                  className="absolute inset-0 w-full h-full"
                />
                
                {/* Broadcast Overlays */}
                {activeMatch && activeFranchiseA && activeFranchiseB && activeSport && (
                  <ScoreBug 
                    match={activeMatch} 
                    franchiseA={activeFranchiseA} 
                    franchiseB={activeFranchiseB} 
                    sport={activeSport} 
                  />
                )}
                
                {/* Event Watermark */}
                <div className="absolute bottom-6 right-6 opacity-30 pointer-events-none">
                   <EventLogo size="lg" />
                </div>
              </div>
              
              {/* Share button on mobile video */}
              {isMobile && (
                <button 
                  onClick={copyShareLink}
                  className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10"
                >
                  <Share2 className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            {/* Content Side Section */}
            {!isLandscape && (
              <div className={`${isMobile ? 'flex-1 overflow-hidden' : 'w-[340px] border-l border-white/5 shadow-2xl'} flex flex-col bg-[#060b18]/40 backdrop-blur-3xl relative transition-all duration-300`}>
                <div className="absolute inset-0 bg-gradient-to-b from-[#f0b429]/5 to-transparent pointer-events-none" />
                
                {isMobile ? (
                /* Mobile Tabbed Interface */
                <div className="flex flex-col h-full relative z-10">
                  <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar shrink-0 bg-black/20">
                    {[
                      { id: 'live', label: 'Match Centre' },
                      { id: 'scorecard', label: 'Statistics' },
                      { id: 'upcoming', label: 'Schedule' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                          activeTab === tab.id ? 'text-[#f0b429]' : 'text-gray-500'
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#f0b429]" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                     <AnimatePresence mode="wait">
                        {activeTab === 'live' && activeMatch && activeFranchiseA && activeFranchiseB && activeSport && (
                          <motion.div 
                            key="live" 
                            initial={{ x: 20, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: -20, opacity: 0 }}
                          >
                            <MatchCard match={activeMatch} franchiseA={activeFranchiseA} franchiseB={activeFranchiseB} sport={activeSport} variant="full" />
                          </motion.div>
                        )}
                        {activeTab === 'scorecard' && activeMatch && (
                           <motion.div 
                            key="stats" 
                            initial={{ x: 20, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: -20, opacity: 0 }} 
                            className="space-y-4"
                           >
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4">Match Statistics</h3>
                                <div className="grid grid-cols-2 gap-3">
                                   {activeSport?.scoringSchema.fields.map(f => (
                                      <div key={f.key} className="bg-black/40 border border-white/5 rounded-xl p-3">
                                         <div className="text-[9px] text-gray-500 uppercase font-black tracking-tighter mb-1">{f.label}</div>
                                         <div className="text-xl font-bold font-['Bebas_Neue'] tracking-widest text-white">
                                            {activeMatch.scoreA[f.key] ?? 0} — {activeMatch.scoreB[f.key] ?? 0}
                                         </div>
                                      </div>
                                   ))}
                                </div>
                              </div>
                           </motion.div>
                        )}
                        {activeTab === 'upcoming' && (
                          <motion.div 
                            key="upcoming" 
                            initial={{ x: 20, opacity: 0 }} 
                            animate={{ x: 0, opacity: 1 }} 
                            exit={{ x: -20, opacity: 0 }} 
                            className="space-y-3"
                          >
                             {upcomingMatches.length === 0 ? (
                               <p className="text-center text-gray-600 py-10 uppercase font-bold text-xs">No upcoming matches</p>
                             ) : (
                               upcomingMatches.map(m => {
                                  const fa = franchises.find(f => f.id === m.franchiseAId);
                                  const fb = franchises.find(f => f.id === m.franchiseBId);
                                  const sp = sports.find(s => s.id === m.sportId);
                                  if (!fa || !fb || !sp) return null;
                                  return <MatchCard key={m.id} match={m} franchiseA={fa} franchiseB={fb} sport={sp} variant="compact" />;
                               })
                             )}
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
                </div>
              ) : (
                /* Desktop Side Panel */
                <div className="flex flex-col h-full overflow-hidden relative z-10">
                  <div className="p-8 border-b border-white/5 shrink-0 bg-white/5 flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-[#f0b429] uppercase tracking-wider font-['Bebas_Neue'] leading-none">Match Centre</h2>
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black mt-1">International Broadcast</p>
                    </div>
                    <button onClick={copyShareLink} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    {activeMatch && activeFranchiseA && activeFranchiseB && activeSport && (
                      <section>
                         <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> BROADCASTING NOW
                         </div>
                         <MatchCard match={activeMatch} franchiseA={activeFranchiseA} franchiseB={activeFranchiseB} sport={activeSport} variant="full" />
                      </section>
                    )}

                    {filteredLiveMatches.filter(m => m.id !== activeMatch?.id).length > 0 && (
                      <section>
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-4">Other Live Courts</div>
                        <div className="space-y-4">
                          {filteredLiveMatches.filter(m => m.id !== activeMatch?.id).map(m => {
                            const fa = franchises.find(f => f.id === m.franchiseAId);
                            const fb = franchises.find(f => f.id === m.franchiseBId);
                            const sp = sports.find(s => s.id === m.sportId);
                            if (!fa || !fb || !sp) return null;
                            return <MatchCard key={m.id} match={m} franchiseA={fa} franchiseB={fb} sport={sp} variant="compact" />;
                          })}
                        </div>
                      </section>
                    )}

                    {upcomingMatches.length > 0 && (
                      <section>
                         <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] mb-4">Daily Schedule</div>
                         <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                            {upcomingMatches.slice(0, 5).map(m => {
                               const fa = franchises.find(f => f.id === m.franchiseAId);
                               const fb = franchises.find(f => f.id === m.franchiseBId);
                               const sp = sports.find(s => s.id === m.sportId);
                               if (!fa || !fb || !sp) return null;
                               return <MatchCard key={m.id} match={m} franchiseA={fa} franchiseB={fb} sport={sp} variant="compact" />;
                            })}
                         </div>
                      </section>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </>
        )}
      </main>

      {/* Broadcaster News Tickers */}
      {!isLandscape && (
        <div className="shrink-0 border-t border-white/10 z-40 bg-black shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex h-12 bg-[#0a192f] items-stretch">
             <div className="bg-[#f0b429] px-6 flex items-center shrink-0 skew-x-[-15deg] ml-[-12px] z-10 border-r border-black/20 shadow-[5px_0_15px_rgba(0,0,0,0.3)]">
                <span className="text-black font-black text-sm uppercase tracking-tighter skew-x-[15deg]">MAHADASARA 2026</span>
             </div>
             <div className="flex-1 overflow-hidden relative">
                <NewsTicker
                  headlines={branding.globalTickerHeadlines.length > 0 ? branding.globalTickerHeadlines : ['Welcome to the event!']}
                  backgroundColor="transparent"
                  textColor="#FFFFFF"
                  speed={branding.globalTickerSpeed}
                />
             </div>
          </div>
          <div className="flex h-8 bg-black items-stretch">
             <div className="bg-red-600 px-6 flex items-center shrink-0 skew-x-[-15deg] ml-[-8px] z-10">
                <span className="text-white text-[10px] font-black uppercase tracking-widest skew-x-[15deg]">LATEST UPDATES</span>
             </div>
             <div className="flex-1 overflow-hidden">
                <NewsTicker
                  headlines={effectiveTicker.length > 0 ? effectiveTicker : branding.globalTickerHeadlines}
                  backgroundColor="transparent"
                  textColor={branding.secondaryColor}
                  speed={Math.max(30, branding.globalTickerSpeed - 10)}
                />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

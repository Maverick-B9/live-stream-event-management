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
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black"
    >
      <div className="text-center space-y-4">
        <div className="text-gray-400 text-sm uppercase tracking-widest">Next Match Starts In</div>
        <div className="text-8xl font-bold tabular-nums text-white">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div className="flex items-center gap-6 justify-center mt-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: franchiseA.color }}>
              {franchiseA.shortCode || franchiseA.name[0]}
            </div>
            <div className="text-white text-sm">{franchiseA.name}</div>
          </div>
          <div className="text-amber-400 font-bold text-2xl">VS</div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: franchiseB.color }}>
              {franchiseB.shortCode || franchiseB.name[0]}
            </div>
            <div className="text-white text-sm">{franchiseB.name}</div>
          </div>
        </div>
        <div className="text-gray-400 text-sm">{match.venue}</div>
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
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: `${franchise.color}ee` }}
    >
      <div className="text-center text-white space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.6 }}
          className="text-8xl"
        >
          🏆
        </motion.div>
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-black uppercase"
        >
          {franchise.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl opacity-80"
        >
          Wins the Match!
        </motion.p>
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
  const prevStatusesRef = useRef<Record<string, string>>({});
  const videoContainerRef = useRef<HTMLDivElement>(null);





  // Detect match completion for winner announcement
  useEffect(() => {
    matches.forEach(m => {
      const prev = prevStatusesRef.current[m.id];
      if (prev && prev !== 'completed' && m.status === 'completed' && m.winnerId) {
        setWinnerMatchId(m.id);
        setTimeout(() => setWinnerMatchId(null), 3000);
      }
      prevStatusesRef.current[m.id] = m.status;
    });
  }, [matches]);

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

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

  // Countdown widget: show if no stream and upcoming match within 60 min
  const soonMatch = !activeStreamUrl
    ? upcomingMatches.find(m => differenceInMinutes(m.dateTime, new Date()) <= 60 && differenceInMinutes(m.dateTime, new Date()) > 0)
    : null;

  const winnerMatch = winnerMatchId ? matches.find(m => m.id === winnerMatchId) : null;
  const winnerFranchise = winnerMatch?.winnerId ? franchises.find(f => f.id === winnerMatch.winnerId) : null;

  const soonFranchiseA = soonMatch ? franchises.find(f => f.id === soonMatch.franchiseAId) : null;
  const soonFranchiseB = soonMatch ? franchises.find(f => f.id === soonMatch.franchiseBId) : null;

  const effectiveTicker = activeEventTicker.length > 0 ? activeEventTicker : branding.globalTickerHeadlines;

  const filteredMatches = matches.filter(m => {
    if (filter === 'all') return true;
    const sp = sports.find(s => s.id === m.sportId);
    return sp?.name.toLowerCase() === filter;
  });

  const filteredLiveMatches = filteredMatches.filter(m => m.status === 'live');

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Broadcast Link Copied", {
      description: "You can now share this live relay with others.",
      duration: 3000,
    });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#060b18] text-white relative font-['Rajdhani'] overflow-hidden">
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

      {/* Offline banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: -40 }}
            className="absolute top-16 left-0 right-0 z-30 flex justify-center"
          >
            <div className="bg-amber-500 text-black text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5" /> Reconnecting...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 py-4 border-b border-white/5 z-10 shrink-0 bg-[#060b18]/80 backdrop-blur-xl shadow-2xl relative"
      >
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
        <div className="flex items-center gap-3">
          <EventLogo size="md" />
          <h1 className="text-2xl font-bold tracking-wide">{branding.eventName}</h1>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowStandings(true)}
            className="flex items-center gap-2 text-sm font-bold text-[#f0b429] border border-[#f0b429]/30 hover:border-[#f0b429] hover:bg-[#f0b429]/10 rounded-lg px-5 py-2 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(240,180,41,0.1)]"
          >
            <BarChart2 className="w-4 h-4" /> Standings
          </button>
          <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-10">
            <Clock className="w-5 h-5 text-gray-500" />
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </div>
              <div className="text-xl font-bold font-['Bebas_Neue'] tracking-wider leading-none">
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10">
        {soonMatch && soonFranchiseA && soonFranchiseB && !activeStreamUrl ? (
          <div className="w-full h-full">
            <CountdownWidget match={soonMatch} franchiseA={soonFranchiseA} franchiseB={soonFranchiseB} />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row flex-1 w-full h-full">
            {/* Left side: Video */}
            <div 
              ref={videoContainerRef}
              className={`flex-1 flex flex-col min-w-0 bg-black relative ${activeMatch && activeFranchiseA && activeFranchiseB ? '' : 'w-full'}`}
            >
              <div className="flex-1 relative w-full overflow-hidden">
                <VideoPlayer
                  streamUrl={activeStreamUrl}
                  status={activeStreamUrl ? 'playing' : 'idle'}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              
              {/* Match Info Card Beneath Video */}
              {activeMatch && activeStreamUrl && (
                <div className="bg-[#0e172c] border-t border-white/10 px-6 py-4 flex items-center justify-between shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_15px_red]"></div>
                      <span className="text-red-500 font-bold uppercase tracking-[0.25em] text-xs">LIVE RELAY</span>
                    </div>
                    <div className="h-5 w-px bg-white/20"></div>
                    <div className="text-white font-bold text-lg bebas tracking-widest text-[#f0b429]">MAHADASARA SPORTS NETWORK</div>
                  </div>
                  
                  <div className="flex items-center">
                    <button 
                      onClick={copyShareLink}
                      className="flex items-center gap-2 text-xs bg-white/5 hover:bg-[#f0b429]/10 text-[#f0b429] font-bold px-4 py-2 rounded-lg transition-all uppercase tracking-widest border border-white/10 hover:border-[#f0b429]/40"
                    >
                       <Share2 className="w-3.5 h-3.5"/> Share Broadcast
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Score panel aligned perfectly next to the video */}
            {activeMatch && activeFranchiseA && activeFranchiseB && activeSport && (
              <div className="w-full lg:w-[350px] lg:min-w-[350px] bg-[#060b18] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col shrink-0 relative z-30">
                <div className="flex border-b border-white/5 shrink-0">
                  {['all', 'cricket', 'football'].map(t => (
                    <button 
                      key={t} onClick={() => setFilter(t as any)}
                      className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.1em] transition-all border-b-2 ${filter === t ? 'text-[#f0b429] border-[#f0b429] bg-[#f0b429]/5' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
                   <h2 className="text-xl font-black text-[#f0b429] uppercase tracking-wider mb-2 font-['Bebas_Neue']">Live</h2>
                   <div>
                     <MatchCard
                        match={activeMatch}
                        franchiseA={activeFranchiseA}
                        franchiseB={activeFranchiseB}
                        sport={activeSport}
                        variant="full"
                      />
                    </div>
                    
                    {filteredLiveMatches.length > 0 && (
                      <div className="pt-6 border-t border-white/5">
                         <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mb-4">Other Live</div>
                         <div className="space-y-4">
                            {filteredLiveMatches.filter(m => m.id !== activeMatch.id).map(m => {
                              const fa = franchises.find(f => f.id === m.franchiseAId);
                              const fb = franchises.find(f => f.id === m.franchiseBId);
                              const sp = sports.find(s => s.id === m.sportId);
                              if (!fa || !fb || !sp) return null;
                              return <MatchCard key={m.id} match={m} franchiseA={fa} franchiseB={fb} sport={sp} variant="compact" />;
                            })}
                         </div>
                      </div>
                    )}

                    {upcomingMatches.length > 0 && (
                      <div className="pt-6 border-t border-white/5">
                         <div className="text-[10px] text-[#3b82f6] font-bold uppercase tracking-[0.3em] mb-4 font-['Bebas_Neue'] text-xl">Upcoming</div>
                         <div className="space-y-4">
                            {upcomingMatches.filter(m => {
                               if (filter === 'all') return true;
                               const sp = sports.find(s => s.id === m.sportId);
                               return sp?.name.toLowerCase() === filter;
                            }).slice(0, 10).map(m => {
                              const fa = franchises.find(f => f.id === m.franchiseAId);
                              const fb = franchises.find(f => f.id === m.franchiseBId);
                              const sp = sports.find(s => s.id === m.sportId);
                              if (!fa || !fb || !sp) return null;
                              return <MatchCard key={m.id} match={m} franchiseA={fa} franchiseB={fb} sport={sp} variant="compact" />;
                            })}
                         </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Dual ticker */}
      <div className="shrink-0 border-t border-white/10 z-40 bg-black">
        <NewsTicker
          headlines={branding.globalTickerHeadlines.length > 0 ? branding.globalTickerHeadlines : ['Welcome to the event!']}
          backgroundColor={branding.primaryColor}
          textColor="#FFFFFF"
          speed={branding.globalTickerSpeed}
        />
        <NewsTicker
          headlines={effectiveTicker.length > 0 ? effectiveTicker : branding.globalTickerHeadlines}
          backgroundColor="#0a192f"
          textColor={branding.secondaryColor}
          speed={Math.max(30, branding.globalTickerSpeed - 10)}
        />
      </div>

    </div>
  );
}

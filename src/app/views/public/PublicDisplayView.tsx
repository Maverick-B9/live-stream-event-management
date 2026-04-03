import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEvent } from '../../contexts/EventContext';
import { VideoPlayer } from '../../components/shared/VideoPlayer';
import { NewsTicker } from '../../components/shared/NewsTicker';
import { MatchCard } from '../../components/shared/MatchCard';
import { EventLogo } from '../../components/shared/EventLogo';
import { Wifi, WifiOff, Trophy, BarChart2 } from 'lucide-react';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';

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
  const { matches, franchises } = useEvent();
  const completed = matches.filter(m => m.status === 'completed');

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
  const prevStatusesRef = useRef<Record<string, string>>({});

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
        setTimeout(() => setWinnerMatchId(null), 3000);
      }
      prevStatusesRef.current[m.id] = m.status;
    });
  }, [matches]);

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  // Get active stream URL
  const activeEventId = branding.activeStreamEventId;
  let activeStreamUrl: string | null = null;
  let activeEventTicker: string[] = [];

  if (activeEventId) {
    const activeMatch = matches.find(m => m.id === activeEventId);
    const activeCultural = culturalEvents.find(e => e.id === activeEventId);
    activeStreamUrl = activeMatch?.streamUrl || activeCultural?.streamUrl || null;
    activeEventTicker = activeMatch?.tickerHeadlines || activeCultural?.tickerHeadlines || [];
  }

  // Countdown widget: show if no stream and upcoming match within 60 min
  const soonMatch = !activeStreamUrl
    ? upcomingMatches.find(m => differenceInMinutes(m.dateTime, new Date()) <= 60 && differenceInMinutes(m.dateTime, new Date()) > 0)
    : null;

  const winnerMatch = winnerMatchId ? matches.find(m => m.id === winnerMatchId) : null;
  const winnerFranchise = winnerMatch?.winnerId ? franchises.find(f => f.id === winnerMatch.winnerId) : null;

  const soonFranchiseA = soonMatch ? franchises.find(f => f.id === soonMatch.franchiseAId) : null;
  const soonFranchiseB = soonMatch ? franchises.find(f => f.id === soonMatch.franchiseBId) : null;

  const effectiveTicker = activeEventTicker.length > 0 ? activeEventTicker : branding.globalTickerHeadlines;

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden relative">
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
        className="flex items-center justify-between px-8 py-3 border-b border-white/10 z-10 shrink-0"
        style={{ backgroundColor: branding.primaryColor }}
      >
        <div className="flex items-center gap-3">
          <EventLogo size="md" />
          <h1 className="text-2xl font-bold tracking-wide">{branding.eventName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowStandings(true)}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/60 rounded-full px-3 py-1 transition-all"
          >
            <BarChart2 className="w-3.5 h-3.5" /> Standings
          </button>
          <div className="text-right">
            <div className="text-xs text-white/60">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="text-lg font-semibold tabular-nums">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Video / Countdown */}
        <div className="flex-1 min-h-0 relative">
          {soonMatch && soonFranchiseA && soonFranchiseB ? (
            <CountdownWidget match={soonMatch} franchiseA={soonFranchiseA} franchiseB={soonFranchiseB} />
          ) : (
            <VideoPlayer
              streamUrl={activeStreamUrl}
              status={activeStreamUrl ? 'playing' : 'idle'}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Live scorecards strip */}
        {liveMatches.length > 0 && (
          <div className="bg-black/60 backdrop-blur-sm py-3 px-6 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Live Now</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {liveMatches.map(m => {
                const fa = franchises.find(f => f.id === m.franchiseAId);
                const fb = franchises.find(f => f.id === m.franchiseBId);
                const sp = sports.find(s => s.id === m.sportId);
                if (!fa || !fb || !sp) return null;
                return (
                  <MatchCard
                    key={m.id}
                    match={m}
                    franchiseA={fa}
                    franchiseB={fb}
                    sport={sp}
                    variant="compact"
                    showShare
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming row */}
        {upcomingMatches.length > 0 && (
          <div className="bg-black/40 py-2 px-6 shrink-0">
            <div className="flex gap-3 overflow-x-auto items-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider shrink-0">Upcoming</span>
              {upcomingMatches.slice(0, 6).map(m => {
                const fa = franchises.find(f => f.id === m.franchiseAId);
                const fb = franchises.find(f => f.id === m.franchiseBId);
                const sp = sports.find(s => s.id === m.sportId);
                if (!fa || !fb || !sp) return null;
                return (
                  <div key={m.id} className="shrink-0 bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                    <div className="text-xs text-gray-400">{sp.name}</div>
                    <div className="text-white font-medium">
                      <span style={{ color: fa.color }}>{fa.shortCode}</span>
                      {' vs '}
                      <span style={{ color: fb.color }}>{fb.shortCode}</span>
                    </div>
                    <div className="text-xs text-blue-400">{formatDistanceToNow(m.dateTime, { addSuffix: true })}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dual ticker */}
      <div className="shrink-0 border-t border-white/10">
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

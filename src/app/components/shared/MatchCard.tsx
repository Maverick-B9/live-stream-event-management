import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimate } from 'motion/react';
import type { Match, Franchise, Sport } from '../../types';
import { LiveBadge } from './LiveBadge';
import { StatusBadge } from './StatusBadge';
import * as Icons from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Share2 } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  franchiseA: Franchise;
  franchiseB: Franchise;
  sport: Sport;
  variant?: 'compact' | 'full';
  onClick?: () => void;
  showShare?: boolean;
}

// ── Sport-specific score rendering ──────────────────────────────

function getPrimaryScore(sport: Sport, score: Record<string, any>): string {
  const schema = sport.scoringSchema;
  const name = sport.name.toLowerCase();

  if (name === 'cricket') {
    const runs = score?.runs ?? '-';
    const wickets = score?.wickets ?? '-';
    return `${runs}/${wickets}`;
  }

  const primaryField = schema.fields.find(f => f.isPrimary);
  if (!primaryField) return '-';
  return String(score?.[primaryField.key] ?? 0);
}

function getSecondaryStats(
  sport: Sport,
  scoreA: Record<string, any>,
  scoreB: Record<string, any>
): React.ReactNode {
  const name = sport.name.toLowerCase();
  const schema = sport.scoringSchema;

  if (name === 'cricket') {
    return (
      <div className="text-xs text-gray-400 text-center mt-1">
        Overs: {scoreA?.overs ?? '-'} | {scoreB?.overs ?? '-'}
      </div>
    );
  }

  if (name === 'volleyball' || name === 'throwball') {
    const sets = ['set1', 'set2', 'set3', 'set4', 'set5'];
    const scoreline = sets
      .filter(k => scoreA?.[k] || scoreB?.[k])
      .map(k => `${scoreA?.[k] ?? 0}-${scoreB?.[k] ?? 0}`)
      .join(', ');
    return scoreline ? (
      <div className="text-xs text-gray-400 text-center mt-1">{scoreline}</div>
    ) : null;
  }

  if (name === 'kabaddi') {
    return (
      <div className="text-xs text-gray-400 text-center mt-1 flex gap-4 justify-center">
        <span>R: {scoreA?.raids ?? 0}</span>
        <span>T: {scoreA?.tackles ?? 0}</span>
        <span className="text-gray-600">|</span>
        <span>R: {scoreB?.raids ?? 0}</span>
        <span>T: {scoreB?.tackles ?? 0}</span>
      </div>
    );
  }

  if (name === 'football') {
    const ya = scoreA?.yellowCards ?? 0;
    const ra = scoreA?.redCards ?? 0;
    const yb = scoreB?.yellowCards ?? 0;
    const rb = scoreB?.redCards ?? 0;
    if (!ya && !ra && !yb && !rb) return null;
    return (
      <div className="text-xs text-center mt-1 flex gap-3 justify-center">
        <span>{ya > 0 ? `🟨×${ya}` : ''} {ra > 0 ? `🟥×${ra}` : ''}</span>
        <span className="text-gray-400">|</span>
        <span>{yb > 0 ? `🟨×${yb}` : ''} {rb > 0 ? `🟥×${rb}` : ''}</span>
      </div>
    );
  }

  if (name === 'tug of war') {
    return (
      <div className="text-xs text-gray-400 text-center mt-1">
        Round {scoreA?.currentRound ?? scoreB?.currentRound ?? '-'}
      </div>
    );
  }

  // Generic: show all showInCard non-primary fields
  const secondaryFields = schema.fields.filter(f => f.showInCard && !f.isPrimary);
  if (!secondaryFields.length) return null;
  return (
    <div className="flex gap-2 justify-center mt-1 flex-wrap">
      {secondaryFields.map(f => (
        <span key={f.key} className="text-xs text-gray-400">
          {f.label}: {scoreA?.[f.key] ?? '-'}/{scoreB?.[f.key] ?? '-'}
        </span>
      ))}
    </div>
  );
}

// ── Score cell with flash animation ─────────────────────────────

function ScoreCell({ value, live }: { value: string; live: boolean }) {
  const [scope, animate] = useAnimate();
  const prevValue = useRef(value);

  useEffect(() => {
    if (live && prevValue.current !== value) {
      animate(scope.current, {
        backgroundColor: ['rgba(245,158,11,0.6)', 'rgba(245,158,11,0)'],
      }, { duration: 0.8 });
    }
    prevValue.current = value;
  }, [value, live, animate, scope]);

  return (
    <motion.span
      ref={scope}
      className="text-4xl font-bold px-2 rounded font-['Bebas_Neue'] tracking-wider text-white"
    >
      {value}
    </motion.span>
  );
}

// ── Main MatchCard ───────────────────────────────────────────────

export function MatchCard({
  match,
  franchiseA,
  franchiseB,
  sport,
  variant = 'compact',
  onClick,
  showShare = false,
}: MatchCardProps) {
  // @ts-ignore
  const SportIcon = Icons[sport.icon] || Icons.Trophy;
  const isLive = match.status === 'live';

  const primaryA = getPrimaryScore(sport, match.scoreA);
  const primaryB = getPrimaryScore(sport, match.scoreB);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/fixtures?match=${match.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const liveAnimation = isLive ? {
    boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 20px rgba(239,68,68,0.7)', '0 0 0px rgba(239,68,68,0)'],
  } : {};

  if (variant === 'compact') {
    return (
      <motion.div
        className="bg-gray-900 border border-gray-700 rounded-xl p-4 cursor-pointer min-w-[260px] relative"
        animate={liveAnimation}
        transition={isLive ? { duration: 1.5, repeat: Infinity, repeatDelay: 2 } : {}}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <SportIcon className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-white/90 tracking-tighter">{sport.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ${
                sport.gender === 'men' ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' : 
                sport.gender === 'women' ? 'bg-rose-600/30 text-rose-400 border border-rose-500/30' : 
                'bg-amber-600/30 text-amber-400 border border-amber-500/30'
              }`}>
                {sport.gender === 'men' ? "MEN'S" : sport.gender === 'women' ? "WOMEN'S" : 'MIXED'}
              </span>
            </div>
          </div>
          {isLive ? <LiveBadge /> : <StatusBadge status={match.status} />}
        </div>

        <div className="flex items-center justify-between">
          {/* Team A */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-12 rounded-t-lg rounded-b-[40%] flex items-center justify-center text-white text-sm font-bold shrink-0 border-2 border-white/30 shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              style={{ 
                backgroundColor: franchiseA.color, 
                boxShadow: `0 0 15px ${franchiseA.color}40`,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)'
              }}
            >
              {franchiseA.shortCode?.slice(0, 2) || franchiseA.name[0]}
            </div>
            <span className="text-white text-base font-bold tracking-wide truncate">{franchiseA.name}</span>
          </div>
          <ScoreCell value={primaryA} live={isLive} />
        </div>

        <div className="flex items-center justify-between mt-1.5">
          {/* Team B */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-12 rounded-t-lg rounded-b-[40%] flex items-center justify-center text-white text-sm font-bold shrink-0 border-2 border-white/30 shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              style={{ 
                backgroundColor: franchiseB.color, 
                boxShadow: `0 0 15px ${franchiseB.color}40`,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)'
              }}
            >
              {franchiseB.shortCode?.slice(0, 2) || franchiseB.name[0]}
            </div>
            <span className="text-white text-base font-bold tracking-wide truncate">{franchiseB.name}</span>
          </div>
          <ScoreCell value={primaryB} live={isLive} />
        </div>

        {match.currentPeriod && (
          <div className="mt-2 text-center text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            {match.currentPeriod}
          </div>
        )}

        {sport.name.toLowerCase() === 'cricket' && isLive && match.matchEvents && match.matchEvents.length > 0 && (
          <div className="mt-4 p-2 bg-black/40 rounded-lg border border-white/10">
            <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
              <span>RECENT EVENTS</span>
            </div>
            <div className="flex gap-1 h-2 w-full">
              {match.matchEvents.slice(-6).map((ev, idx) => {
                const desc = ev.description.toLowerCase();
                let color = 'bg-gray-600';
                if (desc.includes('boundary') || desc.includes('four') || desc.includes('six')) color = 'bg-green-500';
                if (desc.includes('wicket')) color = 'bg-red-500 animate-pulse';
                if (desc.includes('wide') || desc.includes('no ball')) color = 'bg-amber-500';
                return <div key={idx} className={`flex-1 ${color} rounded-full`}></div>;
              })}
              {Array.from({ length: Math.max(0, 6 - (match.matchEvents?.length || 0)) }).map((_, i) => (
                 <div key={`empty-${i}`} className="flex-1 bg-white/5 rounded-full border border-white/10"></div>
              ))}
            </div>
          </div>
        )}

        {match.status === 'upcoming' && (
          <div className="mt-1 text-center text-xs text-blue-400">
            {formatDistanceToNow(match.dateTime, { addSuffix: true })}
          </div>
        )}

        {showShare && (
          <button
            onClick={handleShare}
            className="absolute top-2 right-2 opacity-40 hover:opacity-100 transition-opacity"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </motion.div>
    );
  }

  // ── Full variant ──────────────────────────────────────────────
  const schema = sport.scoringSchema;
  const showCardFields = schema.fields.filter(f => f.showInCard);

  return (
    <motion.div
      className="bg-gray-900 border border-gray-700 rounded-xl p-6 relative"
      animate={liveAnimation}
      transition={isLive ? { duration: 1.5, repeat: Infinity, repeatDelay: 2 } : {}}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SportIcon className="w-5 h-5 text-gray-400" />
          <span className="font-black text-white uppercase tracking-widest text-lg font-['Bebas_Neue']">{sport.name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest flex items-center gap-1 ${
            sport.gender === 'men' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 
            sport.gender === 'women' ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' : 
            'bg-amber-600/20 text-amber-400 border border-amber-500/30'
          }`}>
            <Icons.User className="w-3 h-3" />
            {sport.gender === 'men' ? "MEN'S CATEGORY" : sport.gender === 'women' ? "WOMEN'S CATEGORY" : 'MIXED CATEGORY'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLive ? <LiveBadge /> : <StatusBadge status={match.status} />}
          {showShare && (
            <button onClick={handleShare} className="opacity-40 hover:opacity-100 transition-opacity">
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Scores */}
      <div className="space-y-3 mb-4">
        {/* Team A */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-16 rounded-t-lg rounded-b-[50%] flex items-center justify-center text-white text-lg font-bold shrink-0 border-2 border-white/20"
              style={{ backgroundColor: franchiseA.color, boxShadow: `0 0 15px ${franchiseA.color}80` }}
            >
              {franchiseA.shortCode || franchiseA.name.slice(0, 3)}
            </div>
            <div>
              <div className="text-white font-bold text-lg">{franchiseA.name}</div>
              {match.winnerId === franchiseA.id && (
                <span className="text-sm text-amber-400 font-bold uppercase tracking-wider drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">🏆 Winner</span>
              )}
            </div>
          </div>
          <ScoreCell value={primaryA} live={isLive} />
        </div>

        <div className="border-t border-gray-700" />

        {/* Team B */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-16 rounded-t-lg rounded-b-[50%] flex items-center justify-center text-white text-lg font-bold shrink-0 border-2 border-white/20"
              style={{ backgroundColor: franchiseB.color, boxShadow: `0 0 15px ${franchiseB.color}80` }}
            >
              {franchiseB.shortCode || franchiseB.name.slice(0, 3)}
            </div>
            <div>
              <div className="text-white font-bold text-lg">{franchiseB.name}</div>
              {match.winnerId === franchiseB.id && (
                <span className="text-sm text-amber-400 font-bold uppercase tracking-wider drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">🏆 Winner</span>
              )}
            </div>
          </div>
          <ScoreCell value={primaryB} live={isLive} />
        </div>
      </div>

      {/* Secondary stats */}
      {getSecondaryStats(sport, match.scoreA, match.scoreB)}

      {/* Period indicator */}
      {match.currentPeriod && (
        <div className="mt-3 text-center">
          <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full">
            {match.currentPeriod}
          </span>
        </div>
      )}

      {/* Match events preview (last 3) */}
      {match.matchEvents && match.matchEvents.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-3 space-y-1.5">
          {match.matchEvents.slice(-3).reverse().map(ev => (
            <div key={ev.id} className="flex items-start gap-2 text-xs text-gray-400">
              <span className="text-gray-600 shrink-0">
                {new Date(ev.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>{ev.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Venue / time */}
      <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between text-xs text-gray-500">
        <span>{match.venue}</span>
        <span>{new Date(match.dateTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
      </div>
    </motion.div>
  );
}

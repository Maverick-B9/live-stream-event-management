import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Match, Franchise, Sport } from '../../types';

interface ScoreBugProps {
  match: Match;
  franchiseA: Franchise;
  franchiseB: Franchise;
  sport: Sport;
}

export function ScoreBug({ match, franchiseA, franchiseB, sport }: ScoreBugProps) {
  const getPrimaryScore = (score: any) => {
    if (sport.name.toLowerCase() === 'cricket') {
      return `${score?.runs ?? 0}/${score?.wickets ?? 0}`;
    }
    const pf = sport.scoringSchema.fields.find(f => f.isPrimary);
    return score?.[pf?.key || ''] ?? 0;
  };

  const scoreA = getPrimaryScore(match.scoreA);
  const scoreB = getPrimaryScore(match.scoreB);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-4 left-4 z-40 flex items-center gap-0.5 font-['Rajdhani']"
    >
      {/* Team A */}
      <div className="flex items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-l-lg h-10 overflow-hidden shadow-2xl">
        <div className="w-1.5 h-full" style={{ backgroundColor: franchiseA.color }} />
        <div className="px-3 flex flex-col justify-center">
           <span className="text-[10px] font-black text-gray-400 leading-none uppercase tracking-tighter">{franchiseA.shortCode || franchiseA.name.slice(0, 3)}</span>
           <span className="text-lg font-black text-white leading-tight font-['Bebas_Neue'] tracking-widest">{scoreA}</span>
        </div>
      </div>

      {/* VS / Status info */}
      <div className="bg-amber-500 flex flex-col items-center justify-center h-10 px-2 min-w-[40px] shadow-2xl skew-x-[-15deg] mx-[-5px] z-10 border-x border-black/20">
         <div className="skew-x-[15deg] flex flex-col items-center">
            <span className="text-[8px] font-black text-black leading-none uppercase tracking-tighter">{match.status === 'live' ? 'LIVE' : 'VS'}</span>
            <span className="text-[9px] font-black text-black leading-tight uppercase tracking-tighter">{match.currentPeriod || sport.name.slice(0, 3)}</span>
         </div>
      </div>

       {/* Team B */}
       <div className="flex items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-r-lg h-10 overflow-hidden shadow-2xl">
        <div className="px-3 flex flex-col justify-center text-right">
           <span className="text-[10px] font-black text-gray-400 leading-none uppercase tracking-tighter">{franchiseB.shortCode || franchiseB.name.slice(0, 3)}</span>
           <span className="text-lg font-black text-white leading-tight font-['Bebas_Neue'] tracking-widest">{scoreB}</span>
        </div>
        <div className="w-1.5 h-full" style={{ backgroundColor: franchiseB.color }} />
      </div>

      {/* Extra Info (e.g. Cricket Overs) */}
      {sport.name.toLowerCase() === 'cricket' && (
        <motion.div 
          initial={{ x: -10, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          className="ml-2 bg-blue-600/80 backdrop-blur-md px-2 py-1 rounded border border-white/10 shadow-lg"
        >
          <span className="text-[10px] font-bold text-white tracking-widest">{match.scoreA.overs || match.scoreB.overs || '0.0'} OV</span>
        </motion.div>
      )}
    </motion.div>
  );
}

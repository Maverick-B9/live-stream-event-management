import React from 'react';
import { motion } from 'motion/react';

interface LiveBadgeProps {
  className?: string;
}

export function LiveBadge({ className = '' }: LiveBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <motion.div
          className="absolute inset-0 bg-red-500 rounded-full"
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      <span className="text-red-500 font-bold uppercase text-xs">LIVE</span>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface NewsTickerProps {
  headlines: string[];
  speed?: number;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function NewsTicker({ 
  headlines, 
  speed = 50, 
  className = '',
  backgroundColor = '#0F172A',
  textColor = '#FFFFFF',
}: NewsTickerProps) {
  const [tickerWidth, setTickerWidth] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (tickerRef.current) {
      setTickerWidth(tickerRef.current.scrollWidth / 2);
    }
  }, [headlines]);

  // Combine items with a decorative separator
  const tickerItems = [...headlines, ...headlines];
  const duration = tickerWidth / speed;

  return (
    <div 
      className={`relative overflow-hidden group select-none ${className}`}
      style={{ 
        backgroundColor,
        maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
      }}
    >
      <motion.div
        ref={tickerRef}
        className="flex whitespace-nowrap py-2"
        animate={{ x: [-tickerWidth, 0] }}
        transition={{
          duration: duration || 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ color: textColor }}
      >
        {tickerItems.map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-6 shrink-0 font-['Rajdhani'] font-bold text-sm tracking-widest uppercase">
            <span>{item}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-50" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

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
      setTickerWidth(tickerRef.current.scrollWidth);
    }
  }, [headlines]);

  const tickerText = headlines.join('   •   ') + '   •   ';
  const duration = tickerWidth / speed;

  return (
    <div 
      className={`overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      <motion.div
        ref={tickerRef}
        className="whitespace-nowrap py-2"
        animate={{ x: [-tickerWidth, 0] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ color: textColor }}
      >
        <span className="inline-block px-4">{tickerText}</span>
        <span className="inline-block px-4">{tickerText}</span>
      </motion.div>
    </div>
  );
}

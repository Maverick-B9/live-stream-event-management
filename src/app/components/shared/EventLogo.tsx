import React from 'react';
import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useEvent } from '../../contexts/EventContext';

interface EventLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export function EventLogo({ size = 'md', animate = false, className = '' }: EventLogoProps) {
  const { branding } = useEvent();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const LogoContent = () => {
    if (branding.eventLogoUrl) {
      return (
        <img 
          src={branding.eventLogoUrl} 
          alt={branding.eventName}
          className={`${sizeClasses[size]} object-contain ${className}`}
        />
      );
    }
    
    return (
      <div 
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full ${className}`}
        style={{ backgroundColor: branding.secondaryColor }}
      >
        <Trophy className="w-2/3 h-2/3 text-white" />
      </div>
    );
  };

  if (!animate) {
    return <LogoContent />;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <LogoContent />
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { EventLogo } from './EventLogo';
import { useEvent } from '../../contexts/EventContext';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  const { branding } = useEvent();

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ 
        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` 
      }}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.1, 1],
            opacity: 1,
          }}
          transition={{ 
            duration: 0.8,
            times: [0, 0.7, 1],
            ease: 'easeOut'
          }}
        >
          <EventLogo size="xl" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.8, 1] }}
          transition={{ 
            duration: 1.5,
            delay: 0.8,
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
          className="mt-6 text-white"
        >
          <p className="text-xl">{message}</p>
        </motion.div>
      </div>
    </div>
  );
}

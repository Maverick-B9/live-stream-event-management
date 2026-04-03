import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle } from 'lucide-react';
import { EventLogo } from './EventLogo';

interface VideoPlayerProps {
  streamUrl: string | null;
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  onStatusChange?: (status: 'idle' | 'loading' | 'playing' | 'paused' | 'error') => void;
  className?: string;
}

export function VideoPlayer({ streamUrl, status, onStatusChange, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [internalStatus, setInternalStatus] = useState(status);

  useEffect(() => {
    setInternalStatus(status);
  }, [status]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setInternalStatus('loading');
      onStatusChange?.('loading');
    };

    const handleCanPlay = () => {
      setInternalStatus('playing');
      onStatusChange?.('playing');
      video.play().catch(() => {
        setInternalStatus('error');
        onStatusChange?.('error');
      });
    };

    const handleError = () => {
      setInternalStatus('error');
      onStatusChange?.('error');
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [onStatusChange]);

  useEffect(() => {
    if (videoRef.current && streamUrl) {
      videoRef.current.load();
    }
  }, [streamUrl]);

  return (
    <div className={`relative bg-black overflow-hidden ${className}`}>
      {streamUrl ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          muted
          loop
        >
          <source src={streamUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white/60">
            <EventLogo size="xl" className="mx-auto mb-4 opacity-20" />
            <p>No stream available</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {internalStatus === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <EventLogo size="xl" />
              </motion.div>
              <p className="text-white mt-4">Loading stream...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {internalStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center"
          >
            <div className="text-center text-white">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-xl">Stream error</p>
              <p className="text-sm text-white/60 mt-2">Unable to load video stream</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

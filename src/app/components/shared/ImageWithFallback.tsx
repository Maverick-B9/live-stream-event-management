import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  shortCode?: string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ImageWithFallback({ src, alt, shortCode, color = '#6366F1', className = '', style }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        onError={() => setFailed(true)}
      />
    );
  }

  // Colored circle fallback with initials
  const initials = shortCode
    ? shortCode.slice(0, 2).toUpperCase()
    : alt.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div
      className={`flex items-center justify-center text-white font-bold select-none ${className}`}
      style={{ backgroundColor: color, ...style }}
    >
      {initials}
    </div>
  );
}

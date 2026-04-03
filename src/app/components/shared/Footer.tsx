import React from 'react';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-sm border-t border-gray-800/60 py-1.5 text-center pointer-events-none select-none">
      <p className="text-xs text-gray-500 leading-tight">
        Developed by <span className="text-amber-400/80 font-medium">Balaram B.</span>
      </p>
      <p className="text-[10px] text-gray-600 leading-tight tracking-wide uppercase">
        Department of Computer Science &amp; Engineering
      </p>
    </footer>
  );
}

import React from 'react';
import { Badge } from '../ui/badge';
import type { MatchStatus } from '../../types';

interface StatusBadgeProps {
  status: MatchStatus;
}

const statusConfig: Record<MatchStatus, { label: string; className: string }> = {
  live: { label: 'LIVE', className: 'bg-red-500 text-white' },
  upcoming: { label: 'UPCOMING', className: 'bg-blue-500 text-white' },
  completed: { label: 'COMPLETED', className: 'bg-gray-500 text-white' },
  halftime: { label: 'HALFTIME', className: 'bg-amber-500 text-white' },
  postponed: { label: 'POSTPONED', className: 'bg-amber-600 text-white' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}

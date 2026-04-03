// Core data types for the platform

export type MatchStatus = 'upcoming' | 'live' | 'halftime' | 'completed' | 'postponed';
export type UserRole = 'admin' | 'coordinator';

export interface Franchise {
  id: string;
  name: string;
  logoUrl: string;
  color: string;
  shortCode: string;
}

export interface SportScoringSchema {
  teamALabel: string;
  teamBLabel: string;
  fields: ScoringField[];
  periodLabel: string; // "Over", "Quarter", "Set", "Round", "Half"
  maxPeriods: number;
}

export interface ScoringField {
  key: string;
  label: string;
  type: 'number' | 'text';
  showInCard: boolean; // whether to show on the public scorecard
  isPrimary: boolean;  // the main score number shown largest
}

export interface Sport {
  id: string;
  name: string;
  gender: 'men' | 'women';
  icon: string;
  scoringSchema: SportScoringSchema;
}

export interface Match {
  id: string;
  sportId: string;
  franchiseAId: string;
  franchiseBId: string;
  scoreA: Record<string, any>;
  scoreB: Record<string, any>;
  status: MatchStatus;
  currentPeriod: string;
  venue: string;
  dateTime: Date;
  coordinatorId: string;
  streamUrl: string | null;
  tickerHeadlines: string[];
  matchEvents: MatchEvent[];
  pendingStreamRequest: StreamRequest | null;
  winnerId: string | null;
  notes?: string;
}

export interface MatchEvent {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  franchiseId: string;
}

export interface StreamRequest {
  id: string;
  coordinatorId: string;
  coordinatorName: string;
  eventId: string;
  eventType: 'match' | 'cultural';
  eventName: string;
  requestedUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string;
  createdAt: Date;
}

export interface CulturalEvent {
  id: string;
  name: string;
  type: string;
  scheduledAt: Date;
  venue: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  result: string;
  notes: string;
  coordinatorId: string;
  streamUrl: string | null;
  tickerHeadlines: string[];
  pendingStreamRequest: StreamRequest | null;
}

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  assignedSportIds: string[];
  assignedEventIds: string[];
  isOnline: boolean;
}

export interface GlobalSettings {
  eventName: string;
  eventLogoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  globalTickerHeadlines: string[];
  globalTickerSpeed: number;
  globalTickerPaused: boolean;
  activeStreamEventId: string | null;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  eventId?: string;
  eventName?: string;
  timestamp: Date;
}

// Legacy compatibility aliases
export type User = AppUser & { id: string };
export interface BrandingSettings {
  eventLogoUrl: string;
  eventName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  animationsEnabled: boolean;
}

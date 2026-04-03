// Mock data for the platform
import type { Franchise, Sport, Match, User, Event, CulturalEvent, TickerHeadline } from '../types';

// 11 Franchises with colors
export const mockFranchises: Franchise[] = [
  { id: 'f1', name: 'Thunder Hawks', logoUrl: '', color: '#1E40AF' },
  { id: 'f2', name: 'Phoenix Flames', logoUrl: '', color: '#DC2626' },
  { id: 'f3', name: 'Storm Riders', logoUrl: '', color: '#059669' },
  { id: 'f4', name: 'Lightning Bolts', logoUrl: '', color: '#F59E0B' },
  { id: 'f5', name: 'Tiger Sharks', logoUrl: '', color: '#8B5CF6' },
  { id: 'f6', name: 'Mountain Lions', logoUrl: '', color: '#06B6D4' },
  { id: 'f7', name: 'Desert Eagles', logoUrl: '', color: '#EA580C' },
  { id: 'f8', name: 'Ocean Warriors', logoUrl: '', color: '#0891B2' },
  { id: 'f9', name: 'Sky Titans', logoUrl: '', color: '#6366F1' },
  { id: 'f10', name: 'Forest Rangers', logoUrl: '', color: '#10B981' },
  { id: 'f11', name: 'Iron Knights', logoUrl: '', color: '#64748B' },
];

// 7 Sports (placeholder names)
export const mockSports: Sport[] = [
  {
    id: 's1',
    name: 'Sport Alpha',
    icon: 'Trophy',
    scoringSchema: [
      { id: 'score', label: 'Score', type: 'number' },
      { id: 'period', label: 'Period', type: 'text', placeholder: 'Q1, Q2...' },
    ],
  },
  {
    id: 's2',
    name: 'Sport Beta',
    icon: 'Target',
    scoringSchema: [
      { id: 'runs', label: 'Runs', type: 'number' },
      { id: 'wickets', label: 'Wickets', type: 'number' },
      { id: 'overs', label: 'Overs', type: 'text' },
    ],
  },
  {
    id: 's3',
    name: 'Sport Gamma',
    icon: 'Zap',
    scoringSchema: [
      { id: 'points', label: 'Points', type: 'number' },
      { id: 'sets', label: 'Sets', type: 'text' },
    ],
  },
  {
    id: 's4',
    name: 'Sport Delta',
    icon: 'Flame',
    scoringSchema: [
      { id: 'goals', label: 'Goals', type: 'number' },
      { id: 'half', label: 'Half', type: 'text', placeholder: '1st, 2nd' },
    ],
  },
  {
    id: 's5',
    name: 'Sport Epsilon',
    icon: 'Award',
    scoringSchema: [
      { id: 'score', label: 'Score', type: 'number' },
      { id: 'time', label: 'Time', type: 'text' },
    ],
  },
  {
    id: 's6',
    name: 'Sport Zeta',
    icon: 'Medal',
    scoringSchema: [
      { id: 'points', label: 'Points', type: 'number' },
      { id: 'round', label: 'Round', type: 'text' },
    ],
  },
  {
    id: 's7',
    name: 'Sport Eta',
    icon: 'Star',
    scoringSchema: [
      { id: 'score', label: 'Score', type: 'number' },
      { id: 'inning', label: 'Inning', type: 'text' },
    ],
  },
];

// Mock users
export const mockUsers: User[] = [
  {
    id: 'u1',
    email: 'admin@sportsevent.com',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: 'u2',
    email: 'coordinator1@sportsevent.com',
    name: 'John Coordinator',
    role: 'coordinator',
    assignedFranchises: ['f1', 'f2'],
    assignedEvents: ['e1'],
    online: true,
  },
  {
    id: 'u3',
    email: 'coordinator2@sportsevent.com',
    name: 'Sarah Coordinator',
    role: 'coordinator',
    assignedFranchises: ['f3'],
    assignedEvents: ['e1'],
    online: false,
  },
];

// Mock event
export const mockEvent: Event = {
  id: 'e1',
  name: 'Championship Series 2026',
  startDate: '2026-04-01',
  endDate: '2026-04-30',
  logoUrl: '',
  sports: ['s1', 's2', 's3', 's4', 's5', 's6', 's7'],
  culturalEvents: ['ce1', 'ce2'],
};

// Mock matches
export const mockMatches: Match[] = [
  {
    id: 'm1',
    sportId: 's1',
    eventId: 'e1',
    franchiseAId: 'f1',
    franchiseBId: 'f2',
    dateTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    venue: 'Central Stadium',
    status: 'live',
    scoreA: { score: 45, period: 'Q3' },
    scoreB: { score: 42, period: 'Q3' },
    currentPeriod: 'Q3',
    coordinatorId: 'u2',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    events: [],
  },
  {
    id: 'm2',
    sportId: 's2',
    eventId: 'e1',
    franchiseAId: 'f3',
    franchiseBId: 'f4',
    dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    venue: 'Arena North',
    status: 'upcoming',
    coordinatorId: 'u3',
    events: [],
  },
  {
    id: 'm3',
    sportId: 's3',
    eventId: 'e1',
    franchiseAId: 'f5',
    franchiseBId: 'f6',
    dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    venue: 'East Sports Complex',
    status: 'upcoming',
    events: [],
  },
  {
    id: 'm4',
    sportId: 's1',
    eventId: 'e1',
    franchiseAId: 'f7',
    franchiseBId: 'f8',
    dateTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    venue: 'West Stadium',
    status: 'completed',
    scoreA: { score: 88, period: 'Final' },
    scoreB: { score: 76, period: 'Final' },
    currentPeriod: 'Final',
    events: [],
  },
];

// Mock cultural events
export const mockCulturalEvents: CulturalEvent[] = [
  {
    id: 'ce1',
    name: 'Opening Ceremony',
    eventId: 'e1',
    type: 'Ceremony',
    dateTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    venue: 'Main Arena',
    status: 'upcoming',
    participants: ['Dance Troupe A', 'Orchestra B'],
  },
  {
    id: 'ce2',
    name: 'Cultural Performance',
    eventId: 'e1',
    type: 'Performance',
    dateTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    venue: 'Cultural Center',
    status: 'upcoming',
    participants: ['Artists Collective'],
  },
];

// Mock ticker headlines
export const mockGlobalHeadlines: TickerHeadline[] = [
  {
    id: 'h1',
    text: 'Championship Series 2026 kicks off with record attendance!',
    priority: 1,
    type: 'global',
    createdBy: 'u1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h2',
    text: 'Thunder Hawks secure dramatic victory in opening match',
    priority: 2,
    type: 'global',
    createdBy: 'u1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h3',
    text: 'Opening ceremony scheduled for tonight at 8 PM',
    priority: 3,
    type: 'global',
    createdBy: 'u1',
    createdAt: new Date().toISOString(),
  },
];

export const mockEventHeadlines: TickerHeadline[] = [
  {
    id: 'h4',
    text: 'LIVE NOW: Thunder Hawks vs Phoenix Flames - Q3 underway',
    priority: 1,
    type: 'event',
    eventId: 'e1',
    createdBy: 'u2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h5',
    text: 'Storm Riders match starting in 1 hour',
    priority: 2,
    type: 'event',
    eventId: 'e1',
    createdBy: 'u3',
    createdAt: new Date().toISOString(),
  },
];

import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  addDoc,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  getDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type {
  GlobalSettings,
  Franchise,
  Sport,
  Match,
  CulturalEvent,
  StreamRequest,
  AppUser,
  ActivityLogEntry,
  MatchEvent,
} from '../types';

// ─── Converters ────────────────────────────────────────────────

function tsToDate(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
}

function matchFromDoc(id: string, data: any): Match {
  return {
    id,
    sportId: data.sportId || '',
    franchiseAId: data.franchiseAId || '',
    franchiseBId: data.franchiseBId || '',
    scoreA: data.scoreA || {},
    scoreB: data.scoreB || {},
    status: data.status || 'upcoming',
    currentPeriod: data.currentPeriod || '',
    venue: data.venue || '',
    dateTime: tsToDate(data.dateTime),
    coordinatorId: data.coordinatorId || '',
    streamUrl: data.streamUrl || null,
    tickerHeadlines: data.tickerHeadlines || [],
    matchEvents: (data.matchEvents || []).map((e: any) => ({
      id: e.id || '',
      type: e.type || '',
      description: e.description || '',
      timestamp: tsToDate(e.timestamp),
      franchiseId: e.franchiseId || '',
    } as MatchEvent)),
    pendingStreamRequest: data.pendingStreamRequest
      ? srFromObj(data.pendingStreamRequest)
      : null,
    winnerId: data.winnerId || null,
    notes: data.notes || '',
  };
}

function culturalFromDoc(id: string, data: any): CulturalEvent {
  return {
    id,
    name: data.name || '',
    type: data.type || '',
    scheduledAt: tsToDate(data.scheduledAt),
    venue: data.venue || '',
    status: data.status || 'upcoming',
    result: data.result || '',
    notes: data.notes || '',
    coordinatorId: data.coordinatorId || '',
    streamUrl: data.streamUrl || null,
    tickerHeadlines: data.tickerHeadlines || [],
    pendingStreamRequest: data.pendingStreamRequest
      ? srFromObj(data.pendingStreamRequest)
      : null,
  };
}

function srFromObj(data: any): StreamRequest {
  return {
    id: data.id || '',
    coordinatorId: data.coordinatorId || '',
    coordinatorName: data.coordinatorName || '',
    eventId: data.eventId || '',
    eventType: data.eventType || 'match',
    eventName: data.eventName || '',
    requestedUrl: data.requestedUrl || '',
    status: data.status || 'pending',
    adminNote: data.adminNote || '',
    createdAt: tsToDate(data.createdAt),
  };
}

function srFromDoc(id: string, data: any): StreamRequest {
  return { ...srFromObj(data), id };
}

function franchiseFromDoc(id: string, data: any): Franchise {
  return {
    id,
    name: data.name || '',
    logoUrl: data.logoUrl || '',
    color: data.color || '#6366F1',
    shortCode: data.shortCode || data.name?.slice(0, 3).toUpperCase() || 'UNK',
  };
}

function sportFromDoc(id: string, data: any): Sport {
  return {
    id,
    name: data.name || '',
    gender: data.gender || 'men',
    icon: data.icon || 'Trophy',
    scoringSchema: data.scoringSchema || {
      teamALabel: 'Team A',
      teamBLabel: 'Team B',
      fields: [{ key: 'score', label: 'Score', type: 'number', isPrimary: true, showInCard: true }],
      periodLabel: 'Period',
      maxPeriods: 2,
    },
  };
}

function settingsFromDoc(data: any): GlobalSettings {
  return {
    eventName: data.eventName || 'Mahadasara Sports 2026',
    eventLogoUrl: data.eventLogoUrl || '',
    primaryColor: data.primaryColor || '#0F172A',
    secondaryColor: data.secondaryColor || '#F59E0B',
    globalTickerHeadlines: data.globalTickerHeadlines || [],
    globalTickerSpeed: data.globalTickerSpeed ?? 50,
    globalTickerPaused: data.globalTickerPaused ?? false,
    activeStreamEventId: data.activeStreamEventId || null,
  };
}

function activityFromDoc(id: string, data: any): ActivityLogEntry {
  return {
    id,
    userId: data.userId || '',
    userName: data.userName || '',
    action: data.action || '',
    eventId: data.eventId,
    eventName: data.eventName,
    timestamp: tsToDate(data.timestamp),
  };
}

// ─── Subscriptions ─────────────────────────────────────────────

export function subscribeToSettings(cb: (s: GlobalSettings) => void) {
  return onSnapshot(doc(db, 'settings', 'global'), snap => {
    if (snap.exists()) cb(settingsFromDoc(snap.data()));
  });
}

export function subscribeFranchises(cb: (list: Franchise[]) => void) {
  return onSnapshot(collection(db, 'franchises'), snap => {
    cb(snap.docs.map(d => franchiseFromDoc(d.id, d.data())));
  });
}

export function subscribeSports(cb: (list: Sport[]) => void) {
  return onSnapshot(collection(db, 'sports'), snap => {
    cb(snap.docs.map(d => sportFromDoc(d.id, d.data())));
  });
}

export function subscribeMatches(cb: (list: Match[]) => void) {
  return onSnapshot(collection(db, 'matches'), snap => {
    cb(snap.docs.map(d => matchFromDoc(d.id, d.data())));
  });
}

export function subscribeCulturalEvents(cb: (list: CulturalEvent[]) => void) {
  return onSnapshot(collection(db, 'culturalEvents'), snap => {
    cb(snap.docs.map(d => culturalFromDoc(d.id, d.data())));
  });
}

export function subscribeCoordinators(cb: (list: AppUser[]) => void) {
  return onSnapshot(
    query(collection(db, 'users'), where('role', '==', 'coordinator')),
    (snap: any) => {
      cb(snap.docs.map((d: any) => ({ uid: d.id, ...d.data() })));
    }
  );
}

export function subscribeStreamRequests(cb: (list: StreamRequest[]) => void) {
  return onSnapshot(
    query(collection(db, 'streamRequests'), orderBy('createdAt', 'desc')),
    snap => {
      cb(snap.docs.map(d => srFromDoc(d.id, d.data())));
    }
  );
}

export function subscribeUser(uid: string, cb: (u: AppUser) => void) {
  return onSnapshot(doc(db, 'users', uid), snap => {
    if (snap.exists()) {
      const d = snap.data();
      cb({
        uid,
        email: d.email || '',
        role: d.role || 'coordinator',
        name: d.name || '',
        assignedSportIds: d.assignedSportIds || [],
        assignedEventIds: d.assignedEventIds || [],
        isOnline: d.isOnline || false,
      });
    }
  });
}

export function subscribeActivityLog(cb: (list: ActivityLogEntry[]) => void) {
  return onSnapshot(
    query(collection(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(20)),
    snap => {
      cb(snap.docs.map(d => activityFromDoc(d.id, d.data())));
    }
  );
}

// ─── Writes ────────────────────────────────────────────────────

export async function updateMatch(id: string, data: Partial<any>) {
  return updateDoc(doc(db, 'matches', id), data);
}

export async function createMatch(data: any) {
  return addDoc(collection(db, 'matches'), { ...data, createdAt: serverTimestamp() });
}

export async function deleteMatch(id: string) {
  const { deleteDoc } = await import('firebase/firestore');
  return deleteDoc(doc(db, 'matches', id));
}

export async function updateCulturalEvent(id: string, data: Partial<any>) {
  return updateDoc(doc(db, 'culturalEvents', id), data);
}

export async function updateSettings(data: Partial<any>) {
  return setDoc(doc(db, 'settings', 'global'), data, { merge: true });
}

export async function updateFranchise(id: string, data: Partial<any>) {
  return setDoc(doc(db, 'franchises', id), data, { merge: true });
}

export async function createFranchise(data: any) {
  return addDoc(collection(db, 'franchises'), data);
}

export async function updateSport(id: string, data: Partial<any>) {
  return setDoc(doc(db, 'sports', id), data, { merge: true });
}

export async function createSport(data: any) {
  return addDoc(collection(db, 'sports'), data);
}

export async function updateUser(uid: string, data: Partial<any>) {
  return setDoc(doc(db, 'users', uid), data, { merge: true });
}

export async function getUserDoc(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid,
    email: d.email || '',
    role: d.role || 'coordinator',
    name: d.name || '',
    assignedSportIds: d.assignedSportIds || [],
    assignedEventIds: d.assignedEventIds || [],
    isOnline: d.isOnline || false,
  };
}

export async function createStreamRequest(data: any) {
  return addDoc(collection(db, 'streamRequests'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateStreamRequest(id: string, data: Partial<any>) {
  return updateDoc(doc(db, 'streamRequests', id), data);
}

export async function addActivityLog(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) {
  return addDoc(collection(db, 'activityLog'), {
    ...entry,
    timestamp: serverTimestamp(),
  });
}

// ─── Default Sport Seeds ────────────────────────────────────────

export const DEFAULT_SPORTS: Omit<Sport, 'id'>[] = [
  {
    name: 'Cricket',
    gender: 'men',
    icon: 'CircleDot',
    scoringSchema: {
      teamALabel: 'Team A',
      teamBLabel: 'Team B',
      periodLabel: 'Over',
      maxPeriods: 20,
      fields: [
        { key: 'runs', label: 'Runs', type: 'number', isPrimary: true, showInCard: true },
        { key: 'wickets', label: 'Wickets', type: 'number', isPrimary: false, showInCard: true },
        { key: 'overs', label: 'Overs', type: 'text', isPrimary: false, showInCard: true },
        { key: 'extras', label: 'Extras', type: 'number', isPrimary: false, showInCard: false },
        { key: 'runRate', label: 'Run Rate', type: 'text', isPrimary: false, showInCard: false },
      ],
    },
  },
  {
    name: 'Kabaddi',
    gender: 'men',
    icon: 'Swords',
    scoringSchema: {
      teamALabel: 'Team A',
      teamBLabel: 'Team B',
      periodLabel: 'Half',
      maxPeriods: 2,
      fields: [
        { key: 'points', label: 'Points', type: 'number', isPrimary: true, showInCard: true },
        { key: 'raids', label: 'Raids', type: 'number', isPrimary: false, showInCard: false },
        { key: 'tackles', label: 'Tackles', type: 'number', isPrimary: false, showInCard: false },
        { key: 'allOuts', label: 'All Outs', type: 'number', isPrimary: false, showInCard: false },
      ],
    },
  },
  {
    name: 'Football',
    gender: 'men',
    icon: 'Circle',
    scoringSchema: {
      teamALabel: 'Team A',
      teamBLabel: 'Team B',
      periodLabel: 'Half',
      maxPeriods: 2,
      fields: [
        { key: 'goals', label: 'Goals', type: 'number', isPrimary: true, showInCard: true },
        { key: 'yellowCards', label: 'Yellow Cards', type: 'number', isPrimary: false, showInCard: false },
        { key: 'redCards', label: 'Red Cards', type: 'number', isPrimary: false, showInCard: false },
        { key: 'corners', label: 'Corners', type: 'number', isPrimary: false, showInCard: false },
      ],
    },
  },
  {
    name: 'Tug of War',
    gender: 'women',
    icon: 'ArrowLeftRight',
    scoringSchema: {
      teamALabel: 'Team A',
      teamBLabel: 'Team B',
      periodLabel: 'Round',
      maxPeriods: 3,
      fields: [
        { key: 'roundsWon', label: 'Rounds Won', type: 'number', isPrimary: true, showInCard: true },
        { key: 'currentRound', label: 'Round', type: 'number', isPrimary: false, showInCard: true },
      ],
    },
  },
  {
    name: 'Volleyball',
    gender: 'men',
    icon: 'Circle',
    scoringSchema: {
      teamALabel: 'Team A',
      teamBLabel: 'Team B',
      periodLabel: 'Set',
      maxPeriods: 5,
      fields: [
        { key: 'setsWon', label: 'Sets Won', type: 'number', isPrimary: true, showInCard: true },
        { key: 'currentSet', label: 'Set Points', type: 'number', isPrimary: false, showInCard: true },
        { key: 'set1', label: 'Set 1', type: 'text', isPrimary: false, showInCard: false },
        { key: 'set2', label: 'Set 2', type: 'text', isPrimary: false, showInCard: false },
        { key: 'set3', label: 'Set 3', type: 'text', isPrimary: false, showInCard: false },
      ],
    },
  },
  {
    name: 'Volleyball',
    gender: 'women',
    icon: 'Circle',
    scoringSchema: {
      teamALabel: 'Team A',
      teamBLabel: 'Team B',
      periodLabel: 'Set',
      maxPeriods: 5,
      fields: [
        { key: 'setsWon', label: 'Sets Won', type: 'number', isPrimary: true, showInCard: true },
        { key: 'currentSet', label: 'Set Points', type: 'number', isPrimary: false, showInCard: true },
        { key: 'set1', label: 'Set 1', type: 'text', isPrimary: false, showInCard: false },
        { key: 'set2', label: 'Set 2', type: 'text', isPrimary: false, showInCard: false },
        { key: 'set3', label: 'Set 3', type: 'text', isPrimary: false, showInCard: false },
      ],
    },
  },
  {
    name: 'Throwball',
    gender: 'women',
    icon: 'Trophy',
    scoringSchema: {
      teamALabel: 'Team A',
      teamBLabel: 'Team B',
      periodLabel: 'Set',
      maxPeriods: 3,
      fields: [
        { key: 'setsWon', label: 'Sets Won', type: 'number', isPrimary: true, showInCard: true },
        { key: 'currentSet', label: 'Set Points', type: 'number', isPrimary: false, showInCard: true },
        { key: 'set1', label: 'Set 1', type: 'text', isPrimary: false, showInCard: false },
        { key: 'set2', label: 'Set 2', type: 'text', isPrimary: false, showInCard: false },
        { key: 'set3', label: 'Set 3', type: 'text', isPrimary: false, showInCard: false },
      ],
    },
  },
];

export async function seedSportsIfEmpty(existingCount: number) {
  if (existingCount > 0) return;
  for (const sport of DEFAULT_SPORTS) {
    await addDoc(collection(db, 'sports'), sport);
  }
}

export async function seedSettingsIfMissing() {
  const snap = await getDoc(doc(db, 'settings', 'global'));
  if (!snap.exists()) {
    await setDoc(doc(db, 'settings', 'global'), {
      eventName: 'Mahadasara 2026',
      eventLogoUrl: '',
      primaryColor: '#0F172A',
      secondaryColor: '#F59E0B',
      globalTickerHeadlines: ['Welcome to Mahadasara 2026!'],
      globalTickerSpeed: 50,
      globalTickerPaused: false,
      activeStreamEventId: null,
    });
  }
}

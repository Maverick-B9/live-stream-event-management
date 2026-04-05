import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  Match, CulturalEvent, Franchise, Sport, GlobalSettings, StreamRequest, ActivityLogEntry, AppUser,
} from '../types';
import {
  subscribeToSettings,
  subscribeFranchises,
  subscribeSports,
  subscribeMatches,
  subscribeCulturalEvents,
  subscribeStreamRequests,
  subscribeActivityLog,
  subscribeCoordinators,
  updateMatch as fsUpdateMatch,
  updateCulturalEvent as fsUpdateCulturalEvent,
  updateSettings,
  updateFranchise as fsUpdateFranchise,
  updateSport as fsUpdateSport,
  updateUser,
  createStreamRequest,
  updateStreamRequest,
  addActivityLog,
  seedSportsIfEmpty,
  seedSettingsIfMissing,
  createMatch as fsCreateMatch,
  createFranchise as fsCreateFranchise,
  createSport as fsCreateSport,
} from '../lib/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

// ──────────────────────────────────────────────────────────────
// Default branding (used before Firestore loads)
// ──────────────────────────────────────────────────────────────
const DEFAULT_BRANDING: GlobalSettings = {
  eventName: 'Mahadasara 2026',
  eventLogoUrl: '/logos/event/logo.jpg',
  primaryColor: '#0F172A',
  secondaryColor: '#F59E0B',
  globalTickerHeadlines: ['Welcome to Mahadasara 2026!'],
  globalTickerSpeed: 50,
  globalTickerPaused: false,
  activeStreamEventId: null,
};

// ──────────────────────────────────────────────────────────────
// Context type
// ──────────────────────────────────────────────────────────────
interface EventContextType {
  branding: GlobalSettings;   // used by EventLogo, LoadingScreen
  franchises: Franchise[];
  sports: Sport[];
  matches: Match[];
  culturalEvents: CulturalEvent[];
  streamRequests: StreamRequest[];
  activityLog: ActivityLogEntry[];
  coordinators: AppUser[];
  isOffline: boolean;
  // Actions
  updateMatch: (id: string, data: Partial<Match>) => Promise<void>;
  updateCulturalEvent: (id: string, data: Partial<CulturalEvent>) => Promise<void>;
  updateBranding: (data: Partial<GlobalSettings>) => Promise<void>;
  updateFranchise: (id: string, data: Partial<Franchise>) => Promise<void>;
  updateSport: (id: string, data: Partial<Sport>) => Promise<void>;
  submitStreamRequest: (req: Omit<StreamRequest, 'id' | 'createdAt' | 'status' | 'adminNote'>) => Promise<void>;
  approveStreamRequest: (req: StreamRequest, note?: string) => Promise<void>;
  rejectStreamRequest: (req: StreamRequest, note: string) => Promise<void>;
  forceSetActiveStream: (eventId: string) => Promise<void>;
  createMatch: (data: Omit<Match, 'id'>) => Promise<void>;
  createFranchise: (data: Omit<Franchise, 'id'>) => Promise<void>;
  createSport: (data: Omit<Sport, 'id'>) => Promise<void>;
  logActivity: (userId: string, userName: string, action: string, eventId?: string, eventName?: string) => Promise<void>;
  uploadFile: (file: File, path: string) => Promise<string>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<GlobalSettings>(DEFAULT_BRANDING);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [culturalEvents, setCulturalEvents] = useState<CulturalEvent[]>([]);
  const [streamRequests, setStreamRequests] = useState<StreamRequest[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [coordinators, setCoordinators] = useState<AppUser[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const seededRef = useRef(false);

  useEffect(() => {
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));
    return () => {
      window.removeEventListener('online', () => setIsOffline(false));
      window.removeEventListener('offline', () => setIsOffline(true));
    };
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      // No Firebase credentials — run with defaults
      return;
    }

    let unsubSettings = () => {};
    let unsubFranchises = () => {};
    let unsubSports = () => {};
    let unsubMatches = () => {};
    let unsubCultural = () => {};
    let unsubRequests = () => {};
    let unsubActivity = () => {};

    try {
      unsubSettings = subscribeToSettings(setBranding);
      unsubFranchises = subscribeFranchises(setFranchises);
      unsubMatches = subscribeMatches(setMatches);
      unsubCultural = subscribeCulturalEvents(setCulturalEvents);
      unsubRequests = subscribeStreamRequests(setStreamRequests);
      unsubActivity = subscribeActivityLog(setActivityLog);
      const unsubCoords = subscribeCoordinators(setCoordinators);

      unsubSports = subscribeSports((list) => {
        setSports(list);
        if (!seededRef.current) {
          seededRef.current = true;
          seedSportsIfEmpty(list.length).catch(console.error);
          seedSettingsIfMissing().catch(console.error);
        }
      });
      
      return () => {
        unsubSettings();
        unsubFranchises();
        unsubSports();
        unsubMatches();
        unsubCultural();
        unsubRequests();
        unsubActivity();
        unsubCoords();
      };
    } catch (err) {
      console.error('Firestore subscription error:', err);
    }
  }, []);

  // ── Actions ─────────────────────────────────────────────────

  const updateMatchFn = async (id: string, data: Partial<Match>) => {
    await fsUpdateMatch(id, data);
  };

  const updateCulturalEventFn = async (id: string, data: Partial<CulturalEvent>) => {
    await fsUpdateCulturalEvent(id, data);
  };

  const updateBranding = async (data: Partial<GlobalSettings>) => {
    await updateSettings(data);
  };

  const updateFranchiseFn = async (id: string, data: Partial<Franchise>) => {
    await fsUpdateFranchise(id, data);
  };

  const updateSportFn = async (id: string, data: Partial<Sport>) => {
    await fsUpdateSport(id, data);
  };

  const submitStreamRequest = async (
    req: Omit<StreamRequest, 'id' | 'createdAt' | 'status' | 'adminNote'>
  ) => {
    const docRef = await createStreamRequest({ ...req, status: 'pending', adminNote: '' });
    const pendingSR = {
      id: docRef.id,
      ...req,
      status: 'pending',
      adminNote: '',
      createdAt: new Date(),
    };
    if (req.eventType === 'match') {
      await fsUpdateMatch(req.eventId, { pendingStreamRequest: pendingSR });
    } else {
      await fsUpdateCulturalEvent(req.eventId, { pendingStreamRequest: pendingSR });
    }
  };

  const approveStreamRequest = async (req: StreamRequest, note = '') => {
    await updateStreamRequest(req.id, { status: 'approved', adminNote: note });
    if (req.eventType === 'match') {
      await fsUpdateMatch(req.eventId, { streamUrl: req.requestedUrl, pendingStreamRequest: null });
    } else {
      await fsUpdateCulturalEvent(req.eventId, { streamUrl: req.requestedUrl, pendingStreamRequest: null });
    }
    await updateSettings({ activeStreamEventId: req.eventId });
  };

  const rejectStreamRequest = async (req: StreamRequest, note: string) => {
    await updateStreamRequest(req.id, { status: 'rejected', adminNote: note });
    if (req.eventType === 'match') {
      await fsUpdateMatch(req.eventId, { pendingStreamRequest: null });
    } else {
      await fsUpdateCulturalEvent(req.eventId, { pendingStreamRequest: null });
    }
  };

  const forceSetActiveStream = async (eventId: string) => {
    await updateSettings({ activeStreamEventId: eventId });
  };

  const createMatchFn = async (data: Omit<Match, 'id'>) => {
    await fsCreateMatch(data);
  };

  const createFranchiseFn = async (data: Omit<Franchise, 'id'>) => {
    await fsCreateFranchise(data);
  };

  const createSportFn = async (data: Omit<Sport, 'id'>) => {
    await fsCreateSport(data);
  };

  const logActivity = async (
    userId: string,
    userName: string,
    action: string,
    eventId?: string,
    eventName?: string
  ) => {
    const payload: any = { userId, userName, action };
    if (eventId) payload.eventId = eventId;
    if (eventName) payload.eventName = eventName;
    await addActivityLog(payload);
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  return (
    <EventContext.Provider
      value={{
        branding,
        franchises,
        sports,
        matches,
        culturalEvents,
        streamRequests,
        activityLog,
        coordinators,
        isOffline,
        updateMatch: updateMatchFn,
        updateCulturalEvent: updateCulturalEventFn,
        updateBranding,
        updateFranchise: updateFranchiseFn,
        updateSport: updateSportFn,
        submitStreamRequest,
        approveStreamRequest,
        rejectStreamRequest,
        forceSetActiveStream,
        createMatch: createMatchFn,
        createFranchise: createFranchiseFn,
        createSport: createSportFn,
        logActivity,
        uploadFile,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvent must be used within EventProvider');
  return context;
}

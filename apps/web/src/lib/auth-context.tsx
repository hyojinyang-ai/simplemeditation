import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';
import { fetchCloudEntries, mergeMeditationEntries, pushCloudEntries } from './cloud-sync';
import { useMeditationStore } from './meditation-store';
import { isSupabaseConfigured, supabase } from './supabase';

type SyncStatus = 'idle' | 'authenticating' | 'syncing' | 'synced' | 'error';

type AuthContextValue = {
  isConfigured: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  syncStatus: SyncStatus;
  user: User | null;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const entriesSnapshot = () => JSON.stringify(useMeditationStore.getState().entries);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const entries = useMeditationStore((state) => state.entries);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const lastSyncedSnapshotRef = useRef('');
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const syncNow = useCallback(async () => {
    if (!supabase || !session?.user) {
      return;
    }

    syncingRef.current = true;
    setSyncStatus('syncing');

    try {
      const localEntries = useMeditationStore.getState().entries;
      const remoteEntries = await fetchCloudEntries(session.user.id);
      const mergedEntries = mergeMeditationEntries(localEntries, remoteEntries);

      useMeditationStore.setState({ entries: mergedEntries });
      await pushCloudEntries(session.user.id, mergedEntries);

      lastSyncedSnapshotRef.current = JSON.stringify(mergedEntries);
      setSyncStatus('synced');
    } catch (error) {
      console.error('[AuthProvider] Failed to sync meditation entries', error);
      setSyncStatus('error');
      toast('Sync failed', {
        description: 'We could not sync your meditation history just now.',
      });
    } finally {
      syncingRef.current = false;
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user || !supabase) {
      lastSyncedSnapshotRef.current = entriesSnapshot();
      setSyncStatus('idle');
      return;
    }

    void syncNow();
  }, [session, syncNow]);

  useEffect(() => {
    if (!session?.user || !supabase || syncingRef.current) {
      return;
    }

    const snapshot = JSON.stringify(entries);
    if (snapshot === lastSyncedSnapshotRef.current) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      syncingRef.current = true;
      setSyncStatus('syncing');

      try {
        await pushCloudEntries(session.user.id, entries);
        lastSyncedSnapshotRef.current = snapshot;
        setSyncStatus('synced');
      } catch (error) {
        console.error('[AuthProvider] Failed to push meditation entries', error);
        setSyncStatus('error');
      } finally {
        syncingRef.current = false;
      }
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [entries, session]);

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    setSyncStatus('authenticating');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/settings`,
      },
    });

    if (error) {
      setSyncStatus('error');
      throw error;
    }

    setSyncStatus('idle');
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    setSession(null);
    setSyncStatus('idle');
    lastSyncedSnapshotRef.current = entriesSnapshot();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: isSupabaseConfigured,
      isAuthenticated: Boolean(session?.user),
      loading,
      syncStatus,
      user: session?.user ?? null,
      signInWithEmail,
      signOut,
      syncNow,
    }),
    [loading, session, signInWithEmail, signOut, syncNow, syncStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

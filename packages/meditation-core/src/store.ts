import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from './storage';
import type { MoodEntry } from './types';

/**
 * Meditation state managed by Zustand store.
 */
export interface MeditationState {
  /** Array of all meditation entries */
  entries: MoodEntry[];

  /** Whether user is currently in an active meditation session */
  isMeditating: boolean;

  /**
   * Add a new meditation entry to the store.
   * Automatically generates id (crypto.randomUUID) and timestamp (Date.now).
   *
   * @param entry - Meditation entry without id and timestamp
   */
  addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;

  /**
   * Set whether user is currently meditating.
   *
   * @param isActive - True if meditation session is active
   */
  setMeditating: (isActive: boolean) => void;
}

/**
 * Creates a Zustand store for meditation state with persist middleware.
 * Storage adapter allows platform-specific persistence (localStorage for web, MMKV for mobile).
 *
 * @param storage - StateStorage implementation (localStorage, MMKV, or mock)
 * @param storageKey - Key used to store data in storage (default: 'meditation-entries')
 * @returns Zustand store hook
 *
 * @example
 * ```typescript
 * // Web app
 * const webStorage: StateStorage = {
 *   getItem: (name) => localStorage.getItem(name),
 *   setItem: (name, value) => localStorage.setItem(name, value),
 *   removeItem: (name) => localStorage.removeItem(name),
 * };
 * const useMeditationStore = createMeditationStore(webStorage, 'zen-mood-entries-v2');
 * ```
 */
export function createMeditationStore(
  storage: StateStorage,
  storageKey: string = 'meditation-entries'
) {
  return create<MeditationState>()(
    persist(
      (set) => ({
        entries: [],
        isMeditating: false,

        addEntry: (entry) =>
          set((state) => ({
            entries: [
              ...state.entries,
              {
                ...entry,
                id: crypto.randomUUID(),
                timestamp: Date.now(),
              },
            ],
          })),

        setMeditating: (isActive) => set({ isMeditating: isActive }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => storage),
      }
    )
  );
}

import { create } from 'zustand';

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad';

export interface MoodEntry {
  id: string;
  mood: Mood;
  timestamp: number;
  note?: string;
  sessionMinutes?: number;
}

interface MeditationState {
  entries: MoodEntry[];
  addEntry: (mood: Mood, note?: string, sessionMinutes?: number) => void;
}

const loadEntries = (): MoodEntry[] => {
  try {
    const stored = localStorage.getItem('zen-mood-entries');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useMeditationStore = create<MeditationState>((set) => ({
  entries: loadEntries(),
  addEntry: (mood, note, sessionMinutes) =>
    set((state) => {
      const newEntries = [
        ...state.entries,
        { id: crypto.randomUUID(), mood, timestamp: Date.now(), note, sessionMinutes },
      ];
      localStorage.setItem('zen-mood-entries', JSON.stringify(newEntries));
      return { entries: newEntries };
    }),
}));

export const moodConfig: Record<Mood, { emoji: string; label: string; color: string }> = {
  great: { emoji: '🌟', label: 'Great', color: 'bg-zen-sage-light text-zen-sage' },
  good: { emoji: '😊', label: 'Good', color: 'bg-zen-ocean-light text-zen-ocean' },
  okay: { emoji: '😌', label: 'Okay', color: 'bg-zen-sand text-zen-warm' },
  low: { emoji: '😔', label: 'Low', color: 'bg-zen-lavender-light text-zen-lavender' },
  bad: { emoji: '😢', label: 'Bad', color: 'bg-muted text-muted-foreground' },
};

import { create } from 'zustand';
import {
  Frown, BatteryLow, Minus, Zap, AlertTriangle,
  CloudRain, Waves, TreePine, Bell, Disc3, Music, Shuffle,
  Smile, Wind, Heart, Sun, Sparkles,
} from 'lucide-react';

export type PreMood = 'stressed' | 'tired' | 'neutral' | 'energized' | 'anxious';
export type PostMood = 'calm' | 'relieved' | 'peaceful' | 'grateful' | 'refreshed';
export type Mood = PreMood | PostMood;
export type SoundType = 'singing-bowl' | 'gong' | 'ambient-pad' | 'nature' | 'rain' | 'ocean' | 'random';

export interface MoodEntry {
  id: string;
  preMood: PreMood;
  postMood?: PostMood;
  timestamp: number;
  note?: string;
  sessionMinutes?: number;
  sound?: SoundType;
}

interface MeditationState {
  entries: MoodEntry[];
  addEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
}

const loadEntries = (): MoodEntry[] => {
  try {
    const stored = localStorage.getItem('zen-mood-entries-v2');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const useMeditationStore = create<MeditationState>((set) => ({
  entries: loadEntries(),
  addEntry: (entry) =>
    set((state) => {
      const newEntries = [
        ...state.entries,
        { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
      ];
      localStorage.setItem('zen-mood-entries-v2', JSON.stringify(newEntries));
      return { entries: newEntries };
    }),
}));

export const preMoodConfig: Record<PreMood, { icon: typeof Frown; label: string; color: string }> = {
  stressed: { icon: Frown, label: 'Stressed', color: 'bg-zen-rose-light text-zen-rose' },
  tired: { icon: BatteryLow, label: 'Tired', color: 'bg-zen-lavender-light text-zen-lavender' },
  neutral: { icon: Minus, label: 'Neutral', color: 'bg-zen-sky-light text-zen-sky' },
  energized: { icon: Zap, label: 'Energized', color: 'bg-zen-green-light text-zen-green' },
  anxious: { icon: AlertTriangle, label: 'Anxious', color: 'bg-zen-blue-light text-zen-blue' },
};

export const postMoodConfig: Record<PostMood, { icon: typeof Smile; label: string; color: string }> = {
  calm: { icon: Smile, label: 'Calm', color: 'bg-zen-blue-light text-zen-blue' },
  relieved: { icon: Wind, label: 'Relieved', color: 'bg-zen-sky-light text-zen-sky' },
  peaceful: { icon: Heart, label: 'Peaceful', color: 'bg-zen-lavender-light text-zen-lavender' },
  grateful: { icon: Sun, label: 'Grateful', color: 'bg-zen-green-light text-zen-green' },
  refreshed: { icon: Sparkles, label: 'Refreshed', color: 'bg-zen-rose-light text-zen-rose' },
};

export const soundConfig: Record<SoundType, { icon: typeof Bell; label: string }> = {
  'singing-bowl': { icon: Bell, label: 'Singing Bowl' },
  'gong': { icon: Disc3, label: 'Gong' },
  'ambient-pad': { icon: Music, label: 'Ambient Pad' },
  'nature': { icon: TreePine, label: 'Nature' },
  'rain': { icon: CloudRain, label: 'Rain' },
  'ocean': { icon: Waves, label: 'Ocean' },
  'random': { icon: Shuffle, label: 'Surprise Me' },
};

export const stoicQuotes = [
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "He who fears death will never do anything worthy of a living man.", author: "Seneca" },
  { text: "It is not things that disturb us, but our judgments about things.", author: "Epictetus" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
  { text: "We suffer more in imagination than in reality.", author: "Seneca" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "The soul becomes dyed with the color of its thoughts.", author: "Marcus Aurelius" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "True happiness is to enjoy the present, without anxious dependence upon the future.", author: "Seneca" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "The present moment is all you ever have.", author: "Eckhart Tolle" },
  { text: "Wherever you are, be there totally.", author: "Eckhart Tolle" },
  { text: "In today's rush, we all think too much, seek too much, want too much — and forget about the joy of just being.", author: "Eckhart Tolle" },
];

export const getRandomQuote = () => stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)];
export const preMoodToValue: Record<PreMood, number> = { stressed: 1, anxious: 2, tired: 2, neutral: 3, energized: 5 };
export const postMoodToValue: Record<PostMood, number> = { calm: 4, relieved: 4, peaceful: 5, grateful: 5, refreshed: 5 };

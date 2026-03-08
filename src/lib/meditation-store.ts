import { create } from 'zustand';

// Pre-meditation moods
export type PreMood = 'stressed' | 'tired' | 'neutral' | 'energized' | 'anxious';
// Post-meditation moods
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
  } catch {
    return [];
  }
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

export const preMoodConfig: Record<PreMood, { emoji: string; label: string; color: string }> = {
  stressed: { emoji: '😰', label: 'Stressed', color: 'bg-destructive/10 text-destructive' },
  tired: { emoji: '😴', label: 'Tired', color: 'bg-zen-lavender-light text-zen-lavender' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'bg-zen-sand text-zen-warm' },
  energized: { emoji: '⚡', label: 'Energized', color: 'bg-zen-sage-light text-zen-sage' },
  anxious: { emoji: '😟', label: 'Anxious', color: 'bg-zen-ocean-light text-zen-ocean' },
};

export const postMoodConfig: Record<PostMood, { emoji: string; label: string; color: string }> = {
  calm: { emoji: '😌', label: 'Calm', color: 'bg-zen-sage-light text-zen-sage' },
  relieved: { emoji: '😮‍💨', label: 'Relieved', color: 'bg-zen-ocean-light text-zen-ocean' },
  peaceful: { emoji: '🕊️', label: 'Peaceful', color: 'bg-zen-lavender-light text-zen-lavender' },
  grateful: { emoji: '🙏', label: 'Grateful', color: 'bg-zen-sand text-zen-warm' },
  refreshed: { emoji: '✨', label: 'Refreshed', color: 'bg-zen-warm-light text-zen-warm' },
};

export const soundConfig: Record<SoundType, { emoji: string; label: string }> = {
  'singing-bowl': { emoji: '🔔', label: 'Singing Bowl' },
  'gong': { emoji: '🥁', label: 'Gong' },
  'ambient-pad': { emoji: '🎵', label: 'Ambient Pad' },
  'nature': { emoji: '🌲', label: 'Nature' },
  'rain': { emoji: '🌧️', label: 'Rain' },
  'ocean': { emoji: '🌊', label: 'Ocean' },
  'random': { emoji: '🎲', label: 'Surprise Me' },
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

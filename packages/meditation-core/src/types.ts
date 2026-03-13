/**
 * Core type definitions for SimpleMeditation app
 * Shared between web and mobile platforms
 */

export type PreMood = 'stressed' | 'tired' | 'neutral' | 'anxious';
export type PostMood = 'calm' | 'relieved' | 'peaceful' | 'grateful' | 'refreshed';
export type Mood = PreMood | PostMood;
export type SoundType = 'singing-bowl' | 'gong' | 'ambient-pad' | 'nature' | 'rain' | 'ocean' | 'wind' | 'birds' | 'fireplace' | 'random';

export interface MoodEntry {
  id: string;
  preMood: PreMood;
  postMood?: PostMood;
  timestamp: number;
  note?: string;
  sessionMinutes?: number;
  sound?: SoundType;
  savedQuote?: { text: string; author: string };
}

/**
 * Human-readable labels for pre-meditation moods
 * Note: Icons are UI-specific and remain in web/mobile apps
 */
export const preMoodLabels: Record<PreMood, string> = {
  stressed: 'Stressed',
  tired: 'Tired',
  neutral: 'Neutral',
  anxious: 'Anxious',
};

/**
 * Tailwind CSS classes for pre-meditation mood colors
 */
export const preMoodColors: Record<PreMood, string> = {
  stressed: 'bg-zen-rose-light text-zen-rose',
  tired: 'bg-zen-lavender-light text-zen-lavender',
  neutral: 'bg-zen-sky-light text-zen-sky',
  anxious: 'bg-zen-blue-light text-zen-blue',
};

/**
 * Human-readable labels for post-meditation moods
 * Note: Icons are UI-specific and remain in web/mobile apps
 */
export const postMoodLabels: Record<PostMood, string> = {
  calm: 'Calm',
  relieved: 'Relieved',
  peaceful: 'Peaceful',
  grateful: 'Grateful',
  refreshed: 'Refreshed',
};

/**
 * Tailwind CSS classes for post-meditation mood colors
 */
export const postMoodColors: Record<PostMood, string> = {
  calm: 'bg-zen-blue-light text-zen-blue',
  relieved: 'bg-zen-sky-light text-zen-sky',
  peaceful: 'bg-zen-lavender-light text-zen-lavender',
  grateful: 'bg-zen-green-light text-zen-green',
  refreshed: 'bg-zen-rose-light text-zen-rose',
};

/**
 * Convert pre-meditation moods to numeric values for analytics
 */
export const preMoodToValue: Record<PreMood, number> = {
  stressed: 1,
  anxious: 2,
  tired: 2,
  neutral: 3,
};

/**
 * Convert post-meditation moods to numeric values for analytics
 */
export const postMoodToValue: Record<PostMood, number> = {
  calm: 4,
  relieved: 4,
  peaceful: 5,
  grateful: 5,
  refreshed: 5,
};

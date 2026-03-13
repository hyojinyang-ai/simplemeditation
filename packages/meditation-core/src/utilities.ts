import { startOfDay, subDays } from 'date-fns';
import type { MoodEntry, PreMood, PostMood } from './types';

/**
 * Calculates the current meditation streak in consecutive days.
 * Counts backwards from today until the first day with no meditation entry.
 *
 * @param entries - Array of meditation entries
 * @returns Number of consecutive days with at least one meditation session
 *
 * @example
 * // User meditated today, yesterday, and 2 days ago
 * const streak = calculateStreak(entries); // Returns 3
 */
export function calculateStreak(entries: MoodEntry[]): number {
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const dayStart = startOfDay(subDays(new Date(), i)).getTime();
    const dayEnd = dayStart + 86400000; // 24 hours in milliseconds

    const hasEntry = entries.some(
      (e) => e.timestamp >= dayStart && e.timestamp < dayEnd
    );

    if (hasEntry) {
      streak++;
    } else {
      break; // Streak ends on first missing day
    }
  }

  return streak;
}

/**
 * Maps pre-meditation moods to numeric values for analytics.
 * Lower values indicate more negative states.
 *
 * Scale:
 * - 1: Stressed (most negative)
 * - 2: Anxious, Tired (moderately negative)
 * - 3: Neutral (baseline)
 */
export const preMoodToValue: Record<PreMood, number> = {
  stressed: 1,
  anxious: 2,
  tired: 2,
  neutral: 3,
};

/**
 * Maps post-meditation moods to numeric values for analytics.
 * Higher values indicate more positive states.
 *
 * Scale:
 * - 4: Calm, Relieved (moderately positive)
 * - 5: Peaceful, Grateful, Refreshed (most positive)
 */
export const postMoodToValue: Record<PostMood, number> = {
  calm: 4,
  relieved: 4,
  peaceful: 5,
  grateful: 5,
  refreshed: 5,
};

import { describe, it, expect } from 'vitest';
import { calculateStreak, preMoodToValue, postMoodToValue } from '../utilities';
import type { MoodEntry } from '../types';

describe('calculateStreak', () => {
  it('returns 0 when no entries', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 3 for 3 consecutive days', () => {
    const now = Date.now();
    const oneDayMs = 86400000; // 24 hours in milliseconds

    const entries: MoodEntry[] = [
      {
        id: '1',
        timestamp: now,
        preMood: 'neutral',
        postMood: 'calm',
        sessionMinutes: 10,
        sound: 'singing-bowl',
      },
      {
        id: '2',
        timestamp: now - oneDayMs,
        preMood: 'neutral',
        postMood: 'calm',
        sessionMinutes: 10,
        sound: 'singing-bowl',
      },
      {
        id: '3',
        timestamp: now - oneDayMs * 2,
        preMood: 'neutral',
        postMood: 'calm',
        sessionMinutes: 10,
        sound: 'singing-bowl',
      },
    ];

    expect(calculateStreak(entries)).toBe(3);
  });

  it('stops counting at first missing day', () => {
    const now = Date.now();
    const oneDayMs = 86400000;

    const entries: MoodEntry[] = [
      {
        id: '1',
        timestamp: now,
        preMood: 'neutral',
        postMood: 'calm',
        sessionMinutes: 10,
        sound: 'singing-bowl',
      },
      {
        id: '2',
        timestamp: now - oneDayMs,
        preMood: 'neutral',
        postMood: 'calm',
        sessionMinutes: 10,
        sound: 'singing-bowl',
      },
      // Day 2 (today - 2 days) is missing
      {
        id: '3',
        timestamp: now - oneDayMs * 3,
        preMood: 'neutral',
        postMood: 'calm',
        sessionMinutes: 10,
        sound: 'singing-bowl',
      },
    ];

    expect(calculateStreak(entries)).toBe(2);
  });

  it('handles multiple entries on same day (counts as 1)', () => {
    const now = Date.now();
    const oneHourMs = 3600000; // 1 hour in milliseconds

    const entries: MoodEntry[] = [
      {
        id: '1',
        timestamp: now,
        preMood: 'neutral',
        postMood: 'calm',
        sessionMinutes: 10,
        sound: 'singing-bowl',
      },
      {
        id: '2',
        timestamp: now - oneHourMs, // 1 hour earlier, same day
        preMood: 'stressed',
        postMood: 'relieved',
        sessionMinutes: 15,
        sound: 'gong',
      },
      {
        id: '3',
        timestamp: now - oneHourMs * 2, // 2 hours earlier, same day
        preMood: 'anxious',
        postMood: 'peaceful',
        sessionMinutes: 20,
        sound: 'ambient-pad',
      },
    ];

    // All three entries are on the same day, so streak should be 1
    expect(calculateStreak(entries)).toBe(1);
  });
});

describe('preMoodToValue', () => {
  it('has all 4 pre-mood values', () => {
    expect(Object.keys(preMoodToValue)).toHaveLength(4);
    expect(preMoodToValue).toHaveProperty('stressed');
    expect(preMoodToValue).toHaveProperty('anxious');
    expect(preMoodToValue).toHaveProperty('tired');
    expect(preMoodToValue).toHaveProperty('neutral');
  });

  it('maps stressed=1, anxious=2, tired=2, neutral=3', () => {
    expect(preMoodToValue.stressed).toBe(1);
    expect(preMoodToValue.anxious).toBe(2);
    expect(preMoodToValue.tired).toBe(2);
    expect(preMoodToValue.neutral).toBe(3);
  });
});

describe('postMoodToValue', () => {
  it('has all 5 post-mood values', () => {
    expect(Object.keys(postMoodToValue)).toHaveLength(5);
    expect(postMoodToValue).toHaveProperty('calm');
    expect(postMoodToValue).toHaveProperty('relieved');
    expect(postMoodToValue).toHaveProperty('peaceful');
    expect(postMoodToValue).toHaveProperty('grateful');
    expect(postMoodToValue).toHaveProperty('refreshed');
  });

  it('maps calm=4, relieved=4, peaceful=5, grateful=5, refreshed=5', () => {
    expect(postMoodToValue.calm).toBe(4);
    expect(postMoodToValue.relieved).toBe(4);
    expect(postMoodToValue.peaceful).toBe(5);
    expect(postMoodToValue.grateful).toBe(5);
    expect(postMoodToValue.refreshed).toBe(5);
  });
});

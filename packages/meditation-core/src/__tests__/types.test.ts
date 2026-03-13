import { describe, it, expect } from 'vitest';
import type { PreMood, PostMood, SoundType, MoodEntry } from '../types';
import { preMoodLabels, preMoodColors, postMoodLabels, postMoodColors } from '../types';

describe('PreMood type', () => {
  it('should accept valid pre-mood values', () => {
    const validMoods: PreMood[] = ['stressed', 'tired', 'neutral', 'anxious'];
    expect(validMoods).toHaveLength(4);
  });
});

describe('PostMood type', () => {
  it('should accept valid post-mood values', () => {
    const validMoods: PostMood[] = ['calm', 'relieved', 'peaceful', 'grateful', 'refreshed'];
    expect(validMoods).toHaveLength(5);
  });
});

describe('SoundType type', () => {
  it('should accept all sound types', () => {
    const validSounds: SoundType[] = [
      'singing-bowl', 'gong', 'ambient-pad', 'nature', 'rain',
      'ocean', 'wind', 'birds', 'fireplace', 'random'
    ];
    expect(validSounds).toHaveLength(10);
  });
});

describe('MoodEntry interface', () => {
  it('should compile with required fields', () => {
    const entry: MoodEntry = {
      id: 'test-id',
      preMood: 'stressed',
      timestamp: Date.now(),
    };
    expect(entry.id).toBe('test-id');
    expect(entry.preMood).toBe('stressed');
    expect(typeof entry.timestamp).toBe('number');
  });

  it('should compile with all optional fields', () => {
    const entry: MoodEntry = {
      id: 'test-id',
      preMood: 'stressed',
      timestamp: Date.now(),
      postMood: 'calm',
      note: 'Test note',
      sessionMinutes: 10,
      sound: 'singing-bowl',
      savedQuote: { text: 'Test quote', author: 'Test author' },
    };
    expect(entry.postMood).toBe('calm');
    expect(entry.note).toBe('Test note');
    expect(entry.sessionMinutes).toBe(10);
    expect(entry.sound).toBe('singing-bowl');
    expect(entry.savedQuote).toEqual({ text: 'Test quote', author: 'Test author' });
  });
});

describe('preMoodLabels', () => {
  it('should have labels for all 4 pre-moods', () => {
    const preMoods: PreMood[] = ['stressed', 'tired', 'neutral', 'anxious'];

    preMoods.forEach((mood) => {
      expect(preMoodLabels[mood]).toBeDefined();
      expect(typeof preMoodLabels[mood]).toBe('string');
      expect(preMoodLabels[mood].length).toBeGreaterThan(0);
    });

    expect(Object.keys(preMoodLabels)).toHaveLength(4);
  });
});

describe('preMoodColors', () => {
  it('should have Tailwind classes for all 4 pre-moods', () => {
    const preMoods: PreMood[] = ['stressed', 'tired', 'neutral', 'anxious'];

    preMoods.forEach((mood) => {
      expect(preMoodColors[mood]).toBeDefined();
      expect(typeof preMoodColors[mood]).toBe('string');
      expect(preMoodColors[mood]).toContain('bg-zen-');
      expect(preMoodColors[mood]).toContain('text-zen-');
    });

    expect(Object.keys(preMoodColors)).toHaveLength(4);
  });
});

describe('postMoodLabels', () => {
  it('should have labels for all 5 post-moods', () => {
    const postMoods: PostMood[] = ['calm', 'relieved', 'peaceful', 'grateful', 'refreshed'];

    postMoods.forEach((mood) => {
      expect(postMoodLabels[mood]).toBeDefined();
      expect(typeof postMoodLabels[mood]).toBe('string');
      expect(postMoodLabels[mood].length).toBeGreaterThan(0);
    });

    expect(Object.keys(postMoodLabels)).toHaveLength(5);
  });
});

describe('postMoodColors', () => {
  it('should have Tailwind classes for all 5 post-moods', () => {
    const postMoods: PostMood[] = ['calm', 'relieved', 'peaceful', 'grateful', 'refreshed'];

    postMoods.forEach((mood) => {
      expect(postMoodColors[mood]).toBeDefined();
      expect(typeof postMoodColors[mood]).toBe('string');
      expect(postMoodColors[mood]).toContain('bg-zen-');
      expect(postMoodColors[mood]).toContain('text-zen-');
    });

    expect(Object.keys(postMoodColors)).toHaveLength(5);
  });
});

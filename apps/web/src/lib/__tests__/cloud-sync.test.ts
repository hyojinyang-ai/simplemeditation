import { describe, expect, it } from 'vitest';
import { mergeMeditationEntries } from '../cloud-sync';

describe('mergeMeditationEntries', () => {
  it('keeps remote-only and local-only entries together', () => {
    const merged = mergeMeditationEntries(
      [
        { id: 'local-1', preMood: 'stressed', timestamp: 2, note: 'Local note' },
      ],
      [
        { id: 'remote-1', preMood: 'neutral', timestamp: 1, sessionMinutes: 10 },
      ]
    );

    expect(merged.map((entry) => entry.id)).toEqual(['remote-1', 'local-1']);
  });

  it('prefers the more complete version of the same entry id', () => {
    const merged = mergeMeditationEntries(
      [
        {
          id: 'shared-1',
          preMood: 'stressed',
          timestamp: 10,
          postMood: 'calm',
          note: 'Finished on desktop',
          savedQuote: { text: 'Stay grounded', author: 'Stillness' },
        },
      ],
      [
        {
          id: 'shared-1',
          preMood: 'stressed',
          timestamp: 10,
          sessionMinutes: 3,
        },
      ]
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].note).toBe('Finished on desktop');
    expect(merged[0].savedQuote).toEqual({ text: 'Stay grounded', author: 'Stillness' });
  });
});

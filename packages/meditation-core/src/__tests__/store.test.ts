import { describe, it, expect, beforeEach } from 'vitest';
import { createMeditationStore } from '../store';
import { createMockStorage } from './helpers/mock-storage';

describe('createMeditationStore', () => {
  let store: ReturnType<typeof createMeditationStore>;

  beforeEach(() => {
    // Create a fresh store for each test with mock storage
    store = createMeditationStore(createMockStorage(), 'test-meditation-store');
  });

  it('creates a working store with mock storage', () => {
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(typeof store.getState).toBe('function');
  });

  it('initializes with empty entries array and isMeditating false', () => {
    const state = store.getState();
    expect(state.entries).toEqual([]);
    expect(state.isMeditating).toBe(false);
  });

  it('addEntry generates unique id with UUID format', () => {
    store.getState().addEntry({
      preMood: 'stressed',
      postMood: 'calm',
      sessionMinutes: 10,
      sound: 'singing-bowl',
    });

    const entries = store.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBeDefined();
    expect(typeof entries[0].id).toBe('string');
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    expect(entries[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('addEntry generates current timestamp', () => {
    const beforeTimestamp = Date.now();
    store.getState().addEntry({
      preMood: 'neutral',
      postMood: 'peaceful',
      sessionMinutes: 15,
      sound: 'gong',
    });
    const afterTimestamp = Date.now();

    const entries = store.getState().entries;
    expect(entries[0].timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
    expect(entries[0].timestamp).toBeLessThanOrEqual(afterTimestamp);
  });

  it('addEntry accepts entry without id/timestamp fields', () => {
    const entryWithoutIdTimestamp = {
      preMood: 'anxious' as const,
      postMood: 'relieved' as const,
      sessionMinutes: 20,
      sound: 'ambient-pad' as const,
      note: 'Felt much better after meditating',
    };

    store.getState().addEntry(entryWithoutIdTimestamp);

    const entries = store.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].preMood).toBe('anxious');
    expect(entries[0].postMood).toBe('relieved');
    expect(entries[0].sessionMinutes).toBe(20);
    expect(entries[0].sound).toBe('ambient-pad');
    expect(entries[0].note).toBe('Felt much better after meditating');
    // Verify id and timestamp were added
    expect(entries[0].id).toBeDefined();
    expect(entries[0].timestamp).toBeDefined();
  });

  it('setMeditating toggles isMeditating boolean', () => {
    expect(store.getState().isMeditating).toBe(false);

    store.getState().setMeditating(true);
    expect(store.getState().isMeditating).toBe(true);

    store.getState().setMeditating(false);
    expect(store.getState().isMeditating).toBe(false);
  });

  it('persist middleware saves to storage after addEntry', () => {
    const mockStorage = createMockStorage();
    const persistedStore = createMeditationStore(mockStorage, 'persist-test');

    // Add an entry
    persistedStore.getState().addEntry({
      preMood: 'tired',
      postMood: 'refreshed',
      sessionMinutes: 10,
      sound: 'nature',
    });

    // Check that storage has data
    const storedData = mockStorage.getItem('persist-test');
    expect(storedData).toBeDefined();
    expect(storedData).not.toBeNull();

    // Verify it's valid JSON with state
    const parsedData = JSON.parse(storedData as string);
    expect(parsedData.state).toBeDefined();
    expect(parsedData.state.entries).toHaveLength(1);
  });

  it('store hydrates from storage on creation', () => {
    const mockStorage = createMockStorage();

    // Create first store and add entry
    const firstStore = createMeditationStore(mockStorage, 'hydration-test');
    firstStore.getState().addEntry({
      preMood: 'stressed',
      postMood: 'calm',
      sessionMinutes: 15,
      sound: 'rain',
    });

    const firstEntries = firstStore.getState().entries;
    expect(firstEntries).toHaveLength(1);

    // Create second store with same storage and key - should hydrate
    const secondStore = createMeditationStore(mockStorage, 'hydration-test');
    const secondEntries = secondStore.getState().entries;

    // Second store should have the entry from first store
    expect(secondEntries).toHaveLength(1);
    expect(secondEntries[0].preMood).toBe('stressed');
    expect(secondEntries[0].postMood).toBe('calm');
  });
});

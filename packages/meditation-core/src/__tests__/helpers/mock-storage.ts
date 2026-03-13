import type { StateStorage } from '../../storage';

/**
 * Creates an in-memory storage implementation for testing.
 * Implements the Zustand StateStorage interface.
 */
export const createMockStorage = (): StateStorage => {
  let storage: Record<string, string> = {};

  return {
    getItem: (name: string): string | null => {
      return storage[name] || null;
    },
    setItem: (name: string, value: string): void => {
      storage[name] = value;
    },
    removeItem: (name: string): void => {
      delete storage[name];
    },
  };
};

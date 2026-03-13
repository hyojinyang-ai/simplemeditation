/**
 * Platform-agnostic storage adapter interface
 *
 * Re-exported from Zustand persist middleware for convenience.
 * - Web apps use localStorage (synchronous)
 * - Mobile apps use MMKV (can be async)
 *
 * This interface enables cross-platform store persistence without
 * coupling business logic to platform-specific storage implementations.
 */
export type { StateStorage } from 'zustand/middleware';

import type { StateStorage } from 'zustand/middleware';

/**
 * Create a storage adapter with optional validation
 * Useful for wrapping platform-specific storage implementations
 */
export function createStorageAdapter(implementation: StateStorage): StateStorage {
  return {
    getItem: (name: string) => {
      try {
        return implementation.getItem(name);
      } catch (error) {
        console.error(`[Storage] getItem failed for key: ${name}`, error);
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        return implementation.setItem(name, value);
      } catch (error) {
        console.error(`[Storage] setItem failed for key: ${name}`, error);
      }
    },
    removeItem: (name: string) => {
      try {
        return implementation.removeItem(name);
      } catch (error) {
        console.error(`[Storage] removeItem failed for key: ${name}`, error);
      }
    },
  };
}

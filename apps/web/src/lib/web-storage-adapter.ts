import type { StateStorage } from 'zustand/middleware';
import { StorageError } from '@repo/meditation-core';

/**
 * Web storage adapter wrapping localStorage for Zustand persist middleware.
 *
 * Implements the StateStorage interface to enable localStorage-based
 * persistence for the meditation store.
 *
 * @example
 * ```typescript
 * import { createMeditationStore } from '@repo/meditation-core';
 * import { webStorageAdapter } from './web-storage-adapter';
 *
 * const useMeditationStore = createMeditationStore(
 *   webStorageAdapter,
 *   'zen-mood-entries-v2'
 * );
 * ```
 */
export const webStorageAdapter: StateStorage = {
  /**
   * Retrieves an item from localStorage.
   *
   * @param name - The storage key
   * @returns The stored value, or null if not found
   * @throws {StorageError} When localStorage access fails
   */
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      throw new StorageError(
        `Failed to get item: ${name}`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  },

  /**
   * Stores an item in localStorage.
   *
   * @param name - The storage key
   * @param value - The value to store (must be a string)
   * @throws {StorageError} When localStorage write fails (e.g., quota exceeded)
   */
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      throw new StorageError(
        `Failed to set item: ${name}`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  },

  /**
   * Removes an item from localStorage.
   *
   * @param name - The storage key
   * @throws {StorageError} When localStorage delete fails
   */
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      throw new StorageError(
        `Failed to remove item: ${name}`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  },
};

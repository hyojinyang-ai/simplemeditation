/**
 * Platform-agnostic storage adapter interface
 *
 * Compatible with Zustand persist middleware.
 * - Web apps use localStorage (synchronous)
 * - Mobile apps use MMKV (can be async)
 *
 * This interface enables cross-platform store persistence without
 * coupling business logic to platform-specific storage implementations.
 */
export interface StateStorage {
  /**
   * Get item from storage
   * @param name - Storage key
   * @returns Stored value as string, null if not found, or Promise resolving to either
   */
  getItem: (name: string) => string | null | Promise<string | null>;

  /**
   * Set item in storage
   * @param name - Storage key
   * @param value - Value to store (as string)
   * @returns void or Promise<void> for async storage
   */
  setItem: (name: string, value: string) => void | Promise<void>;

  /**
   * Remove item from storage
   * @param name - Storage key
   * @returns void or Promise<void> for async storage
   */
  removeItem: (name: string) => void | Promise<void>;
}

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

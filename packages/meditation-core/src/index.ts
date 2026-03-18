/**
 * @repo/meditation-core
 *
 * Shared meditation business logic for SimpleMeditation apps.
 *
 * Phase 1: Package scaffold only (placeholder exports)
 * Phase 2: Extract meditation store, types, utilities from web app
 */

export const PACKAGE_NAME = '@repo/meditation-core';
export const PACKAGE_VERSION = '0.0.0';

// Placeholder function to verify package imports work
export function validatePackage(): boolean {
  return true;
}

// Core types and interfaces
export type {
  PreMood,
  PostMood,
  Mood,
  SoundType,
  MoodEntry,
} from './types';

export {
  preMoodLabels,
  preMoodColors,
  postMoodLabels,
  postMoodColors,
} from './types';

// Storage interfaces
export type { StateStorage } from './storage';
export { createStorageAdapter } from './storage';

// Error classes and type guards
export {
  MeditationError,
  StorageError,
  SerializationError,
  StoreInitError,
  isStorageError,
  isSerializationError,
  isStoreInitError,
  isMeditationError,
} from './errors';

// Store factory and state
export { createMeditationStore, type MeditationState, type MeditationStore } from './store';

// Utility functions
export { calculateStreak, preMoodToValue, postMoodToValue } from './utilities';

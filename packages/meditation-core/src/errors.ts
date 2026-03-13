/**
 * Custom error classes for meditation core logic
 *
 * These errors provide type-safe error handling across platforms
 * and enable better error recovery strategies.
 */

/**
 * Base error class for all meditation-related errors
 */
export class MeditationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MeditationError';
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, MeditationError.prototype);
  }
}

/**
 * Storage operation failed (read/write/delete)
 */
export class StorageError extends MeditationError {
  constructor(message: string, public key?: string) {
    super(message);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

/**
 * Data serialization/deserialization failed
 */
export class SerializationError extends MeditationError {
  constructor(message: string, public data?: unknown) {
    super(message);
    this.name = 'SerializationError';
    Object.setPrototypeOf(this, SerializationError.prototype);
  }
}

/**
 * Store initialization failed
 */
export class StoreInitError extends MeditationError {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StoreInitError';
    Object.setPrototypeOf(this, StoreInitError.prototype);
  }
}

/**
 * Type guards for error handling
 */
export function isStorageError(error: unknown): error is StorageError {
  return error instanceof StorageError;
}

export function isSerializationError(error: unknown): error is SerializationError {
  return error instanceof SerializationError;
}

export function isStoreInitError(error: unknown): error is StoreInitError {
  return error instanceof StoreInitError;
}

export function isMeditationError(error: unknown): error is MeditationError {
  return error instanceof MeditationError;
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { webStorageAdapter } from '../web-storage-adapter';
import { StorageError } from '@repo/meditation-core';

describe('webStorageAdapter', () => {
  let mockGetItem: ReturnType<typeof vi.fn>;
  let mockSetItem: ReturnType<typeof vi.fn>;
  let mockRemoveItem: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create fresh mocks for each test
    mockGetItem = vi.fn();
    mockSetItem = vi.fn();
    mockRemoveItem = vi.fn();

    // Replace global localStorage with our mocks
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: mockRemoveItem,
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getItem', () => {
    it('should return value from localStorage', () => {
      const testKey = 'test-key';
      const testValue = 'test-value';
      mockGetItem.mockReturnValue(testValue);

      const result = webStorageAdapter.getItem(testKey);

      expect(mockGetItem).toHaveBeenCalledWith(testKey);
      expect(result).toBe(testValue);
    });

    it('should return null when key does not exist', () => {
      const testKey = 'nonexistent-key';
      mockGetItem.mockReturnValue(null);

      const result = webStorageAdapter.getItem(testKey);

      expect(mockGetItem).toHaveBeenCalledWith(testKey);
      expect(result).toBeNull();
    });

    it('should throw StorageError when localStorage.getItem fails', () => {
      const testKey = 'error-key';
      const originalError = new Error('localStorage access denied');
      mockGetItem.mockImplementation(() => {
        throw originalError;
      });

      expect(() => webStorageAdapter.getItem(testKey)).toThrow(StorageError);
      expect(() => webStorageAdapter.getItem(testKey)).toThrow(`Failed to get item: ${testKey}`);
    });

    it('should preserve original error as cause property', () => {
      const testKey = 'error-key';
      const originalError = new Error('localStorage access denied');
      mockGetItem.mockImplementation(() => {
        throw originalError;
      });

      try {
        webStorageAdapter.getItem(testKey);
        expect.fail('Should have thrown StorageError');
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).cause).toBe(originalError);
      }
    });
  });

  describe('setItem', () => {
    it('should write to localStorage', () => {
      const testKey = 'test-key';
      const testValue = 'test-value';

      webStorageAdapter.setItem(testKey, testValue);

      expect(mockSetItem).toHaveBeenCalledWith(testKey, testValue);
    });

    it('should throw StorageError when localStorage.setItem fails', () => {
      const testKey = 'quota-key';
      const testValue = 'test-value';
      const originalError = new Error('QuotaExceededError');
      mockSetItem.mockImplementation(() => {
        throw originalError;
      });

      expect(() => webStorageAdapter.setItem(testKey, testValue)).toThrow(StorageError);
      expect(() => webStorageAdapter.setItem(testKey, testValue)).toThrow(`Failed to set item: ${testKey}`);
    });
  });

  describe('removeItem', () => {
    it('should delete from localStorage', () => {
      const testKey = 'test-key';

      webStorageAdapter.removeItem(testKey);

      expect(mockRemoveItem).toHaveBeenCalledWith(testKey);
    });

    it('should throw StorageError when localStorage.removeItem fails', () => {
      const testKey = 'error-key';
      const originalError = new Error('localStorage access denied');
      mockRemoveItem.mockImplementation(() => {
        throw originalError;
      });

      expect(() => webStorageAdapter.removeItem(testKey)).toThrow(StorageError);
      expect(() => webStorageAdapter.removeItem(testKey)).toThrow(`Failed to remove item: ${testKey}`);
    });
  });
});

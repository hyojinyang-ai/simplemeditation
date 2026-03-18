import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from '@repo/meditation-core';

export const asyncStorageAdapter: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(name),
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

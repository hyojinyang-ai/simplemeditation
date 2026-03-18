import {
  createMeditationStore,
  type MeditationState,
  type PostMood,
  type PreMood,
  type SoundType,
  type MoodEntry,
} from '@repo/meditation-core';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import { asyncStorageAdapter } from './storage';

const meditationStore = createMeditationStore(asyncStorageAdapter, 'zen-mood-entries-v2');

type MeditationSelector<T> = (state: MeditationState) => T;

type BoundMeditationStore = {
  (): MeditationState;
  <T>(selector: MeditationSelector<T>): T;
} & Pick<StoreApi<MeditationState>, 'getState' | 'setState' | 'subscribe'>;

const identity = (state: MeditationState) => state;

export const useMeditationStore = Object.assign(
  ((selector?: MeditationSelector<unknown>) => useStore(meditationStore, selector ?? identity)) as BoundMeditationStore,
  {
    getState: meditationStore.getState,
    setState: meditationStore.setState,
    subscribe: meditationStore.subscribe,
  }
);

export type { MeditationState, PreMood, PostMood, SoundType, MoodEntry };

/**
 * Web-specific mood and sound configurations
 * Combines meditation-core data with Lucide icons for UI rendering
 */

import {
  Frown,
  BatteryLow,
  Minus,
  AlertTriangle,
  Smile,
  Wind,
  Heart,
  Sun,
  Sparkles,
  CloudRain,
  Waves,
  TreePine,
  Bell,
  Disc3,
  Music,
  Shuffle,
  Circle,
  Bird,
  Flame,
} from 'lucide-react';
import {
  preMoodLabels,
  preMoodColors,
  postMoodLabels,
  postMoodColors,
  type PreMood,
  type PostMood,
  type SoundType,
} from '@repo/meditation-core';

/**
 * Pre-meditation mood configuration with icons
 * Labels and colors from meditation-core, icons specific to web UI
 */
export const preMoodConfig: Record<
  PreMood,
  { icon: typeof Frown; label: string; color: string }
> = {
  stressed: {
    icon: Frown,
    label: preMoodLabels.stressed,
    color: preMoodColors.stressed,
  },
  tired: {
    icon: BatteryLow,
    label: preMoodLabels.tired,
    color: preMoodColors.tired,
  },
  neutral: {
    icon: Minus,
    label: preMoodLabels.neutral,
    color: preMoodColors.neutral,
  },
  anxious: {
    icon: AlertTriangle,
    label: preMoodLabels.anxious,
    color: preMoodColors.anxious,
  },
};

/**
 * Post-meditation mood configuration with icons
 * Labels and colors from meditation-core, icons specific to web UI
 */
export const postMoodConfig: Record<
  PostMood,
  { icon: typeof Smile; label: string; color: string }
> = {
  calm: {
    icon: Smile,
    label: postMoodLabels.calm,
    color: postMoodColors.calm,
  },
  relieved: {
    icon: Wind,
    label: postMoodLabels.relieved,
    color: postMoodColors.relieved,
  },
  peaceful: {
    icon: Heart,
    label: postMoodLabels.peaceful,
    color: postMoodColors.peaceful,
  },
  grateful: {
    icon: Sun,
    label: postMoodLabels.grateful,
    color: postMoodColors.grateful,
  },
  refreshed: {
    icon: Sparkles,
    label: postMoodLabels.refreshed,
    color: postMoodColors.refreshed,
  },
};

/**
 * Sound type configuration with icons
 * Web-specific configuration for ambient sound picker
 */
export const soundConfig: Record<
  SoundType,
  { icon: typeof Bell; label: string }
> = {
  'singing-bowl': { icon: Circle, label: 'Singing Bowl' },
  gong: { icon: Disc3, label: 'Gong' },
  'ambient-pad': { icon: Music, label: 'Ambient Pad' },
  nature: { icon: TreePine, label: 'Nature' },
  rain: { icon: CloudRain, label: 'Rain' },
  ocean: { icon: Waves, label: 'Ocean' },
  wind: { icon: Wind, label: 'Wind Chimes' },
  birds: { icon: Bird, label: 'Birds' },
  fireplace: { icon: Flame, label: 'Fireplace' },
  random: { icon: Shuffle, label: 'Surprise Me' },
};

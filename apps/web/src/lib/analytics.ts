import { track } from '@vercel/analytics';

/**
 * Analytics utility for tracking user engagement in SimpleMeditation app
 * Uses Vercel Analytics custom events
 */

// Helper to log events in development
const logEvent = (eventName: string, data: Record<string, any>) => {
  if (import.meta.env.DEV) {
    console.log(`📊 Analytics Event: ${eventName}`, data);
  }
};

// Page view tracking
export const trackPageView = (pageName: string) => {
  const data = {
    page: pageName,
    timestamp: new Date().toISOString(),
  };
  logEvent('page_view', data);
  track('page_view', data);
};

// Meditation session events
export const trackSessionStart = (minutes: number, sound: string) => {
  const data = {
    duration_minutes: minutes,
    sound_type: sound,
  };
  logEvent('session_start', data);
  track('session_start', data);
};

export const trackSessionComplete = (
  minutes: number,
  sound: string,
  preMood: string,
  postMood?: string
) => {
  const data = {
    duration_minutes: minutes,
    sound_type: sound,
    pre_mood: preMood,
    post_mood: postMood || 'not_set',
  };
  logEvent('session_complete', data);
  track('session_complete', data);
};

export const trackSessionAbandoned = (
  minutes: number,
  remainingSeconds: number,
  sound: string
) => {
  const completionPercent = Math.round(
    ((minutes * 60 - remainingSeconds) / (minutes * 60)) * 100
  );

  const data = {
    duration_minutes: minutes,
    completion_percent: completionPercent,
    sound_type: sound,
  };
  logEvent('session_abandoned', data);
  track('session_abandoned', data);
};

// Mood tracking events
export const trackPreMoodSelection = (mood: string) => {
  const data = { mood };
  logEvent('pre_mood_selected', data);
  track('pre_mood_selected', data);
};

export const trackPostMoodSelection = (mood: string, preMood: string) => {
  const data = {
    mood,
    pre_mood: preMood,
    mood_shift: `${preMood}_to_${mood}`,
  };
  logEvent('post_mood_selected', data);
  track('post_mood_selected', data);
};

// Sound selection tracking
export const trackSoundChange = (fromSound: string, toSound: string) => {
  const data = {
    from_sound: fromSound,
    to_sound: toSound,
  };
  logEvent('sound_changed', data);
  track('sound_changed', data);
};

// User engagement metrics
export const trackFeatureUsage = (feature: string) => {
  const data = { feature };
  logEvent('feature_used', data);
  track('feature_used', data);
};

export const trackQuoteSaved = (quoteAuthor: string) => {
  const data = { author: quoteAuthor };
  logEvent('quote_saved', data);
  track('quote_saved', data);
};

export const trackNoteAdded = (sessionMinutes: number) => {
  const data = { session_minutes: sessionMinutes };
  logEvent('note_added', data);
  track('note_added', data);
};

// Analytics page interactions
export const trackAnalyticsView = (chartType: string) => {
  const data = { chart_type: chartType };
  logEvent('analytics_viewed', data);
  track('analytics_viewed', data);
};

// Settings changes
export const trackSettingsChange = (setting: string, value: string) => {
  const data = { setting, value };
  logEvent('settings_changed', data);
  track('settings_changed', data);
};

// User retention metrics
export const trackDailyStreak = (streakDays: number) => {
  const data = { streak_days: streakDays };
  logEvent('daily_streak', data);
  track('daily_streak', data);
};

export const trackTotalSessions = (totalSessions: number) => {
  const data = { total_sessions: totalSessions };
  logEvent('total_sessions_milestone', data);
  track('total_sessions_milestone', data);
};

// Audio playback events
export const trackAudioError = (errorType: string, sound: string) => {
  const data = {
    error_type: errorType,
    sound_type: sound,
  };
  logEvent('audio_error', data);
  track('audio_error', data);
};

// Pull-to-refresh tracking
export const trackPullToRefresh = (page: string) => {
  const data = { page };
  logEvent('pull_to_refresh', data);
  track('pull_to_refresh', data);
};

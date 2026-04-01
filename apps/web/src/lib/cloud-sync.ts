import type { MoodEntry } from '@repo/meditation-core';
import { supabase } from './supabase';

const MEDITATION_ENTRIES_TABLE = 'meditation_entries';

type CloudMoodEntryRow = {
  id: string;
  user_id: string;
  pre_mood: MoodEntry['preMood'];
  post_mood: MoodEntry['postMood'] | null;
  timestamp: number;
  note: string | null;
  session_minutes: number | null;
  sound: MoodEntry['sound'] | null;
  saved_quote: MoodEntry['savedQuote'] | null;
};

const toCloudRow = (userId: string, entry: MoodEntry): CloudMoodEntryRow => ({
  id: entry.id,
  user_id: userId,
  pre_mood: entry.preMood,
  post_mood: entry.postMood ?? null,
  timestamp: entry.timestamp,
  note: entry.note ?? null,
  session_minutes: entry.sessionMinutes ?? null,
  sound: entry.sound ?? null,
  saved_quote: entry.savedQuote ?? null,
});

const fromCloudRow = (row: CloudMoodEntryRow): MoodEntry => ({
  id: row.id,
  preMood: row.pre_mood,
  postMood: row.post_mood ?? undefined,
  timestamp: row.timestamp,
  note: row.note ?? undefined,
  sessionMinutes: row.session_minutes ?? undefined,
  sound: row.sound ?? undefined,
  savedQuote: row.saved_quote ?? undefined,
});

const entryCompletenessScore = (entry: MoodEntry) => {
  let score = 0;

  if (entry.postMood) score += 4;
  if (entry.note) score += 2;
  if (entry.savedQuote) score += 2;
  if (entry.sessionMinutes) score += 1;
  if (entry.sound) score += 1;

  return score;
};

const preferEntry = (left: MoodEntry, right: MoodEntry) => {
  const leftScore = entryCompletenessScore(left);
  const rightScore = entryCompletenessScore(right);

  if (leftScore !== rightScore) {
    return leftScore > rightScore ? left : right;
  }

  return left.timestamp >= right.timestamp ? left : right;
};

export const mergeMeditationEntries = (localEntries: MoodEntry[], remoteEntries: MoodEntry[]) => {
  const merged = new Map<string, MoodEntry>();

  [...remoteEntries, ...localEntries].forEach((entry) => {
    const existing = merged.get(entry.id);
    merged.set(entry.id, existing ? preferEntry(existing, entry) : entry);
  });

  return [...merged.values()].sort((a, b) => a.timestamp - b.timestamp);
};

export const fetchCloudEntries = async (userId: string) => {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from(MEDITATION_ENTRIES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => fromCloudRow(row as CloudMoodEntryRow));
};

export const pushCloudEntries = async (userId: string, entries: MoodEntry[]) => {
  if (!supabase || entries.length === 0) {
    return;
  }

  const { error } = await supabase
    .from(MEDITATION_ENTRIES_TABLE)
    .upsert(entries.map((entry) => toCloudRow(userId, entry)), {
      onConflict: 'user_id,id',
    });

  if (error) {
    throw error;
  }
};

import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  calculateStreak,
  type MeditationState,
  type MoodEntry,
  type PostMood,
  type PreMood,
  type SoundType,
} from '@repo/meditation-core';
import { getRandomQuote } from '@repo/meditation-content';
import { useMeditationStore } from './src/meditation-store';

type Tab = 'practice' | 'history' | 'settings';
type Step = 'mood' | 'session' | 'sound' | 'meditate' | 'reflect' | 'quote';

const preMoods: Array<{ key: PreMood; label: string; tone: string }> = [
  { key: 'stressed', label: 'Stressed', tone: '#d36d74' },
  { key: 'tired', label: 'Tired', tone: '#8d7ab5' },
  { key: 'neutral', label: 'Neutral', tone: '#6c8fa6' },
  { key: 'anxious', label: 'Anxious', tone: '#567ab2' },
];

const postMoods: Array<{ key: PostMood; label: string; tone: string }> = [
  { key: 'calm', label: 'Calm', tone: '#567ab2' },
  { key: 'relieved', label: 'Relieved', tone: '#5d90a8' },
  { key: 'peaceful', label: 'Peaceful', tone: '#8870a5' },
  { key: 'grateful', label: 'Grateful', tone: '#739764' },
  { key: 'refreshed', label: 'Refreshed', tone: '#cc7a66' },
];

const sessions = [3, 5, 10, 15];

const sounds: Array<{ key: SoundType; label: string; caption: string }> = [
  { key: 'singing-bowl', label: 'Singing Bowl', caption: 'Bright and ceremonial' },
  { key: 'gong', label: 'Gong', caption: 'Grounded and resonant' },
  { key: 'ambient-pad', label: 'Ambient Pad', caption: 'Soft and spacious' },
  { key: 'nature', label: 'Nature', caption: 'Forest textures' },
  { key: 'rain', label: 'Rain', caption: 'Steady and calming' },
  { key: 'ocean', label: 'Ocean', caption: 'Rolling and expansive' },
  { key: 'wind', label: 'Wind', caption: 'Airy and light' },
  { key: 'birds', label: 'Birds', caption: 'Morning energy' },
  { key: 'fireplace', label: 'Fireplace', caption: 'Warm and steady' },
  { key: 'random', label: 'Surprise Me', caption: 'Let the app choose' },
];

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatEntryDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function App() {
  const entries = useMeditationStore((state) => state.entries);
  const setMeditating = useMeditationStore((state) => state.setMeditating);
  const addEntry = useMeditationStore((state) => state.addEntry);

  const [activeTab, setActiveTab] = useState<Tab>('practice');
  const [step, setStep] = useState<Step>('mood');
  const [preMood, setPreMood] = useState<PreMood>();
  const [minutes, setMinutes] = useState<number>();
  const [sound, setSound] = useState<SoundType>();
  const [postMood, setPostMood] = useState<PostMood>();
  const [note, setNote] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lastEntryId, setLastEntryId] = useState<string>();
  const [quote, setQuote] = useState(() => getRandomQuote());
  const [quoteSaved, setQuoteSaved] = useState(false);

  const streak = useMemo(() => calculateStreak(entries), [entries]);
  const sortedEntries = useMemo(
    () => [...entries].sort((left, right) => right.timestamp - left.timestamp),
    [entries]
  );

  useEffect(() => {
    setMeditating(playing);
  }, [playing, setMeditating]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setPlaying(false);
          setCompleted(true);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (activeTab !== 'practice' && playing) {
      setPlaying(false);
    }
  }, [activeTab, playing]);

  const resetPractice = () => {
    setStep('mood');
    setPreMood(undefined);
    setMinutes(undefined);
    setSound(undefined);
    setPostMood(undefined);
    setNote('');
    setRemainingSeconds(0);
    setPlaying(false);
    setCompleted(false);
    setLastEntryId(undefined);
    setQuote(getRandomQuote());
    setQuoteSaved(false);
  };

  const startSession = () => {
    if (!minutes || !sound) {
      return;
    }
    setRemainingSeconds(minutes * 60);
    setCompleted(false);
    setPlaying(true);
    setStep('meditate');
  };

  const saveReflection = () => {
    if (!preMood || !minutes || !postMood) {
      return;
    }

    addEntry({
      preMood,
      postMood,
      note: note.trim() || undefined,
      sessionMinutes: minutes,
      sound,
    });

    const latestEntry = useMeditationStore.getState().entries.at(-1);
    setLastEntryId(latestEntry?.id);
    setQuoteSaved(false);
    setQuote(getRandomQuote());
    setStep('quote');
  };

  const saveQuote = () => {
    if (!lastEntryId) {
      return;
    }

    useMeditationStore.setState((state: MeditationState) => ({
      entries: state.entries.map((entry: MoodEntry) =>
        entry.id === lastEntryId ? { ...entry, savedQuote: quote } : entry
      ),
    }));
    setQuoteSaved(true);
  };

  const renderTabButton = (tab: Tab, label: string) => (
    <Pressable
      key={tab}
      onPress={() => setActiveTab(tab)}
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );

  const renderChoice = (
    label: string,
    selected: boolean,
    onPress: () => void,
    accent?: string,
    caption?: string
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={[
        styles.choiceCard,
        selected && styles.choiceCardSelected,
        accent ? { borderColor: selected ? accent : '#d9d1c4' } : null,
      ]}
    >
      <Text style={styles.choiceTitle}>{label}</Text>
      {caption ? <Text style={styles.choiceCaption}>{caption}</Text> : null}
    </Pressable>
  );

  const renderPractice = () => (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>Daily practice</Text>
      <Text style={styles.heroTitle}>Stillness for iPhone</Text>
      <Text style={styles.heroCopy}>
        A native meditation flow backed by the same shared core logic as the web app.
      </Text>

      {step === 'mood' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you arriving today?</Text>
          <Text style={styles.cardCopy}>Pick the mood that best matches your starting point.</Text>
          <View style={styles.choiceStack}>
            {preMoods.map((item) =>
              renderChoice(
                item.label,
                preMood === item.key,
                () => {
                  setPreMood(item.key);
                  setStep('session');
                },
                item.tone
              )
            )}
          </View>
        </View>
      )}

      {step === 'session' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose a session length</Text>
          <View style={styles.choiceGrid}>
            {sessions.map((duration) =>
              renderChoice(
                `${duration} min`,
                minutes === duration,
                () => {
                  setMinutes(duration);
                  setStep('sound');
                }
              )
            )}
          </View>
          <Pressable onPress={() => setStep('mood')}>
            <Text style={styles.backLink}>Back</Text>
          </Pressable>
        </View>
      )}

      {step === 'sound' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pick a soundscape</Text>
          <Text style={styles.cardCopy}>
            The iOS scaffold stores your choice now. Native audio playback is the next pass.
          </Text>
          <View style={styles.choiceStack}>
            {sounds.map((item) =>
              renderChoice(item.label, sound === item.key, () => setSound(item.key), undefined, item.caption)
            )}
          </View>
          <Pressable style={styles.primaryButton} onPress={startSession}>
            <Text style={styles.primaryButtonText}>Start meditation</Text>
          </Pressable>
          <Pressable onPress={() => setStep('session')}>
            <Text style={styles.backLink}>Back</Text>
          </Pressable>
        </View>
      )}

      {step === 'meditate' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{completed ? 'Session complete' : 'Breathe and settle'}</Text>
          <Text style={styles.timerText}>{formatDuration(remainingSeconds)}</Text>
          <Text style={styles.cardCopy}>
            {completed
              ? 'Take a breath, notice the shift, and capture how you feel.'
              : `Settle into ${sound === 'random' ? 'a surprise soundscape' : sound?.replace('-', ' ')} and keep your attention soft.`}
          </Text>
          <View style={styles.inlineButtons}>
            {!completed ? (
              <>
                <Pressable style={styles.primaryButtonCompact} onPress={() => setPlaying((value) => !value)}>
                  <Text style={styles.primaryButtonText}>{playing ? 'Pause' : 'Resume'}</Text>
                </Pressable>
                <Pressable
                  style={styles.secondaryButtonCompact}
                  onPress={() => {
                    setPlaying(false);
                    resetPractice();
                  }}
                >
                  <Text style={styles.secondaryButtonText}>End session</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.primaryButton} onPress={() => setStep('reflect')}>
                <Text style={styles.primaryButtonText}>Reflect</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {step === 'reflect' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How do you feel now?</Text>
          <View style={styles.choiceStack}>
            {postMoods.map((item) =>
              renderChoice(item.label, postMood === item.key, () => setPostMood(item.key), item.tone)
            )}
          </View>
          <TextInput
            placeholder="Optional note"
            placeholderTextColor="#8c8377"
            multiline
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
          />
          <Pressable
            style={[styles.primaryButton, !postMood && styles.primaryButtonDisabled]}
            onPress={saveReflection}
            disabled={!postMood}
          >
            <Text style={styles.primaryButtonText}>Save reflection</Text>
          </Pressable>
        </View>
      )}

      {step === 'quote' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>A thought to carry with you</Text>
          <Text style={styles.quoteText}>“{quote.text}”</Text>
          <Text style={styles.quoteAuthor}>{quote.author}</Text>
          <View style={styles.inlineButtons}>
            <Pressable style={styles.primaryButtonCompact} onPress={saveQuote}>
              <Text style={styles.primaryButtonText}>{quoteSaved ? 'Saved' : 'Save quote'}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButtonCompact} onPress={resetPractice}>
              <Text style={styles.secondaryButtonText}>Start again</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  const renderHistoryItem = (entry: MoodEntry) => (
    <View key={entry.id} style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyMood}>
          {entry.preMood} to {entry.postMood ?? 'unfinished'}
        </Text>
        <Text style={styles.historyMeta}>{formatEntryDate(entry.timestamp)}</Text>
      </View>
      <Text style={styles.historyMeta}>
        {entry.sessionMinutes ?? 0} min • {entry.sound ?? 'no sound selected'}
      </Text>
      {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
      {entry.savedQuote ? (
        <Text style={styles.historyQuote}>Saved quote: “{entry.savedQuote.text}”</Text>
      ) : null}
    </View>
  );

  const renderHistory = () => (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>Progress</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{entries.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent reflections</Text>
        {sortedEntries.length === 0 ? (
          <Text style={styles.cardCopy}>Your meditation history will show up here after the first session.</Text>
        ) : (
          <View style={styles.historyList}>{sortedEntries.map(renderHistoryItem)}</View>
        )}
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current scaffold status</Text>
        <Text style={styles.cardCopy}>
          This first iOS pass includes the native meditation flow, saved session history, streaks, notes,
          and quote saving via the shared monorepo packages.
        </Text>
        <Text style={styles.cardCopy}>
          Next step: port native ambient audio playback so the iPhone app matches the web experience more closely.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data model</Text>
        <Text style={styles.cardCopy}>
          Session data is persisted locally on device using AsyncStorage, with the same shared meditation core
          package that powers the web app.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.topBar}>
          {renderTabButton('practice', 'Practice')}
          {renderTabButton('history', 'History')}
          {renderTabButton('settings', 'Settings')}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTab === 'practice' && renderPractice()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'settings' && renderSettings()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4efe6',
  },
  appShell: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#ebe3d6',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#2e4a3f',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6f665a',
  },
  tabButtonTextActive: {
    color: '#f7f3ec',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 48,
  },
  section: {
    gap: 18,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#7f766a',
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
    color: '#1f2a24',
  },
  heroCopy: {
    fontSize: 16,
    lineHeight: 24,
    color: '#61594f',
  },
  card: {
    backgroundColor: '#fcfaf6',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e7dece',
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#1f2a24',
  },
  cardCopy: {
    fontSize: 15,
    lineHeight: 22,
    color: '#61594f',
  },
  choiceStack: {
    gap: 10,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceCard: {
    borderWidth: 1,
    borderColor: '#d9d1c4',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fffdf9',
    gap: 4,
  },
  choiceCardSelected: {
    backgroundColor: '#f4eee4',
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2a322d',
  },
  choiceCaption: {
    fontSize: 13,
    lineHeight: 18,
    color: '#72685e',
  },
  primaryButton: {
    backgroundColor: '#2e4a3f',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonCompact: {
    flex: 1,
    backgroundColor: '#2e4a3f',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#f7f3ec',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButtonCompact: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d7ccbb',
  },
  secondaryButtonText: {
    color: '#51483f',
    fontSize: 15,
    fontWeight: '700',
  },
  backLink: {
    alignSelf: 'center',
    color: '#6d6459',
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 56,
    lineHeight: 62,
    fontWeight: '700',
    color: '#1f2a24',
    letterSpacing: 2,
  },
  inlineButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  noteInput: {
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d9d1c4',
    backgroundColor: '#fffdf9',
    padding: 16,
    textAlignVertical: 'top',
    color: '#2a322d',
    fontSize: 15,
  },
  quoteText: {
    fontSize: 22,
    lineHeight: 32,
    color: '#283129',
  },
  quoteAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7b7266',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fcfaf6',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e7dece',
    gap: 6,
  },
  statValue: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1f2a24',
  },
  statLabel: {
    fontSize: 14,
    color: '#6f665a',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    borderRadius: 18,
    backgroundColor: '#fffdf9',
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2d8c8',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyMood: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#24302a',
    textTransform: 'capitalize',
  },
  historyMeta: {
    fontSize: 13,
    lineHeight: 18,
    color: '#7a7063',
  },
  historyNote: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4f473f',
  },
  historyQuote: {
    fontSize: 13,
    lineHeight: 20,
    color: '#62584c',
    fontStyle: 'italic',
  },
});

import { motion } from 'framer-motion';
import { useMeditationStore, preMoodConfig, PreMood } from '@/lib/meditation-store';
import { subDays, startOfDay, format } from 'date-fns';

const MoodTracker = () => {
  const { entries } = useMeditationStore();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date).getTime();
    const dayEnd = dayStart + 86400000;
    const dayEntries = entries.filter((e) => e.timestamp >= dayStart && e.timestamp < dayEnd);
    return { date, entries: dayEntries };
  });

  const preMoodToValue: Record<PreMood, number> = { stressed: 1, anxious: 2, tired: 2, neutral: 3, energized: 5 };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display">Your Week</h2>
      <div className="grid grid-cols-7 gap-2">
        {last7Days.map(({ date, entries: dayEntries }, i) => {
          const avgMood = dayEntries.length > 0
            ? dayEntries.reduce((sum, e) => sum + preMoodToValue[e.preMood], 0) / dayEntries.length
            : 0;
          const moodLevel: PreMood | null = avgMood >= 4 ? 'energized' : avgMood >= 3 ? 'neutral' : avgMood >= 2 ? 'tired' : avgMood > 0 ? 'stressed' : null;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-xs text-muted-foreground">{format(date, 'EEE')}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                moodLevel ? preMoodConfig[moodLevel].color : 'bg-muted'
              }`}>
                {moodLevel ? preMoodConfig[moodLevel].emoji : '·'}
              </div>
              <span className="text-[10px] text-muted-foreground">{dayEntries.length}x</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodTracker;

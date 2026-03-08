import { motion } from 'framer-motion';
import { useMeditationStore, moodConfig, Mood } from '@/lib/meditation-store';
import { format, subDays, startOfDay } from 'date-fns';

const MoodTracker = () => {
  const { entries } = useMeditationStore();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date).getTime();
    const dayEnd = dayStart + 86400000;
    const dayEntries = entries.filter((e) => e.timestamp >= dayStart && e.timestamp < dayEnd);
    return { date, entries: dayEntries };
  });

  const moodToValue: Record<Mood, number> = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display">Your Week</h2>
      <div className="grid grid-cols-7 gap-2">
        {last7Days.map(({ date, entries: dayEntries }, i) => {
          const avgMood = dayEntries.length > 0
            ? dayEntries.reduce((sum, e) => sum + moodToValue[e.mood], 0) / dayEntries.length
            : 0;
          const moodLevel = avgMood >= 4.5 ? 'great' : avgMood >= 3.5 ? 'good' : avgMood >= 2.5 ? 'okay' : avgMood >= 1.5 ? 'low' : avgMood > 0 ? 'bad' : null;

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
                moodLevel ? moodConfig[moodLevel].color : 'bg-muted'
              }`}>
                {moodLevel ? moodConfig[moodLevel].emoji : '·'}
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

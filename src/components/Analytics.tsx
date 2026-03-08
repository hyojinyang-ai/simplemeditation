import { motion } from 'framer-motion';
import { useMeditationStore, moodConfig, Mood } from '@/lib/meditation-store';
import { subDays, startOfDay } from 'date-fns';

const Analytics = () => {
  const { entries } = useMeditationStore();

  const totalSessions = entries.filter((e) => e.sessionMinutes).length;
  const totalMinutes = entries.reduce((sum, e) => sum + (e.sessionMinutes || 0), 0);
  const moodToValue: Record<Mood, number> = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };
  const avgMood = entries.length > 0
    ? entries.reduce((sum, e) => sum + moodToValue[e.mood], 0) / entries.length
    : 0;

  // Streak calculation
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = startOfDay(subDays(new Date(), i)).getTime();
    const hasEntry = entries.some((e) => e.timestamp >= day && e.timestamp < day + 86400000);
    if (hasEntry) streak++;
    else break;
  }

  const moodDistribution = (Object.keys(moodConfig) as Mood[]).map((mood) => ({
    mood,
    count: entries.filter((e) => e.mood === mood).length,
    ...moodConfig[mood],
  }));

  const maxCount = Math.max(...moodDistribution.map((d) => d.count), 1);

  const stats = [
    { label: 'Sessions', value: totalSessions, icon: '🧘' },
    { label: 'Minutes', value: totalMinutes, icon: '⏱️' },
    { label: 'Streak', value: `${streak}d`, icon: '🔥' },
    { label: 'Avg Mood', value: avgMood.toFixed(1), icon: '💚' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display">Insights</h2>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-display font-semibold mt-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-display">Mood Distribution</h3>
        {moodDistribution.map((item, i) => (
          <motion.div
            key={item.mood}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3"
          >
            <span className="text-xl w-8">{item.emoji}</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.count}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;

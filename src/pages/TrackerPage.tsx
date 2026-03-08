import MoodTracker from '@/components/MoodTracker';
import { useMeditationStore, moodConfig } from '@/lib/meditation-store';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const TrackerPage = () => {
  const { entries } = useMeditationStore();
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen bg-background px-4 pt-8 pb-24 max-w-md mx-auto space-y-6">
      <h1 className="text-3xl font-display font-semibold">Mood Tracker</h1>
      <MoodTracker />

      <div className="space-y-3">
        <h3 className="text-lg font-display">Recent Check-ins</h3>
        {sorted.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">No entries yet. Complete a session to start tracking.</p>
        )}
        {sorted.slice(0, 20).map((entry, i) => {
          const config = moodConfig[entry.mood];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${config.color}`}>
                {config.emoji}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{config.label}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                </div>
              </div>
              {entry.sessionMinutes && (
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                  {entry.sessionMinutes} min
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackerPage;

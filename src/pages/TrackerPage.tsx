import { motion } from 'framer-motion';
import { useMeditationStore, preMoodConfig, postMoodConfig } from '@/lib/meditation-store';
import { format } from 'date-fns';

const TrackerPage = () => {
  const { entries } = useMeditationStore();
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen bg-background px-4 pt-8 pb-24 max-w-md mx-auto space-y-6">
      <h1 className="text-3xl font-display font-semibold">Journal</h1>
      <p className="text-muted-foreground text-sm -mt-3">Your meditation journey</p>

      {sorted.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <span className="text-5xl">🧘</span>
          <p className="text-muted-foreground text-sm">No sessions yet. Complete a meditation to start tracking.</p>
        </div>
      )}

      {sorted.map((entry, i) => {
        const preConfig = preMoodConfig[entry.preMood];
        const postConfig = entry.postMood ? postMoodConfig[entry.postMood] : null;
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-card rounded-2xl p-4 shadow-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {format(new Date(entry.timestamp), 'MMM d, yyyy · h:mm a')}
              </span>
              {entry.sessionMinutes && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                  {entry.sessionMinutes} min
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${preConfig.color}`}>
                <span>{preConfig.emoji}</span>
                {preConfig.label}
              </div>
              {postConfig && (
                <>
                  <span className="text-muted-foreground text-xs">→</span>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${postConfig.color}`}>
                    <span>{postConfig.emoji}</span>
                    {postConfig.label}
                  </div>
                </>
              )}
            </div>

            {entry.note && (
              <p className="text-sm text-muted-foreground italic">"{entry.note}"</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default TrackerPage;

import { motion } from 'framer-motion';
import { useMeditationStore, preMoodConfig, postMoodConfig } from '@/lib/meditation-store';
import { format } from 'date-fns';
import heroImg from '@/assets/hero-nature.jpg';

const TrackerPage = () => {
  const { entries } = useMeditationStore();
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen relative pb-24">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="" className="w-full h-48 object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background" />
      </div>

      <div className="px-4 pt-8 max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-3xl font-display font-semibold">Journal</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your meditation journey</p>
        </div>

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
              className="glass-strong rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(entry.timestamp), 'MMM d, yyyy · h:mm a')}
                </span>
                {entry.sessionMinutes && (
                  <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg">
                    {entry.sessionMinutes} min
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium ${preConfig.color}`}>
                  <span>{preConfig.emoji}</span>
                  {preConfig.label}
                </div>
                {postConfig && (
                  <>
                    <span className="text-muted-foreground text-xs">→</span>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium ${postConfig.color}`}>
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
    </div>
  );
};

export default TrackerPage;

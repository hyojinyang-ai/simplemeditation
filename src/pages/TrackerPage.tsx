import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeditationStore, preMoodConfig, postMoodConfig } from '@/lib/meditation-store';
import { format } from 'date-fns';
import { BookOpen, Bookmark, Leaf, Quote } from 'lucide-react';

import StepHeader from '@/components/StepHeader';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import PullToRefresh from '@/components/PullToRefresh';

type Tab = 'sessions' | 'quotes';

const TrackerPage = () => {
  const { entries } = useMeditationStore();
  const [tab, setTab] = useState<Tab>('sessions');
  const { containerRef, pullDistance, refreshing, threshold } = usePullToRefresh();
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const savedQuotes = sorted.filter(e => e.savedQuote);

  return (
    <div ref={containerRef} className="min-h-screen relative pb-24 overflow-auto">

      <div className="px-4 max-w-md mx-auto space-y-5">
        <StepHeader title="Journal" subtitle="Your meditation journey" sticky />
        <PullToRefresh pullDistance={pullDistance} refreshing={refreshing} threshold={threshold} />

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-muted/40">
          <button
            onClick={() => setTab('sessions')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'sessions' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/70'
            }`}
          >
            <BookOpen size={14} strokeWidth={1.5} />
            Sessions
          </button>
          <button
            onClick={() => setTab('quotes')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'quotes' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/70'
            }`}
          >
            <Bookmark size={14} strokeWidth={1.5} />
            Saved Quotes
            {savedQuotes.length > 0 && (
              <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full leading-none">
                {savedQuotes.length}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {sorted.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <BookOpen size={36} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">No sessions yet. Complete a meditation to start tracking.</p>
                </div>
              )}

              {sorted.map((entry, i) => {
                const preConfig = preMoodConfig[entry.preMood];
                const postConfig = entry.postMood ? postMoodConfig[entry.postMood] : null;
                const PreIcon = preConfig.icon;
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
                      <div className="flex items-center gap-1.5">
                        {entry.savedQuote && (
                          <Bookmark size={12} strokeWidth={1.5} className="text-accent fill-accent" />
                        )}
                        {entry.sessionMinutes && (
                          <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg">
                            {entry.sessionMinutes} min
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium ${preConfig.color}`}>
                        <PreIcon size={14} strokeWidth={1.5} />
                        {preConfig.label}
                      </div>
                      {postConfig && (() => {
                        const PostIcon = postConfig.icon;
                        return (
                          <>
                            <span className="text-muted-foreground text-xs">→</span>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium ${postConfig.color}`}>
                              <PostIcon size={14} strokeWidth={1.5} />
                              {postConfig.label}
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {entry.note && (
                      <p className="text-sm text-muted-foreground italic">"{entry.note}"</p>
                    )}

                    {entry.savedQuote && (
                      <div className="pt-1 border-t border-border/30">
                        <p className="text-xs text-foreground/60 italic leading-relaxed">
                          "{entry.savedQuote.text}" — <span className="not-italic text-muted-foreground">{entry.savedQuote.author}</span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {tab === 'quotes' && (
            <motion.div
              key="quotes"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {savedQuotes.length === 0 && (
                <div className="text-center py-16 space-y-3">
                  <Leaf size={36} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">No saved quotes yet. Save a quote after your next session.</p>
                </div>
              )}

              {savedQuotes.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-strong rounded-2xl p-5 space-y-3"
                >
                  <Quote size={18} strokeWidth={1.5} className="text-accent/60" />
                  <p className="text-base font-display italic leading-relaxed tracking-tight">
                    "{entry.savedQuote!.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">— {entry.savedQuote!.author}</span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackerPage;

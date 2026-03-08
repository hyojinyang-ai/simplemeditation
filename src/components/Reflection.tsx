import { motion } from 'framer-motion';
import { PostMood, postMoodConfig } from '@/lib/meditation-store';
import { useState } from 'react';

interface ReflectionProps {
  onSubmit: (mood: PostMood, note?: string) => void;
}

const Reflection = ({ onSubmit }: ReflectionProps) => {
  const [selected, setSelected] = useState<PostMood>();
  const [note, setNote] = useState('');
  const moods = Object.entries(postMoodConfig) as [PostMood, typeof postMoodConfig[PostMood]][];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div className="text-center space-y-1">
        <span className="text-4xl">🧘</span>
        <h2 className="text-2xl font-display">How do you feel now?</h2>
        <p className="text-muted-foreground text-sm">Take a moment to notice any shifts</p>
      </div>

      <div className="flex justify-center gap-2">
        {moods.map(([mood, config], i) => (
          <motion.button
            key={mood}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setSelected(mood)}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl transition-all min-w-[58px] ${
              selected === mood
                ? `${config.color} ring-2 ring-primary/50 scale-110 shadow-soft`
                : 'hover:bg-muted hover:scale-105'
            }`}
          >
            <span className="text-2xl">{config.emoji}</span>
            <span className="text-[10px] font-medium">{config.label}</span>
          </motion.button>
        ))}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about your session… (optional)"
            className="w-full bg-card border border-border rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSubmit(selected, note || undefined)}
            className="w-full py-3 rounded-xl gradient-calm text-primary-foreground font-medium shadow-soft"
          >
            Save & Continue
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Reflection;

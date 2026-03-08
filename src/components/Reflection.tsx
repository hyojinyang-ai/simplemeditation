import { motion } from 'framer-motion';
import { PostMood, postMoodConfig } from '@/lib/meditation-store';
import { useState } from 'react';
import { Feather } from 'lucide-react';

interface ReflectionProps {
  onSubmit: (mood: PostMood, note?: string) => void;
}

const Reflection = ({ onSubmit }: ReflectionProps) => {
  const [selected, setSelected] = useState<PostMood>();
  const [note, setNote] = useState('');
  const moods = Object.entries(postMoodConfig) as [PostMood, typeof postMoodConfig[PostMood]][];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="text-center space-y-2">
        <Feather size={28} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
        <h2 className="text-2xl font-display font-medium tracking-tight">How do you feel now?</h2>
        <p className="text-muted-foreground text-sm">Notice any shifts</p>
      </div>

      <div className="glass-strong rounded-3xl p-5">
        <div className="flex justify-center gap-2.5">
          {moods.map(([mood, config], i) => {
            const Icon = config.icon;
            return (
              <motion.button
                key={mood}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.88, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
                onClick={() => setSelected(mood)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all min-w-[54px] ${
                  selected === mood
                    ? `${config.color} ring-2 ring-primary/30 scale-110`
                    : 'hover:bg-muted/50 hover:scale-105'
                }`}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="text-[10px] font-medium tracking-wide">{config.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about your session… (optional)"
            className="w-full glass rounded-2xl p-4 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50"
          />
          <motion.button
            whileTap={{ scale: 0.94, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
            onClick={() => onSubmit(selected, note || undefined)}
            className="w-full py-3.5 rounded-2xl gradient-calm text-primary-foreground text-sm font-medium tracking-wide"
          >
            Save & Continue
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Reflection;

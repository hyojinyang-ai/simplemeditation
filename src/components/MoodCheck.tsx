import { motion } from 'framer-motion';
import { Mood, moodConfig } from '@/lib/meditation-store';

interface MoodCheckProps {
  onSelect: (mood: Mood) => void;
  selected?: Mood;
}

const MoodCheck = ({ onSelect, selected }: MoodCheckProps) => {
  const moods = Object.entries(moodConfig) as [Mood, typeof moodConfig[Mood]][];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display text-center">How are you feeling?</h2>
      <p className="text-muted-foreground text-center text-sm">Check in with yourself before your session</p>
      <div className="flex justify-center gap-3 pt-2">
        {moods.map(([mood, config], i) => (
          <motion.button
            key={mood}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(mood)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 ${
              selected === mood
                ? `${config.color} ring-2 ring-primary scale-105`
                : 'hover:bg-muted'
            }`}
          >
            <span className="text-3xl">{config.emoji}</span>
            <span className="text-xs font-medium">{config.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodCheck;

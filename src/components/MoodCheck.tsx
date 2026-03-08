import { motion } from 'framer-motion';
import { PreMood, preMoodConfig } from '@/lib/meditation-store';

interface MoodCheckProps {
  onSelect: (mood: PreMood) => void;
  selected?: PreMood;
}

const MoodCheck = ({ onSelect, selected }: MoodCheckProps) => {
  const moods = Object.entries(preMoodConfig) as [PreMood, typeof preMoodConfig[PreMood]][];

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-display">How are you feeling?</h2>
        <p className="text-muted-foreground text-sm">Check in with yourself before your session</p>
      </div>
      <div className="flex justify-center gap-2">
        {moods.map(([mood, config], i) => (
          <motion.button
            key={mood}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
            onClick={() => onSelect(mood)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 min-w-[64px] ${
              selected === mood
                ? `${config.color} ring-2 ring-primary/50 scale-110 shadow-soft`
                : 'hover:bg-muted hover:scale-105'
            }`}
          >
            <span className="text-3xl">{config.emoji}</span>
            <span className="text-[11px] font-medium leading-tight">{config.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodCheck;

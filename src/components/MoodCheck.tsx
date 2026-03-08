import { motion } from 'framer-motion';
import { PreMood, preMoodConfig } from '@/lib/meditation-store';

interface MoodCheckProps {
  onSelect: (mood: PreMood) => void;
  selected?: PreMood;
}

const MoodCheck = ({ onSelect, selected }: MoodCheckProps) => {
  const moods = Object.entries(preMoodConfig) as [PreMood, typeof preMoodConfig[PreMood]][];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-display font-medium tracking-tight">How are you feeling?</h2>
        <p className="text-muted-foreground text-sm">Check in with yourself</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {moods.map(([mood, config], i) => {
          const Icon = config.icon;
          return (
            <motion.button
              key={mood}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 180 }}
              whileTap={{ scale: 0.95, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
              onClick={() => onSelect(mood)}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 glass-strong ${
                selected === mood
                  ? `${config.color} ring-2 ring-primary/30 scale-[1.02]`
                  : 'hover:bg-muted/50 hover:scale-[1.01]'
              }`}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span className="text-sm font-medium tracking-wide">{config.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodCheck;

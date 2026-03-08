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
      <div className="flex gap-2">
        {moods.map(([mood, config], i) => {
          const Icon = config.icon;
          const isSelected = selected === mood;
          return (
            <motion.button
              key={mood}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 180 }}
              whileTap={{ scale: 0.95, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
              onClick={() => onSelect(mood)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all duration-200 ${
                isSelected
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 scale-[1.02]'
                  : 'glass-strong hover:bg-muted/50 hover:scale-[1.01]'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-xs font-medium tracking-wide">{config.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodCheck;

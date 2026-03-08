import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { SoundType, soundConfig } from '@/lib/meditation-store';

interface SoundPickerProps {
  onSelect: (sound: SoundType) => void;
  selected?: SoundType;
  onBack?: () => void;
}

const SoundPicker = ({ onSelect, selected, onBack }: SoundPickerProps) => {
  const sounds = Object.entries(soundConfig) as [SoundType, typeof soundConfig[SoundType]][];

  return (
    <div className="space-y-6">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
      )}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-display font-medium tracking-tight">Pick your sound</h2>
        <p className="text-muted-foreground text-sm">Choose what resonates with you</p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {sounds.map(([sound, config], i) => {
          const Icon = config.icon;
          return (
            <motion.button
              key={sound}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
              onClick={() => onSelect(sound)}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-200 ${
                selected === sound
                  ? 'gradient-calm text-primary-foreground shadow-soft scale-105'
                  : 'glass-strong hover:bg-muted/50 hover:scale-[1.02]'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[11px] font-medium tracking-wide">{config.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SoundPicker;

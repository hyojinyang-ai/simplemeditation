import { motion } from 'framer-motion';
import { SoundType, soundConfig } from '@/lib/meditation-store';

interface SoundPickerProps {
  onSelect: (sound: SoundType) => void;
  selected?: SoundType;
}

const SoundPicker = ({ onSelect, selected }: SoundPickerProps) => {
  const sounds = Object.entries(soundConfig) as [SoundType, typeof soundConfig[SoundType]][];

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-display">Pick your sound</h2>
        <p className="text-muted-foreground text-sm">Choose what resonates with you today</p>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {sounds.map(([sound, config], i) => (
          <motion.button
            key={sound}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(sound)}
            className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl transition-all duration-200 ${
              selected === sound
                ? 'bg-primary text-primary-foreground shadow-soft scale-105'
                : 'bg-card shadow-card hover:shadow-soft hover:scale-[1.02]'
            }`}
          >
            <span className="text-2xl">{config.emoji}</span>
            <span className={`text-xs font-medium ${selected === sound ? '' : ''}`}>{config.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SoundPicker;

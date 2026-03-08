import { motion } from 'framer-motion';
import { AmbientSound, ambientSounds } from '@/lib/ambient-engine';

interface AmbientPickerProps {
  selected: AmbientSound;
  onSelect: (sound: AmbientSound) => void;
  bowlEnabled: boolean;
  onToggleBowl: () => void;
}

const AmbientPicker = ({ selected, onSelect, bowlEnabled, onToggleBowl }: AmbientPickerProps) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">Background Sound</p>
      <div className="flex justify-center gap-2">
        {ambientSounds.map((sound, i) => (
          <motion.button
            key={sound.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(sound.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs transition-all ${
              selected === sound.id
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-card hover:bg-muted shadow-card'
            }`}
          >
            <span className="text-lg">{sound.emoji}</span>
            <span className="font-medium">{sound.label}</span>
          </motion.button>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={onToggleBowl}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            bowlEnabled
              ? 'bg-zen-sage-light text-zen-sage'
              : 'bg-muted text-muted-foreground hover:bg-card'
          }`}
        >
          <span>🔔</span>
          Singing Bowl
          <span className={`w-2 h-2 rounded-full transition-colors ${bowlEnabled ? 'bg-zen-sage' : 'bg-muted-foreground/30'}`} />
        </button>
      </div>
    </div>
  );
};

export default AmbientPicker;

import { motion } from 'framer-motion';
import { type SoundType } from '@/lib/meditation-store';
import { soundConfig } from '@/lib/web-mood-config';
import { Music2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface SoundPickerProps {
  onSelect: (sound: SoundType) => void;
  selected?: SoundType;
}

const SoundPicker = ({ onSelect, selected }: SoundPickerProps) => {
  const { t } = useI18n();
  const allSounds = Object.entries(soundConfig) as [SoundType, typeof soundConfig[SoundType]][];
  const regularSounds = allSounds.filter(([sound]) => sound !== 'random');
  const randomSound = allSounds.find(([sound]) => sound === 'random');

  return (
    <div className="flex flex-col gap-6">
      {/* Decorative icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          opacity: { delay: 0.1, duration: 0.4 },
          scale: { delay: 0.1, type: 'spring', stiffness: 120 },
        }}
        className="flex items-center justify-center"
      >
        <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center shadow-soft border border-border">
          <Music2 size={32} strokeWidth={1.5} className="text-foreground" />
        </div>
      </motion.div>

      {/* Regular sounds grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {regularSounds.map(([sound, config], i) => {
          const Icon = config.icon;
          return (
            <motion.button
              key={sound}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
              whileHover={{ scale: 1.06, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              onClick={() => onSelect(sound)}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-200 ease-out ${
                selected === sound
                  ? 'glass-selected text-primary-foreground scale-105'
                  : 'glass-button'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[11px] font-medium tracking-wide text-center leading-tight">{t(`sound.${sound}`)}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Surprise Me button - full width */}
      {randomSound && (() => {
        const [sound, config] = randomSound;
        const Icon = config.icon;
        return (
          <motion.button
            key={sound}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
            whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            onClick={() => onSelect(sound)}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all duration-200 ease-out ${
              selected === sound
                ? 'glass-selected text-primary-foreground scale-[1.02]'
                : 'glass-button'
            }`}
          >
            <Icon size={22} strokeWidth={1.5} />
            <span className="text-base font-medium tracking-wide">{t(`sound.${sound}`)}</span>
          </motion.button>
        );
      })()}
    </div>
  );
};

export default SoundPicker;

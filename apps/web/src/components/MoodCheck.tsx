import { motion } from 'framer-motion';
import { type PreMood } from '@/lib/meditation-store';
import { preMoodConfig } from '@/lib/web-mood-config';
import { useI18n } from '@/lib/i18n';

interface MoodCheckProps {
  onSelect: (mood: PreMood) => void;
  selected?: PreMood;
}

const MoodCheck = ({ onSelect, selected }: MoodCheckProps) => {
  const { t } = useI18n();
  const moods = Object.entries(preMoodConfig) as [PreMood, typeof preMoodConfig[PreMood]][];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-display font-medium tracking-tight">{t('how_feeling')}</h2>
        <p className="text-muted-foreground text-sm">{t('check_in')}</p>
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
              whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
              whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              onClick={() => onSelect(mood)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl transition-all duration-200 ease-out ${
                isSelected
                  ? 'glass-selected text-primary-foreground scale-105'
                  : 'glass-button'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-xs font-medium tracking-wide">{t(`mood.${mood}`)}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodCheck;

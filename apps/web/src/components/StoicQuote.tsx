import { motion } from 'framer-motion';
import { Leaf, Bookmark, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface StoicQuoteProps {
  quote: { text: string; author: string };
  onGoHome: () => void;
  onViewJournal: () => void;
  onViewInsights: () => void;
  onSave?: () => void;
  saved?: boolean;
}

const StoicQuote = ({ quote, onGoHome, onViewJournal, onViewInsights, onSave, saved }: StoicQuoteProps) => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="text-center space-y-6 max-h-[70dvh] overflow-y-auto scrollbar-hide"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
      >
        <Leaf size={32} strokeWidth={1.5} className="mx-auto text-accent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
      >
        <Check size={16} strokeWidth={2} />
        {t('saved')}
      </motion.div>

      <div className="glass-strong rounded-3xl p-8 space-y-4">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-display italic leading-relaxed tracking-tight"
        >
          &ldquo;{quote.text}&rdquo;
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-muted-foreground"
        >
          — {quote.author}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="space-y-3"
      >
        {onSave && (
          <motion.button
            whileTap={{ scale: 0.94, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
            whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            onClick={onSave}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 ease-out ${
              saved ? 'glass-selected text-primary-foreground' : 'glass-button'
            }`}
          >
            {saved ? <Check size={14} strokeWidth={2} /> : <Bookmark size={14} strokeWidth={1.5} className={saved ? 'fill-current' : ''} />}
            {saved ? t('quote_saved') : t('save_quote')}
          </motion.button>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <motion.button
            whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
            whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            onClick={onViewJournal}
            className="rounded-2xl glass-button px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 ease-out"
          >
            {t('view_journal')}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
            whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            onClick={onViewInsights}
            className="rounded-2xl glass-button px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 ease-out"
          >
            {t('view_insights')}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
            whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            onClick={onGoHome}
            className="rounded-2xl glass-button px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 ease-out"
          >
            {t('go_home')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StoicQuote;

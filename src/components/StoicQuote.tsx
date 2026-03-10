import { motion } from 'framer-motion';
import { Leaf, ArrowRight, Bookmark } from 'lucide-react';

interface StoicQuoteProps {
  quote: { text: string; author: string };
  onContinue: () => void;
  onSave?: () => void;
  saved?: boolean;
}

const StoicQuote = ({ quote, onContinue, onSave, saved }: StoicQuoteProps) => {
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
        className="flex items-center justify-center gap-3"
      >
        {onSave && (
          <motion.button
            whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
            onClick={onSave}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl glass-strong text-sm font-medium tracking-wide transition-all duration-300 ease-out ${
              saved ? 'text-accent' : 'text-foreground hover:bg-muted/60 hover:shadow-md hover:scale-[1.02]'
            }`}
          >
            <Bookmark size={14} strokeWidth={1.5} className={saved ? 'fill-accent' : ''} />
            {saved ? 'Saved' : 'Save'}
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
          onClick={onContinue}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl glass-strong text-sm font-medium tracking-wide transition-all duration-300 ease-out hover:bg-muted/60 hover:shadow-md hover:scale-[1.02]"
        >
          Begin again
          <ArrowRight size={14} strokeWidth={1.5} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default StoicQuote;

import { motion } from 'framer-motion';
import { Leaf, ArrowRight } from 'lucide-react';

interface StoicQuoteProps {
  quote: { text: string; author: string };
  onContinue: () => void;
}

const StoicQuote = ({ quote, onContinue }: StoicQuoteProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-center space-y-8">
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
          "{quote.text}"
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

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl glass-strong text-sm font-medium tracking-wide hover:bg-muted/50 transition-all"
      >
        Begin again
        <ArrowRight size={14} strokeWidth={1.5} />
      </motion.button>
    </motion.div>
  );
};

export default StoicQuote;

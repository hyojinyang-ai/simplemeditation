import { motion } from 'framer-motion';

interface StoicQuoteProps {
  quote: { text: string; author: string };
  onContinue: () => void;
}

const StoicQuote = ({ quote, onContinue }: StoicQuoteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        className="text-5xl"
      >
        🌿
      </motion.div>

      <div className="space-y-3 px-2">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-display italic leading-relaxed"
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
        className="px-8 py-3 rounded-xl bg-card shadow-card text-sm font-medium hover:shadow-soft transition-all"
      >
        Begin again ✨
      </motion.button>
    </motion.div>
  );
};

export default StoicQuote;

import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface StepHeaderProps {
  title: string;
  onBack?: () => void;
}

const StepHeader = ({ title, onBack }: StepHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center relative py-3"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="absolute left-0 flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span>Back</span>
        </button>
      )}
      <h1 className="text-lg font-display font-medium tracking-tight text-foreground">
        {title}
      </h1>
    </motion.div>
  );
};

export default StepHeader;

import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface StepHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

const StepHeader = ({ title, subtitle, onBack }: StepHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative pt-4 pb-3"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
          <span>Back</span>
        </button>
      )}
      <h1 className="text-3xl font-display font-medium tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default StepHeader;

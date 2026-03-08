import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface StepHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  sticky?: boolean;
}

const StepHeader = ({ title, subtitle, onBack, sticky = false }: StepHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg pt-4 pb-3"
    >
      <div className="flex items-center justify-center relative">
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
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-xs mt-1 text-center">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default StepHeader;

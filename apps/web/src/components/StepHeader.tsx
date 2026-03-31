import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface StepHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  sticky?: boolean;
}

const StepHeader = ({ title, subtitle, onBack, sticky = false }: StepHeaderProps) => {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 w-full pt-6 pb-4 px-4 bg-background"
    >
      <div className="flex items-center justify-center relative max-w-md mx-auto">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-0 flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
            <span>{t('back')}</span>
          </button>
        )}
        <h1 className="text-lg font-display font-medium tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-xs mt-1 text-center max-w-md mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default StepHeader;

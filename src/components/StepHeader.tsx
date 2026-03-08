import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface StepHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Enable sticky header that fades/shrinks on scroll */
  sticky?: boolean;
}

const StepHeader = ({ title, subtitle, onBack, sticky = false }: StepHeaderProps) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!sticky) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  // Scroll-driven values (0→80px scroll range)
  const progress = sticky ? Math.min(scrollY / 80, 1) : 0;
  const titleScale = 1 - progress * 0.18; // 1 → 0.82
  const subtitleOpacity = 1 - progress * 1.5; // fades out faster
  const headerPadding = sticky ? `${16 - progress * 8}px` : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative pt-4 pb-3 ${sticky ? 'sticky top-0 z-20 bg-background/80 backdrop-blur-lg' : ''}`}
      style={sticky ? { paddingBottom: headerPadding } : undefined}
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
      <h1
        className="text-3xl font-display font-medium tracking-tight text-foreground origin-left transition-transform duration-100"
        style={sticky ? { transform: `scale(${titleScale})` } : undefined}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="text-muted-foreground text-sm mt-1 transition-opacity duration-100"
          style={sticky ? { opacity: Math.max(subtitleOpacity, 0) } : undefined}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default StepHeader;

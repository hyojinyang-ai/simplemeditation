import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface Props {
  pullDistance: number;
  refreshing: boolean;
  threshold: number;
}

const PullToRefresh = ({ pullDistance, refreshing, threshold }: Props) => {
  if (pullDistance <= 0 && !refreshing) return null;
  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <motion.div
      className="flex items-center justify-center py-2"
      style={{ height: pullDistance }}
      animate={refreshing ? { height: 40 } : {}}
    >
      <motion.div
        animate={refreshing ? { rotate: 360 } : { rotate: progress * 270 }}
        transition={refreshing ? { repeat: Infinity, duration: 0.6, ease: 'linear' } : { duration: 0 }}
      >
        <Loader2
          size={20}
          strokeWidth={1.5}
          className="text-muted-foreground"
          style={{ opacity: Math.max(progress, refreshing ? 1 : 0) }}
        />
      </motion.div>
    </motion.div>
  );
};

export default PullToRefresh;

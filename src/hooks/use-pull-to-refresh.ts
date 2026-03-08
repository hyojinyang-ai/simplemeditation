import { useRef, useState, useEffect, useCallback } from 'react';

export function usePullToRefresh(onRefresh?: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const threshold = 80;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const el = containerRef.current;
    if (el && el.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling) return;
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    // Dampen the pull
    setPullDistance(Math.min(delta * 0.45, 120));
  }, [pulling]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= threshold) {
      setRefreshing(true);
      // Simulate refresh
      setTimeout(() => {
        onRefresh?.();
        setRefreshing(false);
        setPullDistance(0);
        setPulling(false);
      }, 600);
    } else {
      setPullDistance(0);
      setPulling(false);
    }
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { containerRef, pullDistance, refreshing, threshold };
}

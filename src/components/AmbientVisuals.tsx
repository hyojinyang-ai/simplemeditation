import { motion } from 'framer-motion';
import { forwardRef, useMemo } from 'react';

/** Slow-moving ambient particles/orbs for the meditation screen */
const AmbientVisuals = forwardRef<HTMLDivElement>((_, ref) => {
  const orbs = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: 80 + Math.random() * 160,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 18 + Math.random() * 14,
      delay: i * 1.5,
      opacity: 0.04 + Math.random() * 0.06,
    })),
    []
  );

  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 3,
      startX: Math.random() * 100,
      startY: 90 + Math.random() * 20,
      duration: 12 + Math.random() * 10,
      delay: i * 2,
    })),
    []
  );

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Floating orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, hsl(var(--primary) / ${orb.opacity}) 0%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.15, 0.9, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}

      {/* Rising particles — tiny dots floating upward */}
      {particles.map((p) => (
        <motion.div
          key={`particle-${p.id}`}
          className="absolute rounded-full bg-primary/10"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.startX}%`,
            bottom: 0,
          }}
          animate={{
            y: [0, -(window.innerHeight * 1.2)],
            x: [0, (Math.random() - 0.5) * 60],
            opacity: [0, 0.3, 0.15, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeOut',
            delay: p.delay,
          }}
        />
      ))}

      {/* Gentle gradient wash that shifts slowly */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, hsl(var(--accent) / 0.05) 0%, transparent 60%)',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
});

AmbientVisuals.displayName = 'AmbientVisuals';

export default AmbientVisuals;

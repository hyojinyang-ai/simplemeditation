import { motion } from 'framer-motion';
import { forwardRef, useMemo } from 'react';
import type { AmbientSound } from '@/lib/ambient-engine';

type VisualTheme = 'aurora' | 'fireflies' | 'ripples';

const SOUND_TO_THEME: Record<AmbientSound, VisualTheme> = {
  'singing-bowl': 'aurora',
  'gong': 'aurora',
  'ambient-pad': 'aurora',
  'nature': 'fireflies',
  'rain': 'ripples',
  'ocean': 'ripples',
  'wind': 'aurora',
  'birds': 'fireflies',
  'fireplace': 'aurora',
};

// Color palettes per theme (HSL values for inline styles)
const THEME_COLORS: Record<VisualTheme, { primary: string; secondary: string; accent: string }> = {
  aurora: {
    primary: '160, 60%, 50%',
    secondary: '200, 70%, 55%',
    accent: '280, 50%, 60%',
  },
  fireflies: {
    primary: '50, 90%, 60%',
    secondary: '80, 60%, 45%',
    accent: '40, 80%, 55%',
  },
  ripples: {
    primary: '200, 60%, 50%',
    secondary: '220, 50%, 45%',
    accent: '180, 45%, 55%',
  },
};

/* ─── Aurora theme: sweeping curtains of light ─── */
const AuroraVisuals = ({ colors }: { colors: typeof THEME_COLORS.aurora }) => {
  const bands = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      width: 200 + Math.random() * 300,
      height: 120 + Math.random() * 80,
      x: -50 + Math.random() * 100,
      y: 5 + i * 18,
      duration: 16 + Math.random() * 12,
      delay: i * 2.5,
      color: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent,
      opacity: 0.06 + Math.random() * 0.06,
    })),
    [colors]
  );

  const shimmerDots = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 2,
      x: Math.random() * 100,
      y: Math.random() * 60,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 6,
    })),
    []
  );

  return (
    <>
      {bands.map((band) => (
        <motion.div
          key={`aurora-${band.id}`}
          className="absolute rounded-[50%]"
          style={{
            width: band.width,
            height: band.height,
            left: `${band.x}%`,
            top: `${band.y}%`,
            background: `radial-gradient(ellipse, hsla(${band.color}, ${band.opacity}) 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 80, -40, 60, 0],
            y: [0, -15, 10, -8, 0],
            scaleX: [1, 1.3, 0.9, 1.1, 1],
            opacity: [band.opacity, band.opacity * 1.5, band.opacity * 0.7, band.opacity * 1.2, band.opacity],
          }}
          transition={{
            duration: band.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: band.delay,
          }}
        />
      ))}
      {/* Tiny shimmer particles in the aurora */}
      {shimmerDots.map((dot) => (
        <motion.div
          key={`shimmer-${dot.id}`}
          className="absolute rounded-full"
          style={{
            width: dot.size,
            height: dot.size,
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            background: `hsla(${colors.secondary}, 0.5)`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: dot.delay,
          }}
        />
      ))}
    </>
  );
};

/* ─── Fireflies theme: warm glowing dots drifting lazily ─── */
const FireflyVisuals = ({ colors }: { colors: typeof THEME_COLORS.fireflies }) => {
  const flies = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      size: 3 + Math.random() * 5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      driftX: (Math.random() - 0.5) * 80,
      driftY: (Math.random() - 0.5) * 60,
      glowSize: 12 + Math.random() * 16,
      duration: 5 + Math.random() * 6,
      blinkDuration: 2 + Math.random() * 3,
      delay: Math.random() * 8,
      color: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.accent : colors.secondary,
    })),
    [colors]
  );

  return (
    <>
      {flies.map((fly) => (
        <motion.div
          key={`fly-${fly.id}`}
          className="absolute"
          style={{
            left: `${fly.x}%`,
            top: `${fly.y}%`,
          }}
          animate={{
            x: [0, fly.driftX * 0.5, fly.driftX, fly.driftX * 0.3, 0],
            y: [0, fly.driftY * 0.4, fly.driftY, fly.driftY * 0.6, 0],
          }}
          transition={{
            duration: fly.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: fly.delay,
          }}
        >
          {/* Glow halo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: fly.glowSize,
              height: fly.glowSize,
              top: -(fly.glowSize - fly.size) / 2,
              left: -(fly.glowSize - fly.size) / 2,
              background: `radial-gradient(circle, hsla(${fly.color}, 0.2) 0%, transparent 70%)`,
            }}
            animate={{ opacity: [0.1, 0.4, 0.1], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: fly.blinkDuration, repeat: Infinity, ease: 'easeInOut', delay: fly.delay * 0.5 }}
          />
          {/* Core dot */}
          <motion.div
            className="rounded-full"
            style={{
              width: fly.size,
              height: fly.size,
              background: `hsla(${fly.color}, 0.7)`,
              boxShadow: `0 0 ${fly.glowSize / 2}px hsla(${fly.color}, 0.3)`,
            }}
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: fly.blinkDuration, repeat: Infinity, ease: 'easeInOut', delay: fly.delay * 0.5 }}
          />
        </motion.div>
      ))}
    </>
  );
};

/* ─── Water ripples theme: concentric expanding circles ─── */
const RippleVisuals = ({ colors }: { colors: typeof THEME_COLORS.ripples }) => {
  const ripples = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 50,
      maxSize: 120 + Math.random() * 100,
      duration: 6 + Math.random() * 4,
      delay: i * 2.2,
      color: i % 2 === 0 ? colors.primary : colors.secondary,
    })),
    [colors]
  );

  const drops = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      size: 2 + Math.random() * 2,
      duration: 1.5 + Math.random() * 1,
      delay: i * 1.8 + Math.random() * 2,
      color: colors.accent,
    })),
    [colors]
  );

  return (
    <>
      {/* Expanding ripple rings */}
      {ripples.map((ripple) => (
        <motion.div
          key={`ripple-${ripple.id}`}
          className="absolute rounded-full"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            width: 4,
            height: 4,
            border: `1px solid hsla(${ripple.color}, 0.15)`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            width: [4, ripple.maxSize],
            height: [4, ripple.maxSize],
            opacity: [0.4, 0],
            marginLeft: [0, -ripple.maxSize / 2],
            marginTop: [0, -ripple.maxSize / 2],
          }}
          transition={{
            duration: ripple.duration,
            repeat: Infinity,
            ease: 'easeOut',
            delay: ripple.delay,
          }}
        />
      ))}

      {/* Falling rain drops — small vertical streaks */}
      {drops.map((drop) => (
        <motion.div
          key={`drop-${drop.id}`}
          className="absolute rounded-full"
          style={{
            left: `${drop.x}%`,
            top: 0,
            width: drop.size,
            height: drop.size * 3,
            background: `hsla(${drop.color}, 0.15)`,
            borderRadius: '50%',
          }}
          animate={{
            y: [0, window.innerHeight * 0.8],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            ease: 'easeIn',
            delay: drop.delay,
          }}
        />
      ))}

      {/* Subtle water surface gradient */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: `linear-gradient(to top, hsla(${colors.primary}, 0.04) 0%, transparent 100%)`,
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
};

/* ─── Main component ─── */
interface AmbientVisualsProps {
  sound?: AmbientSound;
}

const AmbientVisuals = forwardRef<HTMLDivElement, AmbientVisualsProps>(({ sound = 'ambient-pad' }, ref) => {
  const theme = SOUND_TO_THEME[sound];
  const colors = THEME_COLORS[theme];

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {theme === 'aurora' && <AuroraVisuals colors={colors} />}
      {theme === 'fireflies' && <FireflyVisuals colors={colors} />}
      {theme === 'ripples' && <RippleVisuals colors={colors} />}
    </div>
  );
});

AmbientVisuals.displayName = 'AmbientVisuals';

export default AmbientVisuals;

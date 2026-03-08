import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CheckCircle, ChevronLeft } from 'lucide-react';
import { ambientEngine, resolveSound, AmbientSound } from '@/lib/ambient-engine';
import { SoundType } from '@/lib/meditation-store';
import AmbientVisuals from './AmbientVisuals';

const BREATH_PHASES = [
  { label: 'Inhale', duration: 4000 },
  { label: 'Hold', duration: 2000 },
  { label: 'Exhale', duration: 4000 },
  { label: 'Hold', duration: 2000 },
] as const;

const TOTAL_CYCLE = BREATH_PHASES.reduce((s, p) => s + p.duration, 0); // 12s

interface MeditationPlayerProps {
  minutes: number;
  sound: SoundType;
  onComplete: () => void;
  onBack?: () => void;
}

const MeditationPlayer = ({ minutes, sound, onComplete, onBack }: MeditationPlayerProps) => {
  const totalSeconds = minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resolvedSound] = useState<AmbientSound>(() => resolveSound(sound));
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [breathPhase, setBreathPhase] = useState(0);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Breathing cycle controller
  useEffect(() => {
    if (!playing) {
      setBreathPhase(0);
      return;
    }
    let phase = 0;
    setBreathPhase(0);
    const tick = () => {
      phase = (phase + 1) % BREATH_PHASES.length;
      setBreathPhase(phase);
      breathTimerRef.current = setTimeout(tick, BREATH_PHASES[phase].duration);
    };
    breathTimerRef.current = setTimeout(tick, BREATH_PHASES[0].duration);
    return () => clearTimeout(breathTimerRef.current);
  }, [playing]);

  const playBell = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3);
    } catch {}
  }, []);

  useEffect(() => {
    if (playing) ambientEngine.start(resolvedSound);
    else ambientEngine.stop();
  }, [playing, resolvedSound]);

  useEffect(() => () => { ambientEngine.stop(); }, []);

  useEffect(() => {
    if (playing && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setPlaying(false);
            setCompleted(true);
            playBell();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, remaining, playBell]);

  useEffect(() => {
    if (completed) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [completed, onComplete]);

  const progress = 1 - remaining / totalSeconds;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <AnimatePresence mode="wait">
      {completed ? (
        <motion.div
          key="done"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4 py-12"
        >
          <CheckCircle size={48} strokeWidth={1.5} className="mx-auto text-accent" />
          <h2 className="text-2xl font-display font-medium text-foreground tracking-tight">Session Complete</h2>
        </motion.div>
      ) : (
        <motion.div
          key="player"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex flex-col items-center gap-10 pt-8"
        >
          {/* Ambient floating visuals behind the player */}
          {playing && <AmbientVisuals />}
          {/* Back button - only before playing */}
          {onBack && (
            <button onClick={onBack} className="self-start flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground/80 transition-colors">
              <ChevronLeft size={16} /> Change sound
            </button>
          )}
          {/* Pulsating circles + progress ring */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Pulsating rings synced to breathing cycle */}
            {playing && (
              <>
                <motion.div
                  key={`ring1-${breathPhase}`}
                  className="absolute inset-0 rounded-full border border-primary/10"
                  animate={
                    breathPhase === 0 || breathPhase === 2
                      ? { scale: [1, breathPhase === 0 ? 1.15 : 1, breathPhase === 2 ? 0.95 : 1], opacity: [0.3, 0.15, 0.3] }
                      : { scale: 1, opacity: 0.2 }
                  }
                  transition={{ duration: BREATH_PHASES[breathPhase].duration / 1000, ease: 'easeInOut' }}
                />
                <motion.div
                  key={`ring2-${breathPhase}`}
                  className="absolute inset-4 rounded-full border border-primary/15"
                  animate={
                    breathPhase === 0 || breathPhase === 2
                      ? { scale: [1, breathPhase === 0 ? 1.1 : 1, breathPhase === 2 ? 0.97 : 1], opacity: [0.2, 0.08, 0.2] }
                      : { scale: 1, opacity: 0.12 }
                  }
                  transition={{ duration: BREATH_PHASES[breathPhase].duration / 1000, ease: 'easeInOut', delay: 0.15 }}
                />
                <motion.div
                  key={`ring3-${breathPhase}`}
                  className="absolute inset-8 rounded-full border border-accent/10"
                  animate={
                    breathPhase === 0 || breathPhase === 2
                      ? { scale: [1, breathPhase === 0 ? 1.08 : 1, breathPhase === 2 ? 0.98 : 1], opacity: [0.25, 0.1, 0.25] }
                      : { scale: 1, opacity: 0.15 }
                  }
                  transition={{ duration: BREATH_PHASES[breathPhase].duration / 1000, ease: 'easeInOut', delay: 0.3 }}
                />
              </>
            )}

            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="115" fill="none" stroke="hsl(145 30% 42% / 0.08)" strokeWidth="2" />
              <circle
                cx="128" cy="128" r="115"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 115}
                strokeDashoffset={2 * Math.PI * 115 * (1 - progress)}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(145, 30%, 42%)" />
                  <stop offset="100%" stopColor="hsl(160, 25%, 55%)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Breathing orb */}
            <motion.div
              className="w-24 h-24 rounded-full gradient-calm opacity-20"
              animate={
                playing
                  ? { scale: breathPhase === 0 ? 1.2 : breathPhase === 2 ? 0.85 : 1 }
                  : { scale: 1 }
              }
              transition={{ duration: BREATH_PHASES[breathPhase]?.duration / 1000 || 1, ease: 'easeInOut' }}
            />

            {/* Timer text + breathing guide */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-display font-light tabular-nums tracking-tight text-foreground">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              {!playing && remaining === totalSeconds && (
                <span className="text-xs text-foreground/40 mt-2 tracking-wide">Tap play to begin</span>
              )}
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-sm text-foreground/60 mt-2 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Play/Pause */}
          <motion.button
            whileTap={{ scale: 0.85, transition: { type: 'spring', stiffness: 600, damping: 15 } }}
            onClick={() => setPlaying(!playing)}
            className="w-14 h-14 rounded-full gradient-calm flex items-center justify-center text-primary-foreground"
          >
            {playing ? <Pause size={20} strokeWidth={1.5} /> : <Play size={20} strokeWidth={1.5} className="ml-0.5" />}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MeditationPlayer;

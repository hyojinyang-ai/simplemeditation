import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { ambientEngine, resolveSound, AmbientSound } from '@/lib/ambient-engine';
import { SoundType } from '@/lib/meditation-store';

interface MeditationPlayerProps {
  minutes: number;
  sound: SoundType;
  onComplete: () => void;
}

const MeditationPlayer = ({ minutes, sound, onComplete }: MeditationPlayerProps) => {
  const totalSeconds = minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resolvedSound] = useState<AmbientSound>(() => resolveSound(sound));
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

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
          className="text-center space-y-3 py-12"
        >
          <span className="text-6xl">🧘</span>
          <h2 className="text-2xl font-display text-primary-foreground">Session Complete</h2>
        </motion.div>
      ) : (
        <motion.div
          key="player"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-8 pt-8"
        >
          {/* Breathing orb with gradient ring */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="115" fill="none" stroke="hsl(230 60% 56% / 0.15)" strokeWidth="4" />
              <circle
                cx="128" cy="128" r="115"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 115}
                strokeDashoffset={2 * Math.PI * 115 * (1 - progress)}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(220, 65%, 58%)" />
                  <stop offset="100%" stopColor="hsl(260, 45%, 65%)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Breathing orb */}
            <div className={`w-28 h-28 rounded-full gradient-calm opacity-30 ${playing ? 'animate-breathe' : ''}`} />

            {/* Timer text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-display tabular-nums tracking-tight text-primary-foreground">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              {!playing && remaining === totalSeconds && (
                <span className="text-xs text-primary-foreground/50 mt-2">Tap play to begin</span>
              )}
              {playing && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-xs text-primary-foreground/60 mt-2"
                >
                  Close your eyes & breathe
                </motion.span>
              )}
            </div>
          </div>

          {/* Play/Pause */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setPlaying(!playing)}
            className="w-16 h-16 rounded-full gradient-calm flex items-center justify-center text-primary-foreground shadow-glow"
          >
            {playing ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MeditationPlayer;

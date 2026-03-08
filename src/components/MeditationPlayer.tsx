import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface MeditationPlayerProps {
  minutes: number;
  onComplete: () => void;
}

const MeditationPlayer = ({ minutes, onComplete }: MeditationPlayerProps) => {
  const totalSeconds = minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const playBell = useCallback(() => {
    try {
      const ctx = new AudioContext();
      audioRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2);
    } catch {}
  }, []);

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
      const timer = setTimeout(onComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, [completed, onComplete]);

  const progress = 1 - remaining / totalSeconds;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const circumference = 2 * Math.PI * 120;

  const reset = () => {
    setPlaying(false);
    setRemaining(totalSeconds);
    setCompleted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-8"
    >
      <AnimatePresence mode="wait">
        {completed ? (
          <motion.div
            key="done"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-2"
          >
            <span className="text-6xl">🧘</span>
            <h2 className="text-2xl font-display">Namaste</h2>
            <p className="text-muted-foreground text-sm">Session complete</p>
          </motion.div>
        ) : (
          <motion.div key="timer" className="relative">
            <svg width="280" height="280" className="-rotate-90">
              <circle
                cx="140" cy="140" r="120"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="6"
              />
              <motion.circle
                cx="140" cy="140" r="120"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`w-16 h-16 rounded-full bg-primary/10 mb-4 ${playing ? 'animate-breathe' : ''}`} />
              <span className="text-5xl font-display tabular-nums">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!completed && (
        <div className="flex gap-4">
          <button
            onClick={() => setPlaying(!playing)}
            className="w-16 h-16 rounded-full gradient-calm flex items-center justify-center text-primary-foreground shadow-soft transition-transform hover:scale-105"
          >
            {playing ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <button
            onClick={reset}
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors self-center"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default MeditationPlayer;

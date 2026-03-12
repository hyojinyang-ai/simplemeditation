import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CheckCircle } from 'lucide-react';
import { ambientEngine, resolveSound, AmbientSound } from '@/lib/ambient-engine';
import { SoundType } from '@/lib/meditation-store';
import { trackSessionStart, trackSessionComplete, trackSessionAbandoned } from '@/lib/analytics';
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
  preMood?: string;
  postMood?: string;
}

const MeditationPlayer = ({ minutes, sound, onComplete, preMood, postMood }: MeditationPlayerProps) => {
  const totalSeconds = minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resolvedSound] = useState<AmbientSound>(() => resolveSound(sound));
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [breathPhase, setBreathPhase] = useState(0);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const sessionStartTracked = useRef(false);

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

  const playCompletionFeedback = useCallback(() => {
    // Vibration feedback
    try {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch {}

    // Chime sound — two harmonious tones
    try {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.35, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
      master.connect(ctx.destination);

      // First chime tone (C5)
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, ctx.currentTime);
      g1.gain.setValueAtTime(0.4, ctx.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      osc1.connect(g1);
      g1.connect(master);
      osc1.start();
      osc1.stop(ctx.currentTime + 3);

      // Second chime tone (E5) — delayed
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(660, ctx.currentTime + 0.6);
      g2.gain.setValueAtTime(0, ctx.currentTime);
      g2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.6);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
      osc2.connect(g2);
      g2.connect(master);
      osc2.start(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 4);
    } catch {}
  }, []);

  useEffect(() => {
    if (playing) {
      ambientEngine.start(resolvedSound);
      // Track session start only once
      if (!sessionStartTracked.current) {
        trackSessionStart(minutes, sound);
        sessionStartTracked.current = true;
      }
    } else {
      ambientEngine.stop();
    }
  }, [playing, resolvedSound, minutes, sound]);

  useEffect(() => {
    // Cleanup: track abandonment if session was started but not completed
    return () => {
      if (sessionStartTracked.current && !completed && remaining < totalSeconds) {
        trackSessionAbandoned(minutes, remaining, sound);
      }
      ambientEngine.stop();
    };
  }, [completed, remaining, totalSeconds, minutes, sound]);

  useEffect(() => {
    if (playing && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setPlaying(false);
            setCompleted(true);
            playCompletionFeedback();
            // Track session completion
            trackSessionComplete(minutes, sound, preMood || 'unknown', postMood);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, remaining, playCompletionFeedback]);

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
          className="relative flex flex-col items-center -mt-8 -mx-4 px-4 py-8 pb-24 bg-gradient-to-b from-white to-gray-50 overflow-y-auto"
          style={{ minHeight: 'calc(100vh - 140px)' }}
        >
          {/* Meditation Cat Image for specific sounds - at the top */}
          {resolvedSound === 'gong' && (
            <div className="w-full flex flex-col items-center flex-shrink-0 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full flex items-center justify-center h-[35vh]"
              >
                <img
                  src="/images/meditation-cat-gong.png"
                  alt="Meditation Cat with Gong"
                  className="h-full w-auto object-cover"
                />
              </motion.div>
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-foreground/70 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}
          {resolvedSound === 'singing-bowl' && (
            <div className="w-full flex flex-col items-center flex-shrink-0 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full flex items-center justify-center h-[35vh]"
              >
                <img
                  src="/images/meditation-cat-bowl.png"
                  alt="Meditation Cat with Bowl"
                  className="h-full w-auto object-cover"
                />
              </motion.div>
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-foreground/70 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}
          {resolvedSound === 'ambient-pad' && (
            <div className="w-full flex flex-col items-center flex-shrink-0 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full flex items-center justify-center h-[35vh]"
              >
                <img
                  src="/images/meditation-cat-space.png"
                  alt="Meditation Cat in Cosmic Space"
                  className="h-full w-auto object-cover"
                />
              </motion.div>
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-foreground/70 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}
          {resolvedSound === 'nature' && (
            <div className="w-full flex flex-col items-center flex-shrink-0 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full flex items-center justify-center h-[35vh]"
              >
                <img
                  src="/images/meditation-cat-nature.png"
                  alt="Meditation Cat in Nature"
                  className="h-full w-auto object-cover"
                />
              </motion.div>
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-foreground/70 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}
          {resolvedSound === 'rain' && (
            <div className="w-full flex flex-col items-center flex-shrink-0 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full flex items-center justify-center h-[35vh]"
              >
                <img
                  src="/images/meditation-cat-rain.png"
                  alt="Meditation Cat in Rain"
                  className="h-full w-auto object-cover"
                />
              </motion.div>
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-foreground/70 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}
          {resolvedSound === 'ocean' && (
            <div className="w-full flex flex-col items-center flex-shrink-0 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full flex items-center justify-center h-[35vh]"
              >
                <img
                  src="/images/meditation-cat-ocean.png"
                  alt="Meditation Cat by the Ocean"
                  className="h-full w-auto object-cover"
                />
              </motion.div>
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-foreground/70 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}
          {resolvedSound === 'wind' && (
            <div className="w-full flex flex-col items-center flex-shrink-0 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full flex items-center justify-center h-[35vh]"
              >
                <img
                  src="/images/meditation-cat-wind.png"
                  alt="Meditation Cat with Wind Chimes"
                  className="h-full w-auto object-cover"
                />
              </motion.div>
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-foreground/70 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}
          {resolvedSound === 'birds' && (
            <div className="w-full flex flex-col items-center flex-shrink-0 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full flex items-center justify-center h-[35vh]"
              >
                <img
                  src="/images/meditation-cat-birds.png"
                  alt="Meditation Cat with Birds"
                  className="h-full w-auto object-cover"
                />
              </motion.div>
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-foreground/70 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}
          {resolvedSound === 'fireplace' && (
            <div className="w-full flex flex-col items-center flex-shrink-0 mt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full flex items-center justify-center h-[35vh]"
              >
                <img
                  src="/images/meditation-cat-fireplace.png"
                  alt="Meditation Cat by the Fireplace"
                  className="h-full w-auto object-cover"
                />
              </motion.div>
              {playing && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-foreground/70 tracking-widest uppercase font-light"
                  >
                    {BREATH_PHASES[breathPhase].label}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Ambient floating visuals behind the player */}
          {playing && <AmbientVisuals sound={resolvedSound} />}

          {/* Timer and Play/Pause - stacked vertically */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 mt-8 mb-20 gap-3">
            <span className="text-3xl sm:text-4xl font-display font-light tabular-nums tracking-tight text-foreground">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            {!playing && remaining === totalSeconds && (
              <span className="text-xs text-foreground/40 tracking-wide">Tap play to begin</span>
            )}
            <motion.button
              whileTap={{ scale: 0.85, transition: { type: 'spring', stiffness: 600, damping: 15 } }}
              onClick={() => setPlaying(!playing)}
              className="w-14 h-14 rounded-full gradient-calm flex items-center justify-center text-primary-foreground flex-shrink-0 mt-1"
            >
              {playing ? <Pause size={20} strokeWidth={1.5} /> : <Play size={20} strokeWidth={1.5} className="ml-0.5" />}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MeditationPlayer;

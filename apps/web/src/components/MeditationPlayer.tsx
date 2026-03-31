import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CheckCircle } from 'lucide-react';
import { ambientEngine, resolveSound, AmbientSound } from '@/lib/ambient-engine';
import { SoundType, useMeditationStore } from '@/lib/meditation-store';
import { trackSessionStart, trackSessionComplete, trackSessionAbandoned } from '@/lib/analytics';
import AmbientVisuals from './AmbientVisuals';
import { useI18n } from '@/lib/i18n';

const BREATH_PHASES = [
  { key: 'inhale', duration: 4000 },
  { key: 'hold', duration: 2000 },
  { key: 'exhale', duration: 4000 },
  { key: 'hold', duration: 2000 },
] as const;

const TOTAL_CYCLE = BREATH_PHASES.reduce((s, p) => s + p.duration, 0); // 12s

interface MeditationPlayerProps {
  minutes: number;
  sound: SoundType;
  onComplete: () => void;
  onCountdownComplete?: () => void;
  preMood?: string;
  postMood?: string;
  autoPlay?: boolean;
}

const MeditationPlayer = ({
  minutes,
  sound,
  onComplete,
  onCountdownComplete,
  preMood,
  postMood,
  autoPlay = false,
}: MeditationPlayerProps) => {
  const { t } = useI18n();
  console.log(`[MeditationPlayer] Component render - sound: ${sound}, autoPlay: ${autoPlay}, minutes: ${minutes}`);

  const totalSeconds = minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [playing, setPlaying] = useState(() => {
    console.log(`[MeditationPlayer] Initializing playing state: ${autoPlay}`);
    return autoPlay;
  });
  const [completed, setCompleted] = useState(false);
  const [resolvedSound] = useState<AmbientSound>(() => {
    const resolved = resolveSound(sound);
    console.log(`[MeditationPlayer] Resolved sound: ${sound} -> ${resolved}`);
    return resolved;
  });
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [breathPhase, setBreathPhase] = useState(0);
  const breathTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const sessionStartTracked = useRef(false);
  const completedRef = useRef(false);
  const remainingRef = useRef(totalSeconds);
  const { setMeditating } = useMeditationStore();

  // Log when component mounts/unmounts
  useEffect(() => {
    console.log(`[MeditationPlayer] Component MOUNTED`);
    return () => {
      console.log(`[MeditationPlayer] Component UNMOUNTING`);
    };
  }, []);

  // Log prop changes
  useEffect(() => {
    console.log(`[MeditationPlayer] 📝 Props changed - minutes: ${minutes}, sound: ${sound}, autoPlay: ${autoPlay}`);
  }, [minutes, sound, autoPlay]);

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

  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

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
    console.log(`[MeditationPlayer] ⚡ useEffect RUNNING - playing: ${playing}, resolvedSound: ${resolvedSound}`);

    if (playing) {
      // Start audio engine
      try {
        console.log('[MeditationPlayer] 🎵 playing=true, calling ambientEngine.start()');
        ambientEngine.start(resolvedSound);
        setMeditating(true);
        // Track session start only once
        if (!sessionStartTracked.current) {
          trackSessionStart(minutes, sound);
          sessionStartTracked.current = true;
        }
      } catch (error) {
        console.error('[MeditationPlayer] Failed to start meditation audio:', error);
        // If autoplay fails, pause and let user manually start
        console.log('[MeditationPlayer] Setting playing to FALSE due to error');
        setPlaying(false);
      }
    } else {
      console.log('[MeditationPlayer] 🛑 playing=false, calling ambientEngine.stop()');
      ambientEngine.stop();
    }
  }, [playing, resolvedSound]);

  useEffect(() => {
    // Cleanup: only run on component unmount
    return () => {
      console.log('[MeditationPlayer] Cleanup on unmount');
      const wasAbandoned = sessionStartTracked.current && !completedRef.current;
      if (wasAbandoned && remainingRef.current < totalSeconds) {
        console.log('[MeditationPlayer] Tracking session abandonment');
        trackSessionAbandoned(minutes, remainingRef.current, sound);
      }
      ambientEngine.stop();
      setMeditating(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  useEffect(() => {
    if (playing && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            ambientEngine.stop();
            setMeditating(false);
            setPlaying(false);
            setCompleted(true);
            onCountdownComplete?.();
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
  }, [minutes, onCountdownComplete, playCompletionFeedback, playing, postMood, preMood, remaining, setMeditating, sound]);

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
          <h2 className="text-2xl font-display font-medium text-foreground tracking-tight">{t('session_complete')}</h2>
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
                    {t(BREATH_PHASES[breathPhase].key)}
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
                    {t(BREATH_PHASES[breathPhase].key)}
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
                    {t(BREATH_PHASES[breathPhase].key)}
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
                    {t(BREATH_PHASES[breathPhase].key)}
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
                    {t(BREATH_PHASES[breathPhase].key)}
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
                    {t(BREATH_PHASES[breathPhase].key)}
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
                    {t(BREATH_PHASES[breathPhase].key)}
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
                    {t(BREATH_PHASES[breathPhase].key)}
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
                    {t(BREATH_PHASES[breathPhase].key)}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Ambient floating visuals behind the player */}
          {playing && <AmbientVisuals sound={resolvedSound} />}

          {/* Timer - centered */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 mt-8 mb-20 gap-2">
            <span className="text-4xl sm:text-5xl font-display font-light tabular-nums tracking-tight text-foreground">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            {playing && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
                whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                onClick={() => setPlaying(false)}
                className="mt-2 px-5 py-2 rounded-full glass-button text-xs font-medium tracking-wide transition-all duration-200"
              >
                <Pause size={14} strokeWidth={1.5} className="inline mr-1.5" />
                {t('pause')}
              </motion.button>
            )}
            {!playing && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.92, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
                whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                onClick={() => {
                  // User interaction - safe to start audio
                  console.log('User clicked play - starting meditation');
                  setPlaying(true);
                }}
                className="mt-2 px-5 py-2 rounded-full glass-selected text-primary-foreground text-xs font-medium tracking-wide transition-all duration-200"
              >
                <Play size={14} strokeWidth={1.5} className="inline mr-1.5" />
                {remaining === totalSeconds ? t('begin') : t('resume')}
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MeditationPlayer;

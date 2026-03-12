import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import MoodCheck from '@/components/MoodCheck';
import SessionPicker from '@/components/SessionPicker';
import SoundPicker from '@/components/SoundPicker';
import MeditationPlayer from '@/components/MeditationPlayer';
import Reflection from '@/components/Reflection';
import StoicQuote from '@/components/StoicQuote';
import { PreMood, PostMood, SoundType, useMeditationStore, getRandomQuote } from '@/lib/meditation-store';
import { trackPageView, trackPreMoodSelection, trackPostMoodSelection, trackSoundChange, trackQuoteSaved } from '@/lib/analytics';

import StepHeader from '@/components/StepHeader';

type Step = 'mood' | 'session' | 'sound' | 'meditate' | 'reflect' | 'quote';


const Index = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const [step, setStep] = useState<Step>('mood');
  const [preMood, setPreMood] = useState<PreMood>();
  const [postMood, setPostMood] = useState<PostMood>();
  const [minutes, setMinutes] = useState<number>();
  const [sound, setSound] = useState<SoundType>();
  const [quote] = useState(() => getRandomQuote());
  const [saved, setSaved] = useState(false);
  const [lastEntryId, setLastEntryId] = useState<string>();
  const { addEntry, entries } = useMeditationStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isHome = step === 'mood' || step === 'quote';

  // Track page view on mount
  useEffect(() => {
    trackPageView('home');
  }, []);

  useEffect(() => {
    if (isHome && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [isHome]);

  const handleMoodSelect = (m: PreMood) => {
    setPreMood(m);
    trackPreMoodSelection(m);
    setTimeout(() => setStep('session'), 300);
  };

  const handleSessionSelect = (m: number) => {
    setMinutes(m);
    setTimeout(() => setStep('sound'), 300);
  };

  const handleSoundSelect = (s: SoundType) => {
    if (sound) {
      trackSoundChange(sound, s);
    }
    setSound(s);
    // Auto-start meditation
    setTimeout(() => setStep('meditate'), 300);
  };

  const handleMeditationComplete = useCallback(() => {
    setStep('reflect');
  }, []);

  const handleReflection = (mood: PostMood, note?: string) => {
    setPostMood(mood);
    if (preMood) {
      trackPostMoodSelection(mood, preMood);
    }
    if (preMood && minutes) {
      addEntry({ preMood, postMood: mood, note, sessionMinutes: minutes, sound });
      // Get the latest entry id
      const store = useMeditationStore.getState();
      setLastEntryId(store.entries[store.entries.length - 1]?.id);
    }
    setStep('quote');
  };

  const handleSaveQuote = () => {
    if (lastEntryId) {
      const store = useMeditationStore.getState();
      const updated = store.entries.map(e =>
        e.id === lastEntryId ? { ...e, savedQuote: quote } : e
      );
      localStorage.setItem('zen-mood-entries-v2', JSON.stringify(updated));
      useMeditationStore.setState({ entries: updated });
      setSaved(true);
      trackQuoteSaved(quote.author);
    }
  };

  const handleReset = useCallback(() => {
    setStep('mood');
    setPreMood(undefined);
    setPostMood(undefined);
    setMinutes(undefined);
    setSound(undefined);
    setSaved(false);
    setLastEntryId(undefined);
  }, []);

  // Reset to mood selection when navigating to home
  useEffect(() => {
    // Only reset if we're not already on the initial mood step
    if (step !== 'mood') {
      handleReset();
    }
  }, [pathname]); // Reset when route changes


  return (
    <div className="min-h-[100dvh] relative flex flex-col overflow-hidden">
      {/* Sticky Header */}
      {step === 'mood' && <StepHeader title="Stillness" subtitle="Begin your practice" sticky />}
      {step === 'session' && <StepHeader title="Meditation" subtitle="Choose your session" onBack={() => setStep('mood')} sticky />}
      {step === 'sound' && <StepHeader title="Meditation" subtitle="Pick a soundscape" onBack={() => setStep('session')} sticky />}
      {step === 'meditate' && <StepHeader title="Meditation" subtitle="Breathe deeply" sticky />}
      {step === 'reflect' && <StepHeader title="Reflection" subtitle="How do you feel now?" sticky />}
      {step === 'quote' && <StepHeader title="Stillness" subtitle="A thought to carry with you" sticky />}

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-28">
        <div className="w-full max-w-sm">
          {isHome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                opacity: { delay: 0.2, duration: 0.4 },
                scale: { delay: 0.2, type: 'spring', stiffness: 120 },
              }}
              className="w-52 h-52 mx-auto mt-2 mb-1 rounded-full overflow-hidden bg-background"
            >
              <video
                ref={videoRef}
                src="/videos/hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain scale-90 mix-blend-multiply"
              />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12, scale: 0.97, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, scale: 0.97, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 'mood' && <MoodCheck onSelect={handleMoodSelect} selected={preMood} />}
              {step === 'session' && <SessionPicker onSelect={handleSessionSelect} selected={minutes} />}
              {step === 'sound' && <SoundPicker onSelect={handleSoundSelect} selected={sound} />}
              {step === 'meditate' && minutes && sound && (
                <MeditationPlayer
                  minutes={minutes}
                  sound={sound}
                  onComplete={handleMeditationComplete}
                  preMood={preMood}
                  postMood={postMood}
                  autoPlay={true}
                />
              )}
              {step === 'reflect' && <Reflection onSubmit={handleReflection} />}
              {step === 'quote' && <StoicQuote quote={quote} onContinue={handleReset} onSave={handleSaveQuote} saved={saved} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoodCheck from '@/components/MoodCheck';
import SessionPicker from '@/components/SessionPicker';
import SoundPicker from '@/components/SoundPicker';
import MeditationPlayer from '@/components/MeditationPlayer';
import Reflection from '@/components/Reflection';
import StoicQuote from '@/components/StoicQuote';
import { PreMood, PostMood, SoundType, useMeditationStore, getRandomQuote } from '@/lib/meditation-store';
import heroImg from '@/assets/hero-nature.jpg';

type Step = 'mood' | 'session' | 'sound' | 'play' | 'reflect' | 'quote';

const Index = () => {
  const [step, setStep] = useState<Step>('mood');
  const [preMood, setPreMood] = useState<PreMood>();
  const [minutes, setMinutes] = useState<number>();
  const [sound, setSound] = useState<SoundType>();
  const [quote] = useState(() => getRandomQuote());
  const [saved, setSaved] = useState(false);
  const [lastEntryId, setLastEntryId] = useState<string>();
  const { addEntry, entries } = useMeditationStore();

  const handleMoodSelect = (m: PreMood) => {
    setPreMood(m);
    setTimeout(() => setStep('session'), 300);
  };

  const handleSessionSelect = (m: number) => {
    setMinutes(m);
    setTimeout(() => setStep('sound'), 300);
  };

  const handleSoundSelect = (s: SoundType) => {
    setSound(s);
    setTimeout(() => setStep('play'), 300);
  };

  const handleMeditationComplete = useCallback(() => {
    setStep('reflect');
  }, []);

  const handleReflection = (postMood: PostMood, note?: string) => {
    if (preMood && minutes) {
      addEntry({ preMood, postMood, note, sessionMinutes: minutes, sound });
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
    }
  };

  const handleReset = () => {
    setStep('mood');
    setPreMood(undefined);
    setMinutes(undefined);
    setSound(undefined);
    setSaved(false);
    setLastEntryId(undefined);
  };

  const isMeditating = step === 'play';
  const showHero = !isMeditating;
  const isHome = step === 'mood' || step === 'quote';

  return (
    <div className="min-h-[100dvh] relative flex flex-col items-center justify-center px-4 pb-16 overflow-hidden">
      {/* Background — hide hero image on home, show on other steps */}
      {!isHome && (
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className={`absolute inset-0 ${isMeditating ? 'gradient-meditation' : 'gradient-hero opacity-85'}`} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {showHero && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h1 className="text-3xl font-display font-medium tracking-tight text-foreground">
              Stillness
            </h1>
            <p className="text-muted-foreground text-xs mt-1 tracking-wide">Find your calm</p>
            {isHome && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  opacity: { delay: 0.2, duration: 0.4 },
                  scale: { delay: 0.2, type: 'spring', stiffness: 120 },
                }}
                className="w-52 h-52 mx-auto mt-4 mb-1 rounded-full overflow-hidden bg-background"
              >
                <video
                  src="/videos/hero.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain scale-90 mix-blend-multiply"
                />
              </motion.div>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 'mood' && <MoodCheck onSelect={handleMoodSelect} selected={preMood} />}
            {step === 'session' && <SessionPicker onSelect={handleSessionSelect} selected={minutes} onBack={() => setStep('mood')} />}
            {step === 'sound' && <SoundPicker onSelect={handleSoundSelect} selected={sound} onBack={() => setStep('session')} />}
            {step === 'play' && minutes && sound && (
              <MeditationPlayer minutes={minutes} sound={sound} onComplete={handleMeditationComplete} onBack={() => setStep('sound')} />
            )}
            {step === 'reflect' && <Reflection onSubmit={handleReflection} />}
            {step === 'quote' && <StoicQuote quote={quote} onContinue={handleReset} onSave={handleSaveQuote} saved={saved} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;

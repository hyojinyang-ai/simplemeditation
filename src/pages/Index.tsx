import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoodCheck from '@/components/MoodCheck';
import SessionPicker from '@/components/SessionPicker';
import SoundPicker from '@/components/SoundPicker';
import MeditationPlayer from '@/components/MeditationPlayer';
import Reflection from '@/components/Reflection';
import StoicQuote from '@/components/StoicQuote';
import { PreMood, PostMood, SoundType, useMeditationStore, getRandomQuote } from '@/lib/meditation-store';

type Step = 'mood' | 'session' | 'sound' | 'play' | 'reflect' | 'quote';

const Index = () => {
  const [step, setStep] = useState<Step>('mood');
  const [preMood, setPreMood] = useState<PreMood>();
  const [minutes, setMinutes] = useState<number>();
  const [sound, setSound] = useState<SoundType>();
  const [quote] = useState(() => getRandomQuote());
  const { addEntry } = useMeditationStore();

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
    }
    setStep('quote');
  };

  const handleReset = () => {
    setStep('mood');
    setPreMood(undefined);
    setMinutes(undefined);
    setSound(undefined);
  };

  const stepVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  // Calming gradient for meditation screen
  const isMeditating = step === 'play';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 pb-20 transition-all duration-1000 ${
      isMeditating
        ? 'bg-gradient-to-b from-[hsl(200,30%,15%)] via-[hsl(220,25%,12%)] to-[hsl(240,20%,10%)]'
        : 'gradient-hero'
    }`}>
      {!isMeditating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-display font-semibold tracking-tight">Stillness</h1>
          <p className="text-muted-foreground text-sm mt-1">Find your calm</p>
        </motion.div>
      )}

      <div className={`w-full max-w-sm ${isMeditating ? 'text-[hsl(40,30%,92%)]' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
            {step === 'mood' && <MoodCheck onSelect={handleMoodSelect} selected={preMood} />}
            {step === 'session' && <SessionPicker onSelect={handleSessionSelect} selected={minutes} />}
            {step === 'sound' && <SoundPicker onSelect={handleSoundSelect} selected={sound} />}
            {step === 'play' && minutes && sound && (
              <MeditationPlayer minutes={minutes} sound={sound} onComplete={handleMeditationComplete} />
            )}
            {step === 'reflect' && <Reflection onSubmit={handleReflection} />}
            {step === 'quote' && <StoicQuote quote={quote} onContinue={handleReset} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
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

  const isMeditating = step === 'play';
  const showHero = !isMeditating;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 pb-20 overflow-hidden">
      {/* Background layers */}
      {isMeditating ? (
        <div className="absolute inset-0 gradient-meditation" />
      ) : (
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 gradient-hero opacity-85" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {showHero && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            {(step === 'mood' || step === 'quote') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <Leaf size={32} strokeWidth={1.5} className="mx-auto text-accent animate-float" />
              </motion.div>
            )}
            <h1 className="text-4xl font-display font-medium tracking-tight text-foreground">
              Stillness
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5 tracking-wide">Find your calm</p>
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

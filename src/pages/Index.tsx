import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoodCheck from '@/components/MoodCheck';
import SessionPicker from '@/components/SessionPicker';
import MeditationPlayer from '@/components/MeditationPlayer';
import { Mood, useMeditationStore } from '@/lib/meditation-store';

type Step = 'mood' | 'session' | 'play' | 'done';

const Index = () => {
  const [step, setStep] = useState<Step>('mood');
  const [mood, setMood] = useState<Mood>();
  const [minutes, setMinutes] = useState<number>();
  const { addEntry } = useMeditationStore();

  const handleMoodSelect = (m: Mood) => {
    setMood(m);
    setTimeout(() => setStep('session'), 300);
  };

  const handleSessionSelect = (m: number) => {
    setMinutes(m);
    setTimeout(() => setStep('play'), 300);
  };

  const handleComplete = useCallback(() => {
    if (mood && minutes) {
      addEntry(mood, undefined, minutes);
    }
    setStep('done');
    setTimeout(() => {
      setStep('mood');
      setMood(undefined);
      setMinutes(undefined);
    }, 3000);
  }, [mood, minutes, addEntry]);

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-display font-semibold tracking-tight">Stillness</h1>
        <p className="text-muted-foreground text-sm mt-1">Find your calm</p>
      </motion.div>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 'mood' && (
            <motion.div key="mood" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <MoodCheck onSelect={handleMoodSelect} selected={mood} />
            </motion.div>
          )}
          {step === 'session' && (
            <motion.div key="session" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <SessionPicker onSelect={handleSessionSelect} selected={minutes} />
            </motion.div>
          )}
          {step === 'play' && minutes && (
            <motion.div key="play" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <MeditationPlayer minutes={minutes} onComplete={handleComplete} />
            </motion.div>
          )}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-3"
            >
              <span className="text-6xl">✨</span>
              <h2 className="text-2xl font-display">Well done</h2>
              <p className="text-muted-foreground text-sm">Your session has been logged</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;

import { motion } from 'framer-motion';
import { Zap, CircleDot, Waves, Target, Focus } from 'lucide-react';

interface SessionPickerProps {
  onSelect: (minutes: number) => void;
  selected?: number;
}

const sessions = [
  { minutes: 3, description: 'Quick reset', icon: Zap },
  { minutes: 5, description: 'Find center', icon: CircleDot },
  { minutes: 10, description: 'Deep calm', icon: Waves },
  { minutes: 30, description: 'Focus mode', icon: Target },
  { minutes: 45, description: 'Deep focus', icon: Focus },
];

const SessionPicker = ({ onSelect, selected }: SessionPickerProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Decorative video element */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          opacity: { delay: 0.1, duration: 0.4 },
          scale: { delay: 0.1, type: 'spring', stiffness: 120 },
        }}
        className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-background"
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

      {/* Session list */}
      <div className="flex flex-col gap-3">
      {sessions.map((session, i) => {
        const Icon = session.icon;
        return (
          <motion.button
            key={session.minutes}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
            whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
            onClick={() => onSelect(session.minutes)}
            className={`flex flex-row items-center gap-4 p-4 rounded-2xl transition-all duration-200 ease-out ${
              selected === session.minutes
                ? 'glass-selected text-primary-foreground scale-[1.02]'
                : 'glass-button'
            }`}
          >
            <Icon size={28} strokeWidth={1.5} className="flex-shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1 text-left">
              <span className={`text-base font-display font-medium tracking-tight ${
                selected === session.minutes ? 'text-primary-foreground' : 'text-foreground'
              }`}>
                {session.description}
              </span>
              <span className={`text-xs ${
                selected === session.minutes ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {session.minutes} min
              </span>
            </div>
          </motion.button>
        );
      })}
      </div>
    </div>
  );
};

export default SessionPicker;

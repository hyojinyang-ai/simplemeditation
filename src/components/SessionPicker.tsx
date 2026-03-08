import { motion } from 'framer-motion';
import { Clock, ChevronLeft } from 'lucide-react';

interface SessionPickerProps {
  onSelect: (minutes: number) => void;
  selected?: number;
}

const sessions = [
  { minutes: 3, label: '3 min', description: 'Quick reset' },
  { minutes: 5, label: '5 min', description: 'Find center' },
  { minutes: 10, label: '10 min', description: 'Deep calm' },
];

const SessionPicker = ({ onSelect, selected }: SessionPickerProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-display font-medium tracking-tight">Choose your session</h2>
        <p className="text-muted-foreground text-sm">Short sessions, big impact</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {sessions.map((session, i) => (
          <motion.button
            key={session.minutes}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
            onClick={() => onSelect(session.minutes)}
            className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl transition-all duration-200 ${
              selected === session.minutes
                ? 'gradient-calm text-primary-foreground shadow-soft scale-105'
                : 'glass-strong hover:bg-muted/50 hover:scale-[1.02]'
            }`}
          >
            <Clock size={20} strokeWidth={1.5} />
            <span className="text-lg font-display font-medium">{session.label}</span>
            <span className={`text-[11px] ${selected === session.minutes ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {session.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SessionPicker;

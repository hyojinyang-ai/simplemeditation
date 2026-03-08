import { motion } from 'framer-motion';

interface SessionPickerProps {
  onSelect: (minutes: number) => void;
  selected?: number;
}

const sessions = [
  { minutes: 3, label: '3 min', description: 'Quick reset', icon: '🌱' },
  { minutes: 5, label: '5 min', description: 'Find your center', icon: '🌿' },
  { minutes: 10, label: '10 min', description: 'Deep calm', icon: '🌳' },
];

const SessionPicker = ({ onSelect, selected }: SessionPickerProps) => {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-display">Choose your session</h2>
        <p className="text-muted-foreground text-sm">Short sessions, big impact</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {sessions.map((session, i) => (
          <motion.button
            key={session.minutes}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(session.minutes)}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl transition-all duration-200 ${
              selected === session.minutes
                ? 'gradient-calm text-primary-foreground shadow-glow scale-105'
                : 'glass-strong hover:shadow-soft hover:scale-[1.03]'
            }`}
          >
            <span className="text-3xl">{session.icon}</span>
            <span className="text-lg font-semibold">{session.label}</span>
            <span className={`text-xs ${selected === session.minutes ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {session.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SessionPicker;

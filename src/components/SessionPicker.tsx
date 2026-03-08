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
    <div className="space-y-4">
      <h2 className="text-2xl font-display text-center">Choose your session</h2>
      <div className="grid grid-cols-3 gap-3">
        {sessions.map((session, i) => (
          <motion.button
            key={session.minutes}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(session.minutes)}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl transition-all duration-200 shadow-card ${
              selected === session.minutes
                ? 'bg-primary text-primary-foreground shadow-soft scale-105'
                : 'bg-card hover:shadow-soft'
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

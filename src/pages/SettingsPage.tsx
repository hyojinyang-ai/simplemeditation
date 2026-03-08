import { useTheme } from 'next-themes';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-[100dvh] px-4 pt-12 pb-24">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <h1 className="text-2xl font-display font-semibold text-foreground">Settings</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Appearance */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-medium text-foreground mb-4">Appearance</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Sun size={22} strokeWidth={1.5} />
                <span className="text-xs font-medium">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Moon size={22} strokeWidth={1.5} />
                <span className="text-xs font-medium">Dark</span>
              </button>
            </div>
          </div>

          {/* About */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-medium text-foreground mb-2">About</h2>
            <p className="text-xs text-muted-foreground">Stillness — a mindful meditation companion.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;

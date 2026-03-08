import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, History, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const BottomNav = () => {
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();

  const links = [
    { to: '/', icon: Home, label: 'Meditate' },
    { to: '/tracker', icon: History, label: 'Journal' },
    { to: '/analytics', icon: BarChart3, label: 'Insights' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong z-50 border-t border-border/30">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
              pathname === to ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          <span className="text-[10px] font-medium">{theme === 'dark' ? 'Light' : 'Night'}</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;

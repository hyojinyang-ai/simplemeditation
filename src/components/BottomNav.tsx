import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, History, Settings } from 'lucide-react';

const BottomNav = () => {
  const { pathname } = useLocation();

  const links = [
    { to: '/', icon: Home, label: 'Meditate' },
    { to: '/tracker', icon: History, label: 'Journal' },
    { to: '/analytics', icon: BarChart3, label: 'Insights' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong z-50 border-t border-border/30">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-300 ease-out ${
              pathname === to ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground hover:scale-110 hover:bg-muted/30'
            }`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
      <p className="text-center text-[8px] text-muted-foreground/40 pb-1">
        Sounds by <a href="https://www.freesoundslibrary.com" target="_blank" rel="noopener noreferrer" className="underline">Free Sound Library</a> · CC BY 4.0
      </p>
    </nav>
  );
};

export default BottomNav;

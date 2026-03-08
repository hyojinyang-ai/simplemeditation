import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, History } from 'lucide-react';

const BottomNav = () => {
  const { pathname } = useLocation();

  const links = [
    { to: '/', icon: Home, label: 'Meditate' },
    { to: '/tracker', icon: History, label: 'Tracker' },
    { to: '/analytics', icon: BarChart3, label: 'Insights' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
              pathname === to ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;

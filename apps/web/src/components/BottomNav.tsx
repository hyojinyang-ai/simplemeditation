import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, History, Settings } from 'lucide-react';
import { useMeditationStore } from '@/lib/meditation-store';
import { ambientEngine } from '@/lib/ambient-engine';
import { HOME_RESET_EVENT } from '@/lib/navigation-events';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isMeditating, setMeditating } = useMeditationStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/tracker', icon: History, label: 'Journal' },
    { to: '/analytics', icon: BarChart3, label: 'Insights' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavClick = (to: string, e: React.MouseEvent) => {
    // If navigating to Home while meditating, confirm first (regardless of current page)
    if (to === '/' && isMeditating) {
      e.preventDefault();
      setShowConfirm(true);
      return;
    }

    if (to === '/' && pathname === '/') {
      e.preventDefault();
      window.dispatchEvent(new Event(HOME_RESET_EVENT));
    }
  };

  const handleConfirmStop = () => {
    ambientEngine.stop();
    setMeditating(false);
    setShowConfirm(false);
    navigate('/');
  };

  return (
    <>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="glass-strong border-white/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Stop meditation?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Your meditation session is still in progress. Are you sure you want to stop and return home?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button">Continue meditating</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStop} className="glass-selected text-primary-foreground">
              Stop session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <nav className="fixed bottom-0 left-0 right-0 glass-strong z-50 border-t border-border/30">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={(e) => handleNavClick(to, e)}
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
    </>
  );
};

export default BottomNav;

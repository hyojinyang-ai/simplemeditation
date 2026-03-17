import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StepHeader from '@/components/StepHeader';
import { trackPageView } from '@/lib/analytics';
import { usePageMeta } from '@/hooks/use-page-meta';

const SettingsPage = () => {
  usePageMeta({
    title: 'Settings — Stillness',
    description: 'Customize your meditation experience and app preferences in Stillness.',
  });

  useEffect(() => {
    trackPageView('settings');
  }, []);
  return (
    <div className="min-h-[100dvh] pb-24">
      <StepHeader title="Settings" subtitle="Customize your experience" sticky />

      <div className="px-4 max-w-md mx-auto mt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* About */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-medium text-foreground mb-2">About</h2>
            <p className="text-xs text-muted-foreground">Stillness — a mindful meditation companion.</p>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-foreground">Product</h2>
            <p className="text-xs text-muted-foreground">
              This version stores meditation history locally in your browser and does not yet support account sync across devices.
            </p>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-foreground">Legal & Support</h2>
            <div className="flex flex-col divide-y divide-border/40">
              <Link to="/privacy" className="py-2 text-sm text-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="py-2 text-sm text-foreground hover:text-primary transition-colors">Terms of Use</Link>
              <Link to="/support" className="py-2 text-sm text-foreground hover:text-primary transition-colors">Support</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;

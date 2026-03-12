import { useEffect } from 'react';
import { motion } from 'framer-motion';
import StepHeader from '@/components/StepHeader';
import { trackPageView } from '@/lib/analytics';

const SettingsPage = () => {
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
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;

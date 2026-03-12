import { useEffect } from 'react';
import Analytics from '@/components/Analytics';
import { trackPageView } from '@/lib/analytics';

const AnalyticsPage = () => {
  useEffect(() => {
    trackPageView('analytics');
  }, []);

  return <Analytics />;
};

export default AnalyticsPage;

import { useEffect } from 'react';
import Analytics from '@/components/Analytics';
import { trackPageView } from '@/lib/analytics';
import { usePageMeta } from '@/hooks/use-page-meta';

const AnalyticsPage = () => {
  usePageMeta({
    title: 'Analytics — Stillness',
    description: 'Explore your meditation progress, session patterns, and mood trends over time.',
  });

  useEffect(() => {
    trackPageView('analytics');
  }, []);

  return <Analytics />;
};

export default AnalyticsPage;

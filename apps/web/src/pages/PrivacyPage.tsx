import StepHeader from '@/components/StepHeader';
import { usePageMeta } from '@/hooks/use-page-meta';

const PrivacyPage = () => {
  usePageMeta({
    title: 'Privacy Policy — Stillness',
    description: 'Read how Stillness handles browser-stored meditation data and lightweight product analytics.',
  });

  return (
    <div className="min-h-[100dvh] pb-24">
      <StepHeader title="Privacy Policy" subtitle="How Stillness handles data" sticky />

      <div className="px-4 max-w-2xl mx-auto mt-4 space-y-4">
        <section className="glass rounded-2xl p-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Effective date: March 17, 2026
          </p>
          <p className="text-sm leading-6 text-foreground/90">
            Stillness is designed to store your meditation history locally in your browser. We aim to collect as little personal information as possible while still understanding overall product usage.
          </p>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">What data the app stores</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Meditation session history, mood check-ins, notes, and saved quotes are stored in your browser using local storage under the key <code>zen-mood-entries-v2</code>.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            This data stays on the device and browser you use. If you clear browser storage, reinstall the browser, or switch devices, that data may be lost.
          </p>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">Analytics</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Stillness uses Vercel Analytics to understand aggregate product activity, such as page views, meditation session starts and completions, and feature usage. This helps improve the experience and prioritize product work.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            We do not currently provide user accounts, personalized advertising, or cloud-based profile tracking.
          </p>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">Third-party services</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Stillness is hosted on Vercel. Audio assets and static media are served with the application bundle. External links may direct you to other services that have their own privacy practices.
          </p>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">Contact</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            For privacy-related questions, use the support page linked in settings or open an issue in the project repository.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;

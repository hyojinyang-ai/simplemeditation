import StepHeader from '@/components/StepHeader';
import { usePageMeta } from '@/hooks/use-page-meta';

const TermsPage = () => {
  usePageMeta({
    title: 'Terms of Use — Stillness',
    description: 'Review the basic terms for using the Stillness meditation app.',
  });

  return (
    <div className="min-h-[100dvh] pb-24">
      <StepHeader title="Terms of Use" subtitle="Simple terms for using Stillness" sticky />

      <div className="px-4 max-w-2xl mx-auto mt-4 space-y-4">
        <section className="glass rounded-2xl p-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Effective date: March 17, 2026
          </p>
          <p className="text-sm leading-6 text-foreground/90">
            By using Stillness, you agree to use the app responsibly and in compliance with applicable law.
          </p>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">Wellness, not medical advice</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Stillness is a wellness product and is not a medical device or healthcare service. It does not provide medical advice, diagnosis, or treatment.
          </p>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">Availability</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            We may update, improve, suspend, or remove features at any time. Because this version stores data locally, we are not responsible for data loss caused by browser resets, device changes, or local storage clearing.
          </p>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">Acceptable use</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            You may not misuse the service, interfere with its operation, attempt unauthorized access, or use the app in ways that damage the product or other users.
          </p>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">Contact</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            If you have questions about these terms, use the support page linked in settings.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;

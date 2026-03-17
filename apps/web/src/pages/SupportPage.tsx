import StepHeader from '@/components/StepHeader';
import { usePageMeta } from '@/hooks/use-page-meta';

const repoUrl = 'https://github.com/hyojinyang-ai/simplemeditation';
const issuesUrl = `${repoUrl}/issues`;

const SupportPage = () => {
  usePageMeta({
    title: 'Support — Stillness',
    description: 'Get help, report issues, and find the best place to contact the Stillness project.',
  });

  return (
    <div className="min-h-[100dvh] pb-24">
      <StepHeader title="Support" subtitle="Help, bug reports, and feedback" sticky />

      <div className="px-4 max-w-2xl mx-auto mt-4 space-y-4">
        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">Need help?</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Stillness is currently maintained as a lightweight web product. The fastest support channel is the GitHub repository linked below.
          </p>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">Best ways to reach us</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Bug reports and feature requests:
          </p>
          <a
            href={issuesUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Open GitHub Issues
          </a>
          <p className="text-sm leading-6 text-muted-foreground">
            Project repository:
          </p>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline underline-offset-4"
          >
            {repoUrl}
          </a>
        </section>

        <section className="glass rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-foreground">What to include in a report</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Include your device, browser, the page where the problem happened, and whether audio was playing. Screenshots and exact reproduction steps help a lot.
          </p>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;

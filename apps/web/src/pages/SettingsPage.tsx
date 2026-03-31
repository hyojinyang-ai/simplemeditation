import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StepHeader from '@/components/StepHeader';
import { trackPageView } from '@/lib/analytics';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/components/ui/sonner';
import { useI18n, type Locale } from '@/lib/i18n';

const SettingsPage = () => {
  usePageMeta({
    title: 'Settings — Stillness',
    description: 'Customize your meditation experience and app preferences in Stillness.',
  });

  useEffect(() => {
    trackPageView('settings');
  }, []);

  const { t, locale, setLocale } = useI18n();
  const { isConfigured, isAuthenticated, loading, syncStatus, user, signInWithEmail, signOut, syncNow } = useAuth();
  const [email, setEmail] = useState('');

  const handleEmailSignIn = async () => {
    if (!email.trim()) {
      toast(t('enter_email'), {
        description: t('enter_email_desc'),
      });
      return;
    }

    try {
      await signInWithEmail(email.trim());
      toast(t('check_email'), {
        description: t('check_email_desc'),
      });
    } catch (error) {
      toast(t('sign_in_failed'), {
        description: error instanceof Error ? error.message : t('sign_in_failed_desc'),
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast(t('signed_out'), {
        description: t('signed_out_desc'),
      });
    } catch (error) {
      toast(t('could_not_sign_out'), {
        description: error instanceof Error ? error.message : t('try_again'),
      });
    }
  };

  const languages: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'ko', label: '한국어' },
  ];

  return (
    <div className="min-h-[100dvh] pb-24">
      <StepHeader title={t('settings')} subtitle={t('customize_experience')} sticky />

      <div className="px-4 max-w-md mx-auto mt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Language */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-foreground">{t('language')}</h2>
              <p className="text-xs text-muted-foreground">{t('language_desc')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLocale(lang.value)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                    locale === lang.value
                      ? 'glass-selected text-primary-foreground'
                      : 'glass-button'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-medium text-foreground mb-2">{t('about')}</h2>
            <p className="text-xs text-muted-foreground">{t('about_desc')}</p>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-foreground">{t('product')}</h2>
            <p className="text-xs text-muted-foreground">
              {t('product_desc')}
            </p>
          </div>

          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-foreground">{t('cloud_sync')}</h2>
              <p className="text-xs text-muted-foreground">
                {t('cloud_sync_desc')}
              </p>
            </div>

            {!isConfigured && (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">{t('sync_setup_needed')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('sync_setup_desc')}
                </p>
              </div>
            )}

            {isConfigured && !isAuthenticated && (
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('email_placeholder')}
                  className="w-full rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
                <button
                  onClick={handleEmailSignIn}
                  disabled={loading || syncStatus === 'authenticating'}
                  className="w-full rounded-2xl glass-selected px-4 py-3 text-sm font-medium text-primary-foreground transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {syncStatus === 'authenticating' ? t('sending_magic_link') : t('sign_in_email')}
                </button>
              </div>
            )}

            {isConfigured && isAuthenticated && (
              <div className="space-y-3">
                <div className="rounded-2xl bg-muted/30 p-4 space-y-1">
                  <p className="text-sm font-medium text-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('sync_status_label')}: {syncStatus === 'synced' ? t('up_to_date') : syncStatus}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => void syncNow()}
                    className="rounded-2xl glass-button px-4 py-3 text-sm font-medium transition-all"
                  >
                    {t('sync_now')}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="rounded-2xl glass-button px-4 py-3 text-sm font-medium transition-all"
                  >
                    {t('sign_out')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-foreground">{t('legal_support')}</h2>
            <div className="flex flex-col divide-y divide-border/40">
              <Link to="/privacy" className="py-2 text-sm text-foreground hover:text-primary transition-colors">{t('privacy_policy')}</Link>
              <Link to="/terms" className="py-2 text-sm text-foreground hover:text-primary transition-colors">{t('terms_of_use')}</Link>
              <Link to="/support" className="py-2 text-sm text-foreground hover:text-primary transition-colors">{t('support')}</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;

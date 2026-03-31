import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'ko';

const STORAGE_KEY = 'stillness-locale';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // StepHeader
    back: 'Back',

    // Home / MoodCheck
    stillness: 'Stillness',
    begin_practice: 'Begin your practice',
    how_feeling: 'How are you feeling?',
    check_in: 'Check in with yourself',

    // SessionPicker
    meditation: 'Meditation',
    choose_session: 'Choose your session',
    quick_reset: 'Quick reset',
    find_center: 'Find center',
    deep_calm: 'Deep calm',
    focus_mode: 'Focus mode',
    deep_focus: 'Deep focus',
    min: 'min',

    // SoundPicker
    pick_soundscape: 'Pick a soundscape',

    // MeditationPlayer
    breathe_deeply: 'Breathe deeply',
    inhale: 'Inhale',
    hold: 'Hold',
    exhale: 'Exhale',
    session_complete: 'Session Complete',
    pause: 'Pause',
    begin: 'Begin',
    resume: 'Resume',

    // Reflection
    reflection: 'Reflection',
    how_feel_now: 'How do you feel now?',
    notice_shifts: 'Notice any shifts',
    add_note: 'Add a note about your session\u2026 (optional)',
    save_continue: 'Save & Continue',

    // StoicQuote
    thought_carry: 'A thought to carry with you',
    saved: 'Saved',
    save_quote: 'Save quote',
    quote_saved: 'Quote saved',
    view_journal: 'View journal',
    view_insights: 'View insights',
    go_home: 'Go home',

    // BottomNav
    home: 'Home',
    journal: 'Journal',
    insights: 'Insights',
    settings: 'Settings',
    stop_meditation: 'Stop meditation?',
    meditation_in_progress: 'Your meditation session is still in progress. Are you sure you want to stop and return home?',
    continue_meditating: 'Continue meditating',
    stop_session: 'Stop session',

    // TrackerPage
    your_meditation_journey: 'Your meditation journey',
    sessions: 'Sessions',
    saved_quotes: 'Saved Quotes',
    no_sessions_yet: 'No sessions yet. Complete a meditation to start tracking.',
    no_saved_quotes: 'No saved quotes yet. Save a quote after your next session.',

    // Analytics
    your_mindfulness_journey: 'Your mindfulness journey',
    minutes: 'Minutes',
    streak: 'Streak',
    entries: 'Entries',
    daily_sessions: 'Daily Sessions',
    minutes_meditated: 'Minutes Meditated',
    mood_trend: 'Mood Trend',
    pre_session_avg: 'Pre-session average (1\u20135)',
    before: 'Before',
    after: 'After',
    complete_for_insights: 'Complete sessions to see insights here.',

    // Settings
    customize_experience: 'Customize your experience',
    about: 'About',
    about_desc: 'Stillness \u2014 a mindful meditation companion.',
    product: 'Product',
    product_desc: 'Stillness stores meditation history locally by default. Sign in below to sync your journal across desktop and mobile.',
    cloud_sync: 'Cloud Sync',
    cloud_sync_desc: 'Use passwordless email login to carry your meditation history across devices.',
    sync_setup_needed: 'Sync setup needed',
    sync_setup_desc: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable account sync.',
    email_placeholder: 'you@example.com',
    sending_magic_link: 'Sending magic link...',
    sign_in_email: 'Sign in with email',
    sync_status_label: 'Sync status',
    up_to_date: 'Up to date',
    sync_now: 'Sync now',
    sign_out: 'Sign out',
    legal_support: 'Legal & Support',
    privacy_policy: 'Privacy Policy',
    terms_of_use: 'Terms of Use',
    support: 'Support',
    language: 'Language',
    language_desc: 'Choose your preferred language.',

    // Toast messages
    enter_email: 'Enter your email',
    enter_email_desc: 'We will send you a magic link so you can continue across devices.',
    check_email: 'Check your email',
    check_email_desc: 'Open the magic link on this device to connect your meditation history.',
    sign_in_failed: 'Sign-in failed',
    sign_in_failed_desc: 'We could not send the magic link.',
    signed_out: 'Signed out',
    signed_out_desc: 'This device will keep its local history, but cloud sync is now paused.',
    could_not_sign_out: 'Could not sign out',
    try_again: 'Please try again.',

    // Loading
    preparing: 'Preparing your meditation space...',

    // Mood labels
    'mood.stressed': 'Stressed',
    'mood.tired': 'Tired',
    'mood.neutral': 'Neutral',
    'mood.anxious': 'Anxious',
    'mood.calm': 'Calm',
    'mood.relieved': 'Relieved',
    'mood.peaceful': 'Peaceful',
    'mood.grateful': 'Grateful',
    'mood.refreshed': 'Refreshed',

    // Sound labels
    'sound.singing-bowl': 'Singing Bowl',
    'sound.gong': 'Gong',
    'sound.ambient-pad': 'Ambient Pad',
    'sound.nature': 'Nature',
    'sound.rain': 'Rain',
    'sound.ocean': 'Ocean',
    'sound.wind': 'Wind Chimes',
    'sound.birds': 'Birds',
    'sound.fireplace': 'Fireplace',
    'sound.random': 'Surprise Me',
  },
  ko: {
    back: '\uB4A4\uB85C',

    stillness: 'Stillness',
    begin_practice: '\uBA85\uC0C1\uC744 \uC2DC\uC791\uD558\uC138\uC694',
    how_feeling: '\uC9C0\uAE08 \uAE30\uBD84\uC774 \uC5B4\uB5A0\uC138\uC694?',
    check_in: '\uC790\uC2E0\uC744 \uB3CC\uC544\uBCF4\uC138\uC694',

    meditation: '\uBA85\uC0C1',
    choose_session: '\uC138\uC158\uC744 \uC120\uD0DD\uD558\uC138\uC694',
    quick_reset: '\uBE60\uB978 \uB9AC\uC14B',
    find_center: '\uB9C8\uC74C \uC7A1\uAE30',
    deep_calm: '\uAE4A\uC740 \uD3C9\uC628',
    focus_mode: '\uC9D1\uC911 \uBAA8\uB4DC',
    deep_focus: '\uAE4A\uC740 \uC9D1\uC911',
    min: '\uBD84',

    pick_soundscape: '\uBC30\uACBD \uC74C\uC545\uC744 \uC120\uD0DD\uD558\uC138\uC694',

    breathe_deeply: '\uAE4A\uAC8C \uD638\uD761\uD558\uC138\uC694',
    inhale: '\uB4E4\uC774\uC26C\uAE30',
    hold: '\uBA48\uCD94\uAE30',
    exhale: '\uB0B4\uC26C\uAE30',
    session_complete: '\uC138\uC158 \uC644\uB8CC',
    pause: '\uC77C\uC2DC\uC815\uC9C0',
    begin: '\uC2DC\uC791',
    resume: '\uACC4\uC18D\uD558\uAE30',

    reflection: '\uB3CC\uC544\uBCF4\uAE30',
    how_feel_now: '\uC9C0\uAE08 \uAE30\uBD84\uC774 \uC5B4\uB5A0\uC138\uC694?',
    notice_shifts: '\uBCC0\uD654\uB97C \uB290\uAEF4\uBCF4\uC138\uC694',
    add_note: '\uC138\uC158\uC5D0 \uB300\uD55C \uBA54\uBAA8\uB97C \uB0A8\uACA8\uBCF4\uC138\uC694\u2026 (\uC120\uD0DD\uC0AC\uD56D)',
    save_continue: '\uC800\uC7A5 \uD6C4 \uACC4\uC18D\uD558\uAE30',

    thought_carry: '\uC624\uB298\uC758 \uBA85\uC5B8',
    saved: '\uC800\uC7A5\uB428',
    save_quote: '\uBA85\uC5B8 \uC800\uC7A5',
    quote_saved: '\uBA85\uC5B8 \uC800\uC7A5\uB428',
    view_journal: '\uC77C\uC9C0 \uBCF4\uAE30',
    view_insights: '\uBD84\uC11D \uBCF4\uAE30',
    go_home: '\uD648\uC73C\uB85C',

    home: '\uD648',
    journal: '\uC77C\uC9C0',
    insights: '\uBD84\uC11D',
    settings: '\uC124\uC815',
    stop_meditation: '\uBA85\uC0C1\uC744 \uBA48\uCD9C\uAE4C\uC694?',
    meditation_in_progress: '\uBA85\uC0C1 \uC138\uC158\uC774 \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4. \uBA48\uCD94\uACE0 \uD648\uC73C\uB85C \uB3CC\uC544\uAC00\uC2DC\uACA0\uC5B4\uC694?',
    continue_meditating: '\uBA85\uC0C1 \uACC4\uC18D\uD558\uAE30',
    stop_session: '\uC138\uC158 \uBA48\uCD94\uAE30',

    your_meditation_journey: '\uB098\uC758 \uBA85\uC0C1 \uC5EC\uC815',
    sessions: '\uC138\uC158',
    saved_quotes: '\uC800\uC7A5\uB41C \uBA85\uC5B8',
    no_sessions_yet: '\uC544\uC9C1 \uC138\uC158\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uBA85\uC0C1\uC744 \uC644\uB8CC\uD558\uBA74 \uAE30\uB85D\uC774 \uC2DC\uC791\uB429\uB2C8\uB2E4.',
    no_saved_quotes: '\uC544\uC9C1 \uC800\uC7A5\uB41C \uBA85\uC5B8\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uC138\uC158 \uD6C4 \uBA85\uC5B8\uC744 \uC800\uC7A5\uD574\uBCF4\uC138\uC694.',

    your_mindfulness_journey: '\uB098\uC758 \uB9C8\uC74C\uCC59\uAE40 \uC5EC\uC815',
    minutes: '\uBD84',
    streak: '\uC5F0\uC18D',
    entries: '\uAE30\uB85D',
    daily_sessions: '\uC77C\uBCC4 \uC138\uC158',
    minutes_meditated: '\uBA85\uC0C1 \uC2DC\uAC04',
    mood_trend: '\uAE30\uBD84 \uBCC0\uD654',
    pre_session_avg: '\uC138\uC158 \uC804 \uD3C9\uADE0 (1\u20135)',
    before: '\uC774\uC804',
    after: '\uC774\uD6C4',
    complete_for_insights: '\uC138\uC158\uC744 \uC644\uB8CC\uD558\uBA74 \uBD84\uC11D \uACB0\uACFC\uB97C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.',

    customize_experience: '\uD658\uACBD \uC124\uC815',
    about: '\uC815\uBCF4',
    about_desc: 'Stillness \u2014 \uB9C8\uC74C\uCC59\uAE40 \uBA85\uC0C1 \uCE5C\uAD6C.',
    product: '\uC81C\uD488',
    product_desc: 'Stillness\uB294 \uAE30\uBCF8\uC801\uC73C\uB85C \uBA85\uC0C1 \uAE30\uB85D\uC744 \uB85C\uCEEC\uC5D0 \uC800\uC7A5\uD569\uB2C8\uB2E4. \uC544\uB798\uC5D0\uC11C \uB85C\uADF8\uC778\uD558\uBA74 \uC5EC\uB7EC \uAE30\uAE30\uC5D0\uC11C \uB3D9\uAE30\uD654\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
    cloud_sync: '\uD074\uB77C\uC6B0\uB4DC \uB3D9\uAE30\uD654',
    cloud_sync_desc: '\uBE44\uBC00\uBC88\uD638 \uC5C6\uC774 \uC774\uBA54\uC77C\uB85C \uB85C\uADF8\uC778\uD558\uC5EC \uC5EC\uB7EC \uAE30\uAE30\uC5D0\uC11C \uBA85\uC0C1 \uAE30\uB85D\uC744 \uB3D9\uAE30\uD654\uD558\uC138\uC694.',
    sync_setup_needed: '\uB3D9\uAE30\uD654 \uC124\uC815 \uD544\uC694',
    sync_setup_desc: '\uACC4\uC815 \uB3D9\uAE30\uD654\uB97C \uC704\uD574 VITE_SUPABASE_URL\uACFC VITE_SUPABASE_ANON_KEY\uB97C \uCD94\uAC00\uD558\uC138\uC694.',
    email_placeholder: 'you@example.com',
    sending_magic_link: '\uB9E4\uC9C1 \uB9C1\uD06C \uC804\uC1A1 \uC911...',
    sign_in_email: '\uC774\uBA54\uC77C\uB85C \uB85C\uADF8\uC778',
    sync_status_label: '\uB3D9\uAE30\uD654 \uC0C1\uD0DC',
    up_to_date: '\uCD5C\uC2E0 \uC0C1\uD0DC',
    sync_now: '\uC9C0\uAE08 \uB3D9\uAE30\uD654',
    sign_out: '\uB85C\uADF8\uC544\uC6C3',
    legal_support: '\uBC95\uC801 \uC815\uBCF4 & \uC9C0\uC6D0',
    privacy_policy: '\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68',
    terms_of_use: '\uC774\uC6A9\uC57D\uAD00',
    support: '\uACE0\uAC1D\uC9C0\uC6D0',
    language: '\uC5B8\uC5B4',
    language_desc: '\uC0AC\uC6A9\uD560 \uC5B8\uC5B4\uB97C \uC120\uD0DD\uD558\uC138\uC694.',

    enter_email: '\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD558\uC138\uC694',
    enter_email_desc: '\uB2E4\uB978 \uAE30\uAE30\uC5D0\uC11C\uB3C4 \uC0AC\uC6A9\uD560 \uC218 \uC788\uB3C4\uB85D \uB9E4\uC9C1 \uB9C1\uD06C\uB97C \uBCF4\uB0B4\uB4DC\uB9BD\uB2C8\uB2E4.',
    check_email: '\uC774\uBA54\uC77C\uC744 \uD655\uC778\uD558\uC138\uC694',
    check_email_desc: '\uC774 \uAE30\uAE30\uC5D0\uC11C \uB9E4\uC9C1 \uB9C1\uD06C\uB97C \uC5F4\uC5B4 \uBA85\uC0C1 \uAE30\uB85D\uC744 \uC5F0\uACB0\uD558\uC138\uC694.',
    sign_in_failed: '\uB85C\uADF8\uC778 \uC2E4\uD328',
    sign_in_failed_desc: '\uB9E4\uC9C1 \uB9C1\uD06C\uB97C \uBCF4\uB0BC \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.',
    signed_out: '\uB85C\uADF8\uC544\uC6C3\uB428',
    signed_out_desc: '\uC774 \uAE30\uAE30\uC758 \uB85C\uCEEC \uAE30\uB85D\uC740 \uC720\uC9C0\uB418\uC9C0\uB9CC \uD074\uB77C\uC6B0\uB4DC \uB3D9\uAE30\uD654\uAC00 \uC911\uC9C0\uB429\uB2C8\uB2E4.',
    could_not_sign_out: '\uB85C\uADF8\uC544\uC6C3\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4',
    try_again: '\uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.',

    preparing: '\uBA85\uC0C1 \uACF5\uAC04\uC744 \uC900\uBE44\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4...',

    'mood.stressed': '\uC2A4\uD2B8\uB808\uC2A4',
    'mood.tired': '\uD53C\uACE4',
    'mood.neutral': '\uBCF4\uD1B5',
    'mood.anxious': '\uBD88\uC548',
    'mood.calm': '\uD3C9\uC628',
    'mood.relieved': '\uC548\uB3C4',
    'mood.peaceful': '\uD3C9\uD654',
    'mood.grateful': '\uAC10\uC0AC',
    'mood.refreshed': '\uC0C1\uCF8C',

    'sound.singing-bowl': '\uC2F1\uC789\uBCFC',
    'sound.gong': '\uC9D5',
    'sound.ambient-pad': '\uC568\uBE44\uC5B8\uD2B8',
    'sound.nature': '\uC790\uC5F0',
    'sound.rain': '\uBE44',
    'sound.ocean': '\uD30C\uB3C4',
    'sound.wind': '\uD48D\uACBD',
    'sound.birds': '\uC0C8\uC18C\uB9AC',
    'sound.fireplace': '\uBCBD\uB09C\uB85C',
    'sound.random': '\uB79C\uB364',
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ko') return stored;
  } catch {}
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const t = useCallback((key: string): string => {
    return translations[locale][key] ?? translations.en[key] ?? key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

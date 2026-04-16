# Stillness

Stillness is a mobile-first meditation web app built with React, TypeScript, and Vite. It helps people build a daily mindfulness practice with guided breathing, ambient soundscapes, mood tracking, and reflective quotes.

## What ships today

- Guided meditation sessions with ambient audio
- Mood check-in before and after meditation
- Local journal/history stored in the browser
- Optional passwordless email sync with Supabase
- Analytics dashboard for personal progress
- Vercel Analytics for product usage insights

## Product model

This version is a frontend-only product.

- User data is stored in browser `localStorage` by default
- Optional cloud sync is available when Supabase is configured
- Users can keep data local-only or connect the same history across devices

That keeps the app lightweight, but you should still treat it as an MVP until the sync flow includes production account recovery, richer conflict handling, and mobile parity.

## Local development

Requirements:

- Node.js 20+
- `pnpm` 10+

Install and run:

```bash
pnpm install
pnpm dev
```

The web app runs on `http://localhost:8080`.

### Optional cross-device sync setup

Add these variables in `apps/web/.env.local`:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can also use:

```bash
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Then apply the database migration in `supabase/migrations/20260320_create_meditation_entries.sql`.

## iOS app scaffold

There is now an Expo-based iOS workspace app in `apps/ios`.

Install dependencies and start it with:

```bash
pnpm install
pnpm ios
```

Or run the Expo dev server directly:

```bash
pnpm --filter @repo/ios start
```

What the first iOS pass includes:

- Native meditation flow for mood, session length, sound selection, timer, reflection, and quote saving
- Local persistence with AsyncStorage
- Shared domain logic via `@repo/meditation-core`
- Shared quote/content via `@repo/meditation-content`

What still needs a follow-up pass:

- Native ambient audio playback parity with the web app
- App Store production assets and release signing

## Testing and production build

```bash
pnpm --filter @repo/web test
pnpm build
```

Production files are generated in `apps/web/dist`.

## Deploy to Vercel

This repository is already configured for Vercel deployment.

### Vercel project settings

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm run build`
- Output directory: `apps/web/dist`

### Launch steps

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Confirm the build settings above.
4. Deploy to production.
5. Add your custom domain in Vercel.
6. Point DNS from your registrar to Vercel.
7. Re-test the live site on mobile and desktop.

## Launch checklist

- Confirm the home page, tracker, analytics, and settings pages load on the production URL
- Verify deep links like `/tracker` and `/analytics` work on refresh
- Test one full meditation session with sound on iPhone Safari and Android Chrome
- Confirm Vercel Analytics events appear in the dashboard
- Check favicon, title, and social preview
- Review copy, privacy policy, and support contact before public launch

## Recommended next product steps

- Add accounts and cloud sync
- Add privacy policy and terms pages
- Add onboarding and reminder settings
- Add crash/error monitoring
- Add performance monitoring and bundle budgets

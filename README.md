# Stillness

Stillness is a mobile-first meditation web app built with React, TypeScript, and Vite. It helps people build a daily mindfulness practice with guided breathing, ambient soundscapes, mood tracking, and reflective quotes.

## What ships today

- Guided meditation sessions with ambient audio
- Mood check-in before and after meditation
- Local journal/history stored in the browser
- Analytics dashboard for personal progress
- Vercel Analytics for product usage insights

## Product model

This version is a frontend-only product.

- User data is stored in browser `localStorage`
- There is no login, sync, or cloud backup yet
- Users keep their data on the device/browser they use

That makes it fast and inexpensive to launch, but you should treat it as an MVP until cross-device sync and account recovery are added.

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

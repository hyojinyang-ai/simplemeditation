# External Integrations

**Analysis Date:** 2026-03-12

## APIs & External Services

**Supabase:**
- Type: PostgreSQL database + authentication + real-time APIs
- SDK: `@supabase/supabase-js` 2.98.0
- Client file: `src/integrations/supabase/client.ts` (auto-generated)
- Types file: `src/integrations/supabase/types.ts` (database schema types)
- Current status: Configured but **optional** - app primarily uses localStorage for persistence
- Configuration: `createClient()` with TypeScript Database type support
- Auth: localStorage-based session persistence with autoRefreshToken enabled

**Vercel Analytics:**
- Type: User engagement and web vitals tracking
- Package: `@vercel/analytics` 2.0.0
- Implementation: `src/lib/analytics.ts` - Custom event tracking wrapper
- React component: `<Analytics />` integrated in `src/App.tsx`
- Primary use: Track meditation sessions, mood changes, feature usage, page views
- Viewing: Deploy to Vercel and access Analytics tab in project dashboard

## Data Storage

**Primary (Client-side):**
- localStorage with key: `zen-mood-entries-v2`
- Stores: MoodEntry objects (id, preMood, postMood, timestamp, note, sessionMinutes, sound, savedQuote)
- Managed by: Zustand store in `src/lib/meditation-store.ts`
- Persistence: Automatic on each entry addition
- Format: JSON serialization

**Optional (Backend):**
- Supabase PostgreSQL
- Currently configured but unused for data storage
- Environment vars required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- Available for future expansion (cloud sync, user accounts)

**File Storage:**
- Local filesystem only (public/sounds/)
- 9 meditation audio files:
  - `singing-bowl.mp3` (358 KB)
  - `gong.mp3` (105 KB)
  - `ambient-pad.mp3` (3.0 MB)
  - `nature.mp3` (795 KB)
  - `rain.mp3` (1.2 MB)
  - `ocean.mp3` (3.0 MB)
  - `wind.mp3` (1.2 MB)
  - `birds.mp3` (795 KB)
  - `fireplace.mp3` (156 KB)
- Total: ~20.8 MB

**Caching:**
- None (relies on browser caching via HTTP headers)
- React Query (TanStack Query) available but not actively used

## Authentication & Identity

**Current Auth:**
- None implemented - fully anonymous app
- Supabase auth available but not configured

**Potential (Future):**
- Supabase Auth client available in `src/integrations/supabase/client.ts`
- Supports: Email/password, OAuth, Magic links, MFA
- Session storage: localStorage with auto-refresh

## Monitoring & Observability

**Error Tracking:**
- None detected - no Sentry, Rollbar, or similar integration
- Console error logging available for development

**Analytics & Metrics:**
- Vercel Analytics: Web vitals (CLS, FCP, LCP, TTFB)
- Custom event tracking in `src/lib/analytics.ts`:
  - `trackPageView(pageName)` - Page navigation
  - `trackSessionStart(minutes, sound)` - Meditation start
  - `trackSessionComplete(minutes, sound, preMood, postMood)` - Session end
  - `trackSessionAbandoned(minutes, remainingSeconds, sound)` - Incomplete session
  - `trackPreMoodSelection(mood)` - Pre-meditation mood
  - `trackPostMoodSelection(mood, preMood)` - Post-meditation mood with shift tracking
  - `trackSoundChange(fromSound, toSound)` - Audio selection changes
  - `trackFeatureUsage(feature)` - Feature interactions
  - `trackQuoteSaved(quoteAuthor)` - Saved quotes
  - `trackNoteAdded(sessionMinutes)` - Notes added to sessions
  - `trackAnalyticsView(chartType)` - Analytics page views
  - `trackSettingsChange(setting, value)` - Settings changes
  - `trackDailyStreak(streakDays)` - Retention metrics
  - `trackTotalSessions(totalSessions)` - Session milestones
  - `trackAudioError(errorType, sound)` - Audio playback errors
  - `trackPullToRefresh(page)` - Pull-to-refresh interactions

**Logs:**
- Development: Console logging in analytics.ts with `console.log()` (dev mode only)
- Production: Vercel Analytics dashboard (deployed only)

## CI/CD & Deployment

**Hosting:**
- Vercel (primary - has Analytics and deployment configuration in `.vercel/` directory)
- `.vercel/` directory present with project configuration

**CI Pipeline:**
- Vercel automatic deployments on git push
- Deployment triggers commits to git (ce9e9b0, a417c5f, 5041ca0, etc.)

**Build Process:**
- Vite build pipeline (`npm run build`)
- Output directory: `dist/`
- Development mode available: `npm run build:dev`

## Environment Configuration

**Required Environment Variables:**
- `VITE_SUPABASE_URL` - Supabase project URL (example: `https://bmatgabaipxebnjtubbu.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public anon key for Supabase
- `VITE_SUPABASE_PROJECT_ID` - Project ID (optional, example: `bmatgabaipxebnjtubbu`)

**Variable Access:**
- Via `import.meta.env.VITE_*` throughout app
- Example in `src/integrations/supabase/client.ts`:
  ```typescript
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  ```

**Secrets Location:**
- `.env` file (git-ignored, contains actual credentials)
- `.env.local` for local overrides (never committed)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- Vercel Analytics (passive event tracking)
- No custom webhook implementations

## Browser APIs & Native Features

**Web Audio API:**
- Used in `src/lib/ambient-engine.ts`
- Creates real-time audio synthesis:
  - AudioContext for audio graph
  - OscillatorNode for tone generation (sine wave)
  - GainNode for volume control and LFO modulation
  - Frequencies: Om (136.1 Hz), Solfeggio tones (174 Hz), and harmonic overtones
  - LFO: 0.06 Hz wobble for subtle modulation
  - All operations wrapped in try-catch for browser compatibility

**localStorage API:**
- Primary data persistence (key: `zen-mood-entries-v2`)
- Stores meditation entries as JSON
- Managed by Zustand in `src/lib/meditation-store.ts`

**DOM APIs:**
- matchMedia for responsive design detection (`src/hooks/use-mobile.tsx`)
- fetch for potential HTTP requests (not actively used)

## Third-Party Fonts

**Typography:**
- Google Fonts (loaded via Tailwind config):
  - Sora - Display font family
  - Inter - Body text font family
- CSS @import or link tags expected in stylesheet

## Deployment & Hosting Details

**Vercel Project:**
- Project ID: Present in `.vercel/` directory
- Auto-deploys on main branch push
- Analytics dashboard available at project dashboard
- Environment variables stored in Vercel project settings

**Audio Asset Delivery:**
- Static files in `public/sounds/` served as-is by Vite
- CDN optimization available via Vercel Edge Network

---

*Integration audit: 2026-03-12*

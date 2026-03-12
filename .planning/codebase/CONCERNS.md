# Codebase Concerns

**Analysis Date:** 2026-03-12

## Tech Debt

**Repetitive Component Structure in MeditationPlayer:**
- Issue: Nine nearly-identical conditional blocks rendering sound-specific cat images (lines 176-445), each with identical animation and breathing-phase display logic
- Files: `src/components/MeditationPlayer.tsx`
- Impact: High maintenance burden; adding new sounds requires duplicating 70+ lines of code. Changes to image display, animations, or breathing UI require updates in 9 places
- Fix approach: Extract image-selector logic into a separate mapping object and `<SoundImage>` component that accepts `sound` prop. Render once with conditional src based on `SOUND_TO_IMAGE` lookup table

**Untyped Analytics Data in Store Modifications:**
- Issue: Direct `localStorage.setItem()` and `useMeditationStore.setState()` calls bypass the store's type safety when updating entries with quotes
- Files: `src/pages/Index.tsx` (lines 86-90)
- Impact: State mutations happen outside Zustand actions; no guarantee of consistency if entry structure changes
- Fix approach: Add `updateEntry(id, updates)` action to `useMeditationStore` that handles both state and localStorage updates in one place

**Manual localStorage Management vs Zustand Persistence:**
- Issue: Zustand store `addEntry()` writes to localStorage directly (line 47 in `src/lib/meditation-store.ts`), but `Index.tsx` also writes to localStorage directly for quote updates (line 89)
- Files: `src/lib/meditation-store.ts`, `src/pages/Index.tsx`
- Impact: Inconsistent entry points for data persistence; risk of data loss if one path fails; difficult to add features like data versioning or encryption
- Fix approach: Consider using Zustand's `persist` middleware to centralize all localStorage handling and enable atomic writes

## Known Bugs

**Audio Context Creation on Session Complete:**
- Symptoms: Completion chime may fail silently or create multiple AudioContext instances if completion callback fires twice
- Files: `src/components/MeditationPlayer.tsx` (lines 56-96, `playCompletionFeedback`)
- Trigger: Call to `playCompletionFeedback()` creates new `AudioContext` without checking if one already exists in the component
- Workaround: Browser will throw quota exceeded error if too many contexts are created; app continues working but chime won't play

**Empty Catch Blocks Hiding Errors:**
- Symptoms: Audio failures silently suppressed; makes debugging browser compatibility issues difficult
- Files: `src/lib/ambient-engine.ts` (lines 83, 97, 99, 100), `src/components/MeditationPlayer.tsx` (lines 62, 96), `src/pages/Index.tsx` (line 41)
- Trigger: Any audio-related error (permissions, codec support, network) gets swallowed
- Workaround: Check browser console manually or enable detailed analytics for audio errors; use `trackAudioError()` wrapper

**Fade Interval Lingering After Component Unmount:**
- Symptoms: Memory leak if user navigates away during audio fade-in/fade-out
- Files: `src/lib/ambient-engine.ts` (lines 122-130, 145-153)
- Trigger: `stop()` method sets `fadeInterval = null` but doesn't await cleanup before component unmounts
- Workaround: Audio will eventually stop after fade completes, but resources held during transition

## Security Considerations

**Unencrypted localStorage for Mood Data:**
- Risk: User meditation entries, moods, and notes stored in plaintext in browser storage; accessible to browser extensions and XSS attacks
- Files: `src/lib/meditation-store.ts` (line 47), `src/pages/Index.tsx` (line 89)
- Current mitigation: None; data persists indefinitely until user clears browser cache
- Recommendations: (1) Encrypt entries at rest with client-side encryption library before storing, (2) Add option to sync to Supabase for server-side backup, (3) Implement data expiration/archival policy

**Analytics Tracking Personal Mood Data:**
- Risk: Mood selections (`stressed`, `anxious`, `tired`, `calm`, `peaceful`) sent to Vercel Analytics, could identify user state over time
- Files: `src/lib/analytics.ts` (lines 70-84), `src/pages/Index.tsx` (line 72)
- Current mitigation: Vercel Analytics terms of service govern data; no explicit anonymization
- Recommendations: (1) Review Vercel Analytics retention/sharing policies, (2) Consider removing mood from tracked events or aggregating to categories, (3) Add privacy policy explaining what mood data is collected

**Audio Context Default Initialization:**
- Risk: `new AudioContext()` in `playCompletionFeedback()` and meditation drone doesn't verify user interaction; may fail silently on strict browsers
- Files: `src/components/MeditationPlayer.tsx` (line 66), `src/lib/ambient-engine.ts` (line 34)
- Current mitigation: Wrapped in try-catch; user interaction required before session starts
- Recommendations: (1) Verify AudioContext created only after user tap/click, (2) Log failures to analytics for cross-browser monitoring, (3) Provide fallback notification if audio unavailable

## Performance Bottlenecks

**Inefficient Mood Distribution Calculation:**
- Problem: `Analytics.tsx` recalculates mood distributions on every render, iterating through all entries multiple times
- Files: `src/components/Analytics.tsx` (lines 44-54, 56-62)
- Cause: No memoization of calculations; `preMoodDist`, `postMoodDist`, `moodTrend` recomputed even if entries unchanged
- Improvement path: (1) Wrap calculations in `useMemo` with `[entries]` dependency, (2) Consider moving to store-level selectors for reuse, (3) Add indexing for mood lookups if entry count exceeds 1000

**14-Day Streak Iteration:**
- Problem: `Analytics.tsx` loops 365 days even when checking only 14 days; wastes cycles for user with <14 entries
- Files: `src/components/Analytics.tsx` (lines 26-32)
- Cause: Loop continues checking every day backward until no entry found
- Improvement path: (1) Cache streak calculation in store, (2) Update only when new entry added, (3) Or reverse loop direction and break early if gap detected

**Ambient Visuals Regenerate on Every Motion Frame:**
- Problem: `AmbientVisuals.tsx` creates new `bands`, `shimmerDots`, `flies`, `ripples` arrays on initialization even though they're static
- Files: `src/components/AmbientVisuals.tsx` (lines 37-62, 122-137, 193-216)
- Cause: `useMemo` dependency arrays are correct but visual particles could be cached at module level
- Improvement path: (1) Pre-generate particle arrays at module scope (non-random if deterministic), (2) Or implement WebGL particle system for complex scenes, (3) Monitor frame rate on low-end devices

## Fragile Areas

**MeditationPlayer Timer Logic:**
- Files: `src/components/MeditationPlayer.tsx` (lines 99-142)
- Why fragile: (1) Multiple state variables (`playing`, `remaining`, `completed`) must stay in sync; pause resets breathing phase but not timer, (2) Session tracking via `sessionStartTracked` ref can get out of sync if component re-mounts, (3) Cleanup logic runs on unmount but may fire abandonment event even if session completed just before unmount
- Safe modification: (1) Add console warnings if invariants violated (e.g., if completed but remaining > 0), (2) Write tests for edge cases: pause-resume at different times, navigation during session, rapid play-pause, (3) Consider consolidating state with reducer pattern
- Test coverage: Only placeholder `example.test.ts` exists; no tests for player state machines

**Zustand Store with Direct localStorage Access:**
- Files: `src/lib/meditation-store.ts`, `src/pages/Index.tsx`
- Why fragile: (1) Store and direct localStorage calls can get out of sync if `localStorage.setItem` fails, (2) Zustand's built-in `persist` middleware not used; custom implementation hard to extend, (3) No validation on parse; corrupted JSON silently returns empty array
- Safe modification: (1) Validate JSON before parse and log corruption, (2) Add versioning to localStorage key (currently hardcoded `zen-mood-entries-v2`), (3) Centralize all persistence in Zustand middleware
- Test coverage: No tests for store persistence or data recovery

**Sound File Dependencies:**
- Files: `src/lib/ambient-engine.ts`, `src/components/MeditationPlayer.tsx` (image paths `/images/meditation-cat-*.png`), `public/sounds/`
- Why fragile: (1) Sound files mapped in `SOUND_FILES` object must match actual files in `/public/sounds/`; typos fail silently, (2) Image paths hardcoded in conditional blocks; adding sound requires finding and editing multiple files, (3) No validation that sound files exist before trying to play
- Safe modification: (1) Build-time check that all referenced sound/image files exist, (2) Add error boundary that logs missing assets, (3) Provide fallback silence/placeholder image
- Test coverage: No asset validation tests

## Scaling Limits

**localStorage Capacity for Entry Growth:**
- Current capacity: ~5-10MB per browser; typical entry ~100 bytes
- Limit: App breaks around 50,000-100,000 entries (10-50MB JSON)
- Scaling path: (1) Migrate to IndexedDB for larger quota, (2) Implement server sync to Supabase with offline-first strategy, (3) Archive old entries after N months, (4) Add entry pagination to analytics views

**Ambient Visuals Particle Count:**
- Current capacity: ~28 animated particles per scene (4 aurora bands + 8 shimmer + 14 fireflies + 5 ripples + 6 drops)
- Limit: Performance degrades on devices with <60fps capability; motion jank visible at 5+ concurrent scenes
- Scaling path: (1) Implement WebGL/Canvas renderer instead of DOM, (2) Reduce particle count on low-end devices via capability detection, (3) Use `will-change` CSS to hint to browser

**Single QueryClient Instance:**
- Current capacity: App uses one shared QueryClient in `App.tsx`; works for current single-user mode
- Limit: If multi-user or complex async flows added, cache collision possible
- Scaling path: (1) Document expected growth in concurrent queries, (2) If server integration added, ensure separate QueryClient per user/session, (3) Monitor React Query DevTools for cache size

## Dependencies at Risk

**@vercel/analytics with Mood Data:**
- Risk: Library sends custom events to Vercel; mood tracking provides personally-identifying patterns
- Impact: User privacy depends on Vercel's data handling; no easy way to disable per-event
- Migration plan: (1) Replace with privacy-focused alternative (Plausible, Fathom, simple server-side logging), (2) Or strip PII before sending (aggregate moods to weekly summaries, omit raw mood selections), (3) Document data retention policy in privacy page

**next-themes with Limited Customization:**
- Risk: Locks app into light-mode-first theming; custom zen color system requires tailwind config overrides that could break on major updates
- Impact: Theme switching or dark mode additions would require significant refactoring
- Migration plan: (1) Test next-themes compatibility on next major version upgrade, (2) Consider building custom theme provider if zen palette needs diverge from standard dark/light

**Lovable Integration Active in Development:**
- Risk: `lovable-tagger` plugin injected into development builds; if removed, component tagging breaks workflow
- Impact: Development environment tightly coupled to Lovable platform
- Migration plan: (1) This is intentional (Lovable-created project), (2) If migrating away, remove plugin from `vite.config.ts` line 15 and adjust development process

## Missing Critical Features

**No Data Backup or Restore:**
- Problem: Meditation history stored only in browser localStorage; user loses all data if browser cache cleared or device replaced
- Blocks: Users cannot reliably keep their meditation history across devices; no export/import for data portability
- Fix approach: (1) Add localStorage export as JSON button in settings, (2) Implement Supabase sync with simple "backup" button, (3) Or provide read-only cloud backup view

**No Error Recovery for Audio Playback:**
- Problem: If audio playback fails (codec unsupported, network timeout, permissions), user gets silently failed meditation with no feedback
- Blocks: Users on unsupported browsers (Safari without certain codecs, strict CSP policies) have broken sessions
- Fix approach: (1) Add human-readable error dialog if audio fails after 2 seconds, (2) Provide fallback: meditation without audio track, (3) Detect browser capabilities on app init and warn

**No Offline Indication or Sync Status:**
- Problem: Analytics event failures (no network) silently fail; user unaware if mood tracking uploaded
- Blocks: Cannot build confidence in data synchronization; important for future Supabase integration
- Fix approach: (1) Show sync status indicator in UI, (2) Queue failed analytics events and retry, (3) Add offline mode switch in settings

## Test Coverage Gaps

**No Tests for Meditation Player State Machine:**
- What's not tested: Play/pause/resume flow, breathing phase synchronization, timer countdown, completion callback, cleanup on unmount
- Files: `src/components/MeditationPlayer.tsx`
- Risk: Regression undetected; navigation during meditation or component crashes could lose session state
- Priority: High (core feature)

**No Tests for Store Persistence:**
- What's not tested: localStorage read/write, JSON parse error recovery, store hydration, entry uniqueness (no duplicate IDs)
- Files: `src/lib/meditation-store.ts`
- Risk: Data corruption or loss undetected; app could silently drop entries
- Priority: High (data integrity)

**No Tests for Audio Engine:**
- What's not tested: Drone oscillator lifecycle, fade-in/fade-out timing, AudioContext cleanup, sound file loading
- Files: `src/lib/ambient-engine.ts`
- Risk: Memory leaks, audio context quota exceeded, or failed playback undetected in CI
- Priority: Medium (affects session quality but graceful degradation)

**No Tests for Analytics Event Firing:**
- What's not tested: Events tracked at correct moments, mood/sound tracking correlation, session abandonment detection
- Files: `src/lib/analytics.ts`
- Risk: Analytics data invalid; business metrics unreliable
- Priority: Medium (insights quality)

**No Integration Tests for Full Session Flow:**
- What's not tested: Complete flow from mood selection → session → meditation → reflection → quote save
- Files: `src/pages/Index.tsx` (orchestrates all steps)
- Risk: Breaking changes in component dependencies undetected; multi-step UX could fail
- Priority: Medium (user-facing flow)

---

*Concerns audit: 2026-03-12*

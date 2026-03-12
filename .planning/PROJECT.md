# SimpleMeditation Mobile

## What This Is

SimpleMeditation is a meditation app that helps users practice mindfulness with ambient sounds, mood tracking, and personal analytics. Currently a React web app, we're evolving it into a monorepo with shared business logic supporting both web and native mobile apps (iOS and Android) via React Native. The mobile apps will add push notifications, offline mode, and home screen widgets while maintaining the zen-inspired experience users love.

## Core Value

Users can start meditating within seconds, with or without internet, and see how their practice improves their mood over time.

## Requirements

### Validated

<!-- Shipped and confirmed valuable in web app. -->

- ✓ User can meditate with guided breathing timer — existing
- ✓ User can select from 6 ambient sounds (singing-bowl, gong, ambient-pad, nature, rain, ocean) — existing
- ✓ User can track pre-meditation mood (stressed, tired, neutral, anxious) — existing
- ✓ User can track post-meditation mood (calm, relieved, peaceful, grateful, refreshed) — existing
- ✓ User can view analytics showing mood trends and streak tracking — existing
- ✓ User can save inspirational quotes from meditation sessions — existing
- ✓ User can access app on mobile web with responsive design — existing
- ✓ Web Audio API provides dual-layer audio (ambient + meditation drone) — existing
- ✓ User data persists locally across sessions — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Monorepo structure with shared business logic between web and mobile
- [ ] React Native mobile app supports iOS and Android
- [ ] User can install native mobile app from App Store / Play Store
- [ ] User receives push notifications for meditation reminders
- [ ] User can meditate offline without internet connection
- [ ] User can add home screen widget for quick meditation start
- [ ] Mobile app provides native feel with platform-specific UI patterns
- [ ] Shared meditation logic (state, mood tracking, analytics) works across platforms
- [ ] Audio system works on mobile (native audio APIs, not just Web Audio)
- [ ] Local storage works on mobile (AsyncStorage/MMKV instead of localStorage)
- [ ] Analytics track mobile-specific events (app open, background, notifications)

### Out of Scope

- Social features (sharing, community) — Focus on personal practice first
- Subscription/payment — Keep it free to maximize accessibility
- Guided audio meditations — Ambient sounds only, user leads their own practice
- Multiple user accounts — Single user per device
- Apple Watch / Android Wear apps — Mobile first, wearables later
- Real-time syncing between devices — Local-first approach

## Context

**Existing Web App:**
- Production React 18 web app with TypeScript, Vite, Tailwind CSS
- State managed by Zustand with localStorage persistence
- Web Audio API for real-time audio synthesis and mixing
- Supabase configured but currently unused (potential sync backend)
- Vercel Analytics tracking user behavior
- Mobile-first responsive design with pull-to-refresh

**Migration Strategy:**
- Convert existing codebase to monorepo structure
- Extract business logic into shared packages
- Build React Native app consuming shared logic
- Maintain web app alongside mobile (both from same repo)
- Use Expo for managed React Native workflow (faster iteration)

**Technical Debt to Address:**
- Repetitive component structure in MeditationPlayer (9 identical blocks for sounds)
- Manual localStorage management needs consolidation
- Audio context creation needs better lifecycle management
- Empty catch blocks hiding audio errors
- Performance: unmemoized mood calculations in analytics

## Constraints

- **Platform**: Web must remain functional; mobile adds to, doesn't replace
- **Tech Stack**: React Native with Expo for mobile; existing React + Vite for web
- **Code Sharing**: Maximize reuse of business logic (state, mood tracking, analytics)
- **Architecture**: Monorepo with packages for shared logic (meditation-core), web app, mobile app
- **Storage**: Must work offline-first; local storage on each platform
- **Audio**: Need native audio APIs on mobile (Expo Audio); Web Audio API on web
- **Development**: Single developer; prioritize tools that reduce complexity (Expo, shared code)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monorepo with shared packages | Maximize code reuse for meditation logic, reduce duplication, single source of truth | — Pending |
| Expo instead of bare React Native | Faster development, managed workflow, easier deployment to stores | — Pending |
| Keep web app in same repo | Both platforms share business logic; easier to maintain feature parity | — Pending |
| Offline-first architecture | Core value is "meditate within seconds" - can't depend on network | — Pending |

---
*Last updated: 2026-03-12 after initialization*

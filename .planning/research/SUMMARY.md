# Research Summary: SimpleMeditation Mobile Apps

**Domain:** React Native mobile app conversion for meditation/wellness app
**Researched:** 2026-03-12
**Overall confidence:** MEDIUM (based on training data through January 2025, unable to verify current versions)

## Research Limitations

**CRITICAL:** This research could not access:
- Context7 for library version verification
- Official documentation websites (Expo, Turborepo, React Native)
- Web search for 2026 current best practices
- Brave Search API

All findings are based on training data current through January 2025. Version numbers and library recommendations must be verified against current official documentation before implementation.

## Executive Summary

Converting SimpleMeditation from a React web app to a React Native monorepo requires a deliberate monorepo architecture with shared business logic and platform-specific UI layers. The recommended stack centers on **Turborepo** for build orchestration, **pnpm** for workspace management, and **Expo managed workflow** for React Native development.

The existing web app's architecture (Zustand state management, localStorage persistence, Zod validation) translates well to mobile, but critical platform differences require specific solutions:

1. **Storage:** Replace `localStorage` with `react-native-mmkv` (30x faster, synchronous API matching web's localStorage)
2. **Audio:** Web Audio API's real-time synthesis capabilities don't exist on React Native. Solution is to pre-render meditation drone variations as audio files and use `expo-av` for layered playback
3. **UI Components:** Keep shadcn/ui (web) and React Native Paper (mobile) separate. Share business logic only, not UI components
4. **Analytics:** Web continues using Vercel Analytics; mobile requires expo-analytics-segment → Segment → downstream services pipeline

The migration strategy emphasizes incremental extraction of shared code into a `meditation-core` package, enabling the web app to continue functioning throughout the conversion while building the mobile app alongside it.

Critical decision: **Expo managed workflow** over bare React Native aligns with project constraints (single developer, faster iteration). EAS Build handles iOS/Android builds without local Xcode/Android Studio, enabling productive development.

## Key Findings

**Stack:** Turborepo + pnpm monorepo with Expo SDK 52+ (verify current), React Native 0.76+, MMKV storage, expo-av audio, React Native Paper UI
**Architecture:** Three-package monorepo (apps/web, apps/mobile, packages/meditation-core) with shared state/types/utilities, platform-specific UI/storage/analytics adapters
**Critical pitfall:** Web Audio API synthesis capabilities cannot be replicated on mobile; must pre-render meditation drone as audio files or accept simpler audio experience

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Monorepo Foundation (Week 1-2)
**Why first:** Must establish workspace structure before extracting code or building mobile app. Low risk, high value.
- Install Turborepo + pnpm
- Create workspace configuration (pnpm-workspace.yaml, turbo.json)
- Move existing web app to `apps/web/`
- Create `packages/meditation-core/` scaffold
- Verify web app builds and runs unchanged

**Addresses:** Monorepo requirement from Active requirements
**Avoids:** Accidental coupling between web and mobile code (see Pitfalls: tight coupling)
**Confidence:** HIGH - Standard Turborepo setup, well-documented

### Phase 2: Extract Shared Logic (Week 2-3)
**Why second:** Must extract working code before mobile app can import it. Validates architecture works.
- Move Zustand stores to meditation-core
- Move TypeScript types (Mood, Session, analytics) to meditation-core
- Move utility functions (mood calculations, streak tracking) to meditation-core
- Create storage adapter interface
- Implement web storage adapter (localStorage wrapper)
- Update web app imports to use meditation-core package
- Verify web app functionality unchanged

**Addresses:** Shared meditation logic requirement
**Avoids:** Premature mobile development before shared architecture proven (see Pitfalls: mobile-first mistake)
**Dependencies:** Phase 1 complete (monorepo structure exists)
**Confidence:** HIGH - Existing code extraction, low-risk refactor

### Phase 3: Mobile App Scaffold (Week 3-4)
**Why third:** With shared code extracted, can build mobile app consuming it. Proves cross-platform architecture.
- Create `apps/mobile/` with Expo CLI
- Configure Expo Router with tab navigation (/, /tracker, /analytics, /settings)
- Install react-native-mmkv
- Implement mobile storage adapter (MMKV wrapper)
- Configure Zustand persist to use platform-specific storage
- Import meditation-core into mobile app
- Create basic UI shell with React Native Paper
- Test state management reads/writes on iOS Simulator

**Addresses:** React Native mobile app requirement, native feel requirement
**Avoids:** Attempting to share UI components between web and mobile (see Pitfalls: UI sharing anti-pattern)
**Dependencies:** Phase 2 complete (shared logic extracted)
**Confidence:** MEDIUM - Expo setup standard, but audio/storage integration needs testing

### Phase 4: Audio System (Week 4-5)
**Why fourth:** Core meditation feature. Needs dedicated phase due to Web Audio API translation complexity.
- Research current expo-audio vs expo-av recommendation (verify 2026 status)
- Pre-render meditation drone variations (5min, 10min, 20min, 30min MP3 files)
  - Use Web Audio API on desktop to generate drone files
  - Export as MP3 at 128kbps (balance quality/size)
- Copy existing ambient sound files to mobile bundle
- Implement audio playback with expo-av
- Implement dual-layer mixing (ambient + drone)
- Configure expo-task-manager for background audio
- Test uninterrupted playback during meditation sessions

**Addresses:** Audio system works on mobile requirement
**Avoids:** Attempting real-time audio synthesis on mobile (see Pitfalls: Web Audio API mismatch)
**Dependencies:** Phase 3 complete (mobile app scaffold)
**Confidence:** MEDIUM - Pre-rendering strategy sound, but expo-av mixing needs validation
**Risk:** If expo-av can't mix two audio streams, may need to pre-render composite files (ambient+drone combinations = 6 sounds × 4 durations = 24 files)

### Phase 5: Feature Parity (Week 5-7)
**Why fifth:** With core infrastructure working, build out UI screens matching web functionality.
- Implement meditation player UI (timer, sound picker, start/pause)
- Implement mood tracker UI (pre/post mood selection, notes)
- Implement analytics charts (streak, mood transformation, session history)
  - Use react-native-chart-kit or victory-native (verify current recommendation)
- Implement settings UI
- Test complete meditation flow: select mood → meditate → post-mood → see analytics
- Verify offline mode works (no network calls)

**Addresses:** User can meditate, track mood, view analytics requirements
**Avoids:** Feature creep with mobile-specific features before core parity (see Pitfalls: notification distraction)
**Dependencies:** Phase 4 complete (audio working)
**Confidence:** HIGH - Standard React Native UI development

### Phase 6: Mobile-Specific Features (Week 7-9)
**Why sixth:** Core app working, now add mobile value-adds (notifications, true offline).
- Implement push notification infrastructure
  - Configure expo-notifications
  - Request permissions (iOS/Android)
  - Set up EAS for APNs/FCM credentials
- Implement local notification scheduling (daily meditation reminder)
- Verify offline persistence (all data saved locally)
- Set up Sentry for mobile error tracking
- Configure analytics pipeline (expo-analytics-segment → Segment)
- Test on physical devices (iOS + Android)

**Addresses:** Push notifications, offline mode, analytics tracking requirements
**Avoids:** Building widgets before core features stable (see Pitfalls: widget immaturity)
**Dependencies:** Phase 5 complete (feature parity)
**Confidence:** MEDIUM - Notifications standard, but testing on real devices reveals edge cases

### Phase 7: Build & Deploy (Week 9-10)
**Why seventh:** App feature-complete, ready for external testing and app store submission.
- Set up EAS Build for iOS and Android
- Configure app icons, splash screens
- Build iOS app, test on TestFlight
- Build Android app, test on Play Store Beta
- Configure EAS Submit for automated store submission
- Set up EAS Update for OTA updates
- Submit to app stores
- Monitor Sentry for crashes
- Iterate on beta tester feedback

**Addresses:** User can install from App Store/Play Store requirement
**Avoids:** Submitting before thorough device testing (see Pitfalls: simulator blindness)
**Dependencies:** Phase 6 complete (mobile features working)
**Confidence:** MEDIUM - EAS process standard, but app review requirements can surprise

### Phase 8 (Optional): Home Screen Widgets (Week 11-12)
**Why last:** Highest risk, lowest priority. Ecosystem was immature as of early 2025.
- Research current state of react-native-widget-extension (iOS) and react-native-android-widget
- If production-ready, implement quick-start widget (tap to begin meditation)
- If not mature, defer to future milestone

**Addresses:** Home screen widget requirement
**Avoids:** Blocking launch on experimental libraries (see Pitfalls: widget immaturity)
**Dependencies:** Phase 7 complete (app in stores)
**Confidence:** LOW - Widget libraries experimental in early 2025, may still be immature in 2026

## Phase Ordering Rationale

**Why monorepo before extraction?**
Can't extract shared code without workspace structure. One-time setup, unblocks everything.

**Why extraction before mobile app?**
Mobile app needs to import shared code. If we build mobile first, we'd duplicate logic, then have to refactor both apps. Extract once, consume from two apps.

**Why scaffold before audio?**
Audio is complex (Web Audio API translation). Scaffold proves basic architecture works (imports, storage, state) before tackling harder problem.

**Why audio before feature parity?**
Audio is the core meditation experience. If audio approach doesn't work (expo-av can't mix, or performance poor), whole strategy changes. Validate early.

**Why feature parity before mobile-specific?**
Mobile features (notifications, widgets) are additive. Core app must work first. Don't want to debug "Why isn't meditation working?" while also debugging "Why aren't notifications firing?"

**Why build/deploy before widgets?**
Widgets require app store presence to test properly (iOS widget extensions, Android home screen integration). Plus widget libraries may not be production-ready. Don't block launch.

## Research Flags for Phases

| Phase | Research Needs | Confidence |
|-------|---------------|------------|
| Phase 1 (Monorepo) | Standard setup, unlikely to need research | HIGH |
| Phase 2 (Extraction) | Standard refactor, unlikely to need research | HIGH |
| Phase 3 (Scaffold) | Verify Expo SDK current version, Expo Router API | MEDIUM - May need docs review |
| Phase 4 (Audio) | **CRITICAL:** Verify expo-audio vs expo-av status. Test expo-av dual-stream mixing. Confirm pre-rendering approach works. | LOW - Needs dedicated research phase |
| Phase 5 (Feature Parity) | Chart library recommendation (react-native-chart-kit vs victory-native vs recharts-native) | MEDIUM - Quick docs review |
| Phase 6 (Mobile Features) | Notification permission flows (iOS 15+ changes?), Sentry RN setup | MEDIUM - Docs review |
| Phase 7 (Build/Deploy) | EAS Build current workflow, app store requirements | MEDIUM - Process may have changed |
| Phase 8 (Widgets) | **Widget library maturity check** - Are they production-ready in 2026? | LOW - Full ecosystem research needed |

**Highest research priority:** Phase 4 (Audio). Web Audio API mismatch is the biggest technical risk. Need to validate that:
1. expo-av can mix two audio streams (ambient + drone)
2. Pre-rendered drone files sound acceptable (not degraded from real-time synthesis)
3. Background audio works reliably with expo-task-manager

If any of these fail, audio strategy changes significantly.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Monorepo Stack (Turborepo + pnpm) | MEDIUM | Standard in late 2024, but version numbers need verification. Turborepo 2.x may still be beta. |
| Expo Managed Workflow | MEDIUM | Aligned with project constraints. Expo SDK version (52? 53?) needs verification. expo-audio vs expo-av unclear. |
| Storage (MMKV) | HIGH | Proven solution, widely adopted by late 2024. Synchronous API critical for Zustand. |
| Audio Strategy (Pre-rendering) | MEDIUM | Technical approach sound (pun intended), but expo-av mixing capability unconfirmed. May need to render composite files. |
| UI Separation (No Sharing) | HIGH | Industry standard. Web uses shadcn/ui, mobile uses RN Paper. Share logic only. |
| Analytics Pipeline | MEDIUM | Segment integration standard, but Vercel Analytics compatibility with Segment unverified. |
| Widget Libraries | LOW | Ecosystem was experimental/immature in early 2025. May still not be production-ready. High risk for Phase 8. |

**Overall confidence: MEDIUM** - Core approach is sound (monorepo, shared logic, platform-specific UI), but all version numbers and some library choices (expo-audio vs expo-av, chart library, widget libraries) need verification against 2026 current state.

## Gaps to Address

### Immediate Gaps (Block Starting)

1. **Expo SDK current version** - Is it SDK 52, 53, 54? What React Native version does it target?
2. **expo-audio vs expo-av** - Which is recommended in 2026? Has expo-audio replaced expo-av?
3. **Turborepo version** - Is 2.x stable, or still 1.x recommended?

**Action:** Check official documentation before Phase 1.

### Phase-Specific Gaps

**Phase 4 (Audio):**
- Can expo-av mix two audio streams simultaneously? (ambient + drone)
- Does expo-av support volume control per stream? (user may want quieter drone)
- Background audio on iOS: does it require specific entitlements beyond expo-task-manager?
- Pre-rendered drone quality: acceptable compared to real-time synthesis?

**Action:** Dedicated research phase before Phase 4 implementation. May need to prototype audio mixing.

**Phase 5 (Feature Parity):**
- Which chart library for React Native? react-native-chart-kit (simple), victory-native (powerful), or react-native-svg-charts (deprecated?)?
- Recharts (used on web) doesn't work on React Native. Need mobile alternative.

**Action:** Quick research at start of Phase 5. Check library maintenance status, bundle size, feature set.

**Phase 6 (Mobile Features):**
- iOS notification permissions: has flow changed in recent iOS versions?
- Android notification channels: any new requirements?
- Sentry React Native: requires source map upload, release tracking. What's current setup process?

**Action:** Review docs at start of Phase 6. Notification permissions may have new privacy requirements.

**Phase 8 (Widgets):**
- Are react-native-widget-extension and react-native-android-widget production-ready in 2026?
- Do they work with Expo managed workflow, or require ejecting to bare workflow?
- What's the development workflow? (Xcode for iOS widgets, Android Studio for Android widgets?)

**Action:** Full ecosystem research before committing to Phase 8. If widgets require bare workflow, may not be worth it. Consider deferring to future milestone.

### Architecture Gaps

**Not researched (out of scope for this phase):**

- Supabase integration for mobile (backend configured but unused on web)
- Real-time syncing between web and mobile apps (out of scope per PROJECT.md)
- Apple Watch / Android Wear extensions (explicitly out of scope)
- Subscription/payment systems (out of scope - app is free)

**May need research later if requirements change:**

- Supabase React Native client (if backend features added)
- Deep linking configuration (if sharing features added)
- Background sync strategies (if multi-device sync added)

## Recommendations for Roadmap

### Must-Have First
1. **Monorepo structure** (Phase 1) - Foundation for everything
2. **Shared logic extraction** (Phase 2) - Proves architecture works
3. **Mobile scaffold** (Phase 3) - Mobile app exists, can run
4. **Audio system** (Phase 4) - Core meditation feature
5. **Feature parity** (Phase 5) - Functional app

**Reasoning:** These phases are dependencies for each other and contain the highest technical risk (audio translation). Get to working mobile app fast, then add features.

### Can Defer
1. **Home screen widgets** (Phase 8) - Nice-to-have, high risk (ecosystem maturity)
2. **Advanced analytics** - Basic analytics sufficient for MVP
3. **Social features** - Explicitly out of scope

**Reasoning:** Widgets don't affect core value proposition ("meditate within seconds"). If libraries aren't production-ready, app can launch without them.

### Critical Path Items
1. **Audio research before Phase 4** - expo-av mixing capability must be confirmed
2. **Device testing in Phase 6** - Simulator testing insufficient for audio, notifications, background tasks
3. **Chart library research before Phase 5** - Quick decision, but blocks analytics UI

### Quick Wins
- Zustand stores already platform-agnostic (minimal changes to extract)
- Zod schemas work identically on mobile (copy-paste to shared package)
- Utility functions (mood calculations, date formatting) are pure functions (easiest to extract)

**Suggestion:** Start Phase 2 extraction with utilities and types (low risk), then state management (higher risk but well-tested).

## Success Criteria

Research is complete when:
- [x] Monorepo stack recommended (Turborepo + pnpm)
- [x] React Native framework recommended (Expo managed workflow)
- [x] Code sharing strategy defined (shared business logic, separate UI)
- [x] Mobile storage solution recommended (MMKV)
- [x] Mobile audio solution recommended (expo-av with pre-rendered drones)
- [x] UI component strategy defined (React Native Paper, no sharing with web)
- [x] Analytics strategy defined (Segment pipeline)
- [x] Confidence levels assigned to all recommendations
- [x] Open questions flagged for verification
- [x] Phase ordering rationale provided
- [x] Research flags identified for each phase

**Quality check:**
- Comprehensive: All technical domains covered (monorepo, RN framework, storage, audio, UI, analytics)
- Opinionated: Clear recommendations with rationale, not "here are options"
- Honest: Confidence levels reflect actual verification status (MEDIUM overall due to version uncertainty)
- Actionable: Provides specific libraries, versions, migration strategy
- Current: Acknowledges 2026 context, flags need for verification

**Gap:** Unable to verify any recommendations against 2026 current state. All findings based on January 2025 training data. This is a significant limitation that must be addressed before implementation.

---

*Research completed: 2026-03-12*
*Researcher: Claude (training data through January 2025)*
*Next step: Verify all versions, test audio mixing approach, create roadmap based on 7-8 phase structure*

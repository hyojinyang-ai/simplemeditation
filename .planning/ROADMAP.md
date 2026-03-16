# Roadmap: SimpleMeditation Mobile

## Overview

SimpleMeditation evolves from a React web app to a cross-platform meditation practice tool by establishing a monorepo architecture with shared business logic. This roadmap guides the creation of iOS and Android mobile apps that maintain the zen-inspired experience users love while adding native capabilities (push notifications, offline mode, home screen widgets). The journey starts with monorepo foundation and shared code extraction, builds a functional mobile app with audio capabilities, achieves feature parity with the web app, adds mobile-specific enhancements, and culminates in app store deployment.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Monorepo Foundation** - Establish Turborepo workspace with web app preserved (completed 2026-03-12)
- [x] **Phase 2: Shared Logic Extraction** - Extract meditation business logic into reusable core package (completed 2026-03-16)
- [ ] **Phase 3: Mobile App Scaffold** - Create functional iOS app shell with navigation and state management
- [ ] **Phase 4: Audio System** - Implement dual-layer mobile audio (ambient + meditation drone)
- [ ] **Phase 5: Feature Parity** - Build complete meditation UI matching web functionality
- [ ] **Phase 6: Native Features** - Add push notifications, offline mode, and widgets
- [ ] **Phase 7: Build & Deploy** - Ship iOS app to App Store and Android app to Play Store

## Phase Details

### Phase 1: Monorepo Foundation
**Goal**: Workspace structure established with web app functioning unchanged in new location
**Depends on**: Nothing (first phase)
**Requirements**: MONO-01, MONO-02, MONO-03, MONO-04
**Success Criteria** (what must be TRUE):
  1. Turborepo workspace exists with apps/ and packages/ directories
  2. pnpm workspaces configured and dependencies install successfully
  3. Existing web app moved to apps/web/ and builds without errors
  4. Web app runs on localhost:8080 with all features working (meditation timer, mood tracking, analytics)
  5. meditation-core package scaffold exists with TypeScript configuration
**Plans**: 3 plans in 2 waves

Plans:
- [x] 01-01-PLAN.md — Initialize Turborepo workspace and pnpm workspaces (4 tasks, 7 min)
- [ ] 01-02-PLAN.md — Migrate web app to apps/web/
- [x] 01-03-PLAN.md — Create meditation-core package scaffold (2 tasks, 3 min)

### Phase 2: Shared Logic Extraction
**Goal**: Core meditation logic extracted to shared package and consumed by web app
**Depends on**: Phase 1
**Requirements**: MONO-05, MONO-06, MONO-07, MONO-08, MONO-09, MONO-10
**Success Criteria** (what must be TRUE):
  1. Zustand meditation store exported from meditation-core and imported by web app
  2. TypeScript types (Mood, Session, Entry) defined in meditation-core and used by web app
  3. Utility functions (streak tracking, mood calculations) live in meditation-core
  4. Storage adapter interface defined with getItem, setItem, removeItem methods
  5. Web storage adapter wraps localStorage and works with Zustand persist
  6. Web app imports all shared code from meditation-core without duplicating logic
  7. Web app functionality unchanged (all tests pass, manual verification confirms features work)
**Plans**: 4 plans in 1 wave

Plans:
- [x] 02-01-PLAN.md — Create meditation-content package and extract types/storage interface to meditation-core (3 tasks, 5 min)
- [x] 02-02-PLAN.md — Extract Zustand store factory and utility functions to meditation-core (3 tasks, 4 min)
- [x] 02-03-PLAN.md — Integrate shared packages into web app with storage adapter (6 tasks, 180 min)
- [x] 02-04-PLAN.md — Replace inline streak calculation with shared utility (1 task, 1 min)

### Phase 3: Mobile App Scaffold
**Goal**: iOS app exists with navigation, state management, and storage working
**Depends on**: Phase 2
**Requirements**: APP-01, APP-02, APP-03, APP-04, APP-05, APP-06, APP-07, APP-08
**Success Criteria** (what must be TRUE):
  1. iOS app created with Expo CLI in apps/mobile/ directory
  2. Expo Router configured with tab navigation (index, tracker, analytics, settings)
  3. React Native Paper components render on iOS Simulator
  4. meditation-core package imported and TypeScript types resolve correctly
  5. react-native-mmkv installed and mobile storage adapter implemented
  6. Zustand persist middleware uses mobile storage adapter (not localStorage)
  7. User can create a test meditation entry and it persists after app restart
  8. App launches without crashes and displays navigation shell
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Audio System
**Goal**: User can meditate with dual-layer audio (ambient sounds + meditation drone) on mobile
**Depends on**: Phase 3
**Requirements**: AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, AUD-06, AUD-07, AUD-08, AUD-09
**Success Criteria** (what must be TRUE):
  1. Meditation drone pre-rendered as audio files for different session lengths (3, 5, 10, 15, 20, 25, 30 minutes)
  2. All ambient sound files (singing-bowl, gong, ambient-pad, nature, rain, ocean) bundled with app
  3. expo-av configured and plays single audio file successfully
  4. Dual-layer audio playback works (ambient + drone play simultaneously)
  5. Per-stream volume controls work (user can adjust ambient and drone independently)
  6. Background audio capability enabled (audio continues when app in background)
  7. Lock screen audio controls display session information
  8. Audio gracefully handles interruptions (phone calls, alarms) without crashing
  9. User can start meditation, hear audio, lock phone, and audio continues playing
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Feature Parity
**Goal**: Mobile app provides complete meditation experience matching web functionality
**Depends on**: Phase 4
**Requirements**: PAR-01, PAR-02, PAR-03, PAR-04, PAR-05, PAR-06, PAR-07, PAR-08, PAR-09, PAR-10, PAR-11, PAR-12
**Success Criteria** (what must be TRUE):
  1. User can start meditation timer and select session duration (3, 5, 10, 15, 20, 25, 30 minutes)
  2. User can select from 6 ambient sounds before starting meditation
  3. User can track pre-meditation mood (stressed, tired, neutral, anxious)
  4. User can track post-meditation mood (calm, relieved, peaceful, grateful, refreshed)
  5. User can add notes and save inspirational quotes to meditation sessions
  6. User can view meditation history in tracker tab with all past sessions
  7. User can view analytics showing mood trends, current streak, and mood distribution charts
  8. Analytics calculations match web app exactly (same streak count, same mood percentages)
  9. Complete meditation flow works: select pre-mood → choose sound → meditate → post-mood → see updated analytics
  10. Offline mode works (no network required for any meditation features)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Native Features
**Goal**: Mobile app provides native enhancements beyond web experience
**Depends on**: Phase 5
**Requirements**: NAT-01, NAT-02, NAT-03, NAT-04, NAT-05, NAT-06, NAT-07, NAT-08, NAT-09, NAT-10, NAT-11
**Success Criteria** (what must be TRUE):
  1. expo-notifications integrated and iOS notification permissions requested gracefully
  2. User can schedule daily meditation reminder notifications
  3. Notification fires at scheduled time with meditation prompt text
  4. Streak reminder notification fires when user misses a day
  5. All meditation features work offline (no internet connection required)
  6. Audio files bundled with app (not streamed from network)
  7. Meditation history persists locally using MMKV storage
  8. Home screen widget displays current meditation streak
  9. Widget provides "Start Meditation" action that opens app to meditation player
  10. Widget updates automatically after completing a meditation session
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Build & Deploy
**Goal**: iOS and Android apps successfully submitted to app stores
**Depends on**: Phase 6
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04, DEP-05
**Success Criteria** (what must be TRUE):
  1. EAS Build configured for iOS and Android platforms
  2. iOS app builds successfully via EAS Build cloud service
  3. TestFlight beta deployment configured and app uploaded
  4. Android app builds successfully via EAS Build cloud service
  5. Beta testers can install app from TestFlight (iOS) and Play Store Beta (Android)
  6. App store metadata prepared (screenshots, description, keywords, privacy policy)
  7. iOS app submitted to App Store review
  8. Android app submitted to Google Play review
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Monorepo Foundation | 2/3 | Complete    | 2026-03-12 |
| 2. Shared Logic Extraction | 3/4 | Gap closure | - |
| 3. Mobile App Scaffold | 0/? | Not started | - |
| 4. Audio System | 0/? | Not started | - |
| 5. Feature Parity | 0/? | Not started | - |
| 6. Native Features | 0/? | Not started | - |
| 7. Build & Deploy | 0/? | Not started | - |

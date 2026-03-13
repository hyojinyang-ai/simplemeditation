# Requirements: SimpleMeditation Mobile

**Defined:** 2026-03-12
**Core Value:** Users can start meditating within seconds, with or without internet, and see how their practice improves their mood over time

## v1 Requirements

Requirements for initial iOS mobile release. Each maps to roadmap phases.

### Monorepo Foundation

- [x] **MONO-01**: Turborepo workspace structure created with apps/ and packages/ directories
- [x] **MONO-02**: pnpm workspaces configured with proper dependency management
- [x] **MONO-03**: Existing web app moved to apps/web/ and builds successfully
- [x] **MONO-04**: meditation-core package created in packages/ with TypeScript exports
- [ ] **MONO-05**: Zustand stores extracted to meditation-core (useMeditationStore)
- [x] **MONO-06**: TypeScript types extracted to meditation-core (PreMood, PostMood, MoodEntry, SoundType)
- [ ] **MONO-07**: Utility functions extracted to meditation-core (streak tracking, mood calculations)
- [x] **MONO-08**: Storage adapter interface defined (StateStorage with getItem, setItem, removeItem)
- [ ] **MONO-09**: Web storage adapter implemented wrapping localStorage
- [x] **MONO-10**: Mobile storage adapter interface prepared (StateStorage ready for MMKV in Phase 3)

### Mobile App

- [ ] **APP-01**: iOS app created with Expo CLI in apps/mobile/ directory
- [ ] **APP-02**: Expo Router configured with file-based routing
- [ ] **APP-03**: Tab navigation implemented (index, tracker, analytics, settings routes)
- [ ] **APP-04**: React Native Paper UI library integrated for mobile components
- [ ] **APP-05**: meditation-core package imported and types resolve correctly
- [ ] **APP-06**: react-native-mmkv installed and storage adapter implemented
- [ ] **APP-07**: Zustand persist middleware uses mobile storage adapter
- [ ] **APP-08**: App launches and displays basic navigation shell on iOS Simulator

### Audio System

- [ ] **AUD-01**: Meditation drone pre-rendered as audio files (Om 136.1 Hz variations)
- [ ] **AUD-02**: Drone file variations created for different session lengths
- [ ] **AUD-03**: expo-av installed and basic audio playback tested
- [ ] **AUD-04**: Dual-layer audio playback implemented (ambient + drone simultaneously)
- [ ] **AUD-05**: Per-stream volume control working (ambient and drone independently adjustable)
- [ ] **AUD-06**: Background audio capability enabled with expo-av
- [ ] **AUD-07**: Audio continues playing when app moves to background
- [ ] **AUD-08**: Lock screen audio controls display session information
- [ ] **AUD-09**: Audio gracefully handles interruptions (phone calls, alarms)

### Native Features

- [ ] **NAT-01**: expo-notifications library integrated
- [ ] **NAT-02**: iOS notification permissions requested and handled gracefully
- [ ] **NAT-03**: User can schedule meditation reminder notifications
- [ ] **NAT-04**: Notification fires at scheduled time with meditation prompt
- [ ] **NAT-05**: Streak reminder notification fires when user misses a day
- [ ] **NAT-06**: Offline mode works - all meditation features available without internet
- [ ] **NAT-07**: Audio files bundled with app for offline playback
- [ ] **NAT-08**: Meditation history persists locally using MMKV
- [ ] **NAT-09**: Home screen widget displays meditation streak
- [ ] **NAT-10**: Widget provides "Start Meditation" action that opens app to meditation player
- [ ] **NAT-11**: Widget updates when new meditation session completed

### Feature Parity (Mobile matches Web)

- [ ] **PAR-01**: User can start meditation timer on iOS
- [ ] **PAR-02**: User can select session duration (3, 5, 10, 15, 20, 25, 30 minutes)
- [ ] **PAR-03**: User can select from 6 ambient sounds (singing-bowl, gong, ambient-pad, nature, rain, ocean)
- [ ] **PAR-04**: User can track pre-meditation mood (stressed, tired, neutral, anxious)
- [ ] **PAR-05**: User can track post-meditation mood (calm, relieved, peaceful, grateful, refreshed)
- [ ] **PAR-06**: User can add notes to meditation sessions
- [ ] **PAR-07**: User can save inspirational quotes
- [ ] **PAR-08**: User can view meditation history in tracker tab
- [ ] **PAR-09**: User can view analytics showing mood trends
- [ ] **PAR-10**: User can see current meditation streak
- [ ] **PAR-11**: User can view mood distribution charts (pre and post)
- [ ] **PAR-12**: Analytics calculations match web app exactly

### Build & Deploy

- [ ] **DEP-01**: EAS Build configured for iOS
- [ ] **DEP-02**: iOS app builds successfully via EAS Build
- [ ] **DEP-03**: TestFlight beta deployment configured
- [ ] **DEP-04**: App successfully uploaded to TestFlight
- [ ] **DEP-05**: Basic app store metadata prepared (screenshots, description)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Android Platform

- **ANDR-01**: Android app created in same Expo project
- **ANDR-02**: Android-specific UI adaptations (Material Design)
- **ANDR-03**: Android notification handling
- **ANDR-04**: Android widget implementation (Glance API)
- **ANDR-05**: Google Play Store deployment

### Enhanced Features

- **ENH-01**: Breathing haptics during meditation (device vibration synced to breathing)
- **ENH-02**: Smart notification timing using ML (suggest best meditation times)
- **ENH-03**: Session templates (favorite sound + duration combinations)
- **ENH-04**: Adaptive meditation suggestions based on mood history
- **ENH-05**: Dark mode support (currently light mode only)

### Apple Watch

- **WATCH-01**: WatchOS companion app
- **WATCH-02**: Start meditation from watch
- **WATCH-03**: Watch vibration for breathing guidance
- **WATCH-04**: Watch complication showing streak

### Sync & Backup

- **SYNC-01**: Optional Supabase account creation
- **SYNC-02**: Meditation history syncs to Supabase
- **SYNC-03**: Cross-device history access (web ↔ mobile)
- **SYNC-04**: Cloud backup and restore

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Android in v1 | iOS-first to validate mobile architecture; Android in v2 |
| Social features (sharing, community) | Focus on personal practice; social adds complexity and moderation burden |
| Subscription/payment system | Keep app free to maximize accessibility; monetization not immediate goal |
| Guided audio meditations | User-led practice only; voice guidance changes app identity |
| Multiple user accounts | Single user per device simplifies state management; families can use separate devices |
| Real-time audio synthesis on mobile | Web Audio API unavailable; pre-rendered files are pragmatic compromise |
| Apple Watch in v1 | Phone first to validate core experience; wearables are additive |
| Web app deprecation | Maintaining web + mobile from same monorepo; both platforms remain supported |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55 (100% coverage)
- Unmapped: 0

### Phase Mapping

| Requirement | Phase | Status |
|-------------|-------|--------|
| MONO-01 | Phase 1 | Complete |
| MONO-02 | Phase 1 | Complete |
| MONO-03 | Phase 1 | Complete |
| MONO-04 | Phase 1 | Complete |
| MONO-05 | Phase 2 | Pending |
| MONO-06 | Phase 2 | Complete |
| MONO-07 | Phase 2 | Pending |
| MONO-08 | Phase 2 | Complete |
| MONO-09 | Phase 2 | Pending |
| MONO-10 | Phase 2 | Complete |
| APP-01 | Phase 3 | Pending |
| APP-02 | Phase 3 | Pending |
| APP-03 | Phase 3 | Pending |
| APP-04 | Phase 3 | Pending |
| APP-05 | Phase 3 | Pending |
| APP-06 | Phase 3 | Pending |
| APP-07 | Phase 3 | Pending |
| APP-08 | Phase 3 | Pending |
| AUD-01 | Phase 4 | Pending |
| AUD-02 | Phase 4 | Pending |
| AUD-03 | Phase 4 | Pending |
| AUD-04 | Phase 4 | Pending |
| AUD-05 | Phase 4 | Pending |
| AUD-06 | Phase 4 | Pending |
| AUD-07 | Phase 4 | Pending |
| AUD-08 | Phase 4 | Pending |
| AUD-09 | Phase 4 | Pending |
| PAR-01 | Phase 5 | Pending |
| PAR-02 | Phase 5 | Pending |
| PAR-03 | Phase 5 | Pending |
| PAR-04 | Phase 5 | Pending |
| PAR-05 | Phase 5 | Pending |
| PAR-06 | Phase 5 | Pending |
| PAR-07 | Phase 5 | Pending |
| PAR-08 | Phase 5 | Pending |
| PAR-09 | Phase 5 | Pending |
| PAR-10 | Phase 5 | Pending |
| PAR-11 | Phase 5 | Pending |
| PAR-12 | Phase 5 | Pending |
| NAT-01 | Phase 6 | Pending |
| NAT-02 | Phase 6 | Pending |
| NAT-03 | Phase 6 | Pending |
| NAT-04 | Phase 6 | Pending |
| NAT-05 | Phase 6 | Pending |
| NAT-06 | Phase 6 | Pending |
| NAT-07 | Phase 6 | Pending |
| NAT-08 | Phase 6 | Pending |
| NAT-09 | Phase 6 | Pending |
| NAT-10 | Phase 6 | Pending |
| NAT-11 | Phase 6 | Pending |
| DEP-01 | Phase 7 | Pending |
| DEP-02 | Phase 7 | Pending |
| DEP-03 | Phase 7 | Pending |
| DEP-04 | Phase 7 | Pending |
| DEP-05 | Phase 7 | Pending |

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-13 after plan 02-01 completion (MONO-06, MONO-08, MONO-10)*

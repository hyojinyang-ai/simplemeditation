# Feature Landscape

**Domain:** Mobile Meditation Apps (iOS/Android)
**Researched:** 2026-03-12

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Offline mode** | Core value of meditation apps is "meditate anytime" - network dependency breaks this | Medium | Audio files must be cached locally; all UI functional without network. Existing web app uses localStorage but needs native file system for audio. |
| **Push notifications for reminders** | Users rely on apps to build daily meditation habits; notifications are primary retention mechanism | Medium | Daily reminder at user-set time, optional streak notifications. iOS/Android have different scheduling APIs. Must respect notification permissions and settings. |
| **Background audio playback** | Users lock phones during meditation to avoid distractions; audio must continue | Medium | Native audio APIs required (iOS: AVAudioSession, Android: MediaSession). Web Audio API won't work in background. Existing drone synthesis may need rearchitecture. |
| **Audio mixing controls** | Users expect to adjust balance between meditation bell/gong sounds and ambient backgrounds | Low | Volume sliders for each layer. Existing AmbientEngine has dual-layer but no individual controls. |
| **Session history/journal** | Tracking progress is core to meditation practice; users expect to see past sessions | Low | Already implemented in web app. Needs mobile-native date picker and scrolling optimizations. |
| **Today screen/lock screen integration** | iOS/Android users expect quick access from lock screen or notification center | High | iOS: Today widgets. Android: Lock screen widgets. Requires widget extensions and inter-process communication. |
| **Quick meditation start** | Table stakes for mobile: tap icon → meditate within seconds, no multi-step setup | Medium | Deep linking to skip onboarding. Widget for one-tap start. Existing web app has 3-step flow (mood → duration → sound) which is too slow for mobile. |
| **App badging for streaks** | Native iOS/Android pattern users expect for engagement/gamification | Low | Badge count shows current streak. Simple but effective retention tool. |
| **Adaptive icons (Android)** | Android users expect app icons to match their theme/launcher | Low | Android 13+ adaptive icon support is expected baseline. |
| **Haptic feedback** | Mobile users expect tactile confirmation for meditation transitions (start, breathing cycles, completion) | Low | iOS: UIImpactFeedbackGenerator. Android: Vibrator API. Existing web app has basic vibration support. |
| **Do Not Disturb integration** | Users meditating don't want interruptions; app should enable DND automatically during sessions | Medium | iOS: Focus mode API. Android: DND access. Permission-gated but expected feature. |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Interactive home screen widgets** | Most meditation apps offer static widgets; interactive widgets (iOS 17+, Android 12+) let users start sessions without opening app | High | iOS: App Intents framework. Android: Jetpack Glance with interactive buttons. Requires careful state management across widget/app boundary. Major competitive advantage. |
| **Breathing pace haptics** | Subtle haptic pulse guiding inhale/exhale rhythm without visual reliance | Low | Existing web app has breathing visualizer; haptics add eyes-closed guidance. Simple timer-triggered vibration patterns. |
| **Smart notification timing** | ML-based "best time to meditate" notifications based on user patterns, not just fixed schedule | High | Analyze past session times, completion rates. Android: WorkManager constraints. iOS: Background processing. Requires analytics data and prediction model. Deferred to later phase. |
| **Ambient sound mixing/layering** | Users can layer multiple ambient sounds (rain + singing bowl + ocean) vs single selection | Medium | Existing AmbientEngine supports one sound + drone. Needs multi-track mixer with individual volume controls. |
| **Mood insights with context** | Post-meditation mood tracking with optional context tags (location, time of day, stressors) for pattern discovery | Medium | Existing mood tracking is simple pre/post. Adding context dimensions enables "You meditate best in mornings" insights. |
| **Complication support (watchOS/Wear OS)** | Quick glance at today's meditation status from watch face | High | Requires watch app development. Out of scope for initial milestone but strong differentiator. |
| **Offline-first architecture with eventual sync** | Users can meditate on multiple devices; data syncs when online without conflicts | High | Existing Supabase integration unused. Requires conflict resolution, delta sync. Strong retention feature but complex. Consider for Phase 2. |
| **Adaptive session suggestions** | App recommends meditation duration/sound based on time of day, mood history, available time | Medium | "You have 10 minutes. Quick breath session?" Requires analytics + heuristics. Differentiation through personalization. |
| **Custom breathing ratios** | Power users want to adjust inhale:hold:exhale:hold ratios beyond default 4:2:4:2 | Low | Existing web app hardcodes breathing cycle. Adding customization appeals to experienced meditators. |
| **Session templates** | Save favorite combinations (sound + duration + breathing ratio) for one-tap access | Low | "Morning calm" = 10min + ocean + 4-6-4 breathing. Reduces friction for repeat users. |
| **Mindful moments (iOS Focus modes)** | Suggest meditation when Focus mode activated or calendar shows break time | Medium | iOS 15+ Focus Filter API. Android: Digital Wellbeing integration. Platform-specific but high value. |
| **Silent mode with visual-only guidance** | For users in shared spaces; breathing visualizer + haptics only, no sound | Low | Existing app requires sound selection. Adding "silent" mode broadens use cases (office, public transit). |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Guided voice meditations** | Requires content creation, licensing, storage bloat. Existing app focuses on ambient sounds for self-guided practice. | Stick to ambient sounds + breathing timer. Users lead their own practice. |
| **Social features (sharing, leaderboards, community)** | Meditation is deeply personal; social pressure undermines intrinsic motivation. Adds complexity, moderation burden. | Focus on personal insights and self-competition (streaks, personal bests). |
| **In-app purchases / subscriptions** | Project goal is accessibility. Freemium creates design conflicts (what to gate?). | Keep completely free. Differentiate on quality and simplicity. |
| **Multiple user profiles** | Single-user-per-device aligns with meditation being personal practice. Multi-user adds auth, data isolation complexity. | One device = one user. Sync across devices via Supabase for same user only. |
| **Live classes / scheduled sessions** | Requires content creation, backend infrastructure, push to scheduled times. Conflicts with "meditate anytime" value. | Notifications are suggestions, not appointments. User always in control. |
| **Gamification beyond streaks** | Points, levels, achievements can create extrinsic motivation that undermines meditation practice. | Simple streak tracking is enough. No badges, levels, or points systems. |
| **Video content** | Meditation apps don't need video. Adds bandwidth, storage, battery drain. Conflicts with eyes-closed practice. | Audio + visual breathing guide is sufficient. |
| **AI chatbots / meditation guides** | Feels gimmicky for meditation. Users want simplicity, not conversational AI. Adds API costs and privacy concerns. | Stoic quotes (existing feature) provide wisdom without complexity. |
| **Sleep stories / bedtime content** | Different use case from meditation. Requires different content, UX, analytics. Feature creep. | Stay focused on meditation practice. Users can use other apps for sleep. |
| **Music streaming integration (Spotify, Apple Music)** | Licensing complexity, requires internet, conflicts with offline-first. Meditation benefits from consistent ambient sounds, not changing playlists. | Curated ambient sounds library. Consistent, predictable audio environment. |

## Feature Dependencies

```
Offline mode → Local audio caching (required before background audio)
Background audio → Native audio APIs (required for lock screen integration)
Push notifications → Notification permissions (required for streak reminders)
Home screen widgets → App state access (requires shared storage/IPC)
Interactive widgets → Widget framework (iOS 17+, Android 12+)
Do Not Disturb integration → System permissions (nice-to-have with background audio)

Mood insights → Historical mood data (existing web app has this)
Session templates → Saved preferences storage (extends existing localStorage pattern)
Adaptive suggestions → Analytics + mood history (builds on existing Vercel Analytics)
Smart notification timing → ML model + session history (requires analytics first)
```

## MVP Recommendation

Prioritize for initial mobile release:

1. **Offline mode** - Core value prop; required baseline for mobile meditation app
2. **Background audio playback** - Users will lock phones; broken audio = app is unusable
3. **Push notifications for reminders** - Primary retention mechanism for habit building
4. **Quick meditation start** - Reduce existing 3-step flow to 1-tap for mobile (widget or deep link)
5. **Haptic feedback for breathing** - Low effort, high perceived quality improvement over web app
6. **Do Not Disturb integration** - Expected by meditation app users; prevents interruptions
7. **Session history** - Already built in web; port to mobile with native scrolling

Defer to Phase 2:

- **Interactive widgets** - High complexity; start with static widget in MVP, upgrade in next release
- **Ambient sound mixing** - Nice-to-have; single sound selection works fine initially
- **Mood insights with context** - Requires analytics data accumulation first
- **Session templates** - Power user feature; defer until user feedback shows demand
- **Smart notification timing** - Requires ML model; too complex for MVP
- **Offline sync across devices** - Valuable but complex; single-device local-first is sufficient for MVP

## Mobile-Specific Patterns to Follow

### iOS Native Patterns

| Pattern | Purpose | Complexity | Priority |
|---------|---------|------------|----------|
| **Swipe gestures for navigation** | iOS users expect swipe-to-go-back throughout app | Low | High - Table stakes |
| **SF Symbols for icons** | Native iOS iconography feels polished | Low | High - Quality signal |
| **Large titles in navigation** | iOS design guideline for top-level screens | Low | Medium - Nice polish |
| **Context menus (long-press)** | iOS pattern for secondary actions on meditation history entries | Medium | Low - Not essential |
| **Shared sheet for export** | Standard iOS pattern for sharing meditation stats | Low | Low - Anti-social feature conflict |

### Android Native Patterns

| Pattern | Purpose | Complexity | Priority |
|---------|---------|------------|----------|
| **Material Design 3 components** | Expected Android visual language | Medium | High - Quality signal |
| **Navigation drawer** | Android pattern for settings/secondary nav | Low | Low - Bottom nav sufficient |
| **Floating Action Button (FAB)** | Android pattern for primary action (start meditation) | Low | Medium - Alternative to widget |
| **Snackbars for feedback** | Android toast alternative with actions | Low | Medium - Better UX than toasts |
| **System share sheet** | Standard Android sharing | Low | Low - Anti-social feature conflict |

### Cross-Platform Mobile Patterns

| Pattern | Purpose | Complexity | Priority |
|---------|---------|------------|----------|
| **Pull-to-refresh** | Mobile standard for refreshing content | Low | Low - Existing web app has this; less useful in local-first app |
| **Empty states with CTAs** | First-time user experience when no meditation history | Low | High - Onboarding critical |
| **Bottom sheet modals** | Mobile pattern for secondary content (mood picker, settings) | Medium | High - Better than full-screen on mobile |
| **Skeleton loading states** | Show structure while loading analytics/history | Low | Low - Local data loads instantly |
| **Smooth list animations** | Native scrolling with spring physics | Medium | Medium - Quality polish |

## Complexity Notes

**Low complexity features (1-3 days):**
- Haptic feedback, app badging, adaptive icons, audio mixing controls, breathing ratio customization, silent mode

**Medium complexity features (1-2 weeks):**
- Offline audio caching, push notifications, Do Not Disturb integration, ambient sound mixing, mood insights, session templates, bottom sheet UI patterns

**High complexity features (2-4 weeks):**
- Background audio with lock screen controls, interactive widgets, smart notification timing, offline sync with conflict resolution

## Platform Capability Gaps

**Web app → Mobile gaps to address:**

1. **Audio architecture** - Web Audio API for drone synthesis won't work in background on mobile
   - Solution: Use Expo AV for ambient playback; may need to pre-render drone to audio file or simplify to ambient-only

2. **Storage architecture** - localStorage insufficient for large audio files on mobile
   - Solution: Expo FileSystem for audio caching, AsyncStorage or MMKV for preferences/mood data

3. **Multi-step flow friction** - Web app's mood → duration → sound → meditate is too slow for mobile quick access
   - Solution: Smart defaults + widget/deep link for one-tap start; save last preferences

4. **Navigation during meditation** - Web app has confirmation dialog; mobile needs better session persistence
   - Solution: Background audio + lock screen controls let users safely navigate away

5. **Notification scheduling** - Web has no reminders; critical for mobile retention
   - Solution: Expo Notifications with local scheduling

## Sources

**Confidence: MEDIUM**

Research based on:
- Established mobile meditation app patterns (Headspace, Calm, Insight Timer patterns as of 2024)
- iOS Human Interface Guidelines for meditation/mindfulness apps
- Material Design guidelines for wellbeing apps
- React Native / Expo capabilities documentation
- Existing SimpleMeditation web app features (from PROJECT.md and ARCHITECTURE.md)

**Verification gaps:**
- Web search tools were unavailable; could not verify 2026 current state of meditation app market
- Could not access Context7 for React Native Expo documentation verification
- Feature priorities based on meditation app ecosystem knowledge from training data (Jan 2025)

**Recommendations flagged as LOW confidence:**
- Smart notification timing (ML-based) - implementation complexity may be higher than estimated
- Interactive widgets - iOS 17/Android 12 support needs verification for Expo compatibility
- Focus mode integration - API availability in React Native ecosystem needs verification

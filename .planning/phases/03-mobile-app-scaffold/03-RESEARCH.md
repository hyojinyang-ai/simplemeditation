# Phase 3: Mobile App Scaffold - Research

**Researched:** 2026-03-16
**Domain:** React Native with Expo, iOS mobile app development, monorepo integration
**Confidence:** MEDIUM-HIGH

## Summary

Phase 3 establishes the iOS mobile app foundation in a pnpm monorepo with Expo SDK 55, Expo Router for file-based navigation, React Native Paper for Material Design UI components, and react-native-mmkv for high-performance storage. The app will integrate the existing `@repo/meditation-core` package and provide a navigation shell with four tabs (index, tracker, analytics, settings).

The Expo ecosystem has matured significantly with SDK 55 (released February 2026) running entirely on React Native's New Architecture, automatic monorepo detection, and first-class pnpm workspace support. MMKV provides 30x faster storage than AsyncStorage, making it ideal for offline-first meditation session persistence. Development builds are required (not Expo Go) because react-native-mmkv contains native dependencies.

**Primary recommendation:** Use Expo SDK 55 with Expo Router v4 for file-based navigation, react-native-mmkv 4.2+ for storage with Zustand persist middleware, React Native Paper 5.x for UI components, and development builds (not Expo Go) for native module testing.

## Phase Requirements

<phase_requirements>

| ID | Description | Research Support |
|----|-------------|------------------|
| APP-01 | iOS app created with Expo CLI in apps/mobile/ directory | `npx create-expo-app` with `--template tabs` creates Expo Router app structure |
| APP-02 | Expo Router configured with file-based routing | Expo Router v4 provides automatic file-based routing from `app/` directory structure |
| APP-03 | Tab navigation implemented (index, tracker, analytics, settings routes) | Use `app/(tabs)/_layout.tsx` with Tabs component from expo-router |
| APP-04 | React Native Paper UI library integrated for mobile components | React Native Paper 5.x provides Material Design components compatible with Expo |
| APP-05 | meditation-core package imported and types resolve correctly | pnpm workspace protocol enables direct package imports; TypeScript resolves via tsconfig paths |
| APP-06 | react-native-mmkv installed and storage adapter implemented | MMKV 4.2+ provides StateStorage-compatible interface for Zustand persist |
| APP-07 | Zustand persist middleware uses mobile storage adapter | Create MMKV storage adapter implementing StateStorage interface from meditation-core |
| APP-08 | App launches and displays basic navigation shell on iOS Simulator | Expo development builds run on iOS Simulator after `npx expo prebuild` and `npx expo run:ios` |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | ~55.0.6 | Expo SDK framework | Current stable SDK (Feb 2026), includes React Native 0.83, New Architecture mandatory |
| expo-router | ~4.x | File-based navigation | Official Expo routing solution, replaces React Navigation setup complexity |
| react-native | 0.83 | Mobile UI framework | Included with Expo SDK 55, New Architecture enabled by default |
| react-native-mmkv | ^4.2.0 | Key-value storage | 30x faster than AsyncStorage, synchronous, perfect for Zustand persist |
| react-native-paper | ^5.x | Material Design UI | Official Material Design 3 components, Expo-compatible, comprehensive component library |
| zustand | ^5.0.11 | State management | Already used in meditation-core, lightweight (3KB), TypeScript-first |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-native-vector-icons/material-design-icons | Latest | Icon pack for Paper | Required for React Native Paper internal components (AppBar.BackAction) |
| expo-constants | Included | App config access | Reading app.json configuration values in runtime |
| react-native-safe-area-context | Included | Safe area handling | Handle iPhone notches, status bars automatically |
| react-native-screens | Included | Native navigation primitives | Expo Router dependency for performant screen management |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Expo | Bare React Native | Expo provides faster development, automatic native module linking, and easier monorepo setup; bare RN gives more control but requires manual configuration |
| Expo Router | React Navigation | Expo Router provides file-based routing (less boilerplate) and is officially supported; React Navigation offers more granular control but requires more configuration code |
| react-native-mmkv | AsyncStorage | MMKV is 30x faster and synchronous; AsyncStorage is built-in but slow and asynchronous (not ideal for Zustand persist) |
| React Native Paper | React Native Elements | Paper follows Material Design 3 spec closely and has better TypeScript support; RNE is more customizable but less opinionated |

**Installation:**
```bash
# Navigate to apps directory
cd apps

# Create Expo app with tabs template (includes Expo Router)
npx create-expo-app mobile --template tabs

# Navigate to mobile app
cd mobile

# Install additional dependencies
npx expo install react-native-mmkv react-native-paper react-native-safe-area-context

# Install meditation-core from workspace (already in monorepo)
# Add to package.json dependencies: "@repo/meditation-core": "workspace:*"
pnpm install

# Run prebuild for native modules (MMKV requires native code)
npx expo prebuild --clean

# Start iOS development
npx expo run:ios
```

## Architecture Patterns

### Recommended Project Structure
```
apps/mobile/
├── app/                          # Expo Router directory (file-based routing)
│   ├── (tabs)/                   # Tab group layout
│   │   ├── _layout.tsx           # Tab navigator configuration
│   │   ├── index.tsx             # Home/Meditation player tab
│   │   ├── tracker.tsx           # Mood tracker history tab
│   │   ├── analytics.tsx         # Analytics/charts tab
│   │   └── settings.tsx          # Settings tab
│   ├── _layout.tsx               # Root layout (providers, theme)
│   └── +not-found.tsx            # 404 fallback
├── components/                   # Reusable components
│   ├── ui/                       # Paper component wrappers
│   └── ...                       # Custom components
├── lib/                          # App-specific logic
│   ├── storage.ts                # MMKV adapter for Zustand
│   └── theme.ts                  # Paper theme configuration
├── assets/                       # Images, fonts
├── app.json                      # Expo configuration
├── metro.config.js               # Metro bundler (auto-generated)
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

### Pattern 1: Expo Router Tab Navigation
**What:** File-based routing where directory structure defines navigation hierarchy
**When to use:** All Expo Router apps; eliminates manual navigator configuration
**Example:**
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1', // zen-blue
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Meditate',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="meditation" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Pattern 2: MMKV Storage Adapter for Zustand
**What:** Implement StateStorage interface from meditation-core using react-native-mmkv
**When to use:** Bridge between MMKV and Zustand persist middleware
**Example:**
```typescript
// lib/storage.ts
import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from '@repo/meditation-core';

const mmkv = new MMKV();

export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    mmkv.set(name, value);
  },
  removeItem: (name: string): void => {
    mmkv.delete(name);
  },
};
```

### Pattern 3: React Native Paper Provider Setup
**What:** Wrap root layout with PaperProvider and custom theme
**When to use:** Required for all React Native Paper components to work
**Example:**
```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, configureFonts } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1', // zen-blue
    secondary: '#E0E7FF', // zen-blue-light
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

### Pattern 4: Importing Shared Package in Monorepo
**What:** Import meditation-core types and store factory in mobile app
**When to use:** All imports from workspace packages
**Example:**
```typescript
// app/(tabs)/index.tsx
import { createMeditationStore, type MoodEntry, type PreMood } from '@repo/meditation-core';
import { mmkvStorage } from '../../lib/storage';
import { create } from 'zustand';

// Create store with MMKV storage
export const useMeditationStore = create(
  createMeditationStore(mmkvStorage)
);

// Use in component
function MeditationScreen() {
  const entries = useMeditationStore(state => state.entries);
  const addEntry = useMeditationStore(state => state.addEntry);

  // Component logic
}
```

### Pattern 5: Metro Monorepo Configuration
**What:** Configure Metro to resolve workspace packages and follow symlinks
**When to use:** Required for pnpm monorepos with Expo (auto-configured in SDK 55+)
**Example:**
```javascript
// metro.config.js (auto-generated by Expo SDK 55)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo SDK 55+ auto-detects monorepos and configures Metro
// No manual configuration needed for pnpm workspaces

module.exports = config;
```

### Anti-Patterns to Avoid
- **Manual navigator setup:** Don't use `<NavigationContainer>` with React Navigation directly; use Expo Router's file-based routing instead
- **Expo Go for native modules:** Don't test react-native-mmkv in Expo Go; it requires development builds because of native dependencies
- **AsyncStorage for Zustand:** Don't use AsyncStorage with Zustand persist; it's asynchronous and slow (use MMKV synchronous storage instead)
- **Absolute imports with Babel aliases:** Don't configure Babel module-resolver in Expo apps; use TypeScript paths in tsconfig.json for monorepo package resolution
- **Hardcoded theme values:** Don't hardcode colors in components; use React Native Paper's theme system for consistency

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Navigation state persistence | Custom navigation state serialization | Expo Router built-in state restoration | Expo Router automatically handles deep linking, navigation state persistence, and back button behavior |
| Storage layer | Custom AsyncStorage wrapper with locks and batching | react-native-mmkv | MMKV handles synchronization, encryption, and is 30x faster with simpler API |
| Material Design components | Custom button/card/dialog components styled to match MD3 | React Native Paper | Paper implements Material Design 3 spec completely, handles accessibility, theming, and platform differences |
| Safe area handling | Manual Platform.select with device-specific padding | react-native-safe-area-context with SafeAreaProvider | Library handles all iOS notches, Android system bars, and device variations automatically |
| Monorepo Metro config | Manual Metro watchFolders, resolver config for symlinks | Expo SDK 55+ auto-detection | Expo automatically detects monorepos (pnpm, yarn, npm workspaces) and configures Metro correctly |

**Key insight:** React Native ecosystem maturity (2026) means most infrastructure concerns have battle-tested solutions. Custom implementations introduce bugs around edge cases (device variations, OS updates, unusual navigation flows) that standard libraries already handle.

## Common Pitfalls

### Pitfall 1: pnpm Symlinks Breaking Metro Resolution
**What goes wrong:** Metro bundler cannot find workspace packages or shows "Unable to resolve module" errors for `@repo/meditation-core` imports
**Why it happens:** Metro doesn't follow symlinks by default, and pnpm uses symlinks for workspace dependencies
**How to avoid:**
- Use Expo SDK 55+ which auto-detects pnpm workspaces and configures Metro
- Verify `.npmrc` in monorepo root has `node-linker=hoisted` (set by create-expo-app automatically)
- Run `npx expo start --clear` to clear Metro cache after workspace changes
**Warning signs:**
- "Unable to resolve @repo/meditation-core" errors in Metro bundler
- Metro cache shows stale dependency graph
- Changes in meditation-core not reflected in mobile app

### Pitfall 2: Using Expo Go Instead of Development Builds
**What goes wrong:** "react-native-mmkv is not available in Expo Go" error when testing storage
**Why it happens:** react-native-mmkv has native C++ code; Expo Go is pre-built and can't include custom native modules
**How to avoid:**
- Run `npx expo prebuild` to generate native iOS/Android projects
- Use `npx expo run:ios` (not `npx expo start`) for development builds
- Accept that development builds require rebuilding when adding native dependencies
**Warning signs:**
- "This library requires a development build" message in Expo Go
- MMKV import succeeds but crashes at runtime
- Native module imports show as undefined

### Pitfall 3: TypeScript Path Resolution Conflicts
**What goes wrong:** TypeScript shows "Cannot find module '@repo/meditation-core'" but Metro bundler works, or vice versa
**Why it happens:** TypeScript and Metro resolve modules differently; tsconfig.json paths don't automatically configure Metro
**How to avoid:**
- Don't use TypeScript path aliases for workspace packages (rely on pnpm workspace protocol)
- Import workspace packages as `@repo/meditation-core` (matches package.json name)
- Verify tsconfig.json extends workspace root config for consistent resolution
**Warning signs:**
- Red squiggles in VSCode but app runs fine
- App crashes but TypeScript compiler succeeds
- Inconsistent module resolution between dev and production

### Pitfall 4: Duplicate React/React Native Versions
**What goes wrong:** "Invalid hook call" errors, crashes with cryptic messages about multiple React renderers
**Why it happens:** Monorepo hoisting can create multiple copies of React/React Native if version mismatches exist between apps/mobile and packages/meditation-core
**How to avoid:**
- Use exact same React/React Native versions across entire monorepo
- Define React as peerDependency (not dependency) in meditation-core
- Run `pnpm list react react-native` to check for duplicates
**Warning signs:**
- "Invalid hook call" errors in console
- Multiple react versions in pnpm list output
- Hooks work in web app but fail in mobile app

### Pitfall 5: React Native Paper Icons Not Displaying
**What goes wrong:** Material Design icons show as blank squares or "X" symbols in React Native Paper components
**Why it happens:** Icon fonts not loaded in Expo app; vanilla React Native requires manual linking
**How to avoid:**
- No action needed for Expo (icons included in expo package)
- Import from `@expo/vector-icons` not `react-native-vector-icons` directly
- Use MaterialCommunityIcons for widest icon coverage
**Warning signs:**
- AppBar.BackAction shows blank square
- tabBarIcon renders as empty space
- Custom icons work but Paper component icons fail

### Pitfall 6: Environment Variables Not Available
**What goes wrong:** `process.env.SUPABASE_URL` returns undefined in React Native even though .env file exists
**Why it happens:** React Native doesn't load .env automatically; Expo requires `EXPO_PUBLIC_` prefix for client-side variables
**How to avoid:**
- Prefix all client-side env vars with `EXPO_PUBLIC_` (e.g., `EXPO_PUBLIC_SUPABASE_URL`)
- Access as `process.env.EXPO_PUBLIC_SUPABASE_URL` in code
- Never use `EXPO_PUBLIC_` prefix for secrets (they're bundled in app binary)
**Warning signs:**
- Environment variables undefined in mobile but work in web
- .env file exists but values not accessible
- Hardcoded values work but env vars don't

## Code Examples

Verified patterns from official sources:

### Creating Meditation Store with MMKV Storage
```typescript
// apps/mobile/lib/storage.ts
import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from '@repo/meditation-core';

// Create MMKV instance (singleton)
const mmkv = new MMKV();

// Implement StateStorage interface for Zustand persist
export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    mmkv.set(name, value);
  },
  removeItem: (name: string): void => {
    mmkv.delete(name);
  },
};

// apps/mobile/lib/store.ts
import { create } from 'zustand';
import { createMeditationStore } from '@repo/meditation-core';
import { mmkvStorage } from './storage';

// Create Zustand store with MMKV persistence
export const useMeditationStore = create(
  createMeditationStore(mmkvStorage)
);
```

### Tab Navigation Layout Configuration
```typescript
// apps/mobile/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Meditate',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="meditation" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Root Layout with React Native Paper Provider
```typescript
// apps/mobile/app/_layout.tsx
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Customize theme to match SimpleMeditation zen colors
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1', // zen-blue
    secondary: '#E0E7FF', // zen-blue-light
    tertiary: '#C7D2FE', // zen-lavender
    background: '#FFFFFF',
    surface: '#F9FAFB',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // Can customize fonts here if needed
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

### Basic Tab Screen Component
```typescript
// apps/mobile/app/(tabs)/index.tsx
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useMeditationStore } from '../../lib/store';

export default function MeditationScreen() {
  const entries = useMeditationStore(state => state.entries);
  const addEntry = useMeditationStore(state => state.addEntry);

  const handleTestEntry = () => {
    addEntry({
      id: Date.now().toString(),
      preMood: 'stressed',
      postMood: 'calm',
      timestamp: Date.now(),
      sessionMinutes: 5,
      sound: 'singing-bowl',
    });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge">SimpleMeditation</Text>
      <Text variant="bodyMedium">
        {entries.length} meditation sessions recorded
      </Text>
      <Button mode="contained" onPress={handleTestEntry}>
        Test Entry Creation
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Navigation manual setup | Expo Router file-based routing | Expo SDK 46 (2022), matured SDK 49+ | Eliminates 200+ lines of navigator boilerplate; automatic deep linking |
| Expo managed workflow vs bare | Continuous Native Generation (CNG) | Expo SDK 46+ | Unified workflow: start managed, eject gracefully when needed |
| AsyncStorage | MMKV | MMKV stable 2021, mainstream 2024+ | 30x performance improvement, synchronous API works better with Zustand |
| Yarn workspaces only | pnpm/Bun/npm workspaces | Expo SDK 52+ (Jan 2026) | First-class pnpm support with automatic Metro configuration |
| Old Architecture | New Architecture mandatory | Expo SDK 55 (Feb 2026) | Turbo Modules and Fabric renderer always enabled; faster, better memory |
| Material Design 2 | Material Design 3 (Material You) | React Native Paper 5.x (2023+) | Dynamic color, improved accessibility, modern design language |

**Deprecated/outdated:**
- `expo-cli` global install: Now use `npx expo` with local CLI (SDK 46+)
- Manual Metro monorepo config: SDK 55+ auto-detects and configures
- `expo eject`: Replaced by `expo prebuild` for cleaner native project generation
- React Navigation without Expo Router: Use Expo Router for new projects (less boilerplate)
- `.env` without `EXPO_PUBLIC_` prefix: Required for Expo to bundle environment variables

## Open Questions

1. **Expo SDK stability for production iOS release**
   - What we know: SDK 55 released Feb 2026, New Architecture mandatory
   - What's unclear: Production readiness of New Architecture in SDK 55 (first forced-on version)
   - Recommendation: Validate with development builds on physical iOS devices before Phase 7 deployment; monitor Expo Discord for SDK 55 stability reports

2. **React Native Paper theming compatibility with web Tailwind classes**
   - What we know: meditation-core exports Tailwind classes for mood colors (web app uses them)
   - What's unclear: Can React Native Paper theme use same color values for consistent branding across web/mobile?
   - Recommendation: Extract hex color values from Tailwind config, apply to Paper theme (colors work, utility classes don't)

3. **MMKV encryption for sensitive meditation data**
   - What we know: MMKV supports encryption with encryption key parameter
   - What's unclear: Should meditation entries be encrypted at rest on device? Privacy implication
   - Recommendation: Defer encryption to Phase 6 (Native Features); focus Phase 3 on basic persistence working

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29+ with jest-expo preset |
| Config file | `jest.config.js` in `apps/mobile/` (created in Wave 0) |
| Quick run command | `npm test -- --testPathPattern="store.test"` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| APP-01 | Expo app created in apps/mobile/ with package.json | manual | N/A - verify directory structure | ❌ Wave 0 |
| APP-02 | Expo Router resolves app/(tabs)/_layout.tsx | manual | N/A - verify file exists and imports | ❌ Wave 0 |
| APP-03 | Tab navigation renders 4 tabs | unit | `npm test -- TabLayout.test.tsx` | ❌ Wave 0 |
| APP-04 | React Native Paper Button component renders | unit | `npm test -- Paper.test.tsx` | ❌ Wave 0 |
| APP-05 | Import from @repo/meditation-core resolves types | unit | `npm test -- store-integration.test.tsx` | ❌ Wave 0 |
| APP-06 | MMKV storage adapter implements StateStorage | unit | `npm test -- mmkv-storage.test.ts` | ❌ Wave 0 |
| APP-07 | Zustand store persists with MMKV adapter | unit | `npm test -- store-persistence.test.ts` | ❌ Wave 0 |
| APP-08 | App launches without crashes on iOS Simulator | manual | N/A - run `npx expo run:ios` and verify | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="{modified-file}"` (run only tests for changed code)
- **Per wave merge:** `npm test` (full suite must pass)
- **Phase gate:** Full suite green + manual iOS Simulator launch test before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/mobile/jest.config.js` — jest-expo preset configuration
- [ ] `apps/mobile/__tests__/TabLayout.test.tsx` — covers APP-03
- [ ] `apps/mobile/__tests__/Paper.test.tsx` — covers APP-04
- [ ] `apps/mobile/__tests__/store-integration.test.tsx` — covers APP-05
- [ ] `apps/mobile/lib/__tests__/mmkv-storage.test.ts` — covers APP-06
- [ ] `apps/mobile/lib/__tests__/store-persistence.test.ts` — covers APP-07
- [ ] Framework install: `npx expo install jest-expo jest @testing-library/react-native`
- [ ] Test script in package.json: `"test": "jest"`

**Note:** jest-expo provides React Native-specific mocks and jest presets. React Native Testing Library (@testing-library/react-native) provides component testing utilities similar to web's Testing Library.

## Sources

### Primary (HIGH confidence)
- [Expo SDK 55 release information](https://docs.expo.dev/versions/latest/) - Current SDK version, React Native 0.83 included
- [Expo monorepo documentation](https://docs.expo.dev/guides/monorepos/) - Official pnpm workspace support
- [Expo Router tabs documentation](https://docs.expo.dev/router/advanced/tabs/) - File-based tab navigation patterns
- [react-native-mmkv GitHub](https://github.com/mrousavy/react-native-mmkv) - MMKV installation and usage
- [react-native-mmkv Zustand integration](https://github.com/mrousavy/react-native-mmkv/blob/main/docs/WRAPPER_ZUSTAND_PERSIST_MIDDLEWARE.md) - Official Zustand persist middleware guide
- [React Native Paper Getting Started](https://callstack.github.io/react-native-paper/docs/guides/getting-started/) - Installation and provider setup
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/) - Development builds vs Expo Go

### Secondary (MEDIUM confidence)
- [How I Finally Got a React Native Monorepo Working](https://medium.com/code-sense/how-i-finally-got-a-react-native-monorepo-working-with-turbo-pnpm-and-an-expo-shell-after-c8afd85522ea) - Real-world monorepo pitfalls (Medium, Feb 2026)
- [Expo Go vs Expo Dev Client: Which One Should You Actually Use?](https://medium.com/@pamudasansika/expo-go-vs-expo-dev-client-which-one-should-you-actually-use-1538f6aae194) - Development workflow comparison (Medium, Feb 2026)
- [zustand-mmkv-storage: Blazing Fast Persistence for Zustand](https://dev.to/mehdifaraji/zustand-mmkv-storage-blazing-fast-persistence-for-zustand-in-react-native-3ef1) - MMKV integration patterns (DEV, Dec 2025)
- [How to Persist State with AsyncStorage and MMKV in React Native](https://oneuptime.com/blog/post/2026-01-15-react-native-asyncstorage-mmkv/view) - Storage comparison and migration guide (Jan 2026)
- [React Native Path Aliases in Monorepo](https://oneuptime.com/blog/post/2026-01-15-react-native-path-aliases/view) - TypeScript path configuration (Jan 2026)

### Tertiary (LOW confidence)
- [Expo app folder structure best practices](https://expo.dev/blog/expo-app-folder-structure-best-practices) - Project structure recommendations (date unclear)
- [Best Practices for Expo Router: Tabs, Stacks & Shared Screens](https://medium.com/@siddhantshelake/best-practices-for-expo-router-tabs-stacks-shared-screens-b3cacc3e8ebb) - Community patterns (Medium, date unclear)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified via official docs and npm, Expo SDK 55 current stable release
- Architecture: MEDIUM-HIGH - File-based routing and MMKV patterns verified from official docs; monorepo Metro config confirmed auto-detected in SDK 55
- Pitfalls: MEDIUM - pnpm symlink issues verified from multiple community sources; development builds requirement confirmed from official docs; other pitfalls from community experience (Medium, DEV articles)
- Integration patterns: MEDIUM - MMKV + Zustand pattern from official repo docs; Paper provider setup from official docs; Tab navigation from official Expo docs

**Research date:** 2026-03-16
**Valid until:** 2026-04-15 (30 days - Expo ecosystem stable, SDK 55 released Feb 2026)

# SimpleMeditation Analytics Documentation

## Overview

SimpleMeditation uses **Vercel Analytics** to track user visits, engagement, and meditation session data. This provides insights into how users interact with the app and helps improve the meditation experience.

## Analytics Setup

### Dependencies
- `@vercel/analytics` (v2.0.0) - Already installed

### Configuration
The Analytics component is already integrated in `src/App.tsx`:
```tsx
import { Analytics } from "@vercel/analytics/react";

<Analytics />
```

## Tracked Events

### 1. Page Views
Tracks navigation to different pages in the app.

**Events:**
- `page_view` - Triggered on every page load
  - `page`: 'home', 'tracker', 'analytics', 'settings'
  - `timestamp`: ISO 8601 timestamp

### 2. Meditation Sessions

**Session Start:**
- `session_start` - User starts a meditation session
  - `duration_minutes`: Selected session length (3, 5, 10, 15, 20, 30 minutes)
  - `sound_type`: Selected ambient sound

**Session Complete:**
- `session_complete` - User completes a meditation session
  - `duration_minutes`: Session length
  - `sound_type`: Ambient sound used
  - `pre_mood`: Mood before meditation (stressed, tired, neutral, anxious)
  - `post_mood`: Mood after meditation (calm, relieved, peaceful, grateful, refreshed)

**Session Abandoned:**
- `session_abandoned` - User exits before completing session
  - `duration_minutes`: Intended session length
  - `completion_percent`: How much was completed (0-100%)
  - `sound_type`: Ambient sound used

### 3. Mood Tracking

**Pre-Meditation Mood:**
- `pre_mood_selected`
  - `mood`: stressed, tired, neutral, anxious

**Post-Meditation Mood:**
- `post_mood_selected`
  - `mood`: calm, relieved, peaceful, grateful, refreshed
  - `pre_mood`: Original pre-meditation mood
  - `mood_shift`: Combined string showing transformation (e.g., "stressed_to_calm")

### 4. Sound Selection
- `sound_changed` - User changes ambient sound
  - `from_sound`: Previous sound selection
  - `to_sound`: New sound selection

### 5. Engagement Features

**Quote Interactions:**
- `quote_saved` - User saves a stoic quote
  - `author`: Quote author (Marcus Aurelius, Seneca, Epictetus, Eckhart Tolle)

**Notes:**
- `note_added` - User adds a reflection note
  - `session_minutes`: Associated session length

**Pull-to-Refresh:**
- `pull_to_refresh` - User uses pull-to-refresh gesture
  - `page`: Page where gesture was used

### 6. User Retention

**Streaks:**
- `daily_streak` - Milestone for consecutive days
  - `streak_days`: Number of consecutive days

**Session Milestones:**
- `total_sessions_milestone` - Total sessions completed
  - `total_sessions`: Cumulative count

### 7. Analytics Dashboard
- `analytics_viewed` - User views analytics charts
  - `chart_type`: Type of chart viewed

### 8. Settings
- `settings_changed` - User modifies app settings
  - `setting`: Setting name
  - `value`: New value

### 9. Error Tracking
- `audio_error` - Audio playback issues
  - `error_type`: Type of error
  - `sound_type`: Sound that failed

### 10. Feature Usage
- `feature_used` - Generic feature interaction tracking
  - `feature`: Feature name

## Viewing Analytics Data

### In Vercel Dashboard

1. **Deploy to Vercel** (if not already deployed)
   ```bash
   vercel --prod
   ```

2. **Access Analytics:**
   - Go to [vercel.com](https://vercel.com)
   - Select your SimpleMeditation project
   - Navigate to "Analytics" tab

3. **Available Metrics:**
   - **Visitors**: Unique visitors over time
   - **Page Views**: Total page impressions
   - **Custom Events**: All tracked events listed above
   - **Web Vitals**: Performance metrics (CLS, FCP, LCP, FID, TTFB)

### Custom Event Filtering

In Vercel Analytics, you can:
- Filter events by name (e.g., show only `session_complete`)
- Group by properties (e.g., sound_type, mood_shift)
- View time series charts
- Export data for further analysis

## Key Insights You Can Gain

### User Engagement
- **Most popular meditation durations**: Which session lengths are most used
- **Sound preferences**: Which ambient sounds users prefer
- **Completion rate**: Percentage of sessions completed vs abandoned
- **Page engagement**: Which pages users visit most

### Mood Transformation
- **Most common mood shifts**: e.g., "stressed_to_calm"
- **Pre-meditation states**: What moods drive users to meditate
- **Post-meditation outcomes**: How effective sessions are at changing mood

### Retention & Growth
- **Daily active users**: How many users meditate daily
- **Session frequency**: Average sessions per user
- **Feature adoption**: Which features (quotes, notes) are used most
- **Streak tracking**: How many users maintain daily practice

### Performance
- **Audio errors**: Track any playback issues
- **Page load times**: Web Vitals metrics
- **Pull-to-refresh usage**: Mobile engagement patterns

## Privacy Considerations

- Vercel Analytics is **privacy-friendly** and **GDPR compliant**
- No cookies required
- No personal data collected
- All events are anonymized
- Users cannot be individually identified

## Advanced Analytics (Optional Upgrades)

### Google Analytics 4 (GA4)
For more detailed funnel analysis and user segmentation:

```bash
npm install react-ga4
```

### PostHog (Open Source)
For session recordings and heatmaps:

```bash
npm install posthog-js
```

### Mixpanel
For advanced cohort analysis and A/B testing:

```bash
npm install mixpanel-browser
```

## Testing Analytics

### Development
Analytics events work in both development and production. To test:

1. Run the app: `npm run dev`
2. Open browser DevTools → Network tab
3. Filter for "vercel" or "analytics"
4. Perform actions (start session, select mood, etc.)
5. Verify events are sent

### Production
Deploy to Vercel to see real analytics data in dashboard.

## Event Implementation Guide

All analytics functions are centralized in `src/lib/analytics.ts`. To add new events:

```typescript
import { track } from '@vercel/analytics';

export const trackYourEvent = (param: string) => {
  track('event_name', {
    parameter: param,
    timestamp: new Date().toISOString(),
  });
};
```

Then import and use in components:
```typescript
import { trackYourEvent } from '@/lib/analytics';

// In your component
trackYourEvent('value');
```

## Troubleshooting

**Events not showing in Vercel:**
- Ensure you're deployed to Vercel (not localhost)
- Wait 5-10 minutes for data to appear
- Check that `@vercel/analytics` is properly installed
- Verify `<Analytics />` is in App.tsx

**Type errors:**
- Run `npm install` to ensure dependencies are current
- Check TypeScript version compatibility

## Future Enhancements

Potential analytics to add:
- Session time of day patterns
- Weather/time correlation (if API integrated)
- Breathing pace preferences
- Multi-session journey tracking
- Social sharing metrics
- Notification engagement (if push notifications added)
- Offline usage tracking

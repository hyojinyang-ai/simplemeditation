# Analytics Testing Guide

## 🧪 How to Test Analytics

The dev server is running at: **http://localhost:8080/**

All analytics events will be logged to the browser console with a 📊 emoji in development mode.

---

## ✅ Testing Checklist

### 1. **Page View Tracking**

**Test: Navigate to each page**

1. Open http://localhost:8080/
2. Open browser DevTools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Navigate to each page using bottom nav

**Expected Events:**
```
📊 Analytics Event: page_view { page: 'home', timestamp: '...' }
📊 Analytics Event: page_view { page: 'tracker', timestamp: '...' }
📊 Analytics Event: page_view { page: 'analytics', timestamp: '...' }
📊 Analytics Event: page_view { page: 'settings', timestamp: '...' }
```

---

### 2. **Pre-Mood Selection**

**Test: Select a mood before meditation**

1. On home page, select any mood (e.g., "Stressed")

**Expected Event:**
```
📊 Analytics Event: pre_mood_selected { mood: 'stressed' }
```

---

### 3. **Session Duration Selection**

**Test: Choose session length**

1. After selecting mood, choose any duration (e.g., 3 minutes)

**Expected:** No event fires here (only session start matters)

---

### 4. **Sound Selection**

**Test: Pick ambient sound**

1. Choose a sound (e.g., "Singing Bowl")

**Expected:** No event on first selection
**If you go back and change the sound:**
```
📊 Analytics Event: sound_changed { from_sound: 'singing-bowl', to_sound: 'rain' }
```

---

### 5. **Session Start**

**Test: Start meditation session**

1. After selecting sound, tap the Play button

**Expected Event:**
```
📊 Analytics Event: session_start {
  duration_minutes: 3,
  sound_type: 'singing-bowl'
}
```

---

### 6. **Session Complete** ⏱️

**Test: Complete full meditation session**

**Note:** For testing, you may want to:
- Choose 3-minute session for faster testing
- OR temporarily modify the timer in code

1. Let the session run to completion (timer reaches 00:00)

**Expected Event:**
```
📊 Analytics Event: session_complete {
  duration_minutes: 3,
  sound_type: 'singing-bowl',
  pre_mood: 'stressed',
  post_mood: 'not_set'
}
```

---

### 7. **Post-Mood Selection**

**Test: Reflect after meditation**

1. After session completes, select how you feel (e.g., "Calm")

**Expected Event:**
```
📊 Analytics Event: post_mood_selected {
  mood: 'calm',
  pre_mood: 'stressed',
  mood_shift: 'stressed_to_calm'
}
```

---

### 8. **Quote Saved**

**Test: Save inspirational quote**

1. After selecting post-mood, tap "Save Quote" on the quote screen

**Expected Event:**
```
📊 Analytics Event: quote_saved { author: 'Marcus Aurelius' }
```

---

### 9. **Session Abandoned** ⚠️

**Test: Exit session early**

1. Start a new session
2. Let it play for a few seconds
3. Navigate away (click back arrow or bottom nav)

**Expected Event:**
```
📊 Analytics Event: session_abandoned {
  duration_minutes: 3,
  completion_percent: 15,
  sound_type: 'singing-bowl'
}
```

---

### 10. **Pull-to-Refresh** (Mobile/Desktop)

**Test: Refresh tracker page**

1. Go to Tracker page
2. Pull down from the top of the page (on mobile)
3. Or scroll to top and pull (on desktop)

**Expected Event:**
```
📊 Analytics Event: pull_to_refresh { page: 'tracker' }
```

---

## 🔍 Quick Test Flow (Complete Journey)

Here's a full user journey to test multiple events:

1. **Load app** → `page_view: home`
2. **Select "Stressed"** → `pre_mood_selected: stressed`
3. **Choose 3 minutes** → (no event)
4. **Pick "Rain"** → (no event on first pick)
5. **Press Play** → `session_start`
6. **Wait ~10 seconds, then go back** → `session_abandoned: 5%`
7. **Start again, complete session** → `session_complete`
8. **Select "Calm" mood** → `post_mood_selected: calm, mood_shift: stressed_to_calm`
9. **Save quote** → `quote_saved: Seneca`
10. **Click Tracker** → `page_view: tracker`
11. **Click Analytics** → `page_view: analytics`
12. **Click Settings** → `page_view: settings`

**Total Events:** 9-10 events in ~3-5 minutes

---

## 🐛 Troubleshooting

### Events not showing in console?

1. **Check Console Filters:** Make sure "Info" level logs are enabled
2. **Search for "Analytics":** Use the console filter/search
3. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Events showing but not in Vercel?

- Events in **development** are logged to console only
- Events in **production** (deployed to Vercel) go to Vercel Analytics dashboard
- To see in Vercel: `vercel --prod` then check dashboard after ~5-10 minutes

### Page not loading?

```bash
# Check if dev server is running
ps aux | grep vite

# Restart dev server
npm run dev
```

---

## 📊 Vercel Analytics (Production)

To see real analytics data:

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Use the app normally** for a few hours/days

3. **View Analytics:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Click "Analytics" tab
   - Wait 5-10 minutes for data to appear

4. **Explore Custom Events:**
   - Filter by event name (e.g., `session_complete`)
   - Group by properties (e.g., `sound_type`)
   - View time-series charts
   - Export data as CSV

---

## ✨ Success Criteria

Analytics is working correctly if you see:

✅ Console logs with 📊 emoji for all test actions
✅ Correct event names (page_view, session_start, etc.)
✅ Accurate data in each event (durations, moods, sounds)
✅ Mood shift calculations (e.g., "stressed_to_calm")
✅ Completion percentages for abandoned sessions
✅ Timestamps on all events

---

Happy testing! 🎉

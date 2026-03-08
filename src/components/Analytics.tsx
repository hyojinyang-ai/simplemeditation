import { motion } from 'framer-motion';
import { useMeditationStore, preMoodConfig, postMoodConfig, PreMood, PostMood, preMoodToValue } from '@/lib/meditation-store';
import { subDays, startOfDay, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CHART_COLORS = [
  'hsl(152, 35%, 45%)',
  'hsl(200, 25%, 60%)',
  'hsl(270, 25%, 70%)',
  'hsl(32, 40%, 65%)',
  'hsl(0, 60%, 55%)',
];

const Analytics = () => {
  const { entries } = useMeditationStore();

  const totalSessions = entries.filter((e) => e.sessionMinutes).length;
  const totalMinutes = entries.reduce((sum, e) => sum + (e.sessionMinutes || 0), 0);

  // Streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = startOfDay(subDays(new Date(), i)).getTime();
    const hasEntry = entries.some((e) => e.timestamp >= day && e.timestamp < day + 86400000);
    if (hasEntry) streak++;
    else break;
  }

  // Sessions per day (last 14 days)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dayStart = startOfDay(date).getTime();
    const count = entries.filter((e) => e.timestamp >= dayStart && e.timestamp < dayStart + 86400000).length;
    const totalMin = entries
      .filter((e) => e.timestamp >= dayStart && e.timestamp < dayStart + 86400000)
      .reduce((s, e) => s + (e.sessionMinutes || 0), 0);
    return { date: format(date, 'MMM d'), sessions: count, minutes: totalMin };
  });

  // Pre-mood distribution
  const preMoodDist = (Object.keys(preMoodConfig) as PreMood[]).map((mood, i) => ({
    name: preMoodConfig[mood].label,
    value: entries.filter((e) => e.preMood === mood).length,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })).filter((d) => d.value > 0);

  // Post-mood distribution
  const postMoodDist = (Object.keys(postMoodConfig) as PostMood[]).map((mood, i) => ({
    name: postMoodConfig[mood].label,
    value: entries.filter((e) => e.postMood === mood).length,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })).filter((d) => d.value > 0);

  // Mood trend (avg pre-mood per day, last 14 days)
  const moodTrend = last14.map((day) => {
    const dayEntries = entries.filter((e) => {
      const d = format(new Date(e.timestamp), 'MMM d');
      return d === day.date;
    });
    const avg = dayEntries.length > 0
      ? dayEntries.reduce((s, e) => s + preMoodToValue[e.preMood], 0) / dayEntries.length
      : null;
    return { date: day.date, mood: avg };
  });

  const stats = [
    { label: 'Sessions', value: totalSessions, icon: '🧘' },
    { label: 'Minutes', value: totalMinutes, icon: '⏱️' },
    { label: 'Streak', value: `${streak}d`, icon: '🔥' },
    { label: 'Entries', value: entries.length, icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-background px-4 pt-8 pb-24 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-semibold">Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">Your mindfulness journey at a glance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-display font-semibold mt-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Sessions bar chart */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-card space-y-3"
        >
          <h3 className="text-base font-display font-medium">Daily Sessions</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={last14}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="sessions" fill="hsl(152, 35%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Minutes line chart */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-card space-y-3"
        >
          <h3 className="text-base font-display font-medium">Minutes Meditated</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={last14}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis hide />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="minutes" stroke="hsl(200, 25%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Mood trend */}
      {moodTrend.some((d) => d.mood !== null) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl p-4 shadow-card space-y-3"
        >
          <h3 className="text-base font-display font-medium">Mood Trend</h3>
          <p className="text-xs text-muted-foreground -mt-1">Pre-session mood average (1=low, 5=high)</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={moodTrend.filter((d) => d.mood !== null)}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis domain={[1, 5]} hide />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="mood" stroke="hsl(270, 25%, 70%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Feeling distributions */}
      {preMoodDist.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-4 shadow-card space-y-2"
          >
            <h3 className="text-sm font-display font-medium">Before</h3>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={preMoodDist} dataKey="value" cx="50%" cy="50%" outerRadius={45} innerRadius={25} paddingAngle={3}>
                  {preMoodDist.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1">
              {preMoodDist.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
          {postMoodDist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card rounded-2xl p-4 shadow-card space-y-2"
            >
              <h3 className="text-sm font-display font-medium">After</h3>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={postMoodDist} dataKey="value" cx="50%" cy="50%" outerRadius={45} innerRadius={25} paddingAngle={3}>
                    {postMoodDist.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">
                {postMoodDist.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <span className="text-5xl">📊</span>
          <p className="text-muted-foreground text-sm">Complete sessions to see your insights here.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;

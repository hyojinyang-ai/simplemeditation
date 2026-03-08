import { motion } from 'framer-motion';
import { useMeditationStore, preMoodConfig, postMoodConfig, PreMood, PostMood, preMoodToValue } from '@/lib/meditation-store';
import { subDays, startOfDay, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import heroImg from '@/assets/hero-nature.jpg';

const CHART_COLORS = [
  'hsl(220, 65%, 58%)',
  'hsl(260, 45%, 65%)',
  'hsl(155, 40%, 50%)',
  'hsl(200, 60%, 70%)',
  'hsl(340, 40%, 65%)',
];

const Analytics = () => {
  const { entries } = useMeditationStore();

  const totalSessions = entries.filter((e) => e.sessionMinutes).length;
  const totalMinutes = entries.reduce((sum, e) => sum + (e.sessionMinutes || 0), 0);

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = startOfDay(subDays(new Date(), i)).getTime();
    const hasEntry = entries.some((e) => e.timestamp >= day && e.timestamp < day + 86400000);
    if (hasEntry) streak++;
    else break;
  }

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dayStart = startOfDay(date).getTime();
    const count = entries.filter((e) => e.timestamp >= dayStart && e.timestamp < dayStart + 86400000).length;
    const totalMin = entries
      .filter((e) => e.timestamp >= dayStart && e.timestamp < dayStart + 86400000)
      .reduce((s, e) => s + (e.sessionMinutes || 0), 0);
    return { date: format(date, 'MMM d'), sessions: count, minutes: totalMin };
  });

  const preMoodDist = (Object.keys(preMoodConfig) as PreMood[]).map((mood, i) => ({
    name: preMoodConfig[mood].label,
    value: entries.filter((e) => e.preMood === mood).length,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })).filter((d) => d.value > 0);

  const postMoodDist = (Object.keys(postMoodConfig) as PostMood[]).map((mood, i) => ({
    name: postMoodConfig[mood].label,
    value: entries.filter((e) => e.postMood === mood).length,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })).filter((d) => d.value > 0);

  const moodTrend = last14.map((day) => {
    const dayEntries = entries.filter((e) => format(new Date(e.timestamp), 'MMM d') === day.date);
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
    <div className="min-h-screen relative pb-24">
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="" className="w-full h-48 object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/90 to-background" />
      </div>

      <div className="px-4 pt-8 max-w-md mx-auto space-y-5">
        <div>
          <h1 className="text-3xl font-display font-semibold">Insights</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Your mindfulness journey at a glance</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="glass-strong rounded-2xl p-4"
            >
              <span className="text-2xl">{stat.icon}</span>
              <div className="text-2xl font-display font-semibold mt-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {entries.length > 0 && (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-4 space-y-3">
              <h3 className="text-base font-display font-medium">Daily Sessions</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last14}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="sessions" fill="hsl(220, 65%, 58%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-2xl p-4 space-y-3">
              <h3 className="text-base font-display font-medium">Minutes Meditated</h3>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={last14}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="minutes" stroke="hsl(260, 45%, 65%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}

        {moodTrend.some((d) => d.mood !== null) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-strong rounded-2xl p-4 space-y-3">
            <h3 className="text-base font-display font-medium">Mood Trend</h3>
            <p className="text-xs text-muted-foreground -mt-1">Pre-session mood average (1=low, 5=high)</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={moodTrend.filter((d) => d.mood !== null)}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis domain={[1, 5]} hide />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="mood" stroke="hsl(155, 40%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {preMoodDist.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-strong rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-display font-medium">Before</h3>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={preMoodDist} dataKey="value" cx="50%" cy="50%" outerRadius={45} innerRadius={25} paddingAngle={3}>
                    {preMoodDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-strong rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-display font-medium">After</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={postMoodDist} dataKey="value" cx="50%" cy="50%" outerRadius={45} innerRadius={25} paddingAngle={3}>
                      {postMoodDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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
    </div>
  );
};

export default Analytics;

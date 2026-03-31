import { motion } from 'framer-motion';
import { useMeditationStore, type PreMood, type PostMood } from '@/lib/meditation-store';
import { preMoodConfig, postMoodConfig } from '@/lib/web-mood-config';
import { preMoodToValue, calculateStreak } from '@repo/meditation-core';
import { subDays, startOfDay, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, Clock, Flame, FileText, BarChart3 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

import StepHeader from '@/components/StepHeader';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import PullToRefresh from '@/components/PullToRefresh';

const CHART_COLORS = [
  'hsl(220, 65%, 58%)',
  'hsl(260, 45%, 65%)',
  'hsl(155, 40%, 50%)',
  'hsl(200, 60%, 70%)',
  'hsl(340, 40%, 65%)',
];

const Analytics = () => {
  const { t } = useI18n();
  const { entries } = useMeditationStore();
  const { containerRef, pullDistance, refreshing, threshold } = usePullToRefresh();

  const totalSessions = entries.filter((e) => e.sessionMinutes).length;
  const totalMinutes = entries.reduce((sum, e) => sum + (e.sessionMinutes || 0), 0);

  const streak = calculateStreak(entries);

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
    name: t(`mood.${mood}`),
    value: entries.filter((e) => e.preMood === mood).length,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })).filter((d) => d.value > 0);

  const postMoodDist = (Object.keys(postMoodConfig) as PostMood[]).map((mood, i) => ({
    name: t(`mood.${mood}`),
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
    { label: t('sessions'), value: totalSessions, icon: Activity },
    { label: t('minutes'), value: totalMinutes, icon: Clock },
    { label: t('streak'), value: `${streak}d`, icon: Flame },
    { label: t('entries'), value: entries.length, icon: FileText },
  ];

  return (
    <div ref={containerRef} className="min-h-screen relative pb-24 overflow-auto">
      <StepHeader title={t('insights')} subtitle={t('your_mindfulness_journey')} sticky />

      <div className="px-4 max-w-md mx-auto space-y-5 mt-4">
        <PullToRefresh pullDistance={pullDistance} refreshing={refreshing} threshold={threshold} />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="glass-strong rounded-2xl p-4 space-y-2"
              >
                <Icon size={18} strokeWidth={1.5} className="text-muted-foreground" />
                <div className="text-2xl font-display font-medium">{stat.value}</div>
                <div className="text-xs text-muted-foreground tracking-wide">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {entries.length > 0 && (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-display font-medium tracking-tight">{t('daily_sessions')}</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last14}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="sessions" fill="hsl(220, 65%, 58%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-display font-medium tracking-tight">{t('minutes_meditated')}</h3>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={last14}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="minutes" stroke="hsl(260, 45%, 65%)" strokeWidth={2} dot={{ r: 2.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}

        {moodTrend.some((d) => d.mood !== null) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-strong rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-display font-medium tracking-tight">{t('mood_trend')}</h3>
            <p className="text-[11px] text-muted-foreground -mt-1">{t('pre_session_avg')}</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={moodTrend.filter((d) => d.mood !== null)}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis domain={[1, 5]} hide />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="mood" stroke="hsl(155, 40%, 50%)" strokeWidth={2} dot={{ r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {preMoodDist.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-strong rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-display font-medium tracking-tight">{t('before')}</h3>
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
                <h3 className="text-xs font-display font-medium tracking-tight">{t('after')}</h3>
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
            <BarChart3 size={36} strokeWidth={1.5} className="mx-auto text-muted-foreground" />
            <p className="text-muted-foreground text-sm">{t('complete_for_insights')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

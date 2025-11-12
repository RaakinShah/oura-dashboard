'use client';

import { useOuraData } from '@/hooks/useOura';
import { BarChart3, TrendingUp, TrendingDown, Activity, Moon, Heart, Zap, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import { formatShortDate } from '@/lib/date-utils';

// Types for Recharts Tooltip
interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-2xl p-4 shadow-xl border border-white/20">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-bold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { sleep, activity, readiness, loading, hasToken, refetch } = useOuraData();

  if (!hasToken || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!sleep.length || !activity.length || !readiness.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Sync your Oura Ring to view analytics</p>
        </div>
      </div>
    );
  }

  const last30Days = sleep.slice(-30);
  const last7Days = sleep.slice(-7);

  // Combined scores chart data with Area Chart
  const combinedScoresData = last30Days.map((s, index) => ({
    date: formatShortDate(s.day),
    sleep: s.score,
    activity: activity[activity.length - last30Days.length + index]?.score || 0,
    readiness: readiness[readiness.length - last30Days.length + index]?.score || 0,
  }));

  // Sleep phases data
  const sleepPhasesData = last7Days.map((s) => ({
    date: formatShortDate(s.day),
    deep: Math.round(s.deep_sleep_duration / 60),
    rem: Math.round(s.rem_sleep_duration / 60),
    light: Math.round(s.light_sleep_duration / 60),
  }));

  // Activity breakdown
  const activityBreakdownData = activity.slice(-7).map((a) => ({
    date: formatShortDate(a.day),
    steps: a.steps,
    calories: a.active_calories,
  }));

  // Radar chart data - Weekly average comparison
  const radarData = [
    {
      metric: 'Sleep Quality',
      thisWeek: Math.round(last7Days.reduce((sum, s) => sum + s.score, 0) / last7Days.length),
      lastWeek: Math.round(sleep.slice(-14, -7).reduce((sum, s) => sum + s.score, 0) / 7),
    },
    {
      metric: 'Activity',
      thisWeek: Math.round(activity.slice(-7).reduce((sum, a) => sum + a.score, 0) / 7),
      lastWeek: Math.round(activity.slice(-14, -7).reduce((sum, a) => sum + a.score, 0) / 7),
    },
    {
      metric: 'Readiness',
      thisWeek: Math.round(readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / 7),
      lastWeek: Math.round(readiness.slice(-14, -7).reduce((sum, r) => sum + r.score, 0) / 7),
    },
    {
      metric: 'Sleep Duration',
      thisWeek: Math.round((last7Days.reduce((sum, s) => sum + s.total_sleep_duration, 0) / last7Days.length / 3600) * 10),
      lastWeek: Math.round((sleep.slice(-14, -7).reduce((sum, s) => sum + s.total_sleep_duration, 0) / 7 / 3600) * 10),
    },
    {
      metric: 'Efficiency',
      thisWeek: Math.round(last7Days.reduce((sum, s) => sum + s.efficiency, 0) / last7Days.length),
      lastWeek: Math.round(sleep.slice(-14, -7).reduce((sum, s) => sum + s.efficiency, 0) / 7),
    },
  ];

  // Calculate overall stats
  const overallAvg = {
    sleep: Math.round(sleep.reduce((sum, s) => sum + s.score, 0) / sleep.length),
    activity: Math.round(activity.reduce((sum, a) => sum + a.score, 0) / activity.length),
    readiness: Math.round(readiness.reduce((sum, r) => sum + r.score, 0) / readiness.length),
  };

  // Calculate trends
  const calculateTrend = (data: number[]) => {
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  };

  const trends = {
    sleep: calculateTrend(sleep.map(s => s.score)),
    activity: calculateTrend(activity.map(a => a.score)),
    readiness: calculateTrend(readiness.map(r => r.score)),
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in-down">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics & Trends</h1>
          <p className="text-gray-600">Comprehensive view of your health metrics over time</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4 text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-sm font-medium text-gray-700">Refresh</span>
        </button>
      </div>

      {/* Overall Stats - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-hover bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-2xl text-white animate-fade-in-up relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Moon className="h-8 w-8 opacity-90" />
              {trends.sleep > 0 ? (
                <TrendingUp className="h-6 w-6 text-white/80" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white/80" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2 opacity-90">Avg Sleep Score</h3>
            <p className="text-6xl font-bold mb-2">{overallAvg.sleep}</p>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm`}>
                {trends.sleep > 0 ? '↑' : '↓'} {Math.abs(trends.sleep).toFixed(1)}%
              </span>
              <span className="text-sm opacity-75">trend</span>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="card-hover bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl text-white animate-fade-in-up [animation-delay:100ms] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 opacity-90" />
              {trends.activity > 0 ? (
                <TrendingUp className="h-6 w-6 text-white/80" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white/80" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2 opacity-90">Avg Activity Score</h3>
            <p className="text-6xl font-bold mb-2">{overallAvg.activity}</p>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm`}>
                {trends.activity > 0 ? '↑' : '↓'} {Math.abs(trends.activity).toFixed(1)}%
              </span>
              <span className="text-sm opacity-75">trend</span>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="card-hover bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-8 shadow-2xl text-white animate-fade-in-up [animation-delay:200ms] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Heart className="h-8 w-8 opacity-90" />
              {trends.readiness > 0 ? (
                <TrendingUp className="h-6 w-6 text-white/80" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white/80" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2 opacity-90">Avg Readiness Score</h3>
            <p className="text-6xl font-bold mb-2">{overallAvg.readiness}</p>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm`}>
                {trends.readiness > 0 ? '↑' : '↓'} {Math.abs(trends.readiness).toFixed(1)}%
              </span>
              <span className="text-sm opacity-75">trend</span>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Combined Trends - Area Chart */}
      <div className="card-hover bg-white rounded-3xl p-8 shadow-lg border border-gray-100 animate-fade-in-up [animation-delay:300ms]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">30-Day Health Overview</h2>
            <p className="text-sm text-gray-600">All scores trending over the last month</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-100">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Live Data</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={combinedScoresData}>
            <defs>
              <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              domain={[0, 100]}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="sleep"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSleep)"
              name="Sleep"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="activity"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActivity)"
              name="Activity"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="readiness"
              stroke="#ef4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorReadiness)"
              name="Readiness"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart - Weekly Comparison */}
      <div className="card-hover bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-lg border border-purple-100 animate-fade-in-up [animation-delay:400ms]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Week-over-Week Comparison</h2>
          <p className="text-sm text-gray-600">Visual comparison of this week vs last week across all metrics</p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Radar
              name="This Week"
              dataKey="thisWeek"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
              strokeWidth={2}
              animationDuration={1500}
            />
            <Radar
              name="Last Week"
              dataKey="lastWeek"
              stroke="#ec4899"
              fill="#ec4899"
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={1500}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep Phases Breakdown */}
      <div className="card-hover bg-white rounded-3xl p-8 shadow-lg border border-gray-100 animate-fade-in-up [animation-delay:500ms]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sleep Phases (Last 7 Days)</h2>
          <p className="text-sm text-gray-600">Deep, REM, and Light sleep duration in minutes</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={sleepPhasesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tick={{ fill: '#6b7280' }} />
            <YAxis stroke="#9ca3af" fontSize={12} tick={{ fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="deep" fill="#6366f1" name="Deep Sleep" radius={[8, 8, 0, 0]} animationDuration={1200} />
            <Bar dataKey="rem" fill="#8b5cf6" name="REM Sleep" radius={[8, 8, 0, 0]} animationDuration={1200} />
            <Bar dataKey="light" fill="#a78bfa" name="Light Sleep" radius={[8, 8, 0, 0]} animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Breakdown */}
      <div className="card-hover bg-white rounded-3xl p-8 shadow-lg border border-gray-100 animate-fade-in-up [animation-delay:600ms]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Activity Breakdown (Last 7 Days)</h2>
          <p className="text-sm text-gray-600">Daily steps and active calories burned</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={activityBreakdownData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tick={{ fill: '#6b7280' }} />
            <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tick={{ fill: '#6b7280' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tick={{ fill: '#6b7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="steps"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 6 }}
              name="Steps"
              animationDuration={1500}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="calories"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', r: 6 }}
              name="Calories"
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-hover bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 animate-fade-in-up [animation-delay:700ms]">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Data Summary
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{last30Days.length} days of data analyzed</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Sleep scores: {Math.min(...sleep.map(s => s.score))} - {Math.max(...sleep.map(s => s.score))}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Activity scores: {Math.min(...activity.map(a => a.score))} - {Math.max(...activity.map(a => a.score))}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Readiness scores: {Math.min(...readiness.map(r => r.score))} - {Math.max(...readiness.map(r => r.score))}</span>
            </li>
          </ul>
        </div>

        <div className="card-hover bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 animate-fade-in-up [animation-delay:800ms]">
          <h3 className="font-bold text-gray-900 mb-4">💡 Key Observations</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>
                {Math.max(...Object.values(trends).map(Math.abs)) === Math.abs(trends.sleep)
                  ? 'Sleep shows the strongest trend this period'
                  : Math.max(...Object.values(trends).map(Math.abs)) === Math.abs(trends.activity)
                  ? 'Activity shows the strongest trend this period'
                  : 'Readiness shows the strongest trend this period'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>
                Overall performance: {
                  (overallAvg.sleep + overallAvg.activity + overallAvg.readiness) / 3 >= 85 ? 'Excellent ⭐' :
                  (overallAvg.sleep + overallAvg.activity + overallAvg.readiness) / 3 >= 70 ? 'Good ✓' :
                  'Needs improvement'
                }
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>All metrics show {Object.values(trends).every(t => t > 0) ? 'positive' : Object.values(trends).every(t => t < 0) ? 'declining' : 'mixed'} trends</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Heatmap Calendar */}
      <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <HeatmapCalendar sleep={sleep} activity={activity} readiness={readiness} />
      </div>
    </div>
  );
}

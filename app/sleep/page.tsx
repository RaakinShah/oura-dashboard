'use client';

import { useOuraData } from '@/hooks/useOura';
import { Moon, TrendingUp, Clock, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatLongDate, formatShortDate } from '@/lib/date-utils';

export default function Sleep() {
  const { sleep, loading, hasToken } = useOuraData();

  if (!hasToken || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse-slow">Loading sleep data...</p>
        </div>
      </div>
    );
  }

  if (!sleep.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Moon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Sleep Data Available</h2>
          <p className="text-gray-600 leading-relaxed">
            Your sleep data will appear here once you wear your Oura Ring and sync.
          </p>
        </div>
      </div>
    );
  }

  const latestSleep = sleep[sleep.length - 1];
  const last7Days = sleep.slice(-7);
  const last30Days = sleep.slice(-30);

  // Helper function to safely get numeric value
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    return value != null && !isNaN(value) ? value : defaultValue;
  };

  // Calculate averages with safe handling
  const avgScore = Math.round(last7Days.reduce((sum, s) => sum + s.score, 0) / last7Days.length);

  const validDurations = last7Days.filter(s => s.total_sleep_duration && !isNaN(s.total_sleep_duration));
  const avgDuration = validDurations.length > 0
    ? validDurations.reduce((sum, s) => sum + s.total_sleep_duration, 0) / validDurations.length
    : 0;

  const validEfficiencies = last7Days.filter(s => s.efficiency && !isNaN(s.efficiency));
  const avgEfficiency = validEfficiencies.length > 0
    ? Math.round(validEfficiencies.reduce((sum, s) => sum + s.efficiency, 0) / validEfficiencies.length)
    : 0;

  // Prepare chart data with safe values
  const scoreChartData = last30Days.map((s) => ({
    date: formatShortDate(s.day),
    score: s.score,
    efficiency: safeNumber(s.efficiency, 0),
  }));

  const stagesChartData = last7Days.map((s) => ({
    date: formatShortDate(s.day),
    deep: Math.round(safeNumber(s.deep_sleep_duration, 0) / 60),
    rem: Math.round(safeNumber(s.rem_sleep_duration, 0) / 60),
    light: Math.round(safeNumber(s.light_sleep_duration, 0) / 60),
  }));

  return (
    <div className="space-y-8 pb-8">
      <div className="animate-fade-in-down">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Sleep Analysis</h1>
        <p className="text-gray-600 text-lg">Track and optimize your sleep patterns</p>
      </div>

      {/* Latest Sleep Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-xl animate-fade-in-up transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Moon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Last Night</h2>
                <p className="text-white/70">{formatLongDate(latestSleep.day)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold text-white mb-1">{latestSleep.score}</div>
              <p className="text-white/80">Sleep Score</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-white/70 text-sm mb-1">Duration</p>
              <p className="text-white text-xl font-bold">
                {Math.floor(safeNumber(latestSleep.total_sleep_duration, 0) / 3600)}h {Math.floor((safeNumber(latestSleep.total_sleep_duration, 0) % 3600) / 60)}m
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Efficiency</p>
              <p className="text-white text-xl font-bold">{safeNumber(latestSleep.efficiency, 0)}%</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Deep Sleep</p>
              <p className="text-white text-xl font-bold">{Math.floor(safeNumber(latestSleep.deep_sleep_duration, 0) / 60)}m</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">REM Sleep</p>
              <p className="text-white text-xl font-bold">{Math.floor(safeNumber(latestSleep.rem_sleep_duration, 0) / 60)}m</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      </div>

      {/* 7-Day Averages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:100ms] transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg Score (7d)</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgScore}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:200ms] transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg Duration (7d)</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {Math.floor(avgDuration / 3600)}h {Math.floor((avgDuration % 3600) / 60)}m
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:300ms] transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg Efficiency (7d)</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgEfficiency}%</p>
        </div>
      </div>

      {/* Sleep Score Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:400ms] transition-all duration-300 hover:shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sleep Score & Efficiency (30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              name="Sleep Score"
            />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', r: 4 }}
              name="Efficiency %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep Stages */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:500ms] transition-all duration-300 hover:shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Sleep Stages (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stagesChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="deep" stackId="a" fill="#4f46e5" name="Deep Sleep" />
            <Bar dataKey="rem" stackId="a" fill="#8b5cf6" name="REM Sleep" />
            <Bar dataKey="light" stackId="a" fill="#a78bfa" name="Light Sleep" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sleep Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up [animation-delay:600ms]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <h3 className="font-bold text-gray-900 mb-3">💡 Quick Insights</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Your average sleep score this week is {avgScore >= 85 ? 'excellent' : avgScore >= 70 ? 'good' : 'below optimal'}</li>
            <li>• You're averaging {Math.floor(avgDuration / 3600)}h {Math.floor((avgDuration % 3600) / 60)}m of sleep per night</li>
            <li>• Sleep efficiency at {avgEfficiency}% indicates {avgEfficiency >= 85 ? 'high quality' : 'room for improvement'}</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <h3 className="font-bold text-gray-900 mb-3">📈 Recommendations</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Aim for consistent sleep and wake times</li>
            <li>• Target 7-9 hours of sleep for optimal recovery</li>
            <li>• Create a relaxing bedtime routine</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

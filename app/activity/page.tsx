'use client';

import { useOuraData } from '@/hooks/useOura';
import { Activity, TrendingUp, Footprints, Flame } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { units } from '@/lib/units';
import { formatLongDate, formatShortDate } from '@/lib/date-utils';

export default function ActivityPage() {
  const { activity, loading, hasToken } = useOuraData();

  if (!hasToken || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse-slow">Loading activity data...</p>
        </div>
      </div>
    );
  }

  if (!activity.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Activity Data Available</h2>
          <p className="text-gray-600 leading-relaxed">
            Your activity data will appear here once you wear your Oura Ring and sync.
          </p>
        </div>
      </div>
    );
  }

  const latestActivity = activity[activity.length - 1];
  const last7Days = activity.slice(-7);
  const last30Days = activity.slice(-30);

  // Helper function to safely get numeric value
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    return value != null && !isNaN(value) ? value : defaultValue;
  };

  const avgScore = Math.round(last7Days.reduce((sum, a) => sum + a.score, 0) / last7Days.length);
  const avgSteps = Math.round(last7Days.reduce((sum, a) => sum + safeNumber(a.steps, 0), 0) / last7Days.length);
  const avgCalories = Math.round(last7Days.reduce((sum, a) => sum + safeNumber(a.active_calories, 0), 0) / last7Days.length);

  const scoreChartData = last30Days.map((a) => ({
    date: formatShortDate(a.day),
    score: a.score,
    steps: safeNumber(a.steps, 0),
  }));

  const caloriesChartData = last7Days.map((a) => ({
    date: formatShortDate(a.day),
    calories: safeNumber(a.active_calories, 0),
    steps: Math.round(safeNumber(a.steps, 0) / 100),
  }));

  return (
    <div className="space-y-8 pb-8">
      <div className="animate-fade-in-down">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Activity Analysis</h1>
        <p className="text-gray-600 text-lg">Track your daily movement and energy</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-3xl p-8 shadow-xl animate-fade-in-up transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Today</h2>
                <p className="text-white/70">{formatLongDate(latestActivity.day)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold text-white mb-1">{latestActivity.score}</div>
              <p className="text-white/80">Activity Score</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-white/70 text-sm mb-1">Steps</p>
              <p className="text-white text-xl font-bold">{safeNumber(latestActivity.steps, 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Calories</p>
              <p className="text-white text-xl font-bold">{safeNumber(latestActivity.active_calories, 0)}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">High Activity</p>
              <p className="text-white text-xl font-bold">{Math.round(safeNumber(latestActivity.high_activity_time, 0) / 60)}m</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Distance</p>
              <p className="text-white text-xl font-bold">{units.formatDistance(safeNumber(latestActivity.equivalent_walking_distance, 0))}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:100ms] transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg Score (7d)</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgScore}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:200ms] transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Footprints className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg Steps (7d)</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgSteps.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:300ms] transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg Calories (7d)</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgCalories}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:400ms] transition-all duration-300 hover:shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Score (30 Days)</h2>
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
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              name="Activity Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up [animation-delay:500ms] transition-all duration-300 hover:shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Calories Burned (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={caloriesChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="calories" fill="#f97316" name="Active Calories" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up [animation-delay:600ms]">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <h3 className="font-bold text-gray-900 mb-3">💡 Quick Insights</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Your average activity score this week is {avgScore >= 85 ? 'excellent' : avgScore >= 70 ? 'good' : 'below target'}</li>
            <li>• You're averaging {avgSteps.toLocaleString()} steps per day</li>
            <li>• Burning approximately {avgCalories} active calories daily</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
          <h3 className="font-bold text-gray-900 mb-3">📈 Recommendations</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Aim for 10,000 steps daily for optimal health</li>
            <li>• Include both cardio and strength training</li>
            <li>• Take movement breaks every hour</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

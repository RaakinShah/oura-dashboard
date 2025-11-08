'use client';

import { useOuraData } from '@/hooks/useOura';
import { Heart, TrendingUp, Thermometer, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { units } from '@/lib/units';
import { formatLongDate, formatShortDate } from '@/lib/date-utils';

export default function ReadinessPage() {
  const { readiness, loading, hasToken } = useOuraData();

  if (!hasToken || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse-slow">Loading readiness data...</p>
        </div>
      </div>
    );
  }

  if (!readiness.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Readiness Data Available</h2>
          <p className="text-gray-600 leading-relaxed">
            Your readiness data will appear here once you wear your Oura Ring and sync.
          </p>
        </div>
      </div>
    );
  }

  const latestReadiness = readiness[readiness.length - 1];
  const last7Days = readiness.slice(-7);
  const last30Days = readiness.slice(-30);

  // Helper function to safely get numeric value
  const safeNumber = (value: any, defaultValue: number = 0): number => {
    return value != null && !isNaN(value) ? value : defaultValue;
  };

  const avgScore = Math.round(last7Days.reduce((sum, r) => sum + r.score, 0) / last7Days.length);
  const avgHR = Math.round(last7Days.reduce((sum, r) => sum + safeNumber(r.resting_heart_rate, 0), 0) / last7Days.length);
  const avgHRV = Math.round(last7Days.reduce((sum, r) => sum + safeNumber(r.hrv_balance, 0), 0) / last7Days.length);

  const scoreChartData = last30Days.map((r) => ({
    date: formatShortDate(r.day),
    score: r.score,
    hr: safeNumber(r.resting_heart_rate, 0),
  }));

  const getReadinessMessage = (score: number) => {
    if (score >= 85) return { msg: 'Optimal', color: 'text-green-600' };
    if (score >= 70) return { msg: 'Good', color: 'text-yellow-600' };
    return { msg: 'Pay Attention', color: 'text-red-600' };
  };

  const readinessMsg = getReadinessMessage(latestReadiness.score);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Readiness Analysis</h1>
        <p className="text-gray-600">Monitor your body's recovery and readiness</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-rose-400 via-red-500 to-pink-600 rounded-3xl p-8 shadow-xl">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Today</h2>
                <p className="text-white/70">{formatLongDate(latestReadiness.day)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold text-white mb-1">{latestReadiness.score}</div>
              <p className="text-white/80">Readiness Score</p>
              <p className="text-white/90 font-semibold mt-1">{readinessMsg.msg}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-white/70 text-base mb-1">Resting HR</p>
              <p className="text-white text-2xl font-bold">{safeNumber(latestReadiness.resting_heart_rate, 0)} bpm</p>
            </div>
            <div>
              <p className="text-white/70 text-base mb-1">HRV Balance</p>
              <p className="text-white text-2xl font-bold">{safeNumber(latestReadiness.hrv_balance, 0)}</p>
            </div>
            <div>
              <p className="text-white/70 text-base mb-1">Temp Deviation</p>
              <p className="text-white text-2xl font-bold">
                {safeNumber(latestReadiness.temperature_deviation, 0) > 0 ? '+' : ''}
                {safeNumber(latestReadiness.temperature_deviation, 0).toFixed(2)}°C
              </p>
            </div>
            <div>
              <p className="text-white/70 text-base mb-1">Temp Trend</p>
              <p className="text-white text-2xl font-bold">
                {safeNumber(latestReadiness.temperature_trend_deviation, 0) > 0 ? '+' : ''}
                {safeNumber(latestReadiness.temperature_trend_deviation, 0).toFixed(2)}°C
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg Score (7d)</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgScore}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg Resting HR (7d)</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgHR}</p>
          <p className="text-sm text-gray-500 mt-1">bpm</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Avg HRV (7d)</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">{avgHRV}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Readiness Score & Resting HR (30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="score"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', r: 4 }}
              name="Readiness Score"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hr"
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ fill: '#ec4899', r: 4 }}
              name="Resting HR (bpm)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Quick Insights</h3>
          <ul className="space-y-2 text-base text-gray-700">
            <li>• Your readiness is {readinessMsg.msg.toLowerCase()} today</li>
            <li>• Resting heart rate of {safeNumber(latestReadiness.resting_heart_rate, 0)} bpm is {safeNumber(latestReadiness.resting_heart_rate, 0) < 60 ? 'excellent' : safeNumber(latestReadiness.resting_heart_rate, 0) < 70 ? 'good' : 'elevated'}</li>
            <li>• HRV balance at {safeNumber(latestReadiness.hrv_balance, 0)} indicates {safeNumber(latestReadiness.hrv_balance, 0) > 10 ? 'good recovery' : 'stress or fatigue'}</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📈 Recommendations</h3>
          <ul className="space-y-2 text-base text-gray-700">
            {latestReadiness.score >= 85 ? (
              <>
                <li>• Great day for intense workouts</li>
                <li>• Your body is well-recovered</li>
                <li>• Push your limits today</li>
              </>
            ) : latestReadiness.score >= 70 ? (
              <>
                <li>• Moderate activity recommended</li>
                <li>• Listen to your body</li>
                <li>• Avoid overtraining</li>
              </>
            ) : (
              <>
                <li>• Prioritize rest and recovery</li>
                <li>• Light activity only</li>
                <li>• Focus on sleep quality</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

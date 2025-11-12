'use client';

import { useMemo } from 'react';
import { useOuraData } from '@/hooks/useOura';
import { Heart, Activity, Moon, TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw, ArrowRight, Zap, Target } from 'lucide-react';
import { EnhancedAIEngine as AdvancedAIEngine } from '@/lib/ai-engine/core';
import { formatFullDate } from '@/lib/date-utils';
import Link from 'next/link';

export default function Dashboard() {
  const { sleep, activity, readiness, loading, hasToken, error, refetch } = useOuraData();

  // Generate AI insights with memoization for performance
  // Must be called before any conditional returns (Rules of Hooks)
  const insights = useMemo(() => {
    if (sleep.length > 0 && activity.length > 0 && readiness.length > 0) {
      return AdvancedAIEngine.generateDeepInsights(sleep, activity, readiness);
    }
    return [];
  }, [sleep, activity, readiness]);

  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to Oura Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Connect your Oura Ring to unlock AI-powered insights
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md animate-fade-in-up">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Update Settings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!sleep.length || !readiness.length || !activity.length) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Moon className="h-10 w-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Data Available</h2>
          <p className="text-gray-600">
            Wear your Oura Ring and sync your data to see insights
          </p>
        </div>
      </div>
    );
  }

  const latestSleep = sleep[sleep.length - 1];
  const latestActivity = activity[activity.length - 1];
  const latestReadiness = readiness[readiness.length - 1];

  const topInsight = insights[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">{getGreeting()}</h1>
          <p className="text-gray-500 mt-1">
            {latestSleep && formatFullDate(latestSleep.day)}
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-all group"
        >
          <RefreshCw className="h-4 w-4 text-gray-700 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Main Score Cards - Simplified */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sleep */}
        <Link href="/sleep" className="bg-white rounded-3xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <Moon className="h-7 w-7 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sleep</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-gray-900">{latestSleep.score}</span>
            <span className="text-2xl text-gray-400">/100</span>
          </div>
          <p className="text-base text-gray-600 font-medium">
            {(latestSleep.total_sleep_duration / 3600).toFixed(1)}h • {latestSleep.efficiency}% efficiency
          </p>
        </Link>

        {/* Activity */}
        <Link href="/activity" className="bg-white rounded-3xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-7 w-7 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Activity</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-gray-900">{latestActivity.score}</span>
            <span className="text-2xl text-gray-400">/100</span>
          </div>
          <p className="text-base text-gray-600 font-medium">
            {latestActivity.steps.toLocaleString()} steps • {latestActivity.active_calories} cal
          </p>
        </Link>

        {/* Readiness */}
        <Link href="/readiness" className="bg-white rounded-3xl p-6 border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all group">
          <div className="flex items-center justify-between mb-4">
            <Heart className="h-7 w-7 text-red-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Readiness</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-gray-900">{latestReadiness.score}</span>
            <span className="text-2xl text-gray-400">/100</span>
          </div>
          <p className="text-base text-gray-600 font-medium">
            {latestReadiness.resting_heart_rate} bpm resting
          </p>
        </Link>
      </div>

      {/* AI Insight */}
      {topInsight && (
        <div className={`bg-gradient-to-br ${getPriorityGradient(topInsight.priority)} rounded-3xl p-6 text-white shadow-lg animate-fade-in-up`}>
          <div className="flex items-start gap-3 mb-4">
            <Zap className="h-7 w-7 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{topInsight.title}</h2>
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase">
                  {topInsight.priority}
                </span>
              </div>
              <p className="text-white/90 leading-relaxed text-base">
                {topInsight.narrative.split('.')[0]}.
              </p>
            </div>
          </div>

          {topInsight.actionPlan.immediate.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
              <p className="text-white/90 font-semibold text-base mb-2">Immediate Actions:</p>
              <ul className="space-y-1">
                {topInsight.actionPlan.immediate.slice(0, 2).map((action, i) => (
                  <li key={i} className="text-white/80 text-base flex items-start gap-2">
                    <span className="mt-1">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href="/insights"
            className="inline-flex items-center gap-2 mt-4 text-white/90 hover:text-white font-medium text-base transition-colors"
          >
            View All Insights
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Weekly Trends - Simplified */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">7-Day Trend</h3>
        <div className="grid grid-cols-3 gap-6">
          {(() => {
            const last7Sleep = sleep.slice(-7);
            const last7Activity = activity.slice(-7);
            const last7Readiness = readiness.slice(-7);

            const avg7Sleep = Math.round(last7Sleep.reduce((sum, s) => sum + s.score, 0) / last7Sleep.length);
            const avg7Activity = Math.round(last7Activity.reduce((sum, a) => sum + a.score, 0) / last7Activity.length);
            const avg7Readiness = Math.round(last7Readiness.reduce((sum, r) => sum + r.score, 0) / last7Readiness.length);

            const prevAvgSleep = Math.round(sleep.slice(-14, -7).reduce((sum, s) => sum + s.score, 0) / 7);
            const prevAvgActivity = Math.round(activity.slice(-14, -7).reduce((sum, a) => sum + a.score, 0) / 7);
            const prevAvgReadiness = Math.round(readiness.slice(-14, -7).reduce((sum, r) => sum + r.score, 0) / 7);

            const sleepChange = avg7Sleep - prevAvgSleep;
            const activityChange = avg7Activity - prevAvgActivity;
            const readinessChange = avg7Readiness - prevAvgReadiness;

            return (
              <>
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">{avg7Sleep}</span>
                    {sleepChange !== 0 && (
                      <span className={`text-base font-bold ${sleepChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {sleepChange > 0 ? '↑' : '↓'}{Math.abs(sleepChange)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Sleep</p>
                </div>

                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">{avg7Activity}</span>
                    {activityChange !== 0 && (
                      <span className={`text-base font-bold ${activityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {activityChange > 0 ? '↑' : '↓'}{Math.abs(activityChange)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Activity</p>
                </div>

                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">{avg7Readiness}</span>
                    {readinessChange !== 0 && (
                      <span className={`text-base font-bold ${readinessChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {readinessChange > 0 ? '↑' : '↓'}{Math.abs(readinessChange)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Readiness</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Today's Highlights */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-purple-600" />
          Today's Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Best Metric</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.max(latestSleep.score, latestActivity.score, latestReadiness.score) === latestSleep.score
                ? 'Sleep'
                : Math.max(latestSleep.score, latestActivity.score, latestReadiness.score) === latestActivity.score
                ? 'Activity'
                : 'Readiness'}
            </p>
            <p className="text-base text-gray-600 font-medium">
              {Math.max(latestSleep.score, latestActivity.score, latestReadiness.score)} score
            </p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Sleep Quality</p>
            <p className="text-2xl font-bold text-gray-900">{latestSleep.efficiency}%</p>
            <p className="text-base text-gray-600 font-medium">Efficiency</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Recovery Status</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestReadiness.score >= 85 ? 'Optimal' : latestReadiness.score >= 70 ? 'Good' : 'Low'}
            </p>
            <p className="text-base text-gray-600 font-medium">{latestReadiness.score}/100</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/insights"
          className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <Sparkles className="h-6 w-6 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">AI Insights</p>
        </Link>

        <Link
          href="/analytics"
          className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <TrendingUp className="h-6 w-6 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Analytics</p>
        </Link>

        <Link
          href="/goals"
          className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-green-400 hover:shadow-md transition-all group"
        >
          <Target className="h-6 w-6 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-base font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Goals</p>
        </Link>

        <Link
          href="/settings"
          className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all group"
        >
          <ArrowRight className="h-6 w-6 text-gray-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-base font-semibold text-gray-900 transition-colors">Settings</p>
        </Link>
      </div>
    </div>
  );
}

function getPriorityGradient(priority: string) {
  switch (priority) {
    case 'critical': return 'from-red-500 to-rose-600';
    case 'high': return 'from-orange-500 to-red-500';
    case 'medium': return 'from-yellow-500 to-orange-500';
    case 'low': return 'from-green-500 to-emerald-600';
    default: return 'from-blue-500 to-cyan-500';
  }
}

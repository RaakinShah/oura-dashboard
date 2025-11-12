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

      {/* Main Score Cards - Peaceful Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sleep */}
        <Link href="/sleep" className="card-peaceful card-peaceful-lg hover-lift group">
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 rounded-2xl gradient-peaceful-purple">
              <Moon className="h-6 w-6 text-violet-700 dark:text-violet-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-semibold text-peaceful-muted uppercase tracking-wide">Sleep</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-bold bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-purple-400">{latestSleep.score}</span>
            <span className="text-2xl text-peaceful-muted">/100</span>
          </div>
          <div className="flex items-center gap-3 text-peaceful">
            <span className="font-medium">{(latestSleep.total_sleep_duration / 3600).toFixed(1)}h</span>
            <span className="text-peaceful-muted">•</span>
            <span className="font-medium">{latestSleep.efficiency}% efficiency</span>
          </div>
        </Link>

        {/* Activity */}
        <Link href="/activity" className="card-peaceful card-peaceful-lg hover-lift group">
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 rounded-2xl gradient-peaceful-green">
              <Activity className="h-6 w-6 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-semibold text-peaceful-muted uppercase tracking-wide">Activity</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-bold bg-gradient-to-br from-emerald-600 to-green-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-400">{latestActivity.score}</span>
            <span className="text-2xl text-peaceful-muted">/100</span>
          </div>
          <div className="flex items-center gap-3 text-peaceful">
            <span className="font-medium">{latestActivity.steps.toLocaleString()} steps</span>
            <span className="text-peaceful-muted">•</span>
            <span className="font-medium">{latestActivity.active_calories} cal</span>
          </div>
        </Link>

        {/* Readiness */}
        <Link href="/readiness" className="card-peaceful card-peaceful-lg hover-lift group">
          <div className="flex items-center justify-between mb-5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950 dark:to-red-950">
              <Heart className="h-6 w-6 text-rose-700 dark:text-rose-300 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-semibold text-peaceful-muted uppercase tracking-wide">Readiness</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-bold bg-gradient-to-br from-rose-600 to-red-600 bg-clip-text text-transparent dark:from-rose-400 dark:to-red-400">{latestReadiness.score}</span>
            <span className="text-2xl text-peaceful-muted">/100</span>
          </div>
          <div className="flex items-center gap-3 text-peaceful">
            <span className="font-medium">{latestReadiness.resting_heart_rate} bpm</span>
            <span className="text-peaceful-muted">•</span>
            <span className="font-medium">resting</span>
          </div>
        </Link>
      </div>

      {/* AI Insight - Peaceful Design */}
      {topInsight && (
        <div className={`bg-gradient-to-br ${getPriorityGradient(topInsight.priority)} card-peaceful-lg text-white shadow-lg animate-fade-in-up border-0`}>
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

      {/* Weekly Trends - Peaceful Design */}
      <div className="card-peaceful card-peaceful-lg">
        <h3 className="text-2xl font-bold mb-6">7-Day Trend</h3>
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

      {/* Today's Highlights - Peaceful Design */}
      <div className="card-peaceful card-peaceful-lg gradient-calm">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Today's Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card-peaceful">
            <p className="text-sm text-peaceful-muted mb-1 font-medium">Best Metric</p>
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
          <div className="card-peaceful">
            <p className="text-sm text-peaceful-muted mb-1 font-medium">Sleep Quality</p>
            <p className="text-2xl font-bold">{latestSleep.efficiency}%</p>
            <p className="text-base text-peaceful font-medium">Efficiency</p>
          </div>
          <div className="card-peaceful">
            <p className="text-sm text-peaceful-muted mb-1 font-medium">Recovery Status</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestReadiness.score >= 85 ? 'Optimal' : latestReadiness.score >= 70 ? 'Good' : 'Low'}
            </p>
            <p className="text-base text-gray-600 font-medium">{latestReadiness.score}/100</p>
          </div>
        </div>
      </div>

      {/* Quick Links - Peaceful Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Link
          href="/insights"
          className="card-peaceful hover-lift group"
        >
          <div className="p-2.5 rounded-xl gradient-peaceful-purple w-fit mb-3">
            <Sparkles className="h-5 w-5 text-purple-700 dark:text-purple-300 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">AI Insights</p>
        </Link>

        <Link
          href="/analytics"
          className="card-peaceful hover-lift group"
        >
          <div className="p-2.5 rounded-xl gradient-peaceful-blue w-fit mb-3">
            <TrendingUp className="h-5 w-5 text-blue-700 dark:text-blue-300 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Analytics</p>
        </Link>

        <Link
          href="/goals"
          className="card-peaceful hover-lift group"
        >
          <div className="p-2.5 rounded-xl gradient-peaceful-green w-fit mb-3">
            <Target className="h-5 w-5 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Goals</p>
        </Link>

        <Link
          href="/settings"
          className="card-peaceful hover-lift group"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-stone-50 to-gray-50 dark:from-stone-900 dark:to-gray-900 w-fit mb-3">
            <ArrowRight className="h-5 w-5 text-stone-700 dark:text-stone-300 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-base font-semibold group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors">Settings</p>
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

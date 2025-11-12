'use client';

import { useMemo } from 'react';
import { useOuraData } from '@/hooks/useOura';
import { Heart, Activity, Moon, TrendingUp, TrendingDown, Sparkles, RefreshCw, ArrowRight, Zap, Target, BarChart3, Settings } from 'lucide-react';
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
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">
            Welcome to Oura Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Connect your Oura Ring to unlock AI-powered health insights
          </p>
          <Link
            href="/settings"
            className="btn btn-primary"
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
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md animate-fade-in-up">
          <div className="card-lg">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-3">Unable to Load Data</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link href="/settings" className="btn btn-primary">
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
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Moon className="h-10 w-10 text-gray-600 dark:text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No Data Available</h2>
          <p className="text-gray-600 dark:text-gray-400">
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

  // Calculate weekly averages
  const last7Sleep = sleep.slice(-7);
  const last7Activity = activity.slice(-7);
  const last7Readiness = readiness.slice(-7);

  const avg7Sleep = Math.round(last7Sleep.reduce((sum, s) => sum + s.score, 0) / last7Sleep.length);
  const avg7Activity = Math.round(last7Activity.reduce((sum, a) => sum + a.score, 0) / last7Activity.length);
  const avg7Readiness = Math.round(last7Readiness.reduce((sum, r) => sum + r.score, 0) / last7Readiness.length);

  const prevAvgSleep = sleep.length >= 14 ? Math.round(sleep.slice(-14, -7).reduce((sum, s) => sum + s.score, 0) / 7) : avg7Sleep;
  const prevAvgActivity = activity.length >= 14 ? Math.round(activity.slice(-14, -7).reduce((sum, a) => sum + a.score, 0) / 7) : avg7Activity;
  const prevAvgReadiness = readiness.length >= 14 ? Math.round(readiness.slice(-14, -7).reduce((sum, r) => sum + r.score, 0) / 7) : avg7Readiness;

  const sleepChange = avg7Sleep - prevAvgSleep;
  const activityChange = avg7Activity - prevAvgActivity;
  const readinessChange = avg7Readiness - prevAvgReadiness;

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {latestSleep && formatFullDate(latestSleep.day)}
          </p>
        </div>
        <button
          onClick={refetch}
          className="btn btn-secondary"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Hero Metrics - Data First */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
        {/* Sleep Metric */}
        <Link href="/sleep" className="metric-card metric-card-sleep card-interactive group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <Moon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sleep</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Last night</p>
              </div>
            </div>
            {getScoreBadge(latestSleep.score)}
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-6xl font-bold">{latestSleep.score}</span>
              <span className="text-3xl text-gray-400 dark:text-gray-600">/100</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>{(latestSleep.total_sleep_duration / 3600).toFixed(1)}h duration</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span>{latestSleep.efficiency}% efficiency</span>
              </div>
            </div>
          </div>

          {/* Trend indicator */}
          {sleepChange !== 0 && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${sleepChange > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              {sleepChange > 0 ? (
                <TrendingUp className={`h-4 w-4 text-green-600 dark:text-green-400`} />
              ) : (
                <TrendingDown className={`h-4 w-4 text-red-600 dark:text-red-400`} />
              )}
              <span className={`text-sm font-semibold ${sleepChange > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {Math.abs(sleepChange)} vs last week
              </span>
            </div>
          )}
        </Link>

        {/* Activity Metric */}
        <Link href="/activity" className="metric-card metric-card-activity card-interactive group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Activity</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Yesterday</p>
              </div>
            </div>
            {getScoreBadge(latestActivity.score)}
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-6xl font-bold">{latestActivity.score}</span>
              <span className="text-3xl text-gray-400 dark:text-gray-600">/100</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span>{latestActivity.steps.toLocaleString()} steps</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <span>{latestActivity.active_calories} cal</span>
              </div>
            </div>
          </div>

          {/* Trend indicator */}
          {activityChange !== 0 && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${activityChange > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              {activityChange > 0 ? (
                <TrendingUp className={`h-4 w-4 text-green-600 dark:text-green-400`} />
              ) : (
                <TrendingDown className={`h-4 w-4 text-red-600 dark:text-red-400`} />
              )}
              <span className={`text-sm font-semibold ${activityChange > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {Math.abs(activityChange)} vs last week
              </span>
            </div>
          )}
        </Link>

        {/* Readiness Metric */}
        <Link href="/readiness" className="metric-card metric-card-readiness card-interactive group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Readiness</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Today</p>
              </div>
            </div>
            {getScoreBadge(latestReadiness.score)}
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-6xl font-bold">{latestReadiness.score}</span>
              <span className="text-3xl text-gray-400 dark:text-gray-600">/100</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <span>{latestReadiness.resting_heart_rate} bpm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                <span>resting HR</span>
              </div>
            </div>
          </div>

          {/* Trend indicator */}
          {readinessChange !== 0 && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${readinessChange > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              {readinessChange > 0 ? (
                <TrendingUp className={`h-4 w-4 text-green-600 dark:text-green-400`} />
              ) : (
                <TrendingDown className={`h-4 w-4 text-red-600 dark:text-red-400`} />
              )}
              <span className={`text-sm font-semibold ${readinessChange > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {Math.abs(readinessChange)} vs last week
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* AI Insight - Priority Alert */}
      {topInsight && (
        <div className={`card-xl ${getPriorityStyle(topInsight.priority)} animate-fade-in-up`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{topInsight.title}</h2>
                <span className="badge bg-white/20 text-white border-white/30 uppercase text-xs">
                  {topInsight.priority}
                </span>
              </div>
              <p className="text-white/90 leading-relaxed mb-4">
                {topInsight.narrative.split('.')[0]}.
              </p>

              {topInsight.actionPlan.immediate.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <p className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Recommended Actions</p>
                  <ul className="space-y-2">
                    {topInsight.actionPlan.immediate.slice(0, 2).map((action, i) => (
                      <li key={i} className="text-white/90 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href="/insights"
                className="inline-flex items-center gap-2 text-white hover:text-white/80 font-medium transition-colors"
              >
                View All Insights
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Overview */}
      <div className="card-lg animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">7-Day Average</h3>
          <Link href="/analytics" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1">
            View Analytics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold">{avg7Sleep}</span>
              {sleepChange !== 0 && (
                <span className={`text-lg font-bold ${sleepChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {sleepChange > 0 ? '+' : ''}{sleepChange}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sleep Score</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold">{avg7Activity}</span>
              {activityChange !== 0 && (
                <span className={`text-lg font-bold ${activityChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {activityChange > 0 ? '+' : ''}{activityChange}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Activity Score</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold">{avg7Readiness}</span>
              {readinessChange !== 0 && (
                <span className={`text-lg font-bold ${readinessChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {readinessChange > 0 ? '+' : ''}{readinessChange}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Readiness Score</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
        <Link href="/insights" className="card card-interactive text-center p-6 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mx-auto mb-3 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <p className="font-semibold text-sm">AI Insights</p>
        </Link>

        <Link href="/analytics" className="card card-interactive text-center p-6 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mx-auto mb-3 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <p className="font-semibold text-sm">Analytics</p>
        </Link>

        <Link href="/goals" className="card card-interactive text-center p-6 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 mx-auto mb-3 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Target className="h-6 w-6 text-white" />
          </div>
          <p className="font-semibold text-sm">Goals</p>
        </Link>

        <Link href="/settings" className="card card-interactive text-center p-6 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 mx-auto mb-3 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <p className="font-semibold text-sm">Settings</p>
        </Link>
      </div>
    </div>
  );
}

function getScoreBadge(score: number) {
  if (score >= 85) {
    return <span className="badge badge-excellent">Excellent</span>;
  } else if (score >= 70) {
    return <span className="badge badge-good">Good</span>;
  } else if (score >= 55) {
    return <span className="badge badge-moderate">Fair</span>;
  } else {
    return <span className="badge badge-poor">Needs Attention</span>;
  }
}

function getPriorityStyle(priority: string) {
  switch (priority) {
    case 'critical':
      return 'bg-gradient-to-br from-red-600 to-red-700 text-white border-0';
    case 'high':
      return 'bg-gradient-to-br from-orange-600 to-red-600 text-white border-0';
    case 'medium':
      return 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0';
    case 'low':
      return 'bg-gradient-to-br from-green-600 to-emerald-600 text-white border-0';
    default:
      return 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-0';
  }
}

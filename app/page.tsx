'use client';

import { useMemo } from 'react';
import { useOuraData } from '@/hooks/useOura';
import { Heart, Activity, Moon, TrendingUp, TrendingDown, Sparkles, RefreshCw, ArrowRight, Zap } from 'lucide-react';
import { EnhancedAIEngine as AdvancedAIEngine } from '@/lib/ai-engine/core';
import { formatFullDate } from '@/lib/date-utils';
import Link from 'next/link';

export default function Dashboard() {
  const { sleep, activity, readiness, loading, hasToken, error, refetch } = useOuraData();

  const insights = useMemo(() => {
    if (sleep.length > 0 && activity.length > 0 && readiness.length > 0) {
      return AdvancedAIEngine.generateDeepInsights(sleep, activity, readiness);
    }
    return [];
  }, [sleep, activity, readiness]);

  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-lg animate-fade-in">
          <h1 className="text-5xl font-light mb-4">Welcome</h1>
          <p className="text-stone-600 text-lg mb-8 leading-relaxed">
            Connect your Oura Ring to begin
          </p>
          <Link href="/settings" className="btn-refined btn-primary">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-500 text-sm">Loading</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md animate-fade-in">
          <div className="card-refined">
            <h2 className="text-2xl font-light mb-4">Connection Error</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">{error}</p>
            <Link href="/settings" className="btn-refined btn-primary">
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
        <div className="text-center max-w-md animate-fade-in">
          <Moon className="h-12 w-12 text-stone-400 mx-auto mb-6" />
          <h2 className="text-3xl font-light mb-4">No Data Yet</h2>
          <p className="text-stone-600 leading-relaxed">
            Wear your Oura Ring to start collecting insights
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
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate weekly stats
  const last7Sleep = sleep.slice(-7);
  const last7Activity = activity.slice(-7);
  const last7Readiness = readiness.slice(-7);

  const avg7Sleep = Math.round(last7Sleep.reduce((sum, s) => sum + s.score, 0) / last7Sleep.length);
  const avg7Activity = Math.round(last7Activity.reduce((sum, a) => sum + a.score, 0) / last7Activity.length);
  const avg7Readiness = Math.round(last7Readiness.reduce((sum, r) => sum + r.score, 0) / last7Readiness.length);

  const prevAvgSleep = sleep.length >= 14 ? Math.round(sleep.slice(-14, -7).reduce((sum, s) => sum + s.score, 0) / 7) : avg7Sleep;
  const prevAvgActivity = activity.length >= 14 ? Math.round(activity.slice(-14, -7).reduce((sum, a) => sum + a.score, 0) / 7) : avg7Activity;
  const prevAvgReadiness = readiness.length >= 14 ? Math.round(readiness.slice(-14, -7).reduce((sum, r) => sum + r.score, 0) / 7) : avg7Readiness;

  const sleepTrend = avg7Sleep - prevAvgSleep;
  const activityTrend = avg7Activity - prevAvgActivity;
  const readinessTrend = avg7Readiness - prevAvgReadiness;

  return (
    <div className="space-y-16">
      {/* Hero Section - Clean & Spacious */}
      <div className="animate-fade-in">
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-6xl font-light mb-3">
              {getGreeting()}
            </h1>
            <p className="text-stone-500 text-lg">
              {latestSleep && formatFullDate(latestSleep.day)}
            </p>
          </div>
          <button onClick={refetch} className="btn-refined btn-secondary">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Quick Stats - Minimal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-stone-200 rounded-lg p-8 hover:border-stone-300 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-5 w-5 text-stone-400" />
              <span className="text-stone-500 text-xs uppercase tracking-wide font-medium">Sleep</span>
            </div>
            <div className="text-4xl font-light mb-3">{latestSleep.score}</div>
            {sleepTrend !== 0 && (
              <div className="flex items-center gap-2 text-sm text-stone-600">
                {sleepTrend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{sleepTrend > 0 ? '+' : ''}{sleepTrend} from last week</span>
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-8 hover:border-stone-300 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-stone-400" />
              <span className="text-stone-500 text-xs uppercase tracking-wide font-medium">Activity</span>
            </div>
            <div className="text-4xl font-light mb-3">{latestActivity.score}</div>
            {activityTrend !== 0 && (
              <div className="flex items-center gap-2 text-sm text-stone-600">
                {activityTrend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{activityTrend > 0 ? '+' : ''}{activityTrend} from last week</span>
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-8 hover:border-stone-300 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-stone-400" />
              <span className="text-stone-500 text-xs uppercase tracking-wide font-medium">Readiness</span>
            </div>
            <div className="text-4xl font-light mb-3">{latestReadiness.score}</div>
            {readinessTrend !== 0 && (
              <div className="flex items-center gap-2 text-sm text-stone-600">
                {readinessTrend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{readinessTrend > 0 ? '+' : ''}{readinessTrend} from last week</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insight - Elegant Presentation */}
      {topInsight && (
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white border border-stone-200 rounded-lg p-12">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-stone-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-light mb-3">{topInsight.title}</h2>
                <p className="text-stone-600 text-lg leading-relaxed">
                  {topInsight.narrative}
                </p>
              </div>
            </div>

            {topInsight.actionPlan.immediate.length > 0 && (
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-8 mb-8">
                <p className="text-stone-700 font-medium text-sm uppercase tracking-wide mb-6">Recommended Actions</p>
                <ul className="space-y-4">
                  {topInsight.actionPlan.immediate.slice(0, 3).map((action, i) => (
                    <li key={i} className="flex items-start gap-4 text-stone-600">
                      <span className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 text-xs font-medium text-stone-700">
                        {i + 1}
                      </span>
                      <span className="flex-1 pt-0.5">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link href="/insights" className="btn-refined btn-primary">
              View All {insights.length} Insights
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Metric Cards - Clean Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {/* Sleep Card */}
        <Link href="/sleep" className="metric-card group cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Moon className="h-5 w-5 text-stone-700" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide font-medium text-stone-500">Sleep</div>
                <div className="text-xs text-stone-400">Last Night</div>
              </div>
            </div>
            {getRefinedBadge(latestSleep.score)}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-light">{latestSleep.score}</span>
              <span className="text-2xl text-stone-400">/100</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm border-b border-stone-100 pb-2">
                <span className="text-stone-500">Duration</span>
                <span className="font-medium">{(latestSleep.total_sleep_duration / 3600).toFixed(1)}h</span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-stone-100 pb-2">
                <span className="text-stone-500">Efficiency</span>
                <span className="font-medium">{latestSleep.efficiency}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">REM Sleep</span>
                <span className="font-medium">{Math.round(latestSleep.rem_sleep_duration / 60)}min</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-stone-500">7-Day Average</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">{avg7Sleep}</span>
              {sleepTrend !== 0 && (
                <span className={`text-sm font-medium ${sleepTrend > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {sleepTrend > 0 ? '+' : ''}{sleepTrend}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Activity Card */}
        <Link href="/activity" className="metric-card group cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-stone-700" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide font-medium text-stone-500">Activity</div>
                <div className="text-xs text-stone-400">Yesterday</div>
              </div>
            </div>
            {getRefinedBadge(latestActivity.score)}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-light">{latestActivity.score}</span>
              <span className="text-2xl text-stone-400">/100</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm border-b border-stone-100 pb-2">
                <span className="text-stone-500">Steps</span>
                <span className="font-medium">{latestActivity.steps.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-stone-100 pb-2">
                <span className="text-stone-500">Active Calories</span>
                <span className="font-medium">{latestActivity.active_calories} cal</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">High Activity</span>
                <span className="font-medium">{Math.round(latestActivity.high_activity_time / 60)}min</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-stone-500">7-Day Average</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">{avg7Activity}</span>
              {activityTrend !== 0 && (
                <span className={`text-sm font-medium ${activityTrend > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {activityTrend > 0 ? '+' : ''}{activityTrend}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Readiness Card */}
        <Link href="/readiness" className="metric-card group cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <Heart className="h-5 w-5 text-stone-700" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide font-medium text-stone-500">Readiness</div>
                <div className="text-xs text-stone-400">Today</div>
              </div>
            </div>
            {getRefinedBadge(latestReadiness.score)}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-light">{latestReadiness.score}</span>
              <span className="text-2xl text-stone-400">/100</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm border-b border-stone-100 pb-2">
                <span className="text-stone-500">Resting HR</span>
                <span className="font-medium">{latestReadiness.resting_heart_rate} bpm</span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-stone-100 pb-2">
                <span className="text-stone-500">HRV Balance</span>
                <span className="font-medium">{latestReadiness.hrv_balance || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Temperature</span>
                <span className="font-medium">{latestReadiness.temperature_deviation ? `${latestReadiness.temperature_deviation.toFixed(1)}°C` : 'Normal'}</span>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-stone-500">7-Day Average</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">{avg7Readiness}</span>
              {readinessTrend !== 0 && (
                <span className={`text-sm font-medium ${readinessTrend > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {readinessTrend > 0 ? '+' : ''}{readinessTrend}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <Link href="/insights" className="card-refined text-center p-8 group">
          <Sparkles className="h-8 w-8 text-stone-400 mx-auto mb-4 group-hover:text-stone-700 transition-colors" />
          <p className="font-medium text-sm mb-1">Insights</p>
          <p className="text-xs text-stone-500">{insights.length} available</p>
        </Link>

        <Link href="/analytics" className="card-refined text-center p-8 group">
          <TrendingUp className="h-8 w-8 text-stone-400 mx-auto mb-4 group-hover:text-stone-700 transition-colors" />
          <p className="font-medium text-sm mb-1">Analytics</p>
          <p className="text-xs text-stone-500">View trends</p>
        </Link>

        <Link href="/goals" className="card-refined text-center p-8 group">
          <Heart className="h-8 w-8 text-stone-400 mx-auto mb-4 group-hover:text-stone-700 transition-colors" />
          <p className="font-medium text-sm mb-1">Goals</p>
          <p className="text-xs text-stone-500">Track progress</p>
        </Link>

        <Link href="/settings" className="card-refined text-center p-8 group">
          <RefreshCw className="h-8 w-8 text-stone-400 mx-auto mb-4 group-hover:text-stone-700 transition-colors" />
          <p className="font-medium text-sm mb-1">Settings</p>
          <p className="text-xs text-stone-500">Customize</p>
        </Link>
      </div>
    </div>
  );
}

function getRefinedBadge(score: number) {
  if (score >= 85) return <span className="badge badge-excellent">Excellent</span>;
  if (score >= 70) return <span className="badge badge-good">Good</span>;
  if (score >= 55) return <span className="badge badge-fair">Fair</span>;
  return <span className="badge badge-fair">Low</span>;
}

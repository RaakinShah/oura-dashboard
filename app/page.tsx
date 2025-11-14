'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Heart, Activity, Moon, Sparkles, TrendingUp, RefreshCw, ArrowRight, Zap, Settings } from 'lucide-react';

// Hooks
import { useOuraData } from '@/hooks/useOura';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';

// Components
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { InsightNarrative } from '@/components/InsightNarrative';
import { QuickStatCard } from '@/components/dashboard/QuickStatCard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RefinedBadge } from '@/components/dashboard/RefinedBadge';

// Utilities
import { formatFullDate } from '@/lib/date-utils';
import { getGreeting, hasMinimumData, formatDuration, formatMinutes } from '@/lib/utils/calculations';
import { ANIMATION_DELAYS, DATA_REQUIREMENTS } from '@/lib/constants';

// AI Engine
import { EnhancedAIEngine as AdvancedAIEngine } from '@/lib/ai-engine/core';

export default function Dashboard() {
  const { sleep, activity, readiness, loading, hasToken, error, refetch } = useOuraData();

  // Calculate weekly stats with memoization
  const weeklyStats = useWeeklyStats(sleep, activity, readiness);

  // Generate AI insights with memoization
  const insights = useMemo(() => {
    if (
      hasMinimumData(sleep, DATA_REQUIREMENTS.MINIMUM_FOR_TRENDS) &&
      hasMinimumData(activity, DATA_REQUIREMENTS.MINIMUM_FOR_TRENDS) &&
      hasMinimumData(readiness, DATA_REQUIREMENTS.MINIMUM_FOR_TRENDS)
    ) {
      return AdvancedAIEngine.generateDeepInsights(sleep, activity, readiness);
    }
    return [];
  }, [sleep, activity, readiness]);

  const topInsight = insights[0];
  const latestSleep = sleep[sleep.length - 1];
  const latestActivity = activity[activity.length - 1];
  const latestReadiness = readiness[readiness.length - 1];

  // No token state
  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-lg animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-stone-100 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-stone-400"></div>
          </div>
          <h1 className="text-5xl font-light mb-4">Welcome</h1>
          <p className="text-stone-600 text-lg mb-8 leading-relaxed">
            Connect your Oura Ring to begin tracking your health insights
          </p>
          <Link href="/settings" className="btn-refined btn-primary inline-flex" aria-label="Go to settings to connect Oura Ring">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md animate-scale-in">
          <div className="card-refined text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light mb-3">Connection Error</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={refetch} className="btn-refined btn-secondary" aria-label="Retry fetching data">
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
              <Link href="/settings" className="btn-refined btn-primary inline-flex" aria-label="Go to settings">
                Settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Insufficient data state
  if (!hasMinimumData(sleep) || !hasMinimumData(activity) || !hasMinimumData(readiness)) {
    return (
      <EmptyState
        icon={Activity}
        title="No Data Yet"
        description="We're waiting for data from your Oura Ring. Make sure your ring is synced and try refreshing in a few moments."
        action={{
          label: 'Refresh Data',
          href: '/',
        }}
      />
    );
  }

  return (
    <div className="space-y-20 page-transition">
      {/* Hero Section */}
      <header className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light">
              {getGreeting()}
            </h1>
            <time className="text-stone-500 text-base sm:text-lg block">
              {formatFullDate(latestSleep.day)}
            </time>
          </div>
          <button
            onClick={refetch}
            className="btn-refined btn-secondary"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6" role="list" aria-label="Quick health metrics">
          <QuickStatCard
            icon={Moon}
            label="Sleep"
            score={latestSleep.score}
            trend={weeklyStats.sleep.trend}
          />
          <QuickStatCard
            icon={Activity}
            label="Activity"
            score={latestActivity.score}
            trend={weeklyStats.activity.trend}
          />
          <QuickStatCard
            icon={Heart}
            label="Readiness"
            score={latestReadiness.score}
            trend={weeklyStats.readiness.trend}
          />
        </div>
      </header>

      {/* AI Insight */}
      {topInsight && (
        <section
          className="animate-fade-in"
          style={{ animationDelay: ANIMATION_DELAYS.INSIGHT }}
          aria-label="Top AI insight"
        >
          <div className="bg-white border border-stone-200 rounded-xl p-10 sm:p-14">
            <div className="flex items-start gap-8 mb-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center flex-shrink-0 border border-stone-200">
                <Zap className="h-7 w-7 text-stone-700" />
              </div>
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl sm:text-4xl font-light leading-tight">{topInsight.title}</h2>
                <InsightNarrative narrative={topInsight.narrative} />
              </div>
            </div>

            {topInsight.actionPlan.immediate.length > 0 && (
              <div className="bg-gradient-to-br from-stone-50 to-stone-50/50 border border-stone-200/60 rounded-xl p-8 sm:p-10 mb-10">
                <p className="text-stone-700 font-medium text-xs uppercase tracking-wider mb-7">
                  Recommended Actions
                </p>
                <ul className="space-y-5">
                  {topInsight.actionPlan.immediate.slice(0, 3).map((action, i) => (
                    <li key={i} className="flex items-start gap-5 text-stone-700">
                      <span className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {i + 1}
                      </span>
                      <span className="flex-1 pt-1 leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link href="/insights" className="btn-refined btn-primary inline-flex">
              View All {insights.length} Insights
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Metric Cards */}
      <section
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 animate-fade-in"
        style={{ animationDelay: ANIMATION_DELAYS.METRICS }}
        aria-label="Detailed health metrics"
      >
        <MetricCard
          href="/sleep"
          icon={Moon}
          label="Sleep"
          timeLabel="Last Night"
          score={latestSleep.score}
          details={[
            { label: 'Duration', value: formatDuration(latestSleep.total_sleep_duration) },
            { label: 'Efficiency', value: `${latestSleep.efficiency}%` },
            { label: 'REM Sleep', value: formatMinutes(latestSleep.rem_sleep_duration / 60) },
          ]}
          badge={<RefinedBadge score={latestSleep.score} />}
          weeklyAvg={weeklyStats.sleep.current}
          trend={weeklyStats.sleep.trend}
        />
        <MetricCard
          href="/activity"
          icon={Activity}
          label="Activity"
          timeLabel="Yesterday"
          score={latestActivity.score}
          details={[
            { label: 'Steps', value: latestActivity.steps.toLocaleString() },
            { label: 'Active Calories', value: `${latestActivity.active_calories} cal` },
            { label: 'High Activity', value: formatMinutes(latestActivity.high_activity_time / 60) },
          ]}
          badge={<RefinedBadge score={latestActivity.score} />}
          weeklyAvg={weeklyStats.activity.current}
          trend={weeklyStats.activity.trend}
        />
        <MetricCard
          href="/readiness"
          icon={Heart}
          label="Readiness"
          timeLabel="Today"
          score={latestReadiness.score}
          details={[
            { label: 'Resting HR', value: `${latestReadiness.resting_heart_rate} bpm` },
            { label: 'HRV Balance', value: latestReadiness.hrv_balance?.toString() || 'N/A' },
            { label: 'Temperature', value: latestReadiness.temperature_deviation ? `${latestReadiness.temperature_deviation.toFixed(1)}°C` : 'Normal' },
          ]}
          badge={<RefinedBadge score={latestReadiness.score} />}
          weeklyAvg={weeklyStats.readiness.current}
          trend={weeklyStats.readiness.trend}
        />
      </section>

      {/* Navigation Links */}
      <nav
        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 animate-fade-in"
        style={{ animationDelay: ANIMATION_DELAYS.NAVIGATION }}
        aria-label="Quick navigation"
      >
        <Link href="/insights" className="bg-white border border-stone-200 rounded-xl text-center p-10 group hover:border-sage-300 hover:shadow-md transition-all duration-300">
          <Sparkles className="h-9 w-9 text-stone-400 mx-auto mb-5 group-hover:text-sage-700 group-hover:scale-110 transition-all duration-300" />
          <p className="font-medium text-base mb-2 text-stone-900">Insights</p>
          <p className="text-xs text-stone-500">{insights.length} available</p>
        </Link>

        <Link href="/analytics" className="bg-white border border-stone-200 rounded-xl text-center p-10 group hover:border-sage-300 hover:shadow-md transition-all duration-300">
          <TrendingUp className="h-9 w-9 text-stone-400 mx-auto mb-5 group-hover:text-sage-700 group-hover:scale-110 transition-all duration-300" />
          <p className="font-medium text-base mb-2 text-stone-900">Analytics</p>
          <p className="text-xs text-stone-500">View trends</p>
        </Link>

        <Link href="/goals" className="bg-white border border-stone-200 rounded-xl text-center p-10 group hover:border-sage-300 hover:shadow-md transition-all duration-300">
          <Heart className="h-9 w-9 text-stone-400 mx-auto mb-5 group-hover:text-sage-700 group-hover:scale-110 transition-all duration-300" />
          <p className="font-medium text-base mb-2 text-stone-900">Goals</p>
          <p className="text-xs text-stone-500">Track progress</p>
        </Link>

        <Link href="/settings" className="bg-white border border-stone-200 rounded-xl text-center p-10 group hover:border-sage-300 hover:shadow-md transition-all duration-300" aria-label="Go to settings">
          <Settings className="h-9 w-9 text-stone-400 mx-auto mb-5 group-hover:text-sage-700 group-hover:scale-110 transition-all duration-300" />
          <p className="font-medium text-base mb-2 text-stone-900">Settings</p>
          <p className="text-xs text-stone-500">Customize</p>
        </Link>
      </nav>
    </div>
  );
}

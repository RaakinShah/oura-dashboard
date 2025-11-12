'use client';

import { useMemo, memo } from 'react';
import { useOuraData } from '@/hooks/useOura';
import { Heart, Activity, Moon, TrendingUp, TrendingDown, Sparkles, RefreshCw, ArrowRight, Zap } from 'lucide-react';
import { EnhancedAIEngine as AdvancedAIEngine } from '@/lib/ai-engine/core';
import { formatFullDate } from '@/lib/date-utils';
import Link from 'next/link';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';

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
        <div className="text-center max-w-lg animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-stone-100 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-stone-400"></div>
          </div>
          <h1 className="text-5xl font-light mb-4">Welcome</h1>
          <p className="text-stone-600 text-lg mb-8 leading-relaxed">
            Connect your Oura Ring to begin tracking your health insights
          </p>
          <Link href="/settings" className="btn-refined btn-primary" aria-label="Go to settings to connect Oura Ring">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md animate-scale-in">
          <div className="card-refined text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <Link href="/settings" className="btn-refined btn-primary" aria-label="Go to settings">
                Settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sleep.length || !readiness.length || !activity.length) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-stone-100 flex items-center justify-center">
            <Moon className="h-10 w-10 text-stone-500" />
          </div>
          <h2 className="text-3xl font-light mb-4">No Data Yet</h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            Wear your Oura Ring tonight to start collecting health insights
          </p>
          <button onClick={refetch} className="btn-refined btn-secondary" aria-label="Check for new data">
            <RefreshCw className="h-4 w-4" />
            Check Again
          </button>
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
    <div className="space-y-16 page-transition">
      {/* Hero Section - Clean & Spacious */}
      <header className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light mb-3">
              {getGreeting()}
            </h1>
            <time className="text-stone-500 text-base sm:text-lg">
              {latestSleep && formatFullDate(latestSleep.day)}
            </time>
          </div>
          <button onClick={refetch} className="btn-refined btn-secondary" aria-label="Refresh dashboard data">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Quick Stats - Minimal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6" role="list" aria-label="Quick health metrics">
          <QuickStatCard icon={Moon} label="Sleep" score={latestSleep.score} trend={sleepTrend} />
          <QuickStatCard icon={Activity} label="Activity" score={latestActivity.score} trend={activityTrend} />
          <QuickStatCard icon={Heart} label="Readiness" score={latestReadiness.score} trend={readinessTrend} />
        </div>
      </header>

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
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }} aria-label="Detailed health metrics">
        <MetricCard
          href="/sleep"
          icon={Moon}
          label="Sleep"
          timeLabel="Last Night"
          score={latestSleep.score}
          details={[
            { label: 'Duration', value: `${(latestSleep.total_sleep_duration / 3600).toFixed(1)}h` },
            { label: 'Efficiency', value: `${latestSleep.efficiency}%` },
            { label: 'REM Sleep', value: `${Math.round(latestSleep.rem_sleep_duration / 60)}min` }
          ]}
          badge={<RefinedBadge score={latestSleep.score} />}
          weeklyAvg={avg7Sleep}
          trend={sleepTrend}
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
            { label: 'High Activity', value: `${Math.round(latestActivity.high_activity_time / 60)}min` }
          ]}
          badge={<RefinedBadge score={latestActivity.score} />}
          weeklyAvg={avg7Activity}
          trend={activityTrend}
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
            { label: 'Temperature', value: latestReadiness.temperature_deviation ? `${latestReadiness.temperature_deviation.toFixed(1)}°C` : 'Normal' }
          ]}
          badge={<RefinedBadge score={latestReadiness.score} />}
          weeklyAvg={avg7Readiness}
          trend={readinessTrend}
        />
      </section>

      {/* Navigation Links */}
      <nav className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }} aria-label="Quick navigation">
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

        <Link href="/settings" className="card-refined text-center p-8 group" aria-label="Go to settings">
          <RefreshCw className="h-8 w-8 text-stone-400 mx-auto mb-4 group-hover:text-stone-700 transition-colors" />
          <p className="font-medium text-sm mb-1">Settings</p>
          <p className="text-xs text-stone-500">Customize</p>
        </Link>
      </nav>
    </div>
  );
}

// Memoized badge component
const RefinedBadge = memo(({ score }: { score: number }) => {
  if (score >= 85) return <span className="badge badge-excellent">Excellent</span>;
  if (score >= 70) return <span className="badge badge-good">Good</span>;
  if (score >= 55) return <span className="badge badge-fair">Fair</span>;
  return <span className="badge badge-fair">Low</span>;
});
RefinedBadge.displayName = 'RefinedBadge';

// Memoized quick stat card
const QuickStatCard = memo(({
  icon: Icon,
  label,
  score,
  trend
}: {
  icon: any;
  label: string;
  score: number;
  trend: number;
}) => (
  <div className="bg-white border border-stone-200 rounded-lg p-8 hover:border-stone-300 transition-all duration-300">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-stone-400" />
      <span className="text-stone-500 text-xs uppercase tracking-wide font-medium">{label}</span>
    </div>
    <div className="text-4xl font-light mb-3">{score}</div>
    {trend !== 0 && (
      <div className="flex items-center gap-2 text-sm text-stone-600">
        {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{trend > 0 ? '+' : ''}{trend} from last week</span>
      </div>
    )}
  </div>
));
QuickStatCard.displayName = 'QuickStatCard';

// Memoized metric card
const MetricCard = memo(({
  href,
  icon: Icon,
  label,
  timeLabel,
  score,
  details,
  badge,
  weeklyAvg,
  trend
}: {
  href: string;
  icon: any;
  label: string;
  timeLabel: string;
  score: number;
  details: Array<{ label: string; value: string }>;
  badge: React.ReactNode;
  weeklyAvg: number;
  trend: number;
}) => (
  <Link href={href} className="metric-card group cursor-pointer">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
          <Icon className="h-5 w-5 text-stone-700" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide font-medium text-stone-500">{label}</div>
          <div className="text-xs text-stone-400">{timeLabel}</div>
        </div>
      </div>
      {badge}
    </div>

    <div className="mb-6">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-5xl font-light">{score}</span>
        <span className="text-2xl text-stone-400">/100</span>
      </div>

      <div className="space-y-3">
        {details.map((detail, i) => (
          <div key={i} className={`flex items-center justify-between text-sm ${i < details.length - 1 ? 'border-b border-stone-100 pb-2' : ''}`}>
            <span className="text-stone-500">{detail.label}</span>
            <span className="font-medium">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="divider"></div>

    <div className="flex items-center justify-between pt-4">
      <span className="text-sm text-stone-500">7-Day Average</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-lg">{weeklyAvg}</span>
        {trend !== 0 && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {trend > 0 ? '+' : ''}{trend}
          </span>
        )}
      </div>
    </div>
  </Link>
));
MetricCard.displayName = 'MetricCard';

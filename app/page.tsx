'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  Moon,
  Sparkles,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Zap,
  Target,
  Brain,
  Calendar,
  Clock,
} from 'lucide-react';

// Hooks
import { useOuraData } from '@/hooks/useOura';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';

// Components
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { ModernStatWidget } from '@/components/dashboard/ModernStatWidget';
import { QuickInsightCard } from '@/components/dashboard/QuickInsightCard';
import { ActivityRing } from '@/components/dashboard/ActivityRing';

// Utilities
import { formatFullDate } from '@/lib/date-utils';
import { getGreeting, hasMinimumData, formatDuration } from '@/lib/utils/calculations';
import { DATA_REQUIREMENTS } from '@/lib/constants';

// AI Engine
import { EnhancedAIEngine as AdvancedAIEngine } from '@/lib/ai-engine/core';

export default function ModernDashboard() {
  const { sleep, activity, readiness, loading, hasToken, error, refetch } = useOuraData();

  // Calculate weekly stats
  const weeklyStats = useWeeklyStats(sleep, activity, readiness);

  // Generate AI insights
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

  const latestSleep = sleep[sleep.length - 1];
  const latestActivity = activity[activity.length - 1];
  const latestReadiness = readiness[readiness.length - 1];

  // No token state
  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <div className="w-12 h-12 rounded-full border-4 border-white"></div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome
          </h1>
          <p className="text-stone-600 text-lg mb-8 leading-relaxed">
            Connect your Oura Ring to unlock AI-powered health insights
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-red-200">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center">Connection Error</h2>
            <p className="text-stone-600 mb-6 text-center">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={refetch}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const greeting = getGreeting();
  const today = formatFullDate(new Date());

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              {greeting}
            </h1>
            <p className="text-stone-600 mt-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {today}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-stone-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="font-medium">Sync</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatWidget
          title="Sleep Score"
          value={latestSleep?.score || '-'}
          subtitle="Last night"
          icon={Moon}
          color="purple"
          trend={latestSleep && weeklyStats ? {
            value: weeklyStats.sleep.trend,
            label: 'vs previous week',
            positive: weeklyStats.sleep.trend >= 0,
          } : undefined}
          delay={0.1}
        />

        <ModernStatWidget
          title="Readiness"
          value={latestReadiness?.score || '-'}
          subtitle="Today"
          icon={Heart}
          color="red"
          trend={latestReadiness && weeklyStats ? {
            value: weeklyStats.readiness.trend,
            label: 'vs previous week',
            positive: weeklyStats.readiness.trend >= 0,
          } : undefined}
          delay={0.2}
        />

        <ModernStatWidget
          title="Activity"
          value={latestActivity?.score || '-'}
          subtitle="Yesterday"
          icon={Activity}
          color="green"
          trend={latestActivity && weeklyStats ? {
            value: weeklyStats.activity.trend,
            label: 'vs previous week',
            positive: weeklyStats.activity.trend >= 0,
          } : undefined}
          delay={0.3}
        />

        <ModernStatWidget
          title="HRV"
          value={latestReadiness?.score ? Math.round(latestReadiness.score * 0.8) : '-'}
          subtitle="Recovery metric"
          icon={Zap}
          color="cyan"
          delay={0.4}
        />
      </div>

      {/* Activity Rings & Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Rings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-stone-200"
        >
          <h3 className="text-lg font-semibold text-stone-900 mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Daily Goals
          </h3>
          <div className="flex justify-around">
            <ActivityRing
              label="Move"
              value={latestActivity?.score || 0}
              max={100}
              color="#22c55e"
              delay={0.6}
            />
            <ActivityRing
              label="Rest"
              value={latestSleep?.score || 0}
              max={100}
              color="#8b5cf6"
              delay={0.7}
            />
            <ActivityRing
              label="Ready"
              value={latestReadiness?.score || 0}
              max={100}
              color="#ef4444"
              delay={0.8}
            />
          </div>
        </motion.div>

        {/* AI Insights */}
        <div className="lg:col-span-2">
          <QuickInsightCard
            title="AI-Powered Insights"
            insights={
              insights.length > 0
                ? insights.slice(0, 3).map(i => typeof i === 'string' ? i : i.title || 'Insight available')
                : [
                    'Collect more data to receive personalized insights',
                    'Wear your Oura Ring consistently for better analysis',
                    'Check back tomorrow for updated recommendations',
                  ]
            }
            type={insights.length > 0 ? 'positive' : 'neutral'}
            delay={0.6}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Explore Your Health Data
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/insights"
            className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm"
          >
            <Sparkles className="h-6 w-6" />
            <span className="text-sm font-medium">AI Insights</span>
          </Link>
          <Link
            href="/analytics"
            className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm"
          >
            <TrendingUp className="h-6 w-6" />
            <span className="text-sm font-medium">Analytics</span>
          </Link>
          <Link
            href="/statistics"
            className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm"
          >
            <Brain className="h-6 w-6" />
            <span className="text-sm font-medium">Stats Lab</span>
          </Link>
          <Link
            href="/goals"
            className="flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm"
          >
            <Target className="h-6 w-6" />
            <span className="text-sm font-medium">Goals</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

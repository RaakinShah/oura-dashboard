'use client';

import { useMemo } from 'react';
import { useOuraData } from '@/hooks/useOura';
import { Heart, Activity, Moon, TrendingUp, TrendingDown, Sparkles, RefreshCw, ArrowRight, Zap, Target, BarChart3, Settings, Brain, Clock } from 'lucide-react';
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
      <div className="flex min-h-screen items-center justify-center p-4 mesh-gradient">
        <div className="text-center max-w-lg animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-2xl animate-glow">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Oura
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Connect your Oura Ring to unlock AI-powered health insights and personalized recommendations
          </p>
          <Link href="/settings" className="btn btn-primary text-lg px-8 py-4">
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
        <div className="text-center animate-fade-up">
          <div className="w-20 h-20 border-4 border-muted border-t-violet-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg font-medium">Loading your health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md animate-scale-in">
          <div className="card-xl">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Unable to Load Data</h2>
            <p className="text-muted-foreground text-lg mb-8">{error}</p>
            <Link href="/settings" className="btn btn-primary">
              Update Settings
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!sleep.length || !readiness.length || !activity.length) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center max-w-lg animate-scale-in">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-violet-900/20 dark:to-cyan-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Moon className="h-12 w-12 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">No Data Available</h2>
          <p className="text-muted-foreground text-lg">
            Wear your Oura Ring and sync your data to see personalized insights
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
    <div className="space-y-8">
      {/* Hero Header with Mesh Gradient */}
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 mesh-gradient animate-fade-up">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{getGreeting()}</h1>
              <p className="text-muted-foreground text-lg">
                {latestSleep && formatFullDate(latestSleep.day)}
              </p>
            </div>
            <button onClick={refetch} className="btn btn-secondary">
              <RefreshCw className="h-5 w-5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="glass rounded-2xl p-6 backdrop-blur-xl">
              <div className="text-sm text-muted-foreground mb-2">Sleep Score</div>
              <div className="text-4xl font-bold mb-1">{latestSleep.score}</div>
              {sleepTrend !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${sleepTrend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {sleepTrend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(sleepTrend)} from last week</span>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6 backdrop-blur-xl">
              <div className="text-sm text-muted-foreground mb-2">Activity Score</div>
              <div className="text-4xl font-bold mb-1">{latestActivity.score}</div>
              {activityTrend !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${activityTrend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {activityTrend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(activityTrend)} from last week</span>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6 backdrop-blur-xl">
              <div className="text-sm text-muted-foreground mb-2">Readiness</div>
              <div className="text-4xl font-bold mb-1">{latestReadiness.score}</div>
              {readinessTrend !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${readinessTrend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {readinessTrend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(readinessTrend)} from last week</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight - Premium Design */}
      {topInsight && (
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className={`card-xl relative overflow-hidden ${getPriorityBg(topInsight.priority)}`}>
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold text-white">{topInsight.title}</h2>
                    <span className="badge bg-white/20 text-white border-0 uppercase text-xs px-3 py-1.5">
                      {topInsight.priority}
                    </span>
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    {topInsight.narrative}
                  </p>

                  {topInsight.actionPlan.immediate.length > 0 && (
                    <div className="glass rounded-2xl p-6 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-white" />
                        <p className="text-white font-semibold text-sm uppercase tracking-wide">Action Steps</p>
                      </div>
                      <ul className="space-y-3">
                        {topInsight.actionPlan.immediate.slice(0, 3).map((action, i) => (
                          <li key={i} className="flex items-start gap-4 text-white/90">
                            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                              {i + 1}
                            </span>
                            <span className="flex-1">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link href="/insights" className="inline-flex items-center gap-2 text-white hover:text-white/80 font-semibold transition-colors">
                    View All {insights.length} Insights
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        {/* Sleep Card */}
        <Link href="/sleep" className="metric-card card-hover group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Moon className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Sleep</div>
                <div className="text-xs text-muted-foreground">Last night</div>
              </div>
            </div>
            {getScoreBadge(latestSleep.score)}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-6xl font-bold">{latestSleep.score}</span>
              <span className="text-3xl text-muted-foreground">/100</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">{(latestSleep.total_sleep_duration / 3600).toFixed(1)}h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Efficiency</span>
                <span className="font-semibold">{latestSleep.efficiency}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">REM Sleep</span>
                <span className="font-semibold">{Math.round(latestSleep.rem_sleep_duration / 60)}min</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">7-day average</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{avg7Sleep}</span>
                {sleepTrend !== 0 && (
                  <span className={`flex items-center gap-1 font-semibold ${sleepTrend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {sleepTrend > 0 ? '+' : ''}{sleepTrend}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Activity Card */}
        <Link href="/activity" className="metric-card card-hover group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Activity</div>
                <div className="text-xs text-muted-foreground">Yesterday</div>
              </div>
            </div>
            {getScoreBadge(latestActivity.score)}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-6xl font-bold">{latestActivity.score}</span>
              <span className="text-3xl text-muted-foreground">/100</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Steps</span>
                <span className="font-semibold">{latestActivity.steps.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active calories</span>
                <span className="font-semibold">{latestActivity.active_calories} cal</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">High activity</span>
                <span className="font-semibold">{Math.round(latestActivity.high_activity_time / 60)}min</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">7-day average</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{avg7Activity}</span>
                {activityTrend !== 0 && (
                  <span className={`flex items-center gap-1 font-semibold ${activityTrend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {activityTrend > 0 ? '+' : ''}{activityTrend}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Readiness Card */}
        <Link href="/readiness" className="metric-card card-hover group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Readiness</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
            </div>
            {getScoreBadge(latestReadiness.score)}
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-6xl font-bold">{latestReadiness.score}</span>
              <span className="text-3xl text-muted-foreground">/100</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Resting HR</span>
                <span className="font-semibold">{latestReadiness.resting_heart_rate} bpm</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">HRV</span>
                <span className="font-semibold">{latestReadiness.hrv_balance || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Temp deviation</span>
                <span className="font-semibold">{latestReadiness.temperature_deviation ? `${latestReadiness.temperature_deviation.toFixed(1)}°C` : 'Normal'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">7-day average</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{avg7Readiness}</span>
                {readinessTrend !== 0 && (
                  <span className={`flex items-center gap-1 font-semibold ${readinessTrend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {readinessTrend > 0 ? '+' : ''}{readinessTrend}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <Link href="/insights" className="card card-hover group text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow animate-float">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <p className="font-semibold">AI Insights</p>
          <p className="text-xs text-muted-foreground mt-1">{insights.length} available</p>
        </Link>

        <Link href="/analytics" className="card card-hover group text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow animate-float" style={{animationDelay: '0.5s'}}>
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <p className="font-semibold">Analytics</p>
          <p className="text-xs text-muted-foreground mt-1">Deep dive</p>
        </Link>

        <Link href="/goals" className="card card-hover group text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow animate-float" style={{animationDelay: '1s'}}>
            <Target className="h-8 w-8 text-white" />
          </div>
          <p className="font-semibold">Goals</p>
          <p className="text-xs text-muted-foreground mt-1">Track progress</p>
        </Link>

        <Link href="/settings" className="card card-hover group text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow animate-float" style={{animationDelay: '1.5s'}}>
            <Settings className="h-8 w-8 text-white" />
          </div>
          <p className="font-semibold">Settings</p>
          <p className="text-xs text-muted-foreground mt-1">Customize</p>
        </Link>
      </div>
    </div>
  );
}

function getScoreBadge(score: number) {
  if (score >= 85) return <span className="badge badge-success">Excellent</span>;
  if (score >= 70) return <span className="badge badge-primary">Good</span>;
  if (score >= 55) return <span className="badge badge-warning">Fair</span>;
  return <span className="badge badge-error">Needs Attention</span>;
}

function getPriorityBg(priority: string) {
  switch (priority) {
    case 'critical': return 'bg-gradient-to-br from-rose-600 to-red-700 text-white';
    case 'high': return 'bg-gradient-to-br from-orange-600 to-red-600 text-white';
    case 'medium': return 'bg-gradient-to-br from-amber-500 to-orange-500 text-white';
    case 'low': return 'bg-gradient-to-br from-emerald-600 to-green-600 text-white';
    default: return 'bg-gradient-to-br from-violet-600 to-purple-600 text-white';
  }
}

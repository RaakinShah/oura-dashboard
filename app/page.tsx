'use client';

import { useMemo } from 'react';
import { useOuraData } from '@/hooks/useOura';
import { Heart, Activity, Moon, TrendingUp, TrendingDown, Sparkles, RefreshCw, ArrowRight, Zap, Crown, Star } from 'lucide-react';
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
      <div className="flex min-h-screen items-center justify-center p-4 hero-luxury grain">
        <div className="text-center max-w-2xl animate-scale-luxury">
          <div className="w-32 h-32 mx-auto mb-12 rounded-full bg-gradient-gold flex items-center justify-center shadow-dramatic animate-glow-pulse">
            <Crown className="h-16 w-16 text-charcoal" />
          </div>
          <h1 className="text-7xl font-bold mb-6 animate-shimmer-gold">
            Oura Luxury
          </h1>
          <p className="text-2xl text-platinum mb-12 leading-relaxed">
            Experience premium health insights with world-class AI
          </p>
          <Link href="/settings" className="btn-luxury btn-gold text-lg px-12 py-5">
            Begin Your Journey
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center animate-fade-luxury">
          <div className="w-24 h-24 border-4 border-charcoal border-t-gold rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-gold text-xl font-semibold uppercase tracking-widest">Loading Excellence</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-xl animate-scale-luxury">
          <div className="card-luxury">
            <div className="w-20 h-20 bg-gradient-bronze rounded-3xl flex items-center justify-center mb-8">
              <span className="text-5xl">⚠️</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">Connection Error</h2>
            <p className="text-platinum text-xl mb-10 leading-relaxed">{error}</p>
            <Link href="/settings" className="btn-luxury btn-gold">
              Configure Settings
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!sleep.length || !readiness.length || !activity.length) {
    return (
      <div className="flex h-full items-center justify-center p-6 grain">
        <div className="text-center max-w-2xl animate-scale-luxury">
          <div className="w-32 h-32 bg-gradient-royal rounded-full flex items-center justify-center mx-auto mb-12 shadow-dramatic">
            <Moon className="h-16 w-16 text-gold" />
          </div>
          <h2 className="text-5xl font-bold mb-6">Awaiting Data</h2>
          <p className="text-platinum text-xl leading-relaxed">
            Synchronize your Oura Ring to unveil personalized insights
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
    <div className="space-y-12 grain">
      {/* Luxury Hero Section with Spotlight */}
      <div className="hero-luxury rounded-[3rem] overflow-hidden p-12 md:p-20 animate-fade-luxury">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-12">
            <div>
              <h1 className="text-7xl md:text-8xl font-bold mb-4 animate-shimmer-gold">
                {getGreeting()}
              </h1>
              <p className="text-platinum text-2xl">
                {latestSleep && formatFullDate(latestSleep.day)}
              </p>
            </div>
            <button onClick={refetch} className="btn-luxury btn-ghost-luxury">
              <RefreshCw className="h-6 w-6" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Premium Quick Stats - Asymmetric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-luxury rounded-3xl p-8 transform hover:scale-105 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <Moon className="h-8 w-8 text-gold" />
                <span className="text-gold text-sm uppercase tracking-widest font-bold">Sleep</span>
              </div>
              <div className="text-6xl font-bold mb-3">{latestSleep.score}</div>
              {sleepTrend !== 0 && (
                <div className={`flex items-center gap-2 ${sleepTrend > 0 ? 'text-gold' : 'text-bronze'}`}>
                  {sleepTrend > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  <span className="font-semibold">{Math.abs(sleepTrend)} vs last week</span>
                </div>
              )}
            </div>

            <div className="glass-luxury rounded-3xl p-8 transform hover:scale-105 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-8 w-8 text-gold" />
                <span className="text-gold text-sm uppercase tracking-widest font-bold">Activity</span>
              </div>
              <div className="text-6xl font-bold mb-3">{latestActivity.score}</div>
              {activityTrend !== 0 && (
                <div className={`flex items-center gap-2 ${activityTrend > 0 ? 'text-gold' : 'text-bronze'}`}>
                  {activityTrend > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  <span className="font-semibold">{Math.abs(activityTrend)} vs last week</span>
                </div>
              )}
            </div>

            <div className="glass-luxury rounded-3xl p-8 transform hover:scale-105 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-8 w-8 text-gold" />
                <span className="text-gold text-sm uppercase tracking-widest font-bold">Readiness</span>
              </div>
              <div className="text-6xl font-bold mb-3">{latestReadiness.score}</div>
              {readinessTrend !== 0 && (
                <div className={`flex items-center gap-2 ${readinessTrend > 0 ? 'text-gold' : 'text-bronze'}`}>
                  {readinessTrend > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  <span className="font-semibold">{Math.abs(readinessTrend)} vs last week</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight - Dramatic Presentation */}
      {topInsight && (
        <div className="animate-fade-luxury" style={{ animationDelay: '0.2s' }}>
          <div className="card-luxury grain">
            <div className="flex items-start gap-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-gold flex items-center justify-center flex-shrink-0 animate-float-luxury shadow-dramatic">
                <Zap className="h-10 w-10 text-charcoal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-5xl font-bold">{topInsight.title}</h2>
                  <span className="badge-luxury badge-gold">
                    <Star className="h-4 w-4" />
                    {topInsight.priority}
                  </span>
                </div>
                <p className="text-platinum text-2xl leading-relaxed mb-10">
                  {topInsight.narrative}
                </p>

                {topInsight.actionPlan.immediate.length > 0 && (
                  <div className="glass-luxury rounded-3xl p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full bg-gold"></div>
                      <p className="text-gold font-bold text-sm uppercase tracking-widest">Recommended Actions</p>
                    </div>
                    <ul className="space-y-5">
                      {topInsight.actionPlan.immediate.slice(0, 3).map((action, i) => (
                        <li key={i} className="flex items-start gap-6 text-platinum text-lg">
                          <span className="w-10 h-10 rounded-2xl bg-gradient-gold flex items-center justify-center flex-shrink-0 text-charcoal font-bold text-sm">
                            {i + 1}
                          </span>
                          <span className="flex-1 pt-2">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link href="/insights" className="btn-luxury btn-gold">
                  View All {insights.length} Insights
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Metric Cards - Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-elegant" style={{ animationDelay: '0.4s' }}>
        {/* Sleep Card */}
        <Link href="/sleep" className="metric-luxury group cursor-pointer">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-luxury">
                  <Moon className="h-8 w-8 text-charcoal" />
                </div>
                <div>
                  <div className="text-sm text-gold font-bold uppercase tracking-widest">Sleep</div>
                  <div className="text-xs text-platinum">Last Night</div>
                </div>
              </div>
              {getLuxuryBadge(latestSleep.score)}
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-7xl font-bold text-gold">{latestSleep.score}</span>
                <span className="text-4xl text-platinum opacity-50">/100</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg border-b border-gold border-opacity-20 pb-3">
                  <span className="text-platinum">Duration</span>
                  <span className="font-bold text-gold">{(latestSleep.total_sleep_duration / 3600).toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between text-lg border-b border-gold border-opacity-20 pb-3">
                  <span className="text-platinum">Efficiency</span>
                  <span className="font-bold text-gold">{latestSleep.efficiency}%</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-platinum">REM Sleep</span>
                  <span className="font-bold text-gold">{Math.round(latestSleep.rem_sleep_duration / 60)}min</span>
                </div>
              </div>
            </div>

            <div className="divider-luxury"></div>

            <div className="flex items-center justify-between text-lg pt-4">
              <span className="text-platinum">7-Day Average</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl">{avg7Sleep}</span>
                {sleepTrend !== 0 && (
                  <span className={`font-bold ${sleepTrend > 0 ? 'text-gold' : 'text-bronze'}`}>
                    {sleepTrend > 0 ? '+' : ''}{sleepTrend}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Activity Card */}
        <Link href="/activity" className="metric-luxury group cursor-pointer">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-bronze flex items-center justify-center shadow-luxury">
                  <Activity className="h-8 w-8 text-charcoal" />
                </div>
                <div>
                  <div className="text-sm text-bronze font-bold uppercase tracking-widest">Activity</div>
                  <div className="text-xs text-platinum">Yesterday</div>
                </div>
              </div>
              {getLuxuryBadge(latestActivity.score)}
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-7xl font-bold text-bronze">{latestActivity.score}</span>
                <span className="text-4xl text-platinum opacity-50">/100</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg border-b border-bronze border-opacity-20 pb-3">
                  <span className="text-platinum">Steps</span>
                  <span className="font-bold text-bronze">{latestActivity.steps.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-lg border-b border-bronze border-opacity-20 pb-3">
                  <span className="text-platinum">Active Calories</span>
                  <span className="font-bold text-bronze">{latestActivity.active_calories} cal</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-platinum">High Activity</span>
                  <span className="font-bold text-bronze">{Math.round(latestActivity.high_activity_time / 60)}min</span>
                </div>
              </div>
            </div>

            <div className="divider-luxury"></div>

            <div className="flex items-center justify-between text-lg pt-4">
              <span className="text-platinum">7-Day Average</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl">{avg7Activity}</span>
                {activityTrend !== 0 && (
                  <span className={`font-bold ${activityTrend > 0 ? 'text-gold' : 'text-bronze'}`}>
                    {activityTrend > 0 ? '+' : ''}{activityTrend}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Readiness Card */}
        <Link href="/readiness" className="metric-luxury group cursor-pointer">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-platinum flex items-center justify-center shadow-luxury">
                  <Heart className="h-8 w-8 text-charcoal" />
                </div>
                <div>
                  <div className="text-sm text-platinum font-bold uppercase tracking-widest">Readiness</div>
                  <div className="text-xs text-platinum opacity-60">Today</div>
                </div>
              </div>
              {getLuxuryBadge(latestReadiness.score)}
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-7xl font-bold text-platinum">{latestReadiness.score}</span>
                <span className="text-4xl text-platinum opacity-50">/100</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg border-b border-platinum border-opacity-20 pb-3">
                  <span className="text-platinum">Resting HR</span>
                  <span className="font-bold text-platinum">{latestReadiness.resting_heart_rate} bpm</span>
                </div>
                <div className="flex items-center justify-between text-lg border-b border-platinum border-opacity-20 pb-3">
                  <span className="text-platinum">HRV Balance</span>
                  <span className="font-bold text-platinum">{latestReadiness.hrv_balance || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-platinum">Temp Deviation</span>
                  <span className="font-bold text-platinum">{latestReadiness.temperature_deviation ? `${latestReadiness.temperature_deviation.toFixed(1)}°C` : 'Normal'}</span>
                </div>
              </div>
            </div>

            <div className="divider-luxury"></div>

            <div className="flex items-center justify-between text-lg pt-4">
              <span className="text-platinum">7-Day Average</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl">{avg7Readiness}</span>
                {readinessTrend !== 0 && (
                  <span className={`font-bold ${readinessTrend > 0 ? 'text-gold' : 'text-bronze'}`}>
                    {readinessTrend > 0 ? '+' : ''}{readinessTrend}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Luxury CTA Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-luxury" style={{ animationDelay: '0.6s' }}>
        <Link href="/insights" className="card-luxury group text-center p-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-gold mx-auto mb-6 flex items-center justify-center shadow-dramatic group-hover:shadow-luxury transition-shadow animate-float-luxury">
            <Sparkles className="h-10 w-10 text-charcoal" />
          </div>
          <p className="font-bold text-xl text-gold">AI Insights</p>
          <p className="text-sm text-platinum mt-2">{insights.length} Available</p>
        </Link>

        <Link href="/analytics" className="card-luxury group text-center p-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-bronze mx-auto mb-6 flex items-center justify-center shadow-dramatic group-hover:shadow-luxury transition-shadow animate-float-luxury" style={{animationDelay: '1s'}}>
            <TrendingUp className="h-10 w-10 text-charcoal" />
          </div>
          <p className="font-bold text-xl text-bronze">Analytics</p>
          <p className="text-sm text-platinum mt-2">Deep Insights</p>
        </Link>

        <Link href="/goals" className="card-luxury group text-center p-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-platinum mx-auto mb-6 flex items-center justify-center shadow-dramatic group-hover:shadow-luxury transition-shadow animate-float-luxury" style={{animationDelay: '1.5s'}}>
            <Crown className="h-10 w-10 text-charcoal" />
          </div>
          <p className="font-bold text-xl text-platinum">Goals</p>
          <p className="text-sm text-platinum mt-2">Track Progress</p>
        </Link>

        <Link href="/settings" className="card-luxury group text-center p-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-royal mx-auto mb-6 flex items-center justify-center shadow-dramatic group-hover:shadow-luxury transition-shadow animate-float-luxury" style={{animationDelay: '2s'}}>
            <Star className="h-10 w-10 text-gold" />
          </div>
          <p className="font-bold text-xl text-gold">Settings</p>
          <p className="text-sm text-platinum mt-2">Customize</p>
        </Link>
      </div>
    </div>
  );
}

function getLuxuryBadge(score: number) {
  if (score >= 85) return <span className="badge-luxury badge-gold">Exceptional</span>;
  if (score >= 70) return <span className="badge-luxury badge-platinum">Excellent</span>;
  if (score >= 55) return <span className="badge-luxury badge-bronze">Good</span>;
  return <span className="badge-luxury badge-bronze">Attention</span>;
}

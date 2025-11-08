'use client';

import { useOuraData } from '@/hooks/useOura';
import { LifestyleCorrelationAnalyzer } from '@/lib/lifestyle-correlations';
import { TrendingUp, TrendingDown, Minus, Coffee, Moon, Activity, Calendar, Lightbulb, Brain, Target, Star } from 'lucide-react';

export default function LifestylePage() {
  const { sleep, activity, readiness, loading, hasToken, error } = useOuraData();

  if (!hasToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No API Token Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please configure your Oura API token in Settings
          </p>
          <a
            href="/settings"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
          >
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading lifestyle correlation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (sleep.length < 30) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not Enough Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Lifestyle correlation analysis requires at least 30 days of data.
            You currently have {sleep.length} day{sleep.length !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    );
  }

  const analysis = LifestyleCorrelationAnalyzer.analyzeLifestyleCorrelations(sleep, activity, readiness);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-green-600 to-emerald-700';
    if (score >= 70) return 'from-blue-600 to-cyan-700';
    if (score >= 50) return 'from-yellow-600 to-amber-700';
    return 'from-orange-600 to-red-700';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very strong': return 'text-red-600 dark:text-red-400';
      case 'strong': return 'text-orange-600 dark:text-orange-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDirectionIcon = (direction: string) => {
    if (direction === 'positive') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (direction === 'negative') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const factorIcons: Record<string, any> = {
    late_night: Moon,
    alcohol: Coffee,
    caffeine: Coffee,
    exercise_timing: Activity,
    meal_timing: Coffee,
    stress: Brain,
    nap: Moon,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lifestyle Correlations</h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          How your habits affect sleep and recovery
        </p>
      </div>

      {/* Lifestyle Score Card */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${getScoreColor(analysis.lifestyleScore)} rounded-3xl p-8 shadow-xl`}>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Lifestyle Health Score</h2>
                <p className="text-white/80">Based on {analysis.correlations.length} lifestyle factors</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Overall Score</p>
              <p className="text-4xl font-bold text-white">{analysis.lifestyleScore}</p>
              <p className="text-xs text-white/70 mt-1">out of 100</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Factors Tracked</p>
              <p className="text-4xl font-bold text-white">{analysis.correlations.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Best Day</p>
              <p className="text-2xl font-bold text-white">{analysis.patterns.bestDays[0]?.dayOfWeek || 'N/A'}</p>
              <p className="text-xs text-white/70 mt-1">{analysis.patterns.bestDays[0]?.avgReadiness || 0} avg readiness</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Worst Day</p>
              <p className="text-2xl font-bold text-white">{analysis.patterns.worstDays[0]?.dayOfWeek || 'N/A'}</p>
              <p className="text-xs text-white/70 mt-1">{analysis.patterns.worstDays[0]?.avgReadiness || 0} avg readiness</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      </div>

      {/* Lifestyle Correlations */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" />
          Lifestyle Factor Correlations
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {analysis.correlations.map((corr, idx) => {
            const FactorIcon = factorIcons[corr.factor] || Coffee;
            return (
              <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FactorIcon className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {corr.factor.replace('_', ' ')}
                    </h4>
                  </div>
                  {getDirectionIcon(corr.direction)}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Strength</p>
                    <p className={`text-sm font-semibold capitalize ${getStrengthColor(corr.strength)}`}>
                      {corr.strength}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Confidence</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{corr.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Readiness Impact</p>
                    <p className={`text-sm font-semibold ${
                      corr.impact.readiness < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {corr.impact.readiness > 0 ? '+' : ''}{corr.impact.readiness.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Sample Size</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{corr.sampleSize} days</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{corr.insights}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">{corr.recommendation}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Patterns */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Best Days
          </h3>
          <div className="space-y-3">
            {analysis.patterns.bestDays.map((day, idx) => (
              <div key={idx} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{day.dayOfWeek}</h4>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {day.avgReadiness.toFixed(0)}
                  </span>
                </div>
                {day.commonFactors.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Common: {day.commonFactors.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            Worst Days
          </h3>
          <div className="space-y-3">
            {analysis.patterns.worstDays.map((day, idx) => (
              <div key={idx} className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{day.dayOfWeek}</h4>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {day.avgReadiness.toFixed(0)}
                  </span>
                </div>
                {day.commonFactors.length > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Common: {day.commonFactors.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optimization Opportunities */}
      {analysis.optimizations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Optimization Opportunities
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.optimizations.map((opt, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    opt.category === 'timing' ? 'bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300' :
                    opt.category === 'behavior' ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300' :
                    'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300'
                  }`}>
                    {opt.category}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{opt.opportunity}</h4>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">{opt.potentialGain}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{opt.implementation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Behavioral Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-pink-500" />
          Behavioral Insights
        </h3>
        <div className="space-y-4">
          {analysis.behavioralInsights.map((insight, idx) => (
            <div key={idx} className="border-l-4 border-purple-500 pl-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">{insight.finding}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{insight.evidence}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">{insight.actionable}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

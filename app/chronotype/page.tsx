'use client';

import { useOuraData } from '@/hooks/useOura';
import { ChronotypeAnalyzer } from '@/lib/chronotype-analyzer';
import { Sun, Moon, Clock, TrendingUp, Brain, Calendar, Lightbulb, Activity } from 'lucide-react';

export default function ChronotypePage() {
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
          <p className="text-gray-600 dark:text-gray-400">Loading chronotype data...</p>
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

  if (sleep.length < 14) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not Enough Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Chronotype analysis requires at least 14 days of sleep data.
            You currently have {sleep.length} day{sleep.length !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    );
  }

  const analysis = ChronotypeAnalyzer.analyzeChronotype(sleep, activity, readiness);

  const chronotypeInfo = {
    morning: {
      icon: Sun,
      color: 'amber',
      gradient: 'from-amber-600 to-orange-700',
      label: 'Morning Chronotype',
      description: 'Early bird - peak performance in morning hours',
    },
    intermediate: {
      icon: Clock,
      color: 'blue',
      gradient: 'from-blue-600 to-indigo-700',
      label: 'Intermediate Chronotype',
      description: 'Flexible schedule - balanced throughout the day',
    },
    evening: {
      icon: Moon,
      color: 'purple',
      gradient: 'from-purple-600 to-pink-700',
      label: 'Evening Chronotype',
      description: 'Night owl - peak performance in evening hours',
    },
  };

  const info = chronotypeInfo[analysis.chronotype];
  const Icon = info.icon;

  const scoreInterpretation =
    analysis.chronotypeScore > 1 ? 'Extreme Morning' :
    analysis.chronotypeScore > 0.5 ? 'Moderate Morning' :
    analysis.chronotypeScore > -0.5 ? 'Balanced' :
    analysis.chronotypeScore > -1 ? 'Moderate Evening' :
    'Extreme Evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Chronotype Analysis</h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Your circadian rhythm and optimal performance windows
        </p>
      </div>

      {/* Main Chronotype Card */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${info.gradient} rounded-3xl p-8 shadow-xl`}>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{info.label}</h2>
                <p className="text-white/80">{info.description}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Chronotype Score</p>
              <p className="text-2xl font-bold text-white">{analysis.chronotypeScore.toFixed(2)}</p>
              <p className="text-xs text-white/70 mt-1">({scoreInterpretation})</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Analysis Confidence</p>
              <p className="text-2xl font-bold text-white">{analysis.confidence}%</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Sleep Midpoint</p>
              <p className="text-2xl font-bold text-white">
                {Math.floor(analysis.sleepMetrics.averageSleepMidpoint)}:
                {Math.round((analysis.sleepMetrics.averageSleepMidpoint % 1) * 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Social Jetlag</p>
              <p className="text-2xl font-bold text-white">{analysis.socialJetlag.magnitude.toFixed(1)}h</p>
              <p className="text-xs text-white/70 mt-1 capitalize">{analysis.socialJetlag.severity}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      </div>

      {/* Sleep Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Sleep Timing</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Bedtime</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.sleepMetrics.averageBedtime}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Wake Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.sleepMetrics.averageWakeTime}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Sleep Duration</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.sleepMetrics.averageSleepDuration.toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Sleep Debt</span>
              <span className={`font-semibold ${
                analysis.sleepMetrics.sleepDebt > 0.5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {analysis.sleepMetrics.sleepDebt > 0 ? '+' : ''}{analysis.sleepMetrics.sleepDebt.toFixed(1)}h
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Performance Patterns</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Morning Readiness</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.performancePatterns.morningReadiness}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Afternoon Readiness</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.performancePatterns.afternoonReadiness}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Evening Readiness</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analysis.performancePatterns.eveningReadiness}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Peak Window</span>
              <p className="font-semibold text-gray-900 dark:text-white mt-1">
                {analysis.performancePatterns.peakPerformanceWindow}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Circadian Phase */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Circadian Phase Markers
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Est. DLMO</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analysis.circadianPhase.estimatedDLMO}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Melatonin onset</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Optimal Sleep Onset</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analysis.circadianPhase.optimalSleepOnset}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Natural Wake Time</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {analysis.circadianPhase.naturalWakeTime}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phase Shift</p>
            <p className={`text-lg font-semibold ${
              analysis.circadianPhase.phaseAdvancement > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400'
            }`}>
              {analysis.circadianPhase.phaseAdvancement > 0 ? '+' : ''}{analysis.circadianPhase.phaseAdvancement.toFixed(1)}h
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {analysis.circadianPhase.phaseAdvancement > 0 ? 'Advanced' : 'Delayed'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Personalized Recommendations
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sleep Schedule</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Bedtime: <span className="font-semibold text-gray-900 dark:text-white">{analysis.recommendations.optimalSleepSchedule.bedtime}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              Wake: <span className="font-semibold text-gray-900 dark:text-white">{analysis.recommendations.optimalSleepSchedule.wakeTime}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{analysis.recommendations.optimalSleepSchedule.rationale}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Light Exposure</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {analysis.recommendations.lightExposure.morningLight}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {analysis.recommendations.lightExposure.eveningDimming}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Meal Timing</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
              First: {analysis.recommendations.mealTiming.firstMeal}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Last: {analysis.recommendations.mealTiming.lastMeal}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Exercise Timing</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
              Optimal: {analysis.recommendations.exerciseTiming.optimal}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Avoid: {analysis.recommendations.exerciseTiming.avoid}
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-pink-500" />
          Scientific Insights
        </h3>
        <div className="space-y-4">
          {analysis.insights.map((insight, idx) => (
            <div key={idx} className="border-l-4 border-purple-500 pl-4">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">{insight.finding}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{insight.evidence}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">{insight.actionable}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Jetlag Warning */}
      {analysis.socialJetlag.severity !== 'none' && (
        <div className={`rounded-3xl p-6 ${
          analysis.socialJetlag.severity === 'severe' ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700' :
          analysis.socialJetlag.severity === 'moderate' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700' :
          'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700'
        }`}>
          <h3 className={`text-lg font-bold mb-2 ${
            analysis.socialJetlag.severity === 'severe' ? 'text-red-900 dark:text-red-100' :
            analysis.socialJetlag.severity === 'moderate' ? 'text-yellow-900 dark:text-yellow-100' :
            'text-blue-900 dark:text-blue-100'
          }`}>
            Social Jetlag Detected
          </h3>
          <p className={`text-sm ${
            analysis.socialJetlag.severity === 'severe' ? 'text-red-700 dark:text-red-300' :
            analysis.socialJetlag.severity === 'moderate' ? 'text-yellow-700 dark:text-yellow-300' :
            'text-blue-700 dark:text-blue-300'
          }`}>
            {analysis.socialJetlag.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

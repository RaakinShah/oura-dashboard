'use client';

import { useOuraData } from '@/hooks/useOura';
import { SleepDebtCalculator } from '@/lib/sleep-debt-calculator';
import { TrendingDown, AlertTriangle, Clock, Calendar, Lightbulb, Brain, Target } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SleepDebtPage() {
  const { sleep, loading, hasToken, error } = useOuraData();

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
          <p className="text-gray-600 dark:text-gray-400">Loading sleep debt data...</p>
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

  if (sleep.length < 7) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not Enough Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sleep debt analysis requires at least 7 days of sleep data.
            You currently have {sleep.length} day{sleep.length !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    );
  }

  const analysis = SleepDebtCalculator.analyzeSleepDebt(sleep);

  const severityColors = {
    none: { bg: 'from-green-600 to-emerald-700', text: 'text-green-600 dark:text-green-400', icon: 'text-green-500' },
    mild: { bg: 'from-blue-600 to-cyan-700', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-500' },
    moderate: { bg: 'from-yellow-600 to-amber-700', text: 'text-yellow-600 dark:text-yellow-400', icon: 'text-yellow-500' },
    severe: { bg: 'from-orange-600 to-red-700', text: 'text-orange-600 dark:text-orange-400', icon: 'text-orange-500' },
    critical: { bg: 'from-red-700 to-rose-800', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500' },
  };

  const severityColor = severityColors[analysis.severity];

  // Prepare chart data
  const chartData = {
    labels: analysis.debtHistory.map(h => {
      const date = new Date(h.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Sleep Debt (hours)',
        data: analysis.debtHistory.map(h => h.debt),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sleep Debt Analysis</h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Track accumulated sleep deficit and recovery progress
        </p>
      </div>

      {/* Main Debt Card */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${severityColor.bg} rounded-3xl p-8 shadow-xl`}>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">{analysis.severity} Sleep Debt</h2>
                <p className="text-white/80 capitalize">{analysis.debtTrend} trend</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Current Debt</p>
              <p className="text-3xl font-bold text-white">{analysis.currentDebt.toFixed(1)}h</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Sleep Need</p>
              <p className="text-3xl font-bold text-white">{analysis.estimatedSleepNeed}h</p>
              <p className="text-xs text-white/70 mt-1">{analysis.confidence}% confidence</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Recovery Time</p>
              <p className="text-3xl font-bold text-white">{analysis.recoveryEstimate.daysToRecovery}</p>
              <p className="text-xs text-white/70 mt-1">days</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Tonight's Target</p>
              <p className="text-3xl font-bold text-white">
                {(analysis.estimatedSleepNeed + analysis.recoveryEstimate.hoursNeededTonight).toFixed(1)}h
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      </div>

      {/* Performance Impact */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Performance Impact</h3>
        </div>
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cognitive Impairment</p>
              <p className={`text-2xl font-bold ${severityColor.text}`}>
                {analysis.impact.cognitiveImpairment.toFixed(0)}%
              </p>
            </div>
            <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Equivalent BAC</p>
              <p className={`text-2xl font-bold ${severityColor.text}`}>
                {analysis.impact.equivalentBAC.toFixed(3)}%
              </p>
            </div>
            <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accident Risk</p>
              <p className={`text-2xl font-bold ${severityColor.text}`}>
                {analysis.impact.accidentRisk.toFixed(1)}x
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{analysis.impact.description}</p>
        </div>
      </div>

      {/* Debt History Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          30-Day Debt Trend
        </h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Recovery Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          Recovery Plan
        </h3>
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Weekend Recovery</h4>
            <p className="text-green-700 dark:text-green-300 text-sm">
              {analysis.recoveryEstimate.weekendRecoveryPlan}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tonight's Goal</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sleep at least <span className="font-bold text-purple-600 dark:text-purple-400">
                {(analysis.estimatedSleepNeed + analysis.recoveryEstimate.hoursNeededTonight).toFixed(1)} hours
              </span> to begin recovery. Set your bedtime {Math.ceil(analysis.estimatedSleepNeed + analysis.recoveryEstimate.hoursNeededTonight)} hours before your wake time.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Immediate
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.immediate.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-500 flex-shrink-0">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Weekly
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.weekly.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-500 flex-shrink-0">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Long-term
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.longTerm.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-500 flex-shrink-0">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Scientific Insights */}
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
              <p className="text-sm text-purple-600 dark:text-purple-400">{insight.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

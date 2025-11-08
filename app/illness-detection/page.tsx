'use client';

import { useOuraData } from '@/hooks/useOura';
import { IllnessDetector } from '@/lib/illness-detector';
import { Shield, AlertTriangle, Activity, TrendingUp, TrendingDown, Minus, Clock, Brain, Lightbulb } from 'lucide-react';

export default function IllnessDetectionPage() {
  const { sleep, readiness, loading, hasToken, error } = useOuraData();

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
          <p className="text-gray-600 dark:text-gray-400">Loading illness detection data...</p>
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
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not Enough Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Illness detection requires at least 14 days of data.
            You currently have {sleep.length} day{sleep.length !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    );
  }

  const analysis = IllnessDetector.analyzeIllnessRisk(sleep, readiness);

  const riskColors = {
    none: { bg: 'from-green-600 to-emerald-700', text: 'text-green-600 dark:text-green-400', icon: 'text-green-500', border: 'border-green-500' },
    low: { bg: 'from-blue-600 to-cyan-700', text: 'text-blue-600 dark:text-blue-400', icon: 'text-blue-500', border: 'border-blue-500' },
    moderate: { bg: 'from-yellow-600 to-amber-700', text: 'text-yellow-600 dark:text-yellow-400', icon: 'text-yellow-500', border: 'border-yellow-500' },
    high: { bg: 'from-orange-600 to-red-700', text: 'text-orange-600 dark:text-orange-400', icon: 'text-orange-500', border: 'border-orange-500' },
    critical: { bg: 'from-red-700 to-rose-800', text: 'text-red-600 dark:text-red-400', icon: 'text-red-500', border: 'border-red-500' },
  };

  const riskColor = riskColors[analysis.riskLevel];

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Illness Detection</h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Early warning system based on biometric deviations
        </p>
      </div>

      {/* Main Risk Card */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${riskColor.bg} rounded-3xl p-8 shadow-xl`}>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">{analysis.riskLevel} Risk</h2>
                <p className="text-white/80">{analysis.confidence.toFixed(0)}% confidence</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Risk Score</p>
              <p className="text-3xl font-bold text-white">{analysis.riskScore.toFixed(0)}</p>
              <p className="text-xs text-white/70 mt-1">out of 100</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Anomalies Detected</p>
              <p className="text-3xl font-bold text-white">{analysis.anomalies.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Recovery Days</p>
              <p className="text-3xl font-bold text-white">{analysis.recoveryStatus.estimatedRecoveryDays}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Rest Needed</p>
              <p className="text-2xl font-bold text-white">{analysis.recoveryStatus.needsRest ? 'YES' : 'NO'}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      </div>

      {/* Biometric Trends */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Heart Rate Variability</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Current</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{analysis.biometricTrends.hrv.current} ms</span>
                {getTrendIcon(analysis.biometricTrends.hrv.trend)}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Baseline</span>
              <span className="text-gray-900 dark:text-white">{analysis.biometricTrends.hrv.baseline} ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Change</span>
              <span className={analysis.biometricTrends.hrv.change < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {analysis.biometricTrends.hrv.change > 0 ? '+' : ''}{analysis.biometricTrends.hrv.change.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Body Temperature</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Current Deviation</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">
                  {analysis.biometricTrends.temperature.current > 0 ? '+' : ''}{(analysis.biometricTrends.temperature.current * 9/5).toFixed(2)}°F
                </span>
                {getTrendIcon(analysis.biometricTrends.temperature.trend)}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Baseline Deviation</span>
              <span className="text-gray-900 dark:text-white">
                {analysis.biometricTrends.temperature.baseline > 0 ? '+' : ''}{(analysis.biometricTrends.temperature.baseline * 9/5).toFixed(2)}°F
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Change</span>
              <span className={analysis.biometricTrends.temperature.change > 0.3 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {analysis.biometricTrends.temperature.change > 0 ? '+' : ''}{(analysis.biometricTrends.temperature.change * 9/5).toFixed(2)}°F
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
              Values show deviation from your baseline body temperature
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Resting Heart Rate</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Current</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{analysis.biometricTrends.restingHeartRate.current} bpm</span>
                {getTrendIcon(analysis.biometricTrends.restingHeartRate.trend)}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Baseline</span>
              <span className="text-gray-900 dark:text-white">{analysis.biometricTrends.restingHeartRate.baseline} bpm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Change</span>
              <span className={analysis.biometricTrends.restingHeartRate.change > 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {analysis.biometricTrends.restingHeartRate.change > 0 ? '+' : ''}{analysis.biometricTrends.restingHeartRate.change} bpm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies Detected */}
      {analysis.anomalies.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Detected Anomalies
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.anomalies.map((anomaly, idx) => (
              <div key={idx} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-r-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                    {anomaly.type.replace('_', ' ')}
                  </h4>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {anomaly.severity.toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{anomaly.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Duration: {anomaly.duration} day{anomaly.duration !== 1 ? 's' : ''} • {anomaly.deviation.toFixed(1)} SD
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Early Warnings */}
      {analysis.earlyWarnings.filter(w => w.detected).length > 0 && (
        <div className="rounded-3xl p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700">
          <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Early Warning Indicators
          </h3>
          <div className="space-y-3">
            {analysis.earlyWarnings.filter(w => w.detected).map((warning, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{warning.indicator}</h4>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
                    {warning.daysAgo} day{warning.daysAgo !== 1 ? 's' : ''} ago
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{warning.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery Status */}
      <div className={`rounded-3xl p-6 ${
        analysis.recoveryStatus.needsRest
          ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700'
          : 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${
          analysis.recoveryStatus.needsRest ? 'text-orange-900 dark:text-orange-100' : 'text-green-900 dark:text-green-100'
        }`}>
          Recovery Status
        </h3>
        <p className={`text-sm ${
          analysis.recoveryStatus.needsRest ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300'
        }`}>
          {analysis.recoveryStatus.recommendation}
        </p>
      </div>

      {/* Recommendations */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-red-500" />
            Immediate Actions
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
            <Shield className="w-5 h-5 text-blue-500" />
            Preventive Measures
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.preventive.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-500 flex-shrink-0">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Monitoring
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.monitoring.map((rec, idx) => (
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
            <div key={idx} className={`border-l-4 ${riskColor.border} pl-4`}>
              <p className="font-semibold text-gray-900 dark:text-white mb-1">{insight.finding}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{insight.evidence}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">{insight.actionable}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Patterns */}
      {analysis.historicalPatterns.likelyIllnessesDetected > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Historical Patterns
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Likely Illnesses Detected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.historicalPatterns.likelyIllnessesDetected}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Warning Window</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.historicalPatterns.averageWarningWindow} days
              </p>
            </div>
            <div className="md:col-span-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Common Precursors</p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {analysis.historicalPatterns.commonPrecursors.map((precursor, idx) => (
                  <li key={idx}>• {precursor}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useOuraData } from '@/hooks/useOura';
import { AdvancedAIEngine } from '@/lib/advanced-ai-engine';
import {
  Brain,
  TrendingUp,
  Zap,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  Moon,
  Calendar,
  Lightbulb,
  Shield,
  Flame,
  Heart,
  Info,
  RefreshCw,
  Sparkles,
  BarChart3,
  Layers,
  FileDown,
} from 'lucide-react';
import { exportInsightsToPDF } from '@/lib/pdf-export';

export default function Insights() {
  const { sleep, activity, readiness, loading, hasToken, refetch } = useOuraData();

  if (!hasToken || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (!sleep.length || !activity.length || !readiness.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">We need at least a few days of data to generate insights.</p>
        </div>
      </div>
    );
  }

  // Generate advanced AI insights
  const deepInsights = AdvancedAIEngine.generateDeepInsights(sleep, activity, readiness);
  const patterns = AdvancedAIEngine.detectMultiDimensionalPatterns(sleep, activity, readiness);
  const contextualIntel = AdvancedAIEngine.analyzeContext(sleep, activity, readiness);
  const holisticAssessment = AdvancedAIEngine.generateHolisticAssessment(sleep, activity, readiness);
  const readinessForecast = readiness.length >= 14 ?
    AdvancedAIEngine.generatePredictiveModel('readiness', readiness, 7) : null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-500 to-rose-600';
      case 'important': return 'from-orange-500 to-red-500';
      case 'moderate': return 'from-yellow-500 to-orange-500';
      case 'positive': return 'from-green-500 to-emerald-600';
      default: return 'from-blue-500 to-cyan-600';
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'cascading': return 'from-red-500 to-orange-500';
      case 'cyclical': return 'from-blue-500 to-cyan-500';
      case 'progressive': return 'from-green-500 to-emerald-500';
      case 'compensatory': return 'from-purple-500 to-pink-500';
      case 'synergistic': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Sparkles className="h-10 w-10 text-purple-600" />
            Advanced AI Insights
          </h1>
          <p className="text-gray-600">Deep intelligence analysis with natural language coaching</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportInsightsToPDF(sleep, activity, readiness)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200"
            title="Export to PDF"
          >
            <FileDown className="h-4 w-4" />
            <span className="text-sm font-medium">Export PDF</span>
          </button>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4 text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-sm font-medium text-gray-700">Refresh</span>
          </button>
        </div>
      </div>

      {/* Holistic Health Assessment - Hero */}
      <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-3xl p-8 shadow-xl text-white animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-8 w-8" />
          <h2 className="text-3xl font-bold">Overall Health State</h2>
        </div>
        <p className="text-white/90 text-lg mb-6 leading-relaxed">
          {holisticAssessment.overallState}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Resilience */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-white/70 text-sm mb-1">Resilience</p>
            <div className="text-4xl font-bold mb-2">{holisticAssessment.resilience.score}</div>
            <p className="text-white/80 text-sm capitalize">{holisticAssessment.resilience.trend}</p>
          </div>

          {/* Balance */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-white/70 text-sm mb-1">Workload vs Recovery</p>
            <div className="text-4xl font-bold mb-2">
              {holisticAssessment.balanceAnalysis.balance > 0 ? '+' : ''}
              {holisticAssessment.balanceAnalysis.balance}
            </div>
            <p className="text-white/80 text-sm">{holisticAssessment.balanceAnalysis.recommendation}</p>
          </div>

          {/* Top System */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-white/70 text-sm mb-1">Best System</p>
            <div className="text-2xl font-bold mb-2 capitalize">
              {holisticAssessment.systemicHealth.reduce((max, s) => s.score > max.score ? s : max).system}
            </div>
            <p className="text-white/80 text-sm">
              Score: {holisticAssessment.systemicHealth.reduce((max, s) => s.score > max.score ? s : max).score}
            </p>
          </div>
        </div>
      </div>

      {/* Contextual Intelligence */}
      <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-3xl p-6 shadow-xl text-white animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-7 w-7" />
          <h2 className="text-2xl font-bold">Today's Context</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-white/70 text-base mb-2">Current Day</p>
            <p className="text-2xl font-bold mb-4">{contextualIntel.currentContext.dayOfWeek}</p>
            <p className="text-white/80 text-base mb-2">Historical Pattern:</p>
            <p className="text-white/90 text-base">{contextualIntel.historicalContext.typicalPatternForToday}</p>
            <p className="text-white/70 text-base mt-2">
              Typical score: {contextualIntel.historicalContext.similarDaysPerformance}
            </p>
          </div>
          <div>
            <p className="text-white/70 text-base mb-2">Adaptive Recommendations</p>
            <ul className="space-y-2">
              {contextualIntel.adaptiveRecommendations.slice(0, 4).map((rec, i) => (
                <li key={i} className="text-white/90 text-base flex items-start gap-2">
                  <span>•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Deep Health Insights */}
      {deepInsights.length > 0 && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-7 w-7 text-purple-600" />
            Deep Health Insights
          </h2>
          {deepInsights.map((insight, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${getSeverityColor(insight.severity)} rounded-3xl p-6 shadow-lg text-white card-hover`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold flex-1">{insight.title}</h3>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase">
                    {insight.severity}
                  </span>
                  <span className="text-xs text-white/70">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              <p className="text-white/90 text-base mb-6 leading-relaxed">
                {insight.narrative}
              </p>

              {/* Evidence */}
              {insight.evidence.length > 0 && (
                <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <h4 className="text-white/90 font-semibold text-base mb-3 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Evidence
                  </h4>
                  <div className="space-y-2">
                    {insight.evidence.map((ev, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="text-white/70 text-base">•</span>
                        <div className="flex-1">
                          <span className="text-white/90 text-base font-medium">{ev.metric}:</span>
                          <span className="text-white/80 text-base ml-1">{ev.observation}</span>
                        </div>
                        <span className="text-sm text-white/60">
                          {ev.significance}% sig.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Plan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-white/80 font-semibold text-sm mb-3 uppercase">Immediate</h4>
                  <ul className="space-y-2">
                    {insight.actionPlan.immediate.slice(0, 2).map((action, j) => (
                      <li key={j} className="text-white/90 text-sm flex items-start gap-2">
                        <span>•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-white/80 font-semibold text-sm mb-3 uppercase">Short-Term</h4>
                  <ul className="space-y-2">
                    {insight.actionPlan.shortTerm.slice(0, 2).map((action, j) => (
                      <li key={j} className="text-white/90 text-sm flex items-start gap-2">
                        <span>•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h4 className="text-white/80 font-semibold text-sm mb-3 uppercase">Long-Term</h4>
                  <ul className="space-y-2">
                    {insight.actionPlan.longTerm.slice(0, 2).map((action, j) => (
                      <li key={j} className="text-white/90 text-sm flex items-start gap-2">
                        <span>•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Expected Outcome */}
              <div className="pt-4 border-t border-white/20">
                <p className="text-white/90 text-base">
                  <strong>Expected Outcome:</strong> {insight.expectedOutcome}
                </p>
                <p className="text-white/70 text-sm mt-2">
                  <strong>Timeframe:</strong> {insight.timeframe}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-Dimensional Patterns */}
      {patterns.length > 0 && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="h-7 w-7 text-indigo-600" />
            Multi-Dimensional Patterns
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {patterns.map((pattern, i) => (
              <div key={i} className={`bg-gradient-to-br ${getPatternColor(pattern.patternType)} rounded-2xl p-6 shadow-lg text-white`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase">
                      {pattern.patternType}
                    </span>
                    <h3 className="text-xl font-bold mt-3">{pattern.description}</h3>
                  </div>
                  <span className="text-white/70 text-sm">
                    Strength: {pattern.strength}/100
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-white/80 text-base mb-2">Involved Metrics:</p>
                  <div className="flex flex-wrap gap-2">
                    {pattern.involvedMetrics.map((metric, j) => (
                      <span key={j} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-sm">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>

                {pattern.rippleEffects.length > 0 && (
                  <div className="mb-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/90 text-base font-semibold mb-3">Ripple Effects:</p>
                    <ul className="space-y-2">
                      {pattern.rippleEffects.map((effect, j) => (
                        <li key={j} className="text-white/80 text-sm flex items-start gap-2">
                          <span>•</span>
                          <span>{effect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pattern.interventionPoints.length > 0 && (
                  <div>
                    <p className="text-white/90 text-base font-semibold mb-3">Intervention Points:</p>
                    <div className="space-y-2">
                      {pattern.interventionPoints.map((point, j) => (
                        <div key={j} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex-1">
                            <p className="text-white/90 text-base">{point.point}</p>
                            <p className="text-white/70 text-sm mt-1">Difficulty: {point.difficulty}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white text-xl font-bold">{point.leverage}%</p>
                            <p className="text-white/70 text-sm">leverage</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Readiness Forecast */}
      {readinessForecast && (
        <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-3xl p-6 shadow-xl text-white animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-7 w-7" />
            <h2 className="text-2xl font-bold">7-Day Readiness Forecast</h2>
          </div>
          <div className="mb-4">
            <p className="text-white/90 text-base mb-2">
              Trend: <span className="font-bold capitalize">{readinessForecast.trendDirection}</span>
            </p>
            <p className="text-white/80 text-sm">Volatility: {readinessForecast.volatility}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {readinessForecast.predictions.map((pred, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-white/70 text-sm mb-1">Day {pred.day}</p>
                <p className="text-white text-3xl font-bold mb-1">{pred.value}</p>
                <p className="text-white/60 text-sm">
                  {pred.confidenceInterval.lower}-{pred.confidenceInterval.upper}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  {Math.round(pred.confidence * 100)}%
                </p>
              </div>
            ))}
          </div>

          {readinessForecast.scenarioAnalysis.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readinessForecast.scenarioAnalysis.map((scenario, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/70 text-sm uppercase mb-2">
                    {scenario.scenario.replace('_', ' ')}
                  </p>
                  <p className="text-white text-base mb-2">{scenario.outcome}</p>
                  <p className="text-white/60 text-sm">{Math.round(scenario.probability * 100)}% probability</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Systemic Health Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-7 w-7 text-green-600" />
          Systemic Health Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {holisticAssessment.systemicHealth.map((system, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <p className="text-gray-600 text-sm uppercase mb-2 capitalize font-semibold">{system.system}</p>
              <div className="text-4xl font-bold text-gray-900 mb-2">{system.score}</div>
              <p className="text-gray-700 text-base mb-3">{system.status}</p>
              <div className="space-y-1">
                {system.keyIndicators.slice(0, 2).map((indicator, j) => (
                  <p key={j} className="text-gray-600 text-sm flex items-start gap-1">
                    <span>•</span>
                    <span>{indicator}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Life Optimization Areas */}
      {holisticAssessment.lifeOptimization.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-amber-600" />
            Life Optimization Opportunities
          </h2>
          <div className="space-y-4">
            {holisticAssessment.lifeOptimization.map((opt, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-xl">{opt.area}</h3>
                  <div className="text-right">
                    <p className="text-base text-gray-600">Gap: <span className="font-bold text-amber-600">{opt.gap}</span></p>
                    <p className="text-sm text-gray-500">Current: {opt.currentLevel} → Potential: {opt.potential}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-semibold text-gray-700 mb-2">Top Actions:</p>
                  {opt.topActions.slice(0, 3).map((action, j) => (
                    <p key={j} className="text-base text-gray-600 flex items-start gap-2">
                      <span className="text-amber-600">→</span>
                      <span>{action}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Notice */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">About These Advanced Insights</h4>
            <p className="text-sm text-blue-800">
              All insights are generated using sophisticated AI algorithms with multi-dimensional pattern recognition,
              natural language generation, and predictive modeling. Confidence scores indicate accuracy.
              These are personalized recommendations, not medical advice. Consult healthcare professionals for medical decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

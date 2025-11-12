'use client';

import { useMemo } from 'react';
import { useOuraData } from '@/hooks/useOura';
import {
  Brain,
  TrendingUp,
  Zap,
  Heart,
  RefreshCw,
  Sparkles,
  BarChart3,
  Layers,
  FileDown,
  Shield,
  Lightbulb,
  Calendar,
  Info,
  AlertCircle,
} from 'lucide-react';
import { AdvancedAIEngine } from '@/lib/advanced-ai-engine';
import { exportInsightsToPDF } from '@/lib/pdf-export';
import { InsightNarrative } from '@/components/InsightNarrative';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';

export default function Insights() {
  const { sleep, activity, readiness, loading, hasToken, refetch } = useOuraData();

  const insights = useMemo(() => {
    if (sleep.length > 0 && activity.length > 0 && readiness.length > 0) {
      return {
        deep: AdvancedAIEngine.generateDeepInsights(sleep, activity, readiness),
        patterns: AdvancedAIEngine.detectMultiDimensionalPatterns(sleep, activity, readiness),
        contextual: AdvancedAIEngine.analyzeContext(sleep, activity, readiness),
        holistic: AdvancedAIEngine.generateHolisticAssessment(sleep, activity, readiness),
        forecast: readiness.length >= 14
          ? AdvancedAIEngine.generatePredictiveModel('readiness', readiness, 7)
          : null,
      };
    }
    return null;
  }, [sleep, activity, readiness]);

  if (!hasToken || loading) {
    return <DashboardSkeleton />;
  }

  if (!sleep.length || !activity.length || !readiness.length) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-stone-100 flex items-center justify-center">
            <Brain className="h-10 w-10 text-stone-500" />
          </div>
          <h2 className="text-3xl font-light mb-4">No Insights Yet</h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            We need at least a few days of data to generate AI insights
          </p>
          <button onClick={refetch} className="btn-refined btn-secondary">
            <RefreshCw className="h-4 w-4" />
            Check Again
          </button>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const { deep: deepInsights, patterns, contextual: contextualIntel, holistic: holisticAssessment, forecast: readinessForecast } = insights;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'important': return 'border-orange-200 bg-orange-50';
      case 'moderate': return 'border-yellow-200 bg-yellow-50';
      case 'positive': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-12 pb-12 page-transition">
      {/* Header */}
      <header className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-light mb-3">AI Insights</h1>
            <p className="text-stone-600 text-lg">Deep intelligence analysis with personalized recommendations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportInsightsToPDF(sleep, activity, readiness)}
              className="btn-refined btn-secondary"
              title="Export to PDF"
              aria-label="Export insights to PDF"
            >
              <FileDown className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button
              onClick={refetch}
              className="btn-refined btn-secondary"
              title="Refresh data"
              aria-label="Refresh insights"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Overall Health State */}
      <section className="bg-white border border-stone-200 rounded-lg p-8 sm:p-12 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-8 w-8 text-stone-700" />
          <h2 className="text-3xl font-light">Overall Health State</h2>
        </div>
        <p className="text-stone-700 text-lg mb-8 leading-relaxed">
          {holisticAssessment.overallState}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
            <p className="text-stone-500 text-sm uppercase tracking-wide font-medium mb-2">Resilience</p>
            <div className="text-5xl font-light mb-2">{holisticAssessment.resilience.score}</div>
            <p className="text-stone-600 capitalize">{holisticAssessment.resilience.trend}</p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
            <p className="text-stone-500 text-sm uppercase tracking-wide font-medium mb-2">Workload vs Recovery</p>
            <div className="text-5xl font-light mb-2">
              {holisticAssessment.balanceAnalysis.balance > 0 ? '+' : ''}
              {holisticAssessment.balanceAnalysis.balance}
            </div>
            <p className="text-stone-600 text-sm">{holisticAssessment.balanceAnalysis.recommendation}</p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
            <p className="text-stone-500 text-sm uppercase tracking-wide font-medium mb-2">Best System</p>
            <div className="text-3xl font-light mb-2 capitalize">
              {holisticAssessment.systemicHealth.reduce((max, s) => s.score > max.score ? s : max).system}
            </div>
            <p className="text-stone-600">
              Score: {holisticAssessment.systemicHealth.reduce((max, s) => s.score > max.score ? s : max).score}
            </p>
          </div>
        </div>
      </section>

      {/* Today's Context */}
      <section className="bg-white border border-stone-200 rounded-lg p-8 sm:p-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-7 w-7 text-stone-700" />
          <h2 className="text-2xl font-light">Today's Context</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-stone-500 text-sm uppercase tracking-wide font-medium mb-2">Current Day</p>
            <p className="text-3xl font-light mb-6">{contextualIntel.currentContext.dayOfWeek}</p>
            <p className="text-stone-600 mb-2 font-medium">Historical Pattern:</p>
            <p className="text-stone-700 leading-relaxed mb-3">{contextualIntel.historicalContext.typicalPatternForToday}</p>
            <p className="text-stone-500 text-sm">
              Typical score: {contextualIntel.historicalContext.similarDaysPerformance}
            </p>
          </div>
          <div>
            <p className="text-stone-500 text-sm uppercase tracking-wide font-medium mb-4">Adaptive Recommendations</p>
            <div className="space-y-3">
              {contextualIntel.adaptiveRecommendations.slice(0, 5).map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2.5 flex-shrink-0" />
                  <p className="text-stone-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Deep Health Insights */}
      {deepInsights.length > 0 && (
        <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-light flex items-center gap-3">
            <Brain className="h-7 w-7 text-stone-700" />
            Deep Health Insights
          </h2>
          {deepInsights.map((insight, i) => (
            <article
              key={i}
              className={`border rounded-lg p-8 sm:p-12 ${getSeverityColor(insight.severity)} transition-all hover:shadow-md`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                <h3 className="text-2xl sm:text-3xl font-light flex-1">{insight.title}</h3>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className={`px-3 py-1 border rounded-full text-xs font-medium uppercase tracking-wide ${getSeverityBadgeColor(insight.severity)}`}>
                    {insight.severity}
                  </span>
                  <span className="text-xs text-stone-500">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <InsightNarrative narrative={insight.narrative} />
              </div>

              {/* Evidence */}
              {insight.evidence.length > 0 && (
                <div className="mb-8 bg-white border border-stone-200 rounded-lg p-6">
                  <h4 className="text-stone-900 font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-stone-600" />
                    Evidence
                  </h4>
                  <div className="space-y-3">
                    {insight.evidence.map((ev, j) => (
                      <div key={j} className="flex items-start justify-between gap-4 pb-3 border-b border-stone-100 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <span className="text-stone-900 font-medium">{ev.metric}:</span>
                          <span className="text-stone-600 ml-2">{ev.observation}</span>
                        </div>
                        <span className="text-sm text-stone-500 flex-shrink-0">
                          {ev.significance}% sig.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Plan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-stone-200 rounded-lg p-5">
                  <h4 className="text-stone-700 font-medium text-sm uppercase tracking-wide mb-4">Immediate</h4>
                  <ul className="space-y-3">
                    {insight.actionPlan.immediate.slice(0, 3).map((action, j) => (
                      <li key={j} className="text-stone-600 text-sm flex items-start gap-2 leading-relaxed">
                        <span className="text-stone-400">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-stone-200 rounded-lg p-5">
                  <h4 className="text-stone-700 font-medium text-sm uppercase tracking-wide mb-4">Short-Term</h4>
                  <ul className="space-y-3">
                    {insight.actionPlan.shortTerm.slice(0, 3).map((action, j) => (
                      <li key={j} className="text-stone-600 text-sm flex items-start gap-2 leading-relaxed">
                        <span className="text-stone-400">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-stone-200 rounded-lg p-5">
                  <h4 className="text-stone-700 font-medium text-sm uppercase tracking-wide mb-4">Long-Term</h4>
                  <ul className="space-y-3">
                    {insight.actionPlan.longTerm.slice(0, 3).map((action, j) => (
                      <li key={j} className="text-stone-600 text-sm flex items-start gap-2 leading-relaxed">
                        <span className="text-stone-400">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Expected Outcome */}
              <div className="pt-6 border-t border-stone-200">
                <p className="text-stone-700 leading-relaxed mb-2">
                  <strong className="font-medium">Expected Outcome:</strong> {insight.expectedOutcome}
                </p>
                <p className="text-stone-500 text-sm">
                  <strong className="font-medium">Timeframe:</strong> {insight.timeframe}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Multi-Dimensional Patterns */}
      {patterns.length > 0 && (
        <section className="space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-light flex items-center gap-3">
            <Layers className="h-7 w-7 text-stone-700" />
            Multi-Dimensional Patterns
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {patterns.map((pattern, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-lg p-8">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <span className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-medium uppercase tracking-wide text-stone-700">
                      {pattern.patternType}
                    </span>
                    <h3 className="text-xl font-medium mt-3 text-stone-900">{pattern.description}</h3>
                  </div>
                  <span className="text-stone-500 text-sm">
                    Strength: <span className="font-medium text-stone-900">{pattern.strength}/100</span>
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-stone-600 text-sm font-medium mb-3">Involved Metrics:</p>
                  <div className="flex flex-wrap gap-2">
                    {pattern.involvedMetrics.map((metric, j) => (
                      <span key={j} className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>

                {pattern.rippleEffects.length > 0 && (
                  <div className="mb-6 bg-stone-50 border border-stone-200 rounded-lg p-5">
                    <p className="text-stone-900 font-medium mb-3">Ripple Effects:</p>
                    <ul className="space-y-2">
                      {pattern.rippleEffects.map((effect, j) => (
                        <li key={j} className="text-stone-600 flex items-start gap-2">
                          <span className="text-stone-400">•</span>
                          <span>{effect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pattern.interventionPoints.length > 0 && (
                  <div>
                    <p className="text-stone-900 font-medium mb-4">Intervention Points:</p>
                    <div className="space-y-3">
                      {pattern.interventionPoints.map((point, j) => (
                        <div key={j} className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg p-4">
                          <div className="flex-1 pr-4">
                            <p className="text-stone-900">{point.point}</p>
                            <p className="text-stone-500 text-sm mt-1">Difficulty: {point.difficulty}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-stone-900 text-2xl font-light">{point.leverage}%</p>
                            <p className="text-stone-500 text-sm">leverage</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7-Day Readiness Forecast */}
      {readinessForecast && (
        <section className="bg-white border border-stone-200 rounded-lg p-8 sm:p-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-7 w-7 text-stone-700" />
            <h2 className="text-2xl font-light">7-Day Readiness Forecast</h2>
          </div>
          <div className="mb-8">
            <p className="text-stone-700 mb-2">
              Trend: <span className="font-medium capitalize">{readinessForecast.trendDirection}</span>
            </p>
            <p className="text-stone-500 text-sm">Volatility: {readinessForecast.volatility}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {readinessForecast.predictions.map((pred, i) => (
              <div key={i} className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-center">
                <p className="text-stone-500 text-xs uppercase tracking-wide mb-2">Day {pred.day}</p>
                <p className="text-stone-900 text-4xl font-light mb-2">{pred.value}</p>
                <p className="text-stone-500 text-xs">
                  {pred.confidenceInterval.lower}-{pred.confidenceInterval.upper}
                </p>
                <p className="text-stone-400 text-xs mt-1">
                  {Math.round(pred.confidence * 100)}%
                </p>
              </div>
            ))}
          </div>

          {readinessForecast.scenarioAnalysis.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readinessForecast.scenarioAnalysis.map((scenario, i) => (
                <div key={i} className="bg-stone-50 border border-stone-200 rounded-lg p-5">
                  <p className="text-stone-500 text-xs uppercase tracking-wide mb-2">
                    {scenario.scenario.replace('_', ' ')}
                  </p>
                  <p className="text-stone-900 mb-2">{scenario.outcome}</p>
                  <p className="text-stone-500 text-sm">{Math.round(scenario.probability * 100)}% probability</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Systemic Health Status */}
      <section className="bg-white border border-stone-200 rounded-lg p-8 sm:p-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-2xl font-light mb-8 flex items-center gap-3">
          <Shield className="h-7 w-7 text-stone-700" />
          Systemic Health Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {holisticAssessment.systemicHealth.map((system, i) => (
            <div key={i} className="bg-stone-50 border border-stone-200 rounded-lg p-6">
              <p className="text-stone-500 text-xs uppercase tracking-wide font-medium mb-3 capitalize">{system.system}</p>
              <div className="text-5xl font-light text-stone-900 mb-3">{system.score}</div>
              <p className="text-stone-700 mb-4">{system.status}</p>
              <div className="space-y-2">
                {system.keyIndicators.slice(0, 2).map((indicator, j) => (
                  <p key={j} className="text-stone-600 text-sm flex items-start gap-2">
                    <span className="text-stone-400">•</span>
                    <span>{indicator}</span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Life Optimization Areas */}
      {holisticAssessment.lifeOptimization.length > 0 && (
        <section className="bg-white border border-stone-200 rounded-lg p-8 sm:p-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl font-light mb-8 flex items-center gap-3">
            <Lightbulb className="h-7 w-7 text-stone-700" />
            Life Optimization Opportunities
          </h2>
          <div className="space-y-6">
            {holisticAssessment.lifeOptimization.map((opt, i) => (
              <div key={i} className="bg-stone-50 border border-stone-200 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                  <h3 className="font-medium text-stone-900 text-xl">{opt.area}</h3>
                  <div className="text-left sm:text-right">
                    <p className="text-stone-600 text-sm">Gap: <span className="font-medium text-stone-900">{opt.gap}</span></p>
                    <p className="text-stone-500 text-xs mt-1">Current: {opt.currentLevel} → Potential: {opt.potential}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="font-medium text-stone-700 mb-3">Top Actions:</p>
                  {opt.topActions.slice(0, 3).map((action, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <span className="text-stone-400">→</span>
                      <p className="text-stone-600 leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Notice */}
      <aside className="bg-blue-50 border border-blue-200 rounded-lg p-6 animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <div className="flex items-start gap-4">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">About These Insights</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              All insights are generated using sophisticated AI algorithms with multi-dimensional pattern recognition,
              natural language generation, and predictive modeling. Confidence scores indicate accuracy.
              These are personalized recommendations, not medical advice. Consult healthcare professionals for medical decisions.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

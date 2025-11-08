'use client';

import { useState } from 'react';
import { useOuraData } from '@/hooks/useOura';
import { AdvancedAIEngine } from '@/lib/advanced-ai-engine';
import { PersonalizedAI } from '@/lib/personalized-ai';
import { getNote, getTodayDate, getMoodEmoji } from '@/lib/notes-storage';
import { formatFullDate } from '@/lib/date-utils';
import DailyNoteModal from '@/components/DailyNoteModal';
import {
  Sun,
  Moon,
  Activity,
  Heart,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Calendar,
  Plus,
  Edit2,
  FileDown,
  Target,
  Sparkles,
} from 'lucide-react';
import { exportInsightsToPDF } from '@/lib/pdf-export';

export default function TodayPage() {
  const { sleep, activity, readiness, loading, hasToken } = useOuraData();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [todayNote, setTodayNote] = useState(getNote(getTodayDate()));

  if (!hasToken || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading today's overview...</p>
        </div>
      </div>
    );
  }

  if (!sleep.length || !activity.length || !readiness.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center max-w-md">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Yet</h2>
          <p className="text-gray-600">Sync your Oura Ring to see today's overview.</p>
        </div>
      </div>
    );
  }

  const latestSleep = sleep[sleep.length - 1];
  const latestActivity = activity[activity.length - 1];
  const latestReadiness = readiness[readiness.length - 1];

  // Generate AI insights
  const deepInsights = AdvancedAIEngine.generateDeepInsights(sleep, activity, readiness);
  const topInsight = deepInsights[0];

  // Generate Personalized AI insights
  const rootCauses = PersonalizedAI.detectRootCauses(sleep, activity, readiness);
  const whyNarrative = PersonalizedAI.generateWhyNarrative(rootCauses, latestReadiness.score);
  const personalThresholds = PersonalizedAI.calculatePersonalizedThresholds(sleep, activity, readiness);
  const interventionEffects = PersonalizedAI.analyzeInterventionEffectiveness(sleep, readiness);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Optimal';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Pay Attention';
  };

  const handleNoteSaved = () => {
    setTodayNote(getNote(getTodayDate()));
  };

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Today</h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Daily Note Card */}
        <div
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-6 border border-purple-100 card-hover cursor-pointer animate-fade-in-up"
          onClick={() => setIsNoteModalOpen(true)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-purple-600" />
                Daily Note
              </h2>
              <p className="text-sm text-gray-600">
                {todayNote ? 'Tap to edit your note' : 'Tap to add a note about today'}
              </p>
            </div>
            {todayNote?.mood && (
              <div className="text-4xl">{getMoodEmoji(todayNote.mood)}</div>
            )}
          </div>

          {todayNote ? (
            <div className="space-y-2">
              {todayNote.note && (
                <p className="text-gray-700 line-clamp-2">{todayNote.note}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {todayNote.tags?.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <Plus className="h-8 w-8 text-purple-400" />
            </div>
          )}
        </div>

        {/* AI Why Detection - Root Causes */}
        {rootCauses.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Why Your Score Is What It Is</h2>
                <p className="text-sm text-gray-600">AI-detected root causes</p>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">{whyNarrative}</p>

            <div className="space-y-3">
              {rootCauses.slice(0, 3).map((cause, idx) => (
                <div
                  key={idx}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600">#{idx + 1}</span>
                      <h3 className="font-semibold text-gray-900">{cause.factor}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${cause.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {cause.impact > 0 ? '+' : ''}{cause.impact} pts
                      </span>
                      <span className="text-xs text-gray-500">
                        {cause.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{cause.evidence}</p>
                  <p className="text-sm text-indigo-700 font-medium">💡 {cause.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized Thresholds */}
        {personalThresholds.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Personalized Thresholds</h2>
                <p className="text-sm text-gray-600">YOUR optimal ≠ generic 85</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personalThresholds.map((baseline, idx) => (
                <div
                  key={idx}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50"
                >
                  <p className="text-sm font-semibold text-gray-700 mb-3">{baseline.metric}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Your Optimal:</span>
                      <span className="font-bold text-emerald-600">
                        {baseline.metric === 'Sleep Score'
                          ? `${baseline.personalOptimal.toFixed(1)}h`
                          : Math.round(baseline.personalOptimal)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Your Average:</span>
                      <span className="font-semibold text-gray-900">{baseline.averageValue}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Peak Performance:</span>
                      <span className="font-semibold text-blue-600">{baseline.bestPerformanceThreshold}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Critical Threshold:</span>
                      <span className="font-semibold text-red-600">{Math.round(baseline.personalCritical)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intervention Effectiveness Tracking */}
        {interventionEffects.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">What Works For You</h2>
                  <p className="text-sm text-gray-600">Personalized intervention effectiveness</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interventionEffects.map((effect, idx) => (
                <div
                  key={idx}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{effect.intervention}</h3>
                    <div className="flex flex-col items-end">
                      <span className={`font-bold text-lg ${effect.averageImpact > 0 ? 'text-green-600' : effect.averageImpact < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {effect.averageImpact > 0 ? '+' : ''}{effect.averageImpact}
                      </span>
                      <span className="text-xs text-gray-500">
                        {effect.sampleSize} samples
                      </span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            effect.effectiveness === 'highly_effective' ? 'bg-green-500' :
                            effect.effectiveness === 'moderately_effective' ? 'bg-blue-500' :
                            effect.effectiveness === 'minimally_effective' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${effect.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{effect.confidence}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {effect.effectiveness.replace('_', ' ')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">{effect.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {/* Readiness */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Readiness</p>
                <p className="text-xs text-gray-500">{getScoreLabel(latestReadiness.score)}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-5xl font-bold ${getScoreColor(latestReadiness.score).split(' ')[0]}`}>
                {latestReadiness.score}
              </p>
              <p className="text-gray-500">/100</p>
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Moon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sleep</p>
                <p className="text-xs text-gray-500">{getScoreLabel(latestSleep.score)}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-5xl font-bold ${getScoreColor(latestSleep.score).split(' ')[0]}`}>
                {latestSleep.score}
              </p>
              <p className="text-gray-500 text-sm">
                {(latestSleep.total_sleep_duration / 3600).toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Activity</p>
                <p className="text-xs text-gray-500">{getScoreLabel(latestActivity.score)}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-5xl font-bold ${getScoreColor(latestActivity.score).split(' ')[0]}`}>
                {latestActivity.score}
              </p>
              <p className="text-gray-500 text-sm">
                {Math.round(latestActivity.active_calories)} cal
              </p>
            </div>
          </div>
        </div>

        {/* Top AI Insight */}
        {topInsight && (
          <div
            className={`bg-gradient-to-br ${getSeverityColor(topInsight.severity)} rounded-3xl p-6 shadow-lg text-white animate-fade-in-up`}
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb className="h-7 w-7 flex-shrink-0 mt-1" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{topInsight.title}</h2>
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase">
                    {topInsight.severity}
                  </span>
                </div>
                <p className="text-white/90 leading-relaxed mb-4">
                  {topInsight.narrative.split('.')[0]}.
                </p>
              </div>
            </div>

            {topInsight.actionPlan.immediate.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-white/90 font-semibold text-sm mb-2">Immediate Actions:</p>
                <ul className="space-y-1">
                  {topInsight.actionPlan.immediate.slice(0, 2).map((action, i) => (
                    <li key={i} className="text-white/80 text-sm flex items-start gap-2">
                      <span className="mt-1">→</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Resting HR</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestReadiness.resting_heart_rate || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">bpm</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">HRV Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestReadiness.hrv_balance || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">ms</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Deep Sleep</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(latestSleep.deep_sleep_duration / 60)}
            </p>
            <p className="text-xs text-gray-500">min</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">REM Sleep</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(latestSleep.rem_sleep_duration / 60)}
            </p>
            <p className="text-xs text-gray-500">min</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => exportInsightsToPDF(sleep, activity, readiness)}
            className="flex-1 py-4 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FileDown className="h-5 w-5" />
            Export PDF
          </button>
          <button
            onClick={() => window.location.href = '/insights'}
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="h-5 w-5" />
            View All Insights
          </button>
        </div>
      </div>

      <DailyNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleNoteSaved}
      />
    </>
  );
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return 'from-red-500 to-rose-600';
    case 'important': return 'from-orange-500 to-red-500';
    case 'moderate': return 'from-yellow-500 to-orange-500';
    case 'positive': return 'from-green-500 to-emerald-600';
    default: return 'from-blue-500 to-cyan-500';
  }
}

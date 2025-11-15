'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Zap, Target, BarChart3, Network, Award, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { AIUserProfile } from '@/lib/ai/user-profiling-engine';

interface AIProfileDisplayProps {
  profile: AIUserProfile | null;
  loading?: boolean;
}

export default function AIProfileDisplay({ profile, loading }: AIProfileDisplayProps) {
  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <div className="text-xl font-semibold text-gray-800 dark:text-white">
            AI is analyzing your data and building your personalized profile...
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {['Clustering health patterns...', 'Applying dimensionality reduction...', 'Learning optimal ranges...', 'Building knowledge graph...'].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-center">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">No profile generated yet. Connect your Oura data to get started.</p>
      </div>
    );
  }

  const { archetype, optimalRanges, healthDimensions, patterns, beliefs, correlations, ensembleAccuracy } = profile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Brain className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-black">Your AI Health Profile</h2>
              <p className="text-indigo-100">Generated from {profile.dataPoints} days of data using advanced ML</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-sm text-indigo-100">Profile Accuracy</div>
              <div className="text-3xl font-black">{(ensembleAccuracy * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-sm text-indigo-100">Patterns Found</div>
              <div className="text-3xl font-black">{patterns.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-sm text-indigo-100">Correlations</div>
              <div className="text-3xl font-black">{correlations.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Archetype */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-7 h-7 text-yellow-500" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Your Archetype</h3>
          <span className="ml-auto px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
            {(archetype.confidence * 100).toFixed(0)}% confident
          </span>
        </div>

        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
          <div className="text-2xl font-black text-gray-800 dark:text-white capitalize mb-2">
            {archetype.type.replace(/_/g, ' ')}
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            ML clustering identified this as your primary health archetype
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Characteristics
            </div>
            <ul className="space-y-2">
              {archetype.characteristics.map((char, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Recommendations
            </div>
            <ul className="space-y-2">
              {archetype.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Target className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Health Dimensions (PCA Results) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-7 h-7 text-blue-500" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Key Health Dimensions</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">(from PCA analysis)</span>
        </div>

        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Principal Component Analysis identified these as YOUR most important health factors:
          </div>
          <div className="flex flex-wrap gap-2">
            {healthDimensions.primaryFactors.map((factor, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
                #{i + 1} {factor}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {healthDimensions.explainedVariance.slice(0, 3).map((variance, i) => (
            <div key={i} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Component {i + 1}</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {(variance * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">variance</div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimal Ranges */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-7 h-7 text-green-500" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Your Optimal Ranges</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">(learned from YOUR top days)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OptimalRangeCard
            title="Sleep Duration"
            optimal={optimalRanges.sleep.duration.optimal}
            min={optimalRanges.sleep.duration.min}
            max={optimalRanges.sleep.duration.max}
            unit="hours"
            color="blue"
          />
          <OptimalRangeCard
            title="Deep Sleep"
            optimal={optimalRanges.sleep.deepSleep.optimal}
            min={optimalRanges.sleep.deepSleep.min}
            max={optimalRanges.sleep.deepSleep.max}
            unit="min"
            color="purple"
          />
          <OptimalRangeCard
            title="REM Sleep"
            optimal={optimalRanges.sleep.remSleep.optimal}
            min={optimalRanges.sleep.remSleep.min}
            max={optimalRanges.sleep.remSleep.max}
            unit="min"
            color="pink"
          />
        </div>
      </div>

      {/* Beliefs (Bayesian Learning) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-7 h-7 text-purple-500" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">AI Learned Beliefs</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">(Bayesian inference)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BeliefCard
            title="Sleep Sensitivity"
            value={beliefs.sleepSensitive}
            description="How much sleep affects you"
          />
          <BeliefCard
            title="Stress Sensitivity"
            value={beliefs.stressSensitive}
            description="Impact of stress on performance"
          />
          <BeliefCard
            title="Activity-Recovery"
            value={beliefs.activityRecoveryRatio}
            description="Optimal balance ratio"
          />
          <BeliefCard
            title="Circadian Flexibility"
            value={beliefs.circadianFlexibility}
            description="Schedule consistency"
          />
        </div>
      </div>

      {/* Correlations (Knowledge Graph) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Network className="w-7 h-7 text-indigo-500" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Discovered Correlations</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">(knowledge graph)</span>
        </div>

        <div className="space-y-3">
          {correlations.map((corr, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-white">{corr.metric1}</span>
                  <span className="text-gray-500">→</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{corr.metric2}</span>
                </div>
                <div className="flex items-center gap-2">
                  {corr.direction === 'positive' ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  )}
                  <span className={`text-sm font-semibold ${corr.direction === 'positive' ? 'text-green-600' : 'text-orange-600'}`}>
                    {corr.direction}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${corr.strength * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {(corr.strength * 100).toFixed(0)}%
                </span>
              </div>
              {corr.lag > 0 && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Effect appears {corr.lag} day(s) later
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Patterns */}
      {patterns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-7 h-7 text-yellow-500" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Detected Patterns</h3>
          </div>

          <div className="space-y-3">
            {patterns.map((pattern, i) => (
              <div key={i} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="font-semibold text-gray-800 dark:text-white mb-2">{pattern.pattern}</div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Strength: </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{pattern.strength.toFixed(0)}/100</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Predictability: </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{(pattern.predictability * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Frequency: </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{pattern.frequency} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface OptimalRangeCardProps {
  title: string;
  optimal: number;
  min: number;
  max: number;
  unit: string;
  color: 'blue' | 'purple' | 'pink';
}

function OptimalRangeCard({ title, optimal, min, max, unit, color }: OptimalRangeCardProps) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
    pink: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800',
  };

  return (
    <div className={`p-4 bg-gradient-to-br ${colorClasses[color]} rounded-xl border-2`}>
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</div>
      <div className="text-center mb-3">
        <div className="text-4xl font-black text-gray-800 dark:text-white">
          {optimal.toFixed(1)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{unit}</div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-300 text-center">
        Range: {min.toFixed(1)} - {max.toFixed(1)} {unit}
      </div>
    </div>
  );
}

interface BeliefCardProps {
  title: string;
  value: number;
  description: string;
}

function BeliefCard({ title, value, description }: BeliefCardProps) {
  const percentage = value * 100;
  const level = percentage > 70 ? 'High' : percentage > 40 ? 'Medium' : 'Low';
  const color = percentage > 70 ? 'text-red-600' : percentage > 40 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</div>
      <div className={`text-3xl font-black ${color} mb-2`}>{level}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

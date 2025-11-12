import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import {
  HealthData,
  AdvancedInsight,
  HolisticHealthReport,
  PersonalBaselines,
  AnalysisOptions,
} from './types';
import { AdvancedStatistics } from './statistics';
import { PersonalizationEngine } from './personalization';
import { PredictiveAnalytics } from './predictions';

/**
 * Next-Generation AI Health Engine
 * Dramatically enhanced with advanced analytics, personalization, and predictions
 */
export class EnhancedAIEngine {
  private static defaultOptions: AnalysisOptions = {
    minDataPoints: 7,
    significanceLevel: 0.05,
    anomalyThreshold: 2.5,
    predictionHorizon: 7,
    enableAdvancedModels: true,
    enablePersonalization: true,
    verboseNarrative: false,
  };

  /**
   * Generate deep, comprehensive insights (backward compatible with old API)
   */
  static generateDeepInsights(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    options: Partial<AnalysisOptions> = {}
  ): AdvancedInsight[] {
    const opts = { ...this.defaultOptions, ...options };
    const insights: AdvancedInsight[] = [];

    if (sleep.length < opts.minDataPoints!) {
      return insights;
    }

    try {
      const healthData: HealthData = { sleep, activity, readiness };
      const baselines = PersonalizationEngine.generateBaselines(healthData);

      // 1. Sleep Analysis Insights
      const sleepInsights = this.analyzeSleepPatterns(sleep, readiness, baselines, opts);
      insights.push(...sleepInsights);

      // 2. Recovery & Performance Insights
      const recoveryInsights = this.analyzeRecoveryAndPerformance(activity, readiness, baselines);
      insights.push(...recoveryInsights);

      // 3. Illness Prediction Insights
      const healthRiskInsights = this.predictHealthRisks(sleep, readiness, baselines);
      insights.push(...healthRiskInsights);

      // 4. Performance Optimization Insights
      const optimizationInsights = this.generateOptimizationInsights(sleep, activity, readiness, baselines);
      insights.push(...optimizationInsights);

      // Sort by priority
      insights.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      return insights.slice(0, 10); // Top 10 insights
    } catch (error) {
      console.error('Error generating insights:', error);
      return insights;
    }
  }

  /**
   * Sleep pattern analysis with advanced statistics
   */
  private static analyzeSleepPatterns(
    sleep: SleepData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines,
    opts: AnalysisOptions
  ): AdvancedInsight[] {
    const insights: AdvancedInsight[] = [];
    const recent = sleep.slice(-14);
    const sleepScores = recent.map(s => s.score);

    // Trend analysis
    const xData = recent.map((_, i) => i);
    const trend = AdvancedStatistics.linearRegression(xData, sleepScores);

    // Sleep Duration Impact
    const shortSleep = recent.filter(s => s.total_sleep_duration / 3600 < baselines.sleep.optimalDuration - 0.5);
    if (shortSleep.length >= 3) {
      const matchingReadiness = shortSleep
        .map(s => readiness.find(r => r.day === s.day))
        .filter(r => r !== undefined);

      if (matchingReadiness.length > 0) {
        const avgReadiness = matchingReadiness.reduce((sum, r) => sum + r!.score, 0) / matchingReadiness.length;
        const readinessDrop = baselines.readiness.averageScore - avgReadiness;

        if (readinessDrop > 5) {
          insights.push({
            id: `sleep-duration-${Date.now()}`,
            timestamp: new Date().toISOString(),
            category: 'sleep',
            priority: readinessDrop > 15 ? 'high' : 'medium',
            title: 'Sleep Duration Below Optimal',
            summary: `You've had ${shortSleep.length} nights with less than optimal sleep, impacting recovery by ${readinessDrop.toFixed(0)} points`,
            narrative: this.generateSleepDurationNarrative(shortSleep.length, baselines.sleep.optimalDuration, readinessDrop),
            confidence: 0.88,
            evidenceStrength: 'strong',
            dataPoints: [
              {
                metric: 'Optimal Sleep Duration',
                value: baselines.sleep.optimalDuration,
                trend: 'stable',
              },
              {
                metric: 'Recent Avg Duration',
                value: recent.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / recent.length,
                trend: 'down',
              },
              {
                metric: 'Readiness Impact',
                value: -readinessDrop,
                baseline: baselines.readiness.averageScore,
              },
            ],
            patterns: [],
            actionPlan: {
              immediate: [
                `Aim for ${baselines.sleep.optimalDuration.toFixed(1)}h of sleep tonight`,
                `Go to bed 30-60 minutes earlier than usual`,
              ],
              shortTerm: [
                'Maintain consistent sleep schedule for 7 days',
                'Limit caffeine after 2 PM',
                'Create a calming bedtime routine',
              ],
              longTerm: [
                'Optimize bedroom environment for quality sleep',
                'Track correlation between sleep duration and performance',
              ],
              priority: 1,
            },
            expectedOutcome: `Readiness scores should improve by ${(readinessDrop * 0.7).toFixed(0)} points within 3-4 days`,
            timeframeToImprovement: '3-4 days',
          });
        }
      }
    }

    // Trend-based insight
    if (trend.significant) {
      const direction = trend.direction;
      const priority = Math.abs(trend.slope) > 1.5 ? 'high' : 'medium';

      if (direction !== 'stable') {
        insights.push({
          id: `sleep-trend-${Date.now()}`,
          timestamp: new Date().toISOString(),
          category: 'sleep',
          priority,
          title: direction === 'improving' ? 'Sleep Quality Improving' : 'Sleep Quality Declining',
          summary: `Sleep scores show a ${trend.strength} ${direction} trend over the past 2 weeks`,
          narrative: this.generateTrendNarrative('sleep', direction, trend, recent),
          confidence: Math.min(0.95, trend.rSquared),
          evidenceStrength: trend.rSquared > 0.7 ? 'conclusive' : 'strong',
          dataPoints: [
            {
              metric: 'Trend Slope',
              value: trend.slope,
            },
            {
              metric: 'R-squared',
              value: trend.rSquared,
            },
            {
              metric: 'Statistical Significance',
              value: 1 - trend.pValue,
            },
          ],
          patterns: [],
          actionPlan: this.getTrendActionPlan(direction, 'sleep'),
          expectedOutcome: direction === 'improving'
            ? `Continue current trajectory - expect ${Math.round(trend.slope * 7)} point improvement over next week`
            : `Address root causes to reverse decline - potential ${Math.round(Math.abs(trend.slope * 7))} point recovery`,
          timeframeToImprovement: direction === 'improving' ? '1 week' : '2-3 weeks',
        });
      }
    }

    return insights;
  }

  /**
   * Recovery and performance analysis
   */
  private static analyzeRecoveryAndPerformance(
    activity: ActivityData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines
  ): AdvancedInsight[] {
    const insights: AdvancedInsight[] = [];

    if (activity.length < 21) return insights;

    // Training load analysis
    const trainingLoad = PersonalizationEngine.assessTrainingLoad(activity, readiness);

    if (trainingLoad.status === 'overreaching' || trainingLoad.status === 'overtraining_risk') {
      const priority = trainingLoad.status === 'overtraining_risk' ? 'critical' : 'high';

      insights.push({
        id: `training-load-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'recovery',
        priority,
        title: trainingLoad.status === 'overtraining_risk'
          ? 'Overtraining Risk Detected'
          : 'Overreaching Detected',
        summary: `Acute:Chronic workload ratio of ${trainingLoad.ratio.toFixed(2)} indicates ${trainingLoad.status}`,
        narrative: this.generateTrainingLoadNarrative(trainingLoad),
        confidence: 0.85,
        evidenceStrength: 'strong',
        dataPoints: [
          {
            metric: 'Acute Load (7 days)',
            value: trainingLoad.acuteLoad,
          },
          {
            metric: 'Chronic Load (28 days)',
            value: trainingLoad.chronicLoad,
          },
          {
            metric: 'Acute:Chronic Ratio',
            value: trainingLoad.ratio,
            baseline: 1.0,
          },
          {
            metric: 'Training Monotony',
            value: trainingLoad.monotony,
          },
        ],
        patterns: [],
        actionPlan: {
          immediate: [
            'Reduce training intensity by 40-50% for next 48 hours',
            'Prioritize sleep (aim for 9+ hours)',
            'Focus on active recovery only',
          ],
          shortTerm: [
            'Gradually rebuild volume over 7-10 days',
            'Incorporate more recovery days',
            'Monitor readiness daily before training',
          ],
          longTerm: [
            'Implement periodization in training plan',
            'Maintain acute:chronic ratio between 0.8-1.3',
            'Add variety to prevent monotony',
          ],
          priority: 1,
        },
        expectedOutcome: 'Full recovery expected in 7-14 days with proper rest',
        timeframeToImprovement: '7-14 days',
      });
    }

    return insights;
  }

  /**
   * Illness prediction and health risk assessment
   */
  private static predictHealthRisks(
    sleep: SleepData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines
  ): AdvancedInsight[] {
    const insights: AdvancedInsight[] = [];

    const illnessPrediction = PredictiveAnalytics.predictIllnessRisk(readiness, sleep, baselines);

    if (illnessPrediction.riskLevel !== 'minimal') {
      const priority = illnessPrediction.riskLevel === 'high' ? 'critical' : 'high';

      insights.push({
        id: `illness-risk-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'health_risk',
        priority,
        title: `${illnessPrediction.riskLevel.charAt(0).toUpperCase() + illnessPrediction.riskLevel.slice(1)} Illness Risk`,
        summary: `Multiple physiological markers suggest ${illnessPrediction.riskLevel} risk of illness in next ${illnessPrediction.timeline}`,
        narrative: this.generateIllnessPredictionNarrative(illnessPrediction),
        confidence: illnessPrediction.confidence,
        evidenceStrength: illnessPrediction.indicators.length >= 3 ? 'strong' : 'moderate',
        dataPoints: illnessPrediction.indicators.map(ind => ({
          metric: ind.metric,
          value: ind.deviation,
          baseline: 0,
        })),
        patterns: [],
        actionPlan: {
          immediate: illnessPrediction.recommendations.slice(0, 3),
          shortTerm: illnessPrediction.recommendations.slice(3),
          longTerm: ['Strengthen immune system through consistent habits'],
          priority: 1,
        },
        expectedOutcome: 'Early intervention can reduce illness severity by 40-60%',
        timeframeToImprovement: illnessPrediction.timeline,
      });
    }

    return insights;
  }

  /**
   * Performance optimization insights
   */
  private static generateOptimizationInsights(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines
  ): AdvancedInsight[] {
    const insights: AdvancedInsight[] = [];

    // Performance trajectory
    const trajectory = PredictiveAnalytics.predictPerformanceTrend(sleep, activity, readiness);

    if (trajectory.trajectory === 'improving' || trajectory.sustainabilityScore < 60) {
      insights.push({
        id: `performance-trajectory-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'performance',
        priority: 'medium',
        title: trajectory.trajectory === 'improving'
          ? 'Performance on Upward Trajectory'
          : 'Performance Sustainability Concern',
        summary: `Current trajectory: ${trajectory.trajectory}. Sustainability score: ${trajectory.sustainabilityScore}/100`,
        narrative: this.generatePerformanceTrajectoryNarrative(trajectory),
        confidence: trajectory.confidence,
        evidenceStrength: 'moderate',
        dataPoints: [
          {
            metric: 'Trajectory',
            value: trajectory.trajectory === 'improving' ? 1 : trajectory.trajectory === 'declining' ? -1 : 0,
          },
          {
            metric: 'Sustainability Score',
            value: trajectory.sustainabilityScore,
          },
          {
            metric: 'Expected Peak',
            value: trajectory.expectedPeakIn,
          },
        ],
        patterns: [],
        actionPlan: {
          immediate: [
            trajectory.trajectory === 'improving'
              ? 'Maintain current routines that are driving improvement'
              : 'Address work-recovery imbalance',
          ],
          shortTerm: [
            'Monitor sustainability metrics weekly',
            trajectory.sustainabilityScore < 60
              ? 'Increase recovery focus by 20%'
              : 'Continue balanced approach',
          ],
          longTerm: [
            'Build resilience through consistent habits',
            'Plan periodic deload weeks',
          ],
          priority: 2,
        },
        expectedOutcome: trajectory.trajectory === 'improving'
          ? `Peak performance expected in ${trajectory.expectedPeakIn} days`
          : 'Improved sustainability within 2-3 weeks',
        timeframeToImprovement: `${trajectory.expectedPeakIn} days`,
      });
    }

    return insights;
  }

  // ==================== NARRATIVE GENERATORS ====================

  private static generateSleepDurationNarrative(nights: number, optimal: number, impact: number): string {
    return `Over the past two weeks, you've had ${nights} nights where sleep duration fell short of your personalized optimal duration of ${optimal.toFixed(1)} hours. This chronic sleep debt has measurably impacted your recovery capacity, reducing readiness scores by approximately ${impact.toFixed(0)} points on average.\n\nSleep debt accumulates quickly and impairs cognitive function, physical recovery, and immune response. Your body requires consistent sleep at or near your optimal duration to maintain peak performance and health.\n\nPrioritizing sleep extension over the next 3-4 nights can rapidly restore your recovery capacity and reverse this decline.`;
  }

  private static generateTrendNarrative(metric: string, direction: string, trend: any, data: any[]): string {
    const change = Math.abs(trend.slope * data.length);
    return `Statistical analysis reveals a ${trend.strength} ${direction} trend in your ${metric} scores over the past ${data.length} days (slope: ${trend.slope.toFixed(2)}, R²: ${trend.rSquared.toFixed(2)}). This represents a ${change.toFixed(0)}-point ${direction === 'improving' ? 'improvement' : 'decline'} over the analysis period.\n\nThe trend is statistically significant (p < ${trend.pValue.toFixed(3)}), indicating this is not random variation but a genuine shift in your ${metric} quality. ${direction === 'improving' ? 'Identifying and maintaining the factors driving this improvement will help sustain your progress.' : 'Understanding the root causes of this decline is critical for course correction.'}`;
  }

  private static generateTrainingLoadNarrative(load: any): string {
    return `Your acute:chronic workload ratio of ${load.ratio.toFixed(2)} indicates you're training at a volume that significantly exceeds your body's current adaptation capacity. Research shows ratios above 1.3 are associated with increased injury and illness risk.\n\nYour 7-day average activity score (${load.acuteLoad.toFixed(0)}) is ${((load.ratio - 1) * 100).toFixed(0)}% higher than your 28-day rolling average (${load.chronicLoad.toFixed(0)}). Additionally, training monotony is ${load.monotony > 2 ? 'elevated' : 'moderate'}, which compounds the risk.\n\nImmediate rest and recovery are essential to prevent overtraining syndrome, which can require weeks to months of recovery.`;
  }

  private static generateIllnessPredictionNarrative(prediction: any): string {
    const signals = prediction.earlyWarningSignals;
    return `Multiple physiological markers are showing early warning signs of potential illness:\n\n${signals.map((s: string) => `• ${s}`).join('\n')}\n\nThese indicators collectively suggest a ${prediction.riskScore}% elevated risk of illness onset within the next ${prediction.timeline}. Early detection enables proactive intervention, which can significantly reduce illness severity and duration.\n\nYour body is signaling that it needs additional recovery resources to maintain immune function.`;
  }

  private static generatePerformanceTrajectoryNarrative(trajectory: any): string {
    if (trajectory.trajectory === 'improving') {
      return `Your performance metrics show a clear upward trajectory with ${(trajectory.confidence * 100).toFixed(0)}% confidence. Based on current trends, you're on track to reach peak performance in approximately ${trajectory.expectedPeakIn} days.\n\nYour sustainability score of ${trajectory.sustainabilityScore}/100 indicates ${trajectory.sustainabilityScore > 70 ? 'you can likely maintain this trajectory' : 'some concerns about maintaining this pace long-term'}. Continue the behaviors driving this improvement while monitoring for signs of overreach.`;
    } else {
      return `Your performance sustainability score of ${trajectory.sustainabilityScore}/100 suggests an imbalance between workload and recovery. While not yet critical, this pattern can lead to declining performance if not addressed.\n\nThe ratio of work to recovery is suboptimal, indicating you may be pushing too hard relative to your current recovery capacity. Adjusting this balance is key to sustainable performance.`;
    }
  }

  private static getTrendActionPlan(direction: string, metric: string): AdvancedInsight['actionPlan'] {
    if (direction === 'improving') {
      return {
        immediate: ['Document what is working in your routine', 'Maintain consistency'],
        shortTerm: ['Avoid major changes to successful patterns', 'Continue monitoring progress'],
        longTerm: ['Build on this foundation gradually', 'Share insights with others'],
        priority: 2,
      };
    } else {
      return {
        immediate: ['Identify recent changes in routine', 'Address obvious stressors', 'Prioritize sleep tonight'],
        shortTerm: ['Return to previously successful habits', 'Reduce external stressors', 'Add recovery days'],
        longTerm: ['Establish consistent baseline routines', 'Build stress resilience'],
        priority: 1,
      };
    }
  }
}

// Export backward-compatible API
export const AdvancedAIEngine = EnhancedAIEngine;

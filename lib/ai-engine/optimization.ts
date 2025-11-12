import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { PersonalBaselines } from './types';
import { AdvancedStatistics } from './statistics';

/**
 * Goal Optimization & Achievement Prediction Module
 * Predicts likelihood of goal achievement and provides optimization paths
 */
export class OptimizationEngine {
  /**
   * Predict probability of achieving a specific goal
   */
  static predictGoalAchievement(
    goal: {
      type: 'sleep' | 'activity' | 'readiness' | 'weight';
      target: number;
      timeframe: number; // days
      currentValue: number;
    },
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines
  ): {
    probability: number;
    confidence: number;
    projectedValue: number;
    projectedDate: string | null;
    likelihood: 'very_likely' | 'likely' | 'possible' | 'unlikely' | 'very_unlikely';
    keyFactors: Array<{ factor: string; impact: number; status: 'helping' | 'hurting' | 'neutral' }>;
    recommendations: string[];
    alternativePath?: {
      adjustedTimeframe: number;
      adjustedTarget: number;
      reasoning: string;
    };
  } {
    // Get historical data for trend analysis
    const historicalData = this.getHistoricalData(goal.type, sleep, activity, readiness);
    if (historicalData.length < 7) {
      return {
        probability: 50,
        confidence: 0.3,
        projectedValue: goal.currentValue,
        projectedDate: null,
        likelihood: 'possible',
        keyFactors: [],
        recommendations: ['Need at least 7 days of historical data for accurate prediction'],
      };
    }

    // Calculate trend
    const xData = historicalData.map((_, i) => i);
    const trend = AdvancedStatistics.linearRegression(xData, historicalData);

    // Project future value
    const projectedValue = trend.slope * (historicalData.length + goal.timeframe) + trend.intercept;
    const gapToTarget = goal.target - goal.currentValue;
    const projectedImprovement = projectedValue - goal.currentValue;

    // Calculate probability
    let baseProbability = 0;
    if (gapToTarget === 0) {
      baseProbability = 95;
    } else {
      const improvementRatio = projectedImprovement / gapToTarget;
      baseProbability = Math.min(95, Math.max(5, 50 + improvementRatio * 45));
    }

    // Analyze key factors
    const keyFactors = this.analyzeGoalFactors(goal, sleep, activity, readiness, baselines);

    // Adjust probability based on factors
    let adjustedProbability = baseProbability;
    for (const factor of keyFactors) {
      if (factor.status === 'helping') {
        adjustedProbability += factor.impact * 0.5;
      } else if (factor.status === 'hurting') {
        adjustedProbability -= factor.impact * 0.5;
      }
    }
    adjustedProbability = Math.max(5, Math.min(95, adjustedProbability));

    // Confidence based on data quality and consistency
    const coefficientOfVariation = this.calculateCV(historicalData);
    const confidence = Math.max(0.5, Math.min(0.95, trend.rSquared * (1 - coefficientOfVariation / 100)));

    // Determine likelihood
    let likelihood: 'very_likely' | 'likely' | 'possible' | 'unlikely' | 'very_unlikely';
    if (adjustedProbability >= 80) {
      likelihood = 'very_likely';
    } else if (adjustedProbability >= 60) {
      likelihood = 'likely';
    } else if (adjustedProbability >= 40) {
      likelihood = 'possible';
    } else if (adjustedProbability >= 20) {
      likelihood = 'unlikely';
    } else {
      likelihood = 'very_unlikely';
    }

    // Calculate projected achievement date
    let projectedDate: string | null = null;
    if (trend.slope > 0 && gapToTarget > 0) {
      const daysNeeded = Math.ceil(gapToTarget / trend.slope);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysNeeded);
      projectedDate = futureDate.toISOString().split('T')[0];
    }

    // Generate recommendations
    const recommendations = this.generateGoalRecommendations(
      goal,
      adjustedProbability,
      keyFactors,
      trend
    );

    // Suggest alternative path if current goal is unlikely
    let alternativePath = undefined;
    if (likelihood === 'unlikely' || likelihood === 'very_unlikely') {
      if (trend.slope > 0) {
        // Extend timeframe
        const realisticTimeframe = Math.ceil(gapToTarget / trend.slope);
        alternativePath = {
          adjustedTimeframe: realisticTimeframe,
          adjustedTarget: goal.target,
          reasoning: `Based on your current rate of improvement (${trend.slope.toFixed(2)}/day), achieving ${goal.target} will take approximately ${realisticTimeframe} days. Consider extending your goal timeline to be more realistic.`,
        };
      } else {
        // Lower target
        const realisticTarget = goal.currentValue + (trend.slope * goal.timeframe);
        alternativePath = {
          adjustedTimeframe: goal.timeframe,
          adjustedTarget: Math.round(realisticTarget),
          reasoning: `Current trajectory suggests a more achievable target of ${Math.round(realisticTarget)} within ${goal.timeframe} days. Consider adjusting your goal to build momentum.`,
        };
      }
    }

    return {
      probability: Math.round(adjustedProbability),
      confidence: Math.round(confidence * 100) / 100,
      projectedValue: Math.round(projectedValue * 10) / 10,
      projectedDate,
      likelihood,
      keyFactors: keyFactors.slice(0, 5),
      recommendations,
      alternativePath,
    };
  }

  /**
   * Find optimal improvement opportunities (highest ROI actions)
   */
  static identifyOptimalImprovements(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines
  ): Array<{
    area: string;
    currentPerformance: number;
    potentialGain: number;
    effort: 'low' | 'medium' | 'high';
    roi: number; // gain/effort ratio
    specificActions: string[];
    timeToResults: string;
  }> {
    const opportunities: Array<{
      area: string;
      currentPerformance: number;
      potentialGain: number;
      effort: 'low' | 'medium' | 'high';
      roi: number;
      specificActions: string[];
      timeToResults: string;
    }> = [];

    if (sleep.length < 7) {
      return opportunities;
    }

    const recent = {
      sleep: sleep.slice(-7),
      activity: activity.slice(-7),
      readiness: readiness.slice(-7),
    };

    // Opportunity 1: Sleep consistency
    const sleepTimes = recent.sleep.map(s => new Date(s.bedtime_start).getHours() * 60 + new Date(s.bedtime_start).getMinutes());
    const sleepTimeVariability = this.calculateCV(sleepTimes);
    if (sleepTimeVariability > 15) {
      const currentScore = 100 - sleepTimeVariability;
      const potentialGain = Math.min(20, sleepTimeVariability - 5);
      opportunities.push({
        area: 'Sleep Schedule Consistency',
        currentPerformance: Math.round(currentScore),
        potentialGain: Math.round(potentialGain),
        effort: 'low',
        roi: potentialGain / 1, // effort score
        specificActions: [
          'Set a fixed bedtime within 30-minute window',
          'Use alarm to maintain consistent wake time (weekdays AND weekends)',
          'Create pre-sleep routine starting 90 minutes before target bedtime',
        ],
        timeToResults: '3-7 days',
      });
    }

    // Opportunity 2: Deep sleep optimization
    const avgDeepSleep = recent.sleep.reduce((sum, s) => sum + (s.deep_sleep_duration || 0) / 3600, 0) / 7;
    const optimalDeepSleep = recent.sleep.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / 7 * 0.18;
    if (avgDeepSleep < optimalDeepSleep - 0.3) {
      const deepSleepDeficit = (optimalDeepSleep - avgDeepSleep) * 60;
      const potentialGain = Math.min(15, deepSleepDeficit * 2);
      opportunities.push({
        area: 'Deep Sleep Quality',
        currentPerformance: Math.round((avgDeepSleep / optimalDeepSleep) * 100),
        potentialGain: Math.round(potentialGain),
        effort: 'medium',
        roi: potentialGain / 2,
        specificActions: [
          'Lower bedroom temperature to 65-68°F (18-20°C)',
          'Avoid eating 3 hours before bed',
          'Get 30+ minutes of morning sunlight exposure',
          'Avoid caffeine after 2 PM',
        ],
        timeToResults: '5-10 days',
      });
    }

    // Opportunity 3: Activity recovery balance
    const avgActivityScore = recent.activity.reduce((sum, a) => sum + a.score, 0) / 7;
    const avgReadinessScore = recent.readiness.reduce((sum, r) => sum + r.score, 0) / 7;
    const imbalance = Math.abs(avgActivityScore - avgReadinessScore);
    if (imbalance > 15) {
      const potentialGain = Math.min(18, imbalance);
      const needsMoreRecovery = avgActivityScore > avgReadinessScore + 10;
      opportunities.push({
        area: 'Activity-Recovery Balance',
        currentPerformance: Math.round(100 - imbalance),
        potentialGain: Math.round(potentialGain),
        effort: 'low',
        roi: potentialGain / 1,
        specificActions: needsMoreRecovery
          ? [
              'Add 1-2 complete rest days per week',
              'Replace one intense workout with active recovery (walking, yoga)',
              'Ensure 8+ hours sleep on training days',
            ]
          : [
              'Gradually increase activity volume by 10% per week',
              'Add strength training 2-3x per week',
              'Aim for 7,000+ daily steps',
            ],
        timeToResults: needsMoreRecovery ? '5-7 days' : '2-3 weeks',
      });
    }

    // Opportunity 4: Sleep efficiency
    const avgEfficiency = recent.sleep.reduce((sum, s) => sum + s.efficiency, 0) / 7;
    if (avgEfficiency < 90) {
      const potentialGain = Math.min(12, 95 - avgEfficiency);
      opportunities.push({
        area: 'Sleep Efficiency',
        currentPerformance: Math.round(avgEfficiency),
        potentialGain: Math.round(potentialGain),
        effort: 'medium',
        roi: potentialGain / 2,
        specificActions: [
          'Use bedroom only for sleep (no TV, phone, work)',
          'If awake >20 minutes, get up and do relaxing activity',
          'Avoid naps after 3 PM',
          'Consider magnesium glycinate supplement 1-2 hours before bed',
        ],
        timeToResults: '7-14 days',
      });
    }

    // Opportunity 5: REM sleep optimization
    const avgREM = recent.sleep.reduce((sum, s) => sum + (s.rem_sleep_duration || 0) / 3600, 0) / 7;
    if (avgREM < 1.5) {
      const potentialGain = Math.min(10, (2.0 - avgREM) * 5);
      opportunities.push({
        area: 'REM Sleep Optimization',
        currentPerformance: Math.round((avgREM / 2.0) * 100),
        potentialGain: Math.round(potentialGain),
        effort: 'medium',
        roi: potentialGain / 2,
        specificActions: [
          'Reduce alcohol consumption (especially within 4 hours of bed)',
          'Manage evening stress with meditation or journaling',
          'Ensure total sleep duration of 7.5+ hours',
          'Keep consistent sleep schedule (REM occurs more in later cycles)',
        ],
        timeToResults: '1-2 weeks',
      });
    }

    // Opportunity 6: HRV improvement
    const recentHRV = recent.readiness.map(r => r.hrv_balance || 0).filter(h => h > 0);
    if (recentHRV.length >= 5) {
      const avgHRV = recentHRV.reduce((a, b) => a + b, 0) / recentHRV.length;
      const baselineHRV = (baselines.readiness.hrvRange.min + baselines.readiness.hrvRange.max) / 2;
      if (avgHRV < baselineHRV * 0.9) {
        const hrvDeficit = ((baselineHRV - avgHRV) / baselineHRV) * 100;
        const potentialGain = Math.min(15, hrvDeficit * 0.8);
        opportunities.push({
          area: 'Heart Rate Variability',
          currentPerformance: Math.round((avgHRV / baselineHRV) * 100),
          potentialGain: Math.round(potentialGain),
          effort: 'high',
          roi: potentialGain / 3,
          specificActions: [
            'Practice daily breathwork: 5-10 minutes box breathing',
            'Reduce training intensity by 20% for 1 week',
            'Add morning meditation or gentle yoga',
            'Ensure complete recovery days (no intense exercise)',
          ],
          timeToResults: '2-3 weeks',
        });
      }
    }

    // Sort by ROI (highest first)
    opportunities.sort((a, b) => b.roi - a.roi);

    return opportunities;
  }

  /**
   * Create personalized optimization roadmap
   */
  static generateOptimizationRoadmap(
    currentMetrics: {
      sleep: number;
      activity: number;
      readiness: number;
    },
    targetMetrics: {
      sleep: number;
      activity: number;
      readiness: number;
    },
    timeframe: number // days
  ): {
    feasible: boolean;
    roadmap: Array<{
      phase: number;
      duration: number; // days
      focus: string;
      targets: { sleep?: number; activity?: number; readiness?: number };
      keyActions: string[];
      milestones: string[];
    }>;
    warnings: string[];
    successProbability: number;
  } {
    const gaps = {
      sleep: targetMetrics.sleep - currentMetrics.sleep,
      activity: targetMetrics.activity - currentMetrics.activity,
      readiness: targetMetrics.readiness - currentMetrics.readiness,
    };

    const totalImprovement = Math.abs(gaps.sleep) + Math.abs(gaps.activity) + Math.abs(gaps.readiness);
    const avgImprovementNeeded = totalImprovement / timeframe;

    // Assess feasibility (realistic improvement is ~0.5-1.0 points/day)
    const feasible = avgImprovementNeeded <= 1.5;
    const warnings: string[] = [];

    if (!feasible) {
      warnings.push(`Target improvement of ${avgImprovementNeeded.toFixed(1)} points/day exceeds typical capacity (1.0/day)`);
      warnings.push('Consider extending timeline or adjusting targets');
    }

    // Create phased roadmap
    const phases = Math.max(2, Math.min(4, Math.ceil(timeframe / 14)));
    const roadmap: Array<{
      phase: number;
      duration: number;
      focus: string;
      targets: { sleep?: number; activity?: number; readiness?: number };
      keyActions: string[];
      milestones: string[];
    }> = [];

    const phaseDuration = Math.ceil(timeframe / phases);

    // Phase 1: Foundation (focus on sleep and recovery)
    roadmap.push({
      phase: 1,
      duration: phaseDuration,
      focus: 'Build Recovery Foundation',
      targets: {
        sleep: currentMetrics.sleep + gaps.sleep * 0.4,
        readiness: currentMetrics.readiness + gaps.readiness * 0.3,
      },
      keyActions: [
        'Establish consistent sleep schedule (±30 min)',
        'Optimize sleep environment (dark, cool, quiet)',
        'Eliminate major recovery inhibitors (late caffeine, alcohol)',
        'Begin daily stress management practice',
      ],
      milestones: [
        'Sleep timing within 30-minute window for 5+ days',
        'Readiness trending upward',
      ],
    });

    // Phase 2: Optimization (improve sleep quality and balance)
    if (phases >= 2) {
      roadmap.push({
        phase: 2,
        duration: phaseDuration,
        focus: 'Optimize Sleep Quality & Balance',
        targets: {
          sleep: currentMetrics.sleep + gaps.sleep * 0.7,
          activity: currentMetrics.activity + gaps.activity * 0.4,
          readiness: currentMetrics.readiness + gaps.readiness * 0.6,
        },
        keyActions: [
          'Fine-tune sleep architecture (target deep/REM ratios)',
          'Gradually increase activity if below target',
          'Implement recovery protocols (active recovery, nutrition)',
          'Track and respond to readiness signals',
        ],
        milestones: [
          'Sleep score 70+ for 5 consecutive days',
          'Activity-recovery balance within 10 points',
        ],
      });
    }

    // Phase 3: Performance (if timeframe allows)
    if (phases >= 3) {
      roadmap.push({
        phase: 3,
        duration: phaseDuration,
        focus: 'Build Performance Capacity',
        targets: {
          sleep: currentMetrics.sleep + gaps.sleep * 0.9,
          activity: currentMetrics.activity + gaps.activity * 0.7,
          readiness: currentMetrics.readiness + gaps.readiness * 0.85,
        },
        keyActions: [
          'Increase training load aligned with readiness',
          'Maintain sleep consistency under higher stress',
          'Develop resilience to variability',
          'Fine-tune nutrition and recovery timing',
        ],
        milestones: [
          'Sustained high scores (80+) for 3+ days',
          'Quick recovery after high activity days',
        ],
      });
    }

    // Final Phase: Consolidation
    roadmap.push({
      phase: roadmap.length + 1,
      duration: Math.max(7, timeframe - roadmap.reduce((sum, p) => sum + p.duration, 0)),
      focus: 'Consolidate & Sustain',
      targets: targetMetrics,
      keyActions: [
        'Maintain all established habits',
        'Fine-tune based on personal response',
        'Build margin for life stressors',
        'Document successful patterns',
      ],
      milestones: [
        'Hit target metrics for 3+ consecutive days',
        'Demonstrate resilience to disruptions',
      ],
    });

    // Calculate success probability
    let successProbability = 50;
    if (feasible) successProbability += 20;
    if (totalImprovement < 30) successProbability += 15;
    if (timeframe >= 30) successProbability += 10;
    if (currentMetrics.readiness >= 75) successProbability += 10;
    successProbability = Math.min(90, Math.max(10, successProbability));

    return {
      feasible,
      roadmap,
      warnings,
      successProbability,
    };
  }

  // ==================== HELPER METHODS ====================

  private static getHistoricalData(
    type: string,
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): number[] {
    switch (type) {
      case 'sleep':
        return sleep.slice(-30).map(s => s.score);
      case 'activity':
        return activity.slice(-30).map(a => a.score);
      case 'readiness':
        return readiness.slice(-30).map(r => r.score);
      default:
        return [];
    }
  }

  private static analyzeGoalFactors(
    goal: any,
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines
  ): Array<{ factor: string; impact: number; status: 'helping' | 'hurting' | 'neutral' }> {
    const factors: Array<{ factor: string; impact: number; status: 'helping' | 'hurting' | 'neutral' }> = [];

    const recent = {
      sleep: sleep.slice(-7),
      activity: activity.slice(-7),
      readiness: readiness.slice(-7),
    };

    // Consistency factor
    const targetMetric = goal.type === 'sleep' ? recent.sleep.map(s => s.score) :
                        goal.type === 'activity' ? recent.activity.map(a => a.score) :
                        recent.readiness.map(r => r.score);
    const cv = this.calculateCV(targetMetric);
    if (cv < 10) {
      factors.push({ factor: 'High consistency', impact: 10, status: 'helping' });
    } else if (cv > 20) {
      factors.push({ factor: 'High variability', impact: 12, status: 'hurting' });
    }

    // Recovery state
    const avgReadiness = recent.readiness.reduce((sum, r) => sum + r.score, 0) / 7;
    if (avgReadiness >= 80) {
      factors.push({ factor: 'Strong recovery state', impact: 8, status: 'helping' });
    } else if (avgReadiness < 65) {
      factors.push({ factor: 'Poor recovery state', impact: 15, status: 'hurting' });
    }

    // Momentum factor
    const firstHalf = targetMetric.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const secondHalf = targetMetric.slice(4).reduce((a, b) => a + b, 0) / 3;
    const momentum = secondHalf - firstHalf;
    if (momentum > 5) {
      factors.push({ factor: 'Positive momentum', impact: 12, status: 'helping' });
    } else if (momentum < -5) {
      factors.push({ factor: 'Negative momentum', impact: 10, status: 'hurting' });
    }

    return factors.sort((a, b) => b.impact - a.impact);
  }

  private static calculateCV(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return (stdDev / mean) * 100;
  }

  private static generateGoalRecommendations(
    goal: any,
    probability: number,
    factors: Array<{ factor: string; impact: number; status: string }>,
    trend: any
  ): string[] {
    const recommendations: string[] = [];

    if (probability >= 70) {
      recommendations.push('You are on track - maintain current habits and consistency');
      recommendations.push('Focus on eliminating factors that are hurting progress');
    } else if (probability >= 40) {
      recommendations.push('Goal is achievable but requires focused effort');
      for (const factor of factors.filter(f => f.status === 'hurting').slice(0, 2)) {
        recommendations.push(`Address: ${factor.factor}`);
      }
    } else {
      recommendations.push('Current trajectory makes this goal challenging');
      recommendations.push('Consider adjusting timeline or target to build momentum');
      if (trend.slope < 0) {
        recommendations.push('PRIORITY: Reverse negative trend before pursuing ambitious goals');
      }
    }

    // Add metric-specific advice
    if (goal.type === 'sleep') {
      recommendations.push('Key lever: Sleep schedule consistency within 30-minute window');
    } else if (goal.type === 'activity') {
      recommendations.push('Key lever: Balance activity progression with recovery capacity');
    } else if (goal.type === 'readiness') {
      recommendations.push('Key lever: Optimize sleep quality and manage stress levels');
    }

    return recommendations.slice(0, 5);
  }
}

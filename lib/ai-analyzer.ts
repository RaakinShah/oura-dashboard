/**
 * Comprehensive AI Analysis Engine
 * Advanced analytics for Oura Ring data with personalized insights
 */

import { SleepData, ActivityData, ReadinessData } from './oura-api';

// ============= INTERFACES =============

export interface DailyRecommendation {
  type: 'optimal' | 'moderate' | 'light' | 'rest';
  title: string;
  description: string;
  confidence: number;
  activities: {
    recommended: string[];
    avoid: string[];
  };
  bestTimeWindows: string[];
  expectedEnergy: 'peak' | 'good' | 'moderate' | 'low';
  factors: string[];
}

export interface PerformanceWindow {
  time: string;
  energy: number; // 0-100
  level: 'peak' | 'good' | 'moderate' | 'low';
  recommendation: string;
}

export interface LifestyleCorrelation {
  factor: string;
  impact: number; // -100 to +100
  description: string;
  confidence: number;
  sampleSize: number;
}

export interface OptimalMetrics {
  sleepDuration: {
    optimal: number; // hours
    range: { min: number; max: number };
    confidence: number;
    currentAverage: number;
  };
  bedtime: {
    optimal: string; // HH:MM
    range: { earliest: string; latest: string };
    confidence: number;
  };
  wakeTime: {
    optimal: string;
    range: { earliest: string; latest: string };
    confidence: number;
  };
  sleepDebt: {
    totalHours: number;
    status: 'none' | 'minor' | 'moderate' | 'severe';
    daysToRecover: number;
  };
}

export interface ReadinessPrediction {
  tomorrow: {
    predictedScore: number;
    confidence: number;
    range: { min: number; max: number };
  };
  reasoning: string[];
  keyFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
}

export interface RecoveryStatus {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  score: number;
  daysSinceQualityRest: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  warnings: string[];
}

export interface WorkoutTiming {
  bestTimeOfDay: string;
  recommendedIntensity: 'high' | 'moderate' | 'low';
  optimalDuration: number; // minutes
  reasoning: string[];
  impactOnSleep: string;
}

export interface BurnoutRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  factors: string[];
  warnings: string[];
  urgentActions: string[];
  trendAnalysis: 'improving' | 'stable' | 'declining';
}

export interface SmartPattern {
  pattern: string;
  description: string;
  confidence: number;
  actionable: string;
}

export interface TrendAnalysis {
  metric: string;
  currentWeek: number;
  previousWeek: number;
  change: number; // percentage
  trend: 'improving' | 'declining' | 'stable';
  message: string;
  icon: string;
}

export interface KeyInsight {
  title: string;
  message: string;
  type: 'positive' | 'warning' | 'neutral' | 'celebrate';
  priority: number; // 1-10, higher is more important
  actionable: string;
  icon: string;
}

export interface HealthScore {
  overall: number; // 0-100
  breakdown: {
    sleep: { score: number; weight: number; status: string };
    activity: { score: number; weight: number; status: string };
    recovery: { score: number; weight: number; status: string };
  };
  message: string;
  topStrength: string;
  topWeakness: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  progress: number; // 0-100
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CircadianRhythm {
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  confidence: number;
  optimalWakeTime: string;
  optimalSleepTime: string;
  peakProductivityHours: string[];
  naturalEnergyPeaks: { time: string; intensity: number }[];
  recommendations: string[];
}

export interface StressAnalysis {
  overallStressLevel: 'low' | 'moderate' | 'high' | 'severe';
  stressScore: number; // 0-100
  stressFactors: {
    factor: string;
    contribution: number; // percentage
    trend: 'increasing' | 'stable' | 'decreasing';
  }[];
  physiologicalSigns: string[];
  copingStrategies: string[];
  urgency: 'none' | 'monitor' | 'action_needed' | 'urgent';
}

export interface HealthTrajectory {
  timeframe: '7_days' | '30_days' | '90_days';
  overallTrend: 'improving' | 'stable' | 'declining';
  projectedScore: number;
  confidence: number;
  keyDrivers: string[];
  milestones: {
    date: string;
    event: string;
    impact: 'positive' | 'negative';
  }[];
  futureOutlook: string;
}

export interface SleepPhaseOptimization {
  currentSleepPhases: {
    deep: { duration: number; percentage: number; status: 'low' | 'optimal' | 'high' };
    rem: { duration: number; percentage: number; status: 'low' | 'optimal' | 'high' };
    light: { duration: number; percentage: number; status: 'low' | 'optimal' | 'high' };
  };
  recommendations: string[];
  optimizationTips: { phase: string; tip: string; impact: 'high' | 'medium' | 'low' }[];
}

export interface WeeklyHealthReport {
  weekNumber: number;
  dateRange: { start: string; end: string };
  summary: string;
  highlights: string[];
  concerns: string[];
  achievements: string[];
  weekOverWeekComparison: {
    metric: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  recommendations: string[];
  nextWeekFocus: string[];
}

export interface HealthAnomaly {
  type: 'warning' | 'critical' | 'info';
  metric: string;
  description: string;
  currentValue: number;
  expectedRange: { min: number; max: number };
  deviation: number; // How many standard deviations from normal
  possibleCauses: string[];
  recommendedActions: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  detectedOn: string;
}

export interface PersonalizedCoaching {
  currentGoal: string;
  progressToGoal: number; // 0-100%
  weeklyFocus: string;
  dailyTips: string[];
  motivationalMessage: string;
  customRecommendations: {
    sleep: string[];
    activity: string[];
    recovery: string[];
  };
  nextMilestone: {
    description: string;
    daysToAchieve: number;
    requiredActions: string[];
  };
  strengthsToLeverage: string[];
  areasForImprovement: string[];
}

export interface AdvancedCorrelation {
  primaryMetric: string;
  secondaryMetric: string;
  correlationStrength: number; // -1 to 1
  relationshipType: 'strong positive' | 'moderate positive' | 'weak positive' | 'none' | 'weak negative' | 'moderate negative' | 'strong negative';
  insights: string[];
  practicalApplication: string;
  confidence: number;
  sampleSize: number;
  visualData: { x: number; y: number }[];
}

export interface RecoveryPrediction {
  currentRecoveryState: 'fully recovered' | 'well recovered' | 'moderately recovered' | 'poorly recovered' | 'severely fatigued';
  estimatedDaysToFullRecovery: number;
  recoveryTrajectory: {
    day: number;
    predictedReadiness: number;
    confidence: number;
  }[];
  keyFactorsAffectingRecovery: {
    factor: string;
    impact: 'helping' | 'hindering';
    weight: number;
  }[];
  recommendedInterventions: {
    intervention: string;
    expectedBenefit: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  riskFactors: string[];
}

export interface OptimalTimingRecommendation {
  activity: string;
  optimalTimeWindow: string;
  reasoning: string[];
  expectedPerformance: number; // 0-100
  alternativeWindows: { time: string; performance: number }[];
  avoidTimes: string[];
  personalizedTips: string[];
}

// ============= AI ANALYZER CLASS =============

export class AIAnalyzer {
  /**
   * DAILY RECOMMENDATIONS
   * Provides comprehensive daily guidance with specific activities
   */
  static getDailyRecommendation(
    latestReadiness: ReadinessData,
    recentSleep: SleepData[],
    recentActivity: ActivityData[]
  ): DailyRecommendation {
    const readinessScore = latestReadiness.score;
    const lastSleep = recentSleep[recentSleep.length - 1];
    const hrv = latestReadiness.hrv_balance || 0;
    const restingHR = latestReadiness.resting_heart_rate || 60;
    const factors: string[] = [];

    // Analyze multiple factors
    if (readinessScore >= 85) factors.push(`High readiness score (${readinessScore})`);
    if (readinessScore < 70) factors.push(`Low readiness score (${readinessScore})`);
    if (lastSleep && lastSleep.efficiency < 85) factors.push(`Poor sleep efficiency (${lastSleep.efficiency}%)`);
    if (lastSleep && lastSleep.efficiency >= 90) factors.push(`Excellent sleep efficiency (${lastSleep.efficiency}%)`);
    if (hrv > 15) factors.push('High HRV balance - excellent recovery');
    if (hrv < 5 && hrv > 0) factors.push('Low HRV - stress or fatigue detected');
    if (restingHR < 55) factors.push('Excellent resting heart rate');
    if (restingHR > 70) factors.push('Elevated resting heart rate');

    // Determine recommendation type
    if (readinessScore >= 85 && lastSleep && lastSleep.efficiency >= 85 && hrv > 10) {
      return {
        type: 'optimal',
        title: '🟢 Optimal Day - Go All Out!',
        description: 'Your body is in peak condition. This is the perfect day for challenging activities and important work.',
        confidence: 0.95,
        activities: {
          recommended: [
            'High-intensity workouts (HIIT, heavy lifting)',
            'Important presentations or meetings',
            'Complex problem-solving tasks',
            'Learning new skills',
            'Competitive activities',
          ],
          avoid: [
            'Excessive alcohol',
            'Late-night activities',
            'Skipping meals',
          ],
        },
        bestTimeWindows: ['9:00 AM - 12:00 PM (Peak focus)', '2:00 PM - 4:00 PM (Secondary peak)'],
        expectedEnergy: 'peak',
        factors,
      };
    } else if (readinessScore >= 70 && readinessScore < 85) {
      return {
        type: 'moderate',
        title: '🔵 Moderate Day - Balance is Key',
        description: 'Good condition but not optimal. Moderate your intensity and listen to your body.',
        confidence: 0.85,
        activities: {
          recommended: [
            'Moderate cardio (jogging, cycling)',
            'Yoga or stretching',
            'Routine work tasks',
            'Social activities',
            'Light strength training',
          ],
          avoid: [
            'Max effort workouts',
            'All-nighters',
            'High-stress situations',
            'Heavy alcohol consumption',
          ],
        },
        bestTimeWindows: ['10:00 AM - 1:00 PM (Good focus)', '3:00 PM - 5:00 PM (Light tasks)'],
        expectedEnergy: 'good',
        factors,
      };
    } else if (readinessScore >= 55 && readinessScore < 70) {
      return {
        type: 'light',
        title: '🟡 Light Day - Take It Easy',
        description: 'Your body needs gentler activities. Focus on recovery and light movement.',
        confidence: 0.90,
        activities: {
          recommended: [
            'Walking or light stretching',
            'Swimming (low intensity)',
            'Meditation and breathwork',
            'Light household tasks',
            'Reading and learning',
          ],
          avoid: [
            'Intense workouts',
            'Long working hours',
            'Caffeine after 2 PM',
            'Any alcohol',
            'Stressful confrontations',
          ],
        },
        bestTimeWindows: ['10:00 AM - 12:00 PM (Gentle activities only)'],
        expectedEnergy: 'moderate',
        factors,
      };
    } else {
      return {
        type: 'rest',
        title: '🔴 Rest Day - Critical Recovery Needed',
        description: 'Your body is signaling urgent need for rest. Prioritize recovery above all else.',
        confidence: 0.92,
        activities: {
          recommended: [
            'Complete rest or very light walking',
            'Napping (20-30 min)',
            'Massage or foam rolling',
            'Extra sleep tonight (aim for 9+ hours)',
            'Hydration and nutritious meals',
            'Stress-reduction activities',
          ],
          avoid: [
            'ALL intense exercise',
            'Alcohol and caffeine',
            'Late night screen time',
            'Stressful activities',
            'Long working hours',
            'Poor food choices',
          ],
        },
        bestTimeWindows: ['Focus on rest throughout the day'],
        expectedEnergy: 'low',
        factors,
      };
    }
  }

  /**
   * PERFORMANCE WINDOWS
   * Predicts energy levels throughout the day
   */
  static getPerformanceWindows(latestReadiness: ReadinessData): PerformanceWindow[] {
    const baseEnergy = latestReadiness.score;
    const hrv = latestReadiness.hrv_balance || 10;
    const hr = latestReadiness.resting_heart_rate || 60;

    // Adjust based on physiological factors
    const hrvModifier = hrv > 15 ? 1.1 : hrv < 5 ? 0.9 : 1.0;
    const hrModifier = hr < 60 ? 1.05 : hr > 70 ? 0.95 : 1.0;
    const modifier = hrvModifier * hrModifier;

    const windows = [
      { time: '6:00 AM', baseMultiplier: 0.55, desc: 'Early morning - gradual wake-up' },
      { time: '7:00 AM', baseMultiplier: 0.65, desc: 'Morning rise' },
      { time: '8:00 AM', baseMultiplier: 0.75, desc: 'Energy building' },
      { time: '9:00 AM', baseMultiplier: 0.90, desc: 'Peak morning performance' },
      { time: '10:00 AM', baseMultiplier: 0.95, desc: 'Optimal focus window' },
      { time: '11:00 AM', baseMultiplier: 0.93, desc: 'Strong performance continues' },
      { time: '12:00 PM', baseMultiplier: 0.85, desc: 'Pre-lunch productivity' },
      { time: '1:00 PM', baseMultiplier: 0.70, desc: 'Post-lunch dip' },
      { time: '2:00 PM', baseMultiplier: 0.72, desc: 'Recovery from lunch dip' },
      { time: '3:00 PM', baseMultiplier: 0.78, desc: 'Afternoon recovery' },
      { time: '4:00 PM', baseMultiplier: 0.80, desc: 'Secondary peak forming' },
      { time: '5:00 PM', baseMultiplier: 0.75, desc: 'Late afternoon' },
      { time: '6:00 PM', baseMultiplier: 0.68, desc: 'Evening wind down begins' },
      { time: '7:00 PM', baseMultiplier: 0.60, desc: 'Relaxation time' },
      { time: '8:00 PM', baseMultiplier: 0.52, desc: 'Evening low' },
      { time: '9:00 PM', baseMultiplier: 0.45, desc: 'Prepare for sleep' },
      { time: '10:00 PM', baseMultiplier: 0.35, desc: 'Sleep window approaching' },
    ];

    return windows.map(w => {
      const energy = Math.min(100, baseEnergy * w.baseMultiplier * modifier);
      let level: 'peak' | 'good' | 'moderate' | 'low';
      let recommendation: string;

      if (energy >= 80) {
        level = 'peak';
        recommendation = 'Ideal for complex tasks, important decisions, and challenging work';
      } else if (energy >= 65) {
        level = 'good';
        recommendation = 'Good for meetings, collaboration, and routine tasks';
      } else if (energy >= 45) {
        level = 'moderate';
        recommendation = 'Best for light tasks, admin work, and breaks';
      } else {
        level = 'low';
        recommendation = 'Rest, recovery, relaxation, and sleep preparation';
      }

      return {
        time: w.time,
        energy: Math.round(energy),
        level,
        recommendation,
      };
    });
  }

  /**
   * LIFESTYLE CORRELATIONS
   * Analyzes how lifestyle factors impact performance
   * Note: This requires lifestyle tracking data which would be stored separately
   */
  static analyzeLifestyleCorrelations(
    sleepData: SleepData[],
    readinessData: ReadinessData[],
    lifestyleLog?: any[] // Would come from user logging
  ): LifestyleCorrelation[] {
    const correlations: LifestyleCorrelation[] = [];

    // Sleep efficiency impact
    const avgEfficiency = sleepData.reduce((sum, s) => sum + s.efficiency, 0) / sleepData.length;
    const avgReadiness = readinessData.reduce((sum, r) => sum + r.score, 0) / readinessData.length;

    correlations.push({
      factor: 'Sleep Efficiency',
      impact: Math.round((avgEfficiency - 85) * 2), // -30 to +30 scale
      description: `When your sleep efficiency is ${avgEfficiency.toFixed(0)}%, your readiness averages ${avgReadiness.toFixed(0)}`,
      confidence: 0.88,
      sampleSize: sleepData.length,
    });

    // Deep sleep correlation
    const avgDeepSleep = sleepData.reduce((sum, s) => sum + (s.deep_sleep_duration / 60), 0) / sleepData.length;
    correlations.push({
      factor: 'Deep Sleep Duration',
      impact: avgDeepSleep > 90 ? 25 : avgDeepSleep > 60 ? 10 : -10,
      description: `Averaging ${avgDeepSleep.toFixed(0)} minutes of deep sleep. Optimal range is 60-110 minutes`,
      confidence: 0.85,
      sampleSize: sleepData.length,
    });

    // REM sleep correlation
    const avgRemSleep = sleepData.reduce((sum, s) => sum + (s.rem_sleep_duration / 60), 0) / sleepData.length;
    correlations.push({
      factor: 'REM Sleep Duration',
      impact: avgRemSleep > 90 ? 20 : avgRemSleep > 60 ? 10 : -15,
      description: `Averaging ${avgRemSleep.toFixed(0)} minutes of REM sleep. Optimal range is 90-120 minutes`,
      confidence: 0.82,
      sampleSize: sleepData.length,
    });

    // Sleep consistency
    const sleepDurations = sleepData.map(s => s.total_sleep_duration / 3600);
    const stdDev = Math.sqrt(sleepDurations.reduce((sum, d) => sum + Math.pow(d - (sleepDurations.reduce((a,b) => a + b) / sleepDurations.length), 2), 0) / sleepDurations.length);
    correlations.push({
      factor: 'Sleep Consistency',
      impact: stdDev < 0.5 ? 30 : stdDev < 1 ? 15 : stdDev < 1.5 ? 0 : -20,
      description: `Your sleep duration varies by ±${(stdDev * 60).toFixed(0)} minutes. Lower variation improves recovery`,
      confidence: 0.90,
      sampleSize: sleepData.length,
    });

    // HRV trends
    const avgHRV = readinessData.reduce((sum, r) => sum + (r.hrv_balance || 0), 0) / readinessData.length;
    correlations.push({
      factor: 'HRV Balance',
      impact: avgHRV > 15 ? 35 : avgHRV > 10 ? 20 : avgHRV > 5 ? 5 : -25,
      description: `Average HRV balance of ${avgHRV.toFixed(0)}. Higher HRV indicates better recovery and stress resilience`,
      confidence: 0.92,
      sampleSize: readinessData.length,
    });

    // Placeholder for user-logged lifestyle factors
    // These would be real correlations if user logs data
    correlations.push({
      factor: 'Alcohol Consumption',
      impact: -12,
      description: 'Based on typical patterns, alcohol reduces sleep quality by 10-15%',
      confidence: 0.75,
      sampleSize: 0,
    });

    correlations.push({
      factor: 'Late Meals (after 8 PM)',
      impact: -18,
      description: 'Eating late typically reduces sleep efficiency and deep sleep',
      confidence: 0.70,
      sampleSize: 0,
    });

    correlations.push({
      factor: 'Morning Exercise',
      impact: 22,
      description: 'Morning workouts generally improve readiness and sleep quality',
      confidence: 0.68,
      sampleSize: 0,
    });

    correlations.push({
      factor: 'Caffeine After 2 PM',
      impact: -15,
      description: 'Late caffeine typically reduces sleep quality and REM sleep',
      confidence: 0.72,
      sampleSize: 0,
    });

    return correlations.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  /**
   * OPTIMAL METRICS DISCOVERY
   * Finds personalized optimal sleep parameters
   */
  static findOptimalMetrics(
    sleepData: SleepData[],
    readinessData: ReadinessData[]
  ): OptimalMetrics {
    // Find correlation between sleep duration and readiness
    const correlationData = sleepData.map((s, i) => ({
      duration: s.total_sleep_duration / 3600,
      readiness: readinessData[Math.min(i + 1, readinessData.length - 1)]?.score || 0,
    })).filter(d => d.readiness > 0);

    // Group by duration ranges and find best performing
    const durationBuckets: { [key: number]: number[] } = {};
    correlationData.forEach(d => {
      const bucket = Math.floor(d.duration * 2) / 2; // 0.5 hour buckets
      if (!durationBuckets[bucket]) durationBuckets[bucket] = [];
      durationBuckets[bucket].push(d.readiness);
    });

    let optimalDuration = 8; // default
    let maxAvgReadiness = 0;
    Object.entries(durationBuckets).forEach(([dur, scores]) => {
      const avg = scores.reduce((a, b) => a + b) / scores.length;
      if (avg > maxAvgReadiness && scores.length >= 2) {
        maxAvgReadiness = avg;
        optimalDuration = parseFloat(dur);
      }
    });

    const currentAvg = sleepData.reduce((sum, s) => sum + s.total_sleep_duration, 0) / sleepData.length / 3600;

    // Calculate sleep debt
    const optimalTotal = optimalDuration * sleepData.length;
    const actualTotal = sleepData.reduce((sum, s) => sum + s.total_sleep_duration, 0) / 3600;
    const sleepDebt = optimalTotal - actualTotal;

    return {
      sleepDuration: {
        optimal: optimalDuration,
        range: { min: optimalDuration - 0.5, max: optimalDuration + 0.5 },
        confidence: correlationData.length > 14 ? 0.85 : 0.70,
        currentAverage: currentAvg,
      },
      bedtime: {
        optimal: '22:30',
        range: { earliest: '22:00', latest: '23:00' },
        confidence: 0.75,
      },
      wakeTime: {
        optimal: optimalDuration === 8 ? '6:30' : optimalDuration < 8 ? '6:00' : '7:00',
        range: { earliest: '6:00', latest: '7:30' },
        confidence: 0.75,
      },
      sleepDebt: {
        totalHours: Math.max(0, sleepDebt),
        status: sleepDebt <= 0 ? 'none' : sleepDebt < 3 ? 'minor' : sleepDebt < 7 ? 'moderate' : 'severe',
        daysToRecover: Math.ceil(sleepDebt / 1.5), // Assuming 1.5 extra hours per night
      },
    };
  }

  /**
   * TOMORROW'S PREDICTION
   * Forecast tomorrow's readiness
   */
  static predictReadiness(
    recentReadiness: ReadinessData[],
    recentSleep: SleepData[],
    latestActivity: ActivityData
  ): ReadinessPrediction {
    const last3Days = recentReadiness.slice(-3);
    const avgRecent = last3Days.reduce((sum, r) => sum + r.score, 0) / last3Days.length;
    const trend = recentReadiness.length >= 3
      ? (recentReadiness[recentReadiness.length - 1].score - recentReadiness[recentReadiness.length - 3].score) / 2
      : 0;

    const latestSleep = recentSleep[recentSleep.length - 1];
    const sleepQuality = (latestSleep.score / 100) * 0.4; // 40% weight
    const trendFactor = trend * 0.3; // 30% weight
    const baseFactor = (avgRecent / 100) * 0.3; // 30% weight

    const predictedScore = Math.min(100, Math.max(0,
      avgRecent + trend + (sleepQuality * 100) - (avgRecent * baseFactor)
    ));

    const keyFactors = [];

    if (latestSleep.efficiency >= 90) {
      keyFactors.push({ factor: 'Excellent sleep efficiency', impact: 'positive' as const, weight: 0.35 });
    } else if (latestSleep.efficiency < 80) {
      keyFactors.push({ factor: 'Poor sleep efficiency', impact: 'negative' as const, weight: 0.30 });
    }

    if (trend > 5) {
      keyFactors.push({ factor: 'Improving readiness trend', impact: 'positive' as const, weight: 0.25 });
    } else if (trend < -5) {
      keyFactors.push({ factor: 'Declining readiness trend', impact: 'negative' as const, weight: 0.25 });
    }

    if (latestActivity.score >= 85) {
      keyFactors.push({ factor: 'Good activity balance', impact: 'positive' as const, weight: 0.20 });
    } else if (latestActivity.score >= 95) {
      keyFactors.push({ factor: 'Potentially overtrained', impact: 'negative' as const, weight: 0.15 });
    }

    const reasoning = [
      `Based on your last 3 days averaging ${avgRecent.toFixed(0)} readiness`,
      `Recent trend is ${trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable'} (${trend.toFixed(1)} points)`,
      `Last night's sleep quality was ${latestSleep.score >= 85 ? 'excellent' : latestSleep.score >= 70 ? 'good' : 'poor'}`,
      `Sleep efficiency at ${latestSleep.efficiency}% ${latestSleep.efficiency >= 90 ? 'supports strong recovery' : 'may limit recovery'}`,
    ];

    const variance = Math.abs(trend) + 5; // Higher variance with volatile trends

    return {
      tomorrow: {
        predictedScore: Math.round(predictedScore),
        confidence: trend < 5 && trend > -5 ? 0.82 : 0.70,
        range: {
          min: Math.max(0, Math.round(predictedScore - variance)),
          max: Math.min(100, Math.round(predictedScore + variance)),
        },
      },
      reasoning,
      keyFactors,
    };
  }

  /**
   * RECOVERY STATUS
   * Comprehensive recovery monitoring
   */
  static getRecoveryStatus(
    recentReadiness: ReadinessData[],
    recentSleep: SleepData[]
  ): RecoveryStatus {
    const last7Days = recentReadiness.slice(-7);
    const avgReadiness = last7Days.reduce((sum, r) => sum + r.score, 0) / last7Days.length;
    const avgSleepEfficiency = recentSleep.slice(-7).reduce((sum, s) => sum + s.efficiency, 0) / Math.min(7, recentSleep.length);

    // Find days since last quality rest (readiness >= 85)
    let daysSinceQualityRest = 0;
    for (let i = recentReadiness.length - 1; i >= 0; i--) {
      if (recentReadiness[i].score >= 85) break;
      daysSinceQualityRest++;
    }

    let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    let urgency: 'low' | 'medium' | 'high' | 'critical';
    const recommendations: string[] = [];
    const warnings: string[] = [];

    if (avgReadiness >= 85 && avgSleepEfficiency >= 85) {
      status = 'excellent';
      urgency = 'low';
      recommendations.push('Maintain current recovery practices');
      recommendations.push('Your body is well-recovered and ready for challenges');
    } else if (avgReadiness >= 75) {
      status = 'good';
      urgency = 'low';
      recommendations.push('Continue prioritizing sleep quality');
      recommendations.push('Monitor for signs of accumulated fatigue');
    } else if (avgReadiness >= 65) {
      status = 'fair';
      urgency = 'medium';
      recommendations.push('Increase sleep duration by 30-60 minutes');
      recommendations.push('Reduce training intensity by 20-30%');
      recommendations.push('Focus on stress management');
    } else if (avgReadiness >= 50) {
      status = 'poor';
      urgency = 'high';
      warnings.push('Recovery deficit detected');
      recommendations.push('Significantly reduce activity levels');
      recommendations.push('Aim for 8-9 hours of sleep nightly');
      recommendations.push('Consider taking 2-3 complete rest days');
    } else {
      status = 'critical';
      urgency = 'critical';
      warnings.push('CRITICAL: Severe recovery deficit');
      warnings.push('High risk of injury or illness');
      recommendations.push('URGENT: Take immediate rest days');
      recommendations.push('Consult healthcare provider if symptoms persist');
      recommendations.push('No intense exercise until readiness improves');
    }

    if (daysSinceQualityRest >= 7) {
      warnings.push(`${daysSinceQualityRest} days without quality recovery`);
      if (urgency !== 'critical') urgency = 'high';
    }

    return {
      status,
      score: Math.round(avgReadiness),
      daysSinceQualityRest,
      urgency,
      recommendations,
      warnings,
    };
  }

  /**
   * WORKOUT TIMING OPTIMIZATION
   * Determines best time for exercise
   */
  static optimizeWorkoutTiming(
    readinessData: ReadinessData[],
    activityData: ActivityData[],
    sleepData: SleepData[]
  ): WorkoutTiming {
    const avgReadiness = readinessData.slice(-7).reduce((sum, r) => sum + r.score, 0) / Math.min(7, readinessData.length);
    const latestReadiness = readinessData[readinessData.length - 1];

    let bestTime: string;
    let intensity: 'high' | 'moderate' | 'low';
    let duration: number;
    const reasoning: string[] = [];

    // Determine intensity based on readiness
    if (avgReadiness >= 85) {
      intensity = 'high';
      duration = 60;
      bestTime = '9:00 AM - 11:00 AM';
      reasoning.push('High readiness supports intense training');
      reasoning.push('Morning cortisol levels optimize strength and power');
    } else if (avgReadiness >= 70) {
      intensity = 'moderate';
      duration = 45;
      bestTime = '10:00 AM - 12:00 PM';
      reasoning.push('Moderate readiness suits balanced training');
      reasoning.push('Mid-morning provides good energy without overexertion');
    } else {
      intensity = 'low';
      duration = 30;
      bestTime = '11:00 AM - 1:00 PM';
      reasoning.push('Low readiness requires gentle activity');
      reasoning.push('Light movement aids recovery without depleting energy');
    }

    // HRV considerations
    if (latestReadiness.hrv_balance && latestReadiness.hrv_balance < 5) {
      reasoning.push('Low HRV suggests postponing intense exercise');
      if (intensity === 'high') intensity = 'moderate';
    }

    const impactOnSleep = intensity === 'high'
      ? 'Finish intense workouts by 6 PM to avoid disrupting sleep. May increase sleep quality if properly recovered.'
      : intensity === 'moderate'
      ? 'Moderate exercise typically improves sleep quality when done 4+ hours before bed.'
      : 'Light exercise has minimal impact on sleep and can be done anytime.';

    return {
      bestTimeOfDay: bestTime,
      recommendedIntensity: intensity,
      optimalDuration: duration,
      reasoning,
      impactOnSleep,
    };
  }

  /**
   * BURNOUT DETECTION
   * Early warning system for accumulated fatigue
   */
  static detectBurnoutRisk(
    readinessData: ReadinessData[],
    sleepData: SleepData[],
    activityData: ActivityData[]
  ): BurnoutRisk {
    const last14Days = readinessData.slice(-14);
    const avgReadiness = last14Days.reduce((sum, r) => sum + r.score, 0) / last14Days.length;

    // Calculate trend over 2 weeks
    const firstWeek = last14Days.slice(0, 7).reduce((sum, r) => sum + r.score, 0) / 7;
    const secondWeek = last14Days.slice(7).reduce((sum, r) => sum + r.score, 0) / Math.max(1, last14Days.length - 7);
    const trend = secondWeek - firstWeek;

    // Count low readiness days (< 70)
    const lowReadinessDays = last14Days.filter(r => r.score < 70).length;

    // Check sleep quality
    const poorSleepDays = sleepData.slice(-14).filter(s => s.efficiency < 80).length;

    const factors: string[] = [];
    const warnings: string[] = [];
    const urgentActions: string[] = [];

    let level: 'low' | 'medium' | 'high' | 'critical';
    let score = 0;

    // Calculate burnout score
    if (avgReadiness < 70) {
      score += 30;
      factors.push(`Average readiness below 70 (${avgReadiness.toFixed(0)})`);
    }
    if (trend < -5) {
      score += 25;
      factors.push(`Declining trend over 2 weeks (-${Math.abs(trend).toFixed(0)} points)`);
    }
    if (lowReadinessDays >= 7) {
      score += 20;
      factors.push(`${lowReadinessDays} days with readiness < 70`);
    }
    if (poorSleepDays >= 7) {
      score += 15;
      factors.push(`${poorSleepDays} days with poor sleep efficiency`);
    }

    // Check for consecutive low days
    let consecutiveLow = 0;
    let maxConsecutiveLow = 0;
    last14Days.forEach(r => {
      if (r.score < 70) {
        consecutiveLow++;
        maxConsecutiveLow = Math.max(maxConsecutiveLow, consecutiveLow);
      } else {
        consecutiveLow = 0;
      }
    });

    if (maxConsecutiveLow >= 5) {
      score += 10;
      factors.push(`${maxConsecutiveLow} consecutive days of low readiness`);
    }

    // Determine level and actions
    if (score >= 70) {
      level = 'critical';
      warnings.push('CRITICAL BURNOUT RISK DETECTED');
      warnings.push('Immediate action required to prevent injury/illness');
      urgentActions.push('Take 3-5 complete rest days immediately');
      urgentActions.push('Consult with healthcare provider');
      urgentActions.push('Eliminate all intense activities');
      urgentActions.push('Prioritize 8-9 hours of sleep');
    } else if (score >= 50) {
      level = 'high';
      warnings.push('High burnout risk - intervention needed');
      warnings.push('Accumulated fatigue may lead to performance decline');
      urgentActions.push('Reduce training volume by 50% this week');
      urgentActions.push('Add 2 extra rest days');
      urgentActions.push('Focus on stress reduction techniques');
    } else if (score >= 30) {
      level = 'medium';
      warnings.push('Moderate burnout risk detected');
      urgentActions.push('Reduce intensity of workouts by 30%');
      urgentActions.push('Add one extra rest day this week');
      urgentActions.push('Increase sleep duration by 30 minutes');
    } else {
      level = 'low';
      urgentActions.push('Continue current recovery practices');
      urgentActions.push('Monitor readiness trends weekly');
    }

    const trendAnalysis: 'improving' | 'stable' | 'declining' =
      trend > 3 ? 'improving' : trend < -3 ? 'declining' : 'stable';

    return {
      level,
      score,
      factors,
      warnings,
      urgentActions,
      trendAnalysis,
    };
  }

  /**
   * SMART PATTERN DETECTION
   * Discovers hidden patterns in the data
   */
  static detectSmartPatterns(
    sleepData: SleepData[],
    activityData: ActivityData[],
    readinessData: ReadinessData[]
  ): SmartPattern[] {
    const patterns: SmartPattern[] = [];

    // Sleep consistency pattern
    const sleepDurations = sleepData.map(s => s.total_sleep_duration / 3600);
    const avgDuration = sleepDurations.reduce((a, b) => a + b) / sleepDurations.length;
    const stdDev = Math.sqrt(sleepDurations.reduce((sum, d) =>
      sum + Math.pow(d - avgDuration, 2), 0) / sleepDurations.length);

    if (stdDev < 0.5) {
      patterns.push({
        pattern: 'Highly Consistent Sleep Schedule',
        description: `Your sleep duration varies by only ±${(stdDev * 60).toFixed(0)} minutes`,
        confidence: 0.92,
        actionable: 'Excellent! Maintain this consistency for optimal recovery',
      });
    } else if (stdDev > 1.5) {
      patterns.push({
        pattern: 'Irregular Sleep Pattern Detected',
        description: `Sleep duration varies by ±${(stdDev * 60).toFixed(0)} minutes, affecting recovery`,
        confidence: 0.88,
        actionable: 'Set a consistent bedtime and wake time, even on weekends',
      });
    }

    // Efficiency correlation
    const avgEfficiency = sleepData.reduce((sum, s) => sum + s.efficiency, 0) / sleepData.length;
    const avgReadiness = readinessData.reduce((sum, r) => sum + r.score, 0) / readinessData.length;

    if (avgEfficiency >= 90 && avgReadiness >= 85) {
      patterns.push({
        pattern: 'Sleep Quality Drives High Performance',
        description: `Your ${avgEfficiency.toFixed(0)}% sleep efficiency consistently produces ${avgReadiness.toFixed(0)} readiness`,
        confidence: 0.90,
        actionable: 'Your sleep optimization is working perfectly',
      });
    }

    // Activity vs Recovery pattern
    const highActivityDays = activityData.filter(a => a.score >= 90).length;
    const lowReadinessDays = readinessData.filter(r => r.score < 70).length;

    if (highActivityDays > activityData.length * 0.5 && lowReadinessDays > readinessData.length * 0.3) {
      patterns.push({
        pattern: 'Overtraining Indicator',
        description: 'High activity levels not matched by adequate recovery',
        confidence: 0.78,
        actionable: 'Increase rest days and prioritize recovery over activity volume',
      });
    }

    // HRV trend
    const hrvValues = readinessData.map(r => r.hrv_balance || 0).filter(h => h > 0);
    if (hrvValues.length >= 7) {
      const recentHRV = hrvValues.slice(-7).reduce((a, b) => a + b) / 7;
      const olderHRV = hrvValues.slice(0, 7).reduce((a, b) => a + b) / 7;
      const hrvTrend = recentHRV - olderHRV;

      if (hrvTrend > 5) {
        patterns.push({
          pattern: 'Improving Stress Resilience',
          description: `HRV increasing by ${hrvTrend.toFixed(1)} points indicates better adaptation`,
          confidence: 0.82,
          actionable: 'Your recovery practices are working - maintain current approach',
        });
      } else if (hrvTrend < -5) {
        patterns.push({
          pattern: 'Declining HRV Trend',
          description: `HRV decreasing by ${Math.abs(hrvTrend).toFixed(1)} points may indicate accumulated stress`,
          confidence: 0.80,
          actionable: 'Increase stress management practices and recovery time',
        });
      }
    }

    // Deep sleep pattern
    const avgDeepSleep = sleepData.reduce((sum, s) => sum + s.deep_sleep_duration, 0) / sleepData.length / 60;
    if (avgDeepSleep < 60) {
      patterns.push({
        pattern: 'Insufficient Deep Sleep',
        description: `Averaging ${avgDeepSleep.toFixed(0)} minutes of deep sleep (optimal: 60-110 min)`,
        confidence: 0.85,
        actionable: 'Avoid alcohol, keep room cool (65-68°F), and maintain consistent sleep times',
      });
    } else if (avgDeepSleep > 90) {
      patterns.push({
        pattern: 'Excellent Deep Sleep Quality',
        description: `Your ${avgDeepSleep.toFixed(0)} minutes of deep sleep supports optimal physical recovery`,
        confidence: 0.88,
        actionable: 'Continue current sleep practices for sustained recovery',
      });
    }

    // Weekend effect
    if (sleepData.length >= 14) {
      const weekendSleep: number[] = [];
      const weekdaySleep: number[] = [];

      sleepData.forEach(s => {
        const date = new Date(s.day);
        const day = date.getDay();
        const duration = s.total_sleep_duration / 3600;

        if (day === 0 || day === 6) {
          weekendSleep.push(duration);
        } else {
          weekdaySleep.push(duration);
        }
      });

      if (weekendSleep.length > 0 && weekdaySleep.length > 0) {
        const weekendAvg = weekendSleep.reduce((a, b) => a + b) / weekendSleep.length;
        const weekdayAvg = weekdaySleep.reduce((a, b) => a + b) / weekdaySleep.length;
        const diff = weekendAvg - weekdayAvg;

        if (diff > 1) {
          patterns.push({
            pattern: 'Weekend Sleep Compensation',
            description: `Sleeping ${diff.toFixed(1)} hours more on weekends indicates weekday sleep debt`,
            confidence: 0.75,
            actionable: 'Gradually increase weekday sleep to reduce need for weekend catch-up',
          });
        }
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * TREND ANALYSIS
   * Compare current week vs previous week across key metrics
   */
  static analyzeTrends(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): TrendAnalysis[] {
    const trends: TrendAnalysis[] = [];

    if (sleep.length < 14) return trends;

    const currentWeekSleep = sleep.slice(-7);
    const previousWeekSleep = sleep.slice(-14, -7);
    const currentWeekActivity = activity.slice(-7);
    const previousWeekActivity = activity.slice(-14, -7);
    const currentWeekReadiness = readiness.slice(-7);
    const previousWeekReadiness = readiness.slice(-14, -7);

    // Sleep Score Trend
    const currentSleepScore = currentWeekSleep.reduce((sum, s) => sum + s.score, 0) / currentWeekSleep.length;
    const previousSleepScore = previousWeekSleep.reduce((sum, s) => sum + s.score, 0) / previousWeekSleep.length;
    const sleepChange = ((currentSleepScore - previousSleepScore) / previousSleepScore) * 100;

    trends.push({
      metric: 'Sleep Quality',
      currentWeek: Math.round(currentSleepScore),
      previousWeek: Math.round(previousSleepScore),
      change: Math.round(sleepChange),
      trend: sleepChange > 3 ? 'improving' : sleepChange < -3 ? 'declining' : 'stable',
      message: sleepChange > 0
        ? `${Math.round(sleepChange)}% better than last week`
        : sleepChange < 0
          ? `${Math.abs(Math.round(sleepChange))}% lower than last week`
          : 'Consistent with last week',
      icon: sleepChange > 0 ? '📈' : sleepChange < 0 ? '📉' : '➡️'
    });

    // Sleep Duration Trend
    const currentDuration = currentWeekSleep.reduce((sum, s) => sum + s.total_sleep_duration, 0) / currentWeekSleep.length / 3600;
    const previousDuration = previousWeekSleep.reduce((sum, s) => sum + s.total_sleep_duration, 0) / previousWeekSleep.length / 3600;
    const durationDiff = currentDuration - previousDuration;
    const minutes = Math.abs(Math.round(durationDiff * 60));

    if (Math.abs(durationDiff) > 0.25) { // More than 15 minutes difference
      trends.push({
        metric: 'Sleep Duration',
        currentWeek: Math.round(currentDuration * 10) / 10,
        previousWeek: Math.round(previousDuration * 10) / 10,
        change: Math.round((durationDiff / previousDuration) * 100),
        trend: durationDiff > 0 ? 'improving' : 'declining',
        message: durationDiff > 0
          ? `${minutes} min more sleep per night`
          : `${minutes} min less sleep per night`,
        icon: durationDiff > 0 ? '⬆️' : '⬇️'
      });
    }

    // Activity Level Trend
    const currentSteps = currentWeekActivity.reduce((sum, a) => sum + a.steps, 0) / currentWeekActivity.length;
    const previousSteps = previousWeekActivity.reduce((sum, a) => sum + a.steps, 0) / previousWeekActivity.length;
    const stepsChange = ((currentSteps - previousSteps) / previousSteps) * 100;

    if (Math.abs(stepsChange) > 10) {
      trends.push({
        metric: 'Daily Steps',
        currentWeek: Math.round(currentSteps),
        previousWeek: Math.round(previousSteps),
        change: Math.round(stepsChange),
        trend: stepsChange > 0 ? 'improving' : 'declining',
        message: stepsChange > 0
          ? `${Math.abs(Math.round(stepsChange))}% more active`
          : `${Math.abs(Math.round(stepsChange))}% less active`,
        icon: stepsChange > 0 ? '🚶' : '💤'
      });
    }

    // Readiness Trend
    const currentReadinessScore = currentWeekReadiness.reduce((sum, r) => sum + r.score, 0) / currentWeekReadiness.length;
    const previousReadinessScore = previousWeekReadiness.reduce((sum, r) => sum + r.score, 0) / previousWeekReadiness.length;
    const readinessChange = ((currentReadinessScore - previousReadinessScore) / previousReadinessScore) * 100;

    trends.push({
      metric: 'Recovery',
      currentWeek: Math.round(currentReadinessScore),
      previousWeek: Math.round(previousReadinessScore),
      change: Math.round(readinessChange),
      trend: readinessChange > 3 ? 'improving' : readinessChange < -3 ? 'declining' : 'stable',
      message: readinessChange > 0
        ? `Recovering ${Math.abs(Math.round(readinessChange))}% better`
        : readinessChange < 0
          ? `Recovery down ${Math.abs(Math.round(readinessChange))}%`
          : 'Steady recovery',
      icon: readinessChange > 0 ? '💪' : readinessChange < 0 ? '⚠️' : '✅'
    });

    return trends;
  }

  /**
   * KEY INSIGHT
   * Generate the most important insight for today
   */
  static getKeyInsight(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): KeyInsight {
    if (!sleep.length || !readiness.length) {
      return {
        title: 'Welcome to Your Health Dashboard',
        message: 'Start tracking your Oura Ring data to receive personalized insights',
        type: 'neutral',
        priority: 1,
        actionable: 'Ensure your Oura Ring is synced',
        icon: '👋'
      };
    }

    const latestSleep = sleep[sleep.length - 1];
    const latestReadiness = readiness[readiness.length - 1];
    const latestActivity = activity[activity.length - 1];

    // Check for exceptional performance
    if (latestReadiness.score >= 90 && latestSleep.score >= 90) {
      return {
        title: 'Peak Performance Day',
        message: `Your readiness (${latestReadiness.score}) and sleep (${latestSleep.score}) scores are exceptional. This is your day to tackle your biggest challenges.`,
        type: 'celebrate',
        priority: 10,
        actionable: 'Schedule your most important tasks and workouts for today',
        icon: '🌟'
      };
    }

    // Check for recovery need
    const recentReadiness = readiness.slice(-3);
    const avgRecentReadiness = recentReadiness.reduce((sum, r) => sum + r.score, 0) / recentReadiness.length;
    if (avgRecentReadiness < 65) {
      return {
        title: 'Recovery Priority',
        message: `Your readiness has averaged ${Math.round(avgRecentReadiness)} over the last 3 days. Your body needs rest more than activity right now.`,
        type: 'warning',
        priority: 9,
        actionable: 'Take a complete rest day or do only light movement',
        icon: '🛌'
      };
    }

    // Check for sleep consistency
    if (sleep.length >= 7) {
      const last7 = sleep.slice(-7);
      const durations = last7.map(s => s.total_sleep_duration);
      const avgDuration = durations.reduce((a, b) => a + b) / durations.length;
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
      const stdDev = Math.sqrt(variance) / 3600; // Convert to hours

      if (stdDev > 1.5) {
        return {
          title: 'Inconsistent Sleep Pattern',
          message: 'Your sleep duration varies by over 1.5 hours. Consistency is key for optimal recovery.',
          type: 'warning',
          priority: 7,
          actionable: 'Set a consistent bedtime and wake time, even on weekends',
          icon: '⏰'
        };
      }
    }

    // Check for positive trend
    const trends = this.analyzeTrends(sleep, activity, readiness);
    const improvingTrends = trends.filter(t => t.trend === 'improving');
    if (improvingTrends.length >= 2) {
      return {
        title: 'Positive Momentum',
        message: `You're improving in ${improvingTrends.length} key areas. Keep up the great work!`,
        type: 'positive',
        priority: 8,
        actionable: 'Maintain your current routine and habits',
        icon: '📈'
      };
    }

    // Default positive message
    return {
      title: 'Steady Progress',
      message: `Your readiness is ${latestReadiness.score}. You're maintaining good health habits.`,
      type: 'positive',
      priority: 5,
      actionable: 'Continue with balanced activity and recovery',
      icon: '✨'
    };
  }

  /**
   * HEALTH SCORE
   * Overall health score with breakdown
   */
  static getHealthScore(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): HealthScore {
    const recentSleep = sleep.slice(-7);
    const recentActivity = activity.slice(-7);
    const recentReadiness = readiness.slice(-7);

    // Calculate component scores
    const sleepScore = recentSleep.length > 0
      ? recentSleep.reduce((sum, s) => sum + s.score, 0) / recentSleep.length
      : 0;

    const activityScore = recentActivity.length > 0
      ? recentActivity.reduce((sum, a) => sum + a.score, 0) / recentActivity.length
      : 0;

    const recoveryScore = recentReadiness.length > 0
      ? recentReadiness.reduce((sum, r) => sum + r.score, 0) / recentReadiness.length
      : 0;

    // Weights: Sleep 40%, Recovery 35%, Activity 25%
    const overall = (sleepScore * 0.4) + (recoveryScore * 0.35) + (activityScore * 0.25);

    // Determine statuses
    const getStatus = (score: number) => {
      if (score >= 85) return 'Excellent';
      if (score >= 70) return 'Good';
      if (score >= 60) return 'Fair';
      return 'Needs Attention';
    };

    // Find strength and weakness
    const components = [
      { name: 'Sleep', score: sleepScore },
      { name: 'Activity', score: activityScore },
      { name: 'Recovery', score: recoveryScore }
    ];
    components.sort((a, b) => b.score - a.score);

    return {
      overall: Math.round(overall),
      breakdown: {
        sleep: {
          score: Math.round(sleepScore),
          weight: 40,
          status: getStatus(sleepScore)
        },
        activity: {
          score: Math.round(activityScore),
          weight: 25,
          status: getStatus(activityScore)
        },
        recovery: {
          score: Math.round(recoveryScore),
          weight: 35,
          status: getStatus(recoveryScore)
        }
      },
      message: overall >= 80
        ? 'Your health is in excellent shape'
        : overall >= 70
          ? 'Good overall health with room for improvement'
          : 'Focus on the key areas below for better health',
      topStrength: components[0].name,
      topWeakness: components[2].name
    };
  }

  /**
   * ACHIEVEMENTS
   * Track milestones and accomplishments
   */
  static getAchievements(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Achievement[] {
    const achievements: Achievement[] = [];

    // Sleep achievements
    const perfectSleepDays = sleep.filter(s => s.score >= 90).length;
    achievements.push({
      id: 'perfect_sleep_week',
      title: 'Sleep Champion',
      description: 'Achieve 90+ sleep score for 7 consecutive days',
      achieved: perfectSleepDays >= 7,
      progress: Math.min(100, (perfectSleepDays / 7) * 100),
      icon: '🌙',
      rarity: 'epic'
    });

    // Activity achievements
    const tenKDays = activity.filter(a => a.steps >= 10000).length;
    achievements.push({
      id: 'ten_k_streak',
      title: '10K Steps Master',
      description: 'Walk 10,000+ steps for 30 days',
      achieved: tenKDays >= 30,
      progress: Math.min(100, (tenKDays / 30) * 100),
      icon: '🚶',
      rarity: 'legendary'
    });

    // Readiness achievements
    const optimalDays = readiness.filter(r => r.score >= 85).length;
    achievements.push({
      id: 'optimal_week',
      title: 'Peak Recovery',
      description: 'Maintain 85+ readiness for a full week',
      achieved: optimalDays >= 7,
      progress: Math.min(100, (optimalDays / 7) * 100),
      icon: '💪',
      rarity: 'rare'
    });

    // Consistency achievements
    if (sleep.length >= 30) {
      const last30 = sleep.slice(-30);
      const durations = last30.map(s => s.total_sleep_duration);
      const avgDuration = durations.reduce((a, b) => a + b) / durations.length;
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
      const stdDev = Math.sqrt(variance) / 3600;

      const consistent = stdDev < 0.5; // Less than 30 min variation
      achievements.push({
        id: 'sleep_consistency',
        title: 'Creature of Habit',
        description: 'Maintain consistent sleep schedule for 30 days',
        achieved: consistent,
        progress: Math.min(100, ((1 - stdDev) / 0.5) * 100),
        icon: '⏰',
        rarity: 'rare'
      });
    }

    // Data collection achievement
    const totalDays = Math.max(sleep.length, activity.length, readiness.length);
    achievements.push({
      id: 'data_collector',
      title: 'Data Enthusiast',
      description: 'Track your health for 100 days',
      achieved: totalDays >= 100,
      progress: Math.min(100, (totalDays / 100) * 100),
      icon: '📊',
      rarity: 'common'
    });

    return achievements.sort((a, b) => {
      if (a.achieved !== b.achieved) return a.achieved ? -1 : 1;
      return b.progress - a.progress;
    });
  }

  /**
   * CIRCADIAN RHYTHM ANALYSIS
   * Determine chronotype and optimal timing
   */
  static analyzeCircadianRhythm(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): CircadianRhythm {
    const avgBedtime = this.calculateAverageBedtime(sleep);
    const avgWakeTime = this.calculateAverageWakeTime(sleep);

    // Determine chronotype based on sleep patterns
    let chronotype: 'early_bird' | 'night_owl' | 'intermediate';
    const bedtimeHour = parseInt(avgBedtime.split(':')[0]);
    const wakeHour = parseInt(avgWakeTime.split(':')[0]);

    if (bedtimeHour <= 22 && wakeHour <= 6) {
      chronotype = 'early_bird';
    } else if (bedtimeHour >= 24 && wakeHour >= 8) {
      chronotype = 'night_owl';
    } else {
      chronotype = 'intermediate';
    }

    const peakProductivityHours = chronotype === 'early_bird'
      ? ['8:00 AM - 11:00 AM', '2:00 PM - 4:00 PM']
      : chronotype === 'night_owl'
      ? ['12:00 PM - 3:00 PM', '7:00 PM - 10:00 PM']
      : ['9:00 AM - 12:00 PM', '3:00 PM - 6:00 PM'];

    return {
      chronotype,
      confidence: 0.85,
      optimalWakeTime: avgWakeTime,
      optimalSleepTime: avgBedtime,
      peakProductivityHours,
      naturalEnergyPeaks: [
        { time: '10:00 AM', intensity: 85 },
        { time: '3:00 PM', intensity: 70 }
      ],
      recommendations: [
        `As a ${chronotype.replace('_', ' ')}, align your schedule with your natural rhythm`,
        'Schedule important tasks during your peak productivity hours',
        'Maintain consistent sleep and wake times even on weekends'
      ]
    };
  }

  private static calculateAverageBedtime(sleep: SleepData[]): string {
    // Simplified - would use actual bedtime from data
    return '22:30';
  }

  private static calculateAverageWakeTime(sleep: SleepData[]): string {
    // Simplified - would use actual wake time from data
    return '6:30';
  }

  /**
   * STRESS ANALYSIS
   * Detect stress levels from physiological markers
   */
  static analyzeStress(
    readiness: ReadinessData[],
    sleep: SleepData[]
  ): StressAnalysis {
    const recent7Days = readiness.slice(-7);
    const avgHRV = recent7Days.reduce((sum, r) => sum + (r.hrv_balance || 0), 0) / recent7Days.length;
    const avgRestingHR = recent7Days.reduce((sum, r) => sum + (r.resting_heart_rate || 60), 0) / recent7Days.length;
    const avgReadiness = recent7Days.reduce((sum, r) => sum + r.score, 0) / recent7Days.length;

    // Calculate stress score (inverse of recovery indicators)
    const stressScore = Math.round(
      ((100 - avgReadiness) * 0.5) +
      ((avgRestingHR > 65 ? (avgRestingHR - 65) * 2 : 0) * 0.3) +
      ((avgHRV < 10 ? (10 - avgHRV) * 3 : 0) * 0.2)
    );

    let overallStressLevel: 'low' | 'moderate' | 'high' | 'severe';
    let urgency: 'none' | 'monitor' | 'action_needed' | 'urgent';

    if (stressScore < 30) {
      overallStressLevel = 'low';
      urgency = 'none';
    } else if (stressScore < 50) {
      overallStressLevel = 'moderate';
      urgency = 'monitor';
    } else if (stressScore < 70) {
      overallStressLevel = 'high';
      urgency = 'action_needed';
    } else {
      overallStressLevel = 'severe';
      urgency = 'urgent';
    }

    const stressFactors = [];
    if (avgHRV < 10) {
      stressFactors.push({
        factor: 'Low HRV',
        contribution: 30,
        trend: 'increasing' as const
      });
    }
    if (avgRestingHR > 65) {
      stressFactors.push({
        factor: 'Elevated Resting Heart Rate',
        contribution: 25,
        trend: 'increasing' as const
      });
    }
    if (avgReadiness < 70) {
      stressFactors.push({
        factor: 'Poor Recovery',
        contribution: 45,
        trend: 'stable' as const
      });
    }

    return {
      overallStressLevel,
      stressScore,
      stressFactors,
      physiologicalSigns: [
        avgHRV < 10 ? 'Reduced heart rate variability' : null,
        avgRestingHR > 70 ? 'Elevated resting heart rate' : null,
        avgReadiness < 65 ? 'Consistently low readiness scores' : null
      ].filter(Boolean) as string[],
      copingStrategies: [
        'Practice daily meditation or breathwork (10-15 minutes)',
        'Prioritize 7-9 hours of quality sleep',
        'Engage in light physical activity (walking, yoga)',
        'Reduce caffeine intake, especially after 2 PM',
        'Schedule regular breaks throughout the day'
      ],
      urgency
    };
  }

  /**
   * HEALTH TRAJECTORY PREDICTION
   * Project future health based on current trends
   */
  static predictHealthTrajectory(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    timeframe: '7_days' | '30_days' | '90_days' = '30_days'
  ): HealthTrajectory {
    const daysToAnalyze = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
    const recentData = readiness.slice(-Math.min(daysToAnalyze, readiness.length));

    const currentAvg = recentData.reduce((sum, r) => sum + r.score, 0) / recentData.length;
    const firstWeek = recentData.slice(0, 7).reduce((sum, r) => sum + r.score, 0) / 7;
    const lastWeek = recentData.slice(-7).reduce((sum, r) => sum + r.score, 0) / 7;
    const trend = lastWeek - firstWeek;

    let overallTrend: 'improving' | 'stable' | 'declining';
    let projectedScore: number;

    if (trend > 5) {
      overallTrend = 'improving';
      projectedScore = Math.min(100, currentAvg + trend * 1.5);
    } else if (trend < -5) {
      overallTrend = 'declining';
      projectedScore = Math.max(0, currentAvg + trend * 1.5);
    } else {
      overallTrend = 'stable';
      projectedScore = currentAvg;
    }

    return {
      timeframe,
      overallTrend,
      projectedScore: Math.round(projectedScore),
      confidence: 0.78,
      keyDrivers: [
        overallTrend === 'improving' ? 'Consistent sleep quality improvements' : 'Sleep quality variations',
        'Activity level consistency',
        'Recovery patterns'
      ],
      milestones: [],
      futureOutlook: overallTrend === 'improving'
        ? `Your health metrics show positive momentum. Continue current habits to reach projected score of ${Math.round(projectedScore)} in ${timeframe.replace('_', ' ')}.`
        : overallTrend === 'declining'
        ? `Health metrics trending downward. Intervention recommended to prevent further decline.`
        : `Health metrics stable. Small adjustments could drive improvements.`
    };
  }

  /**
   * SLEEP PHASE OPTIMIZATION
   * Analyze and optimize sleep architecture
   */
  static optimizeSleepPhases(sleep: SleepData[]): SleepPhaseOptimization {
    const recent7 = sleep.slice(-7);
    const avgDeepSleep = recent7.reduce((sum, s) => sum + s.deep_sleep_duration, 0) / recent7.length;
    const avgRemSleep = recent7.reduce((sum, s) => sum + s.rem_sleep_duration, 0) / recent7.length;
    const avgLightSleep = recent7.reduce((sum, s) => sum + s.light_sleep_duration, 0) / recent7.length;
    const avgTotalSleep = recent7.reduce((sum, s) => sum + s.total_sleep_duration, 0) / recent7.length;

    const deepPercentage = (avgDeepSleep / avgTotalSleep) * 100;
    const remPercentage = (avgRemSleep / avgTotalSleep) * 100;
    const lightPercentage = (avgLightSleep / avgTotalSleep) * 100;

    const getStatus = (percentage: number, optimal: { min: number; max: number }) => {
      if (percentage < optimal.min) return 'low' as const;
      if (percentage > optimal.max) return 'high' as const;
      return 'optimal' as const;
    };

    const optimizationTips = [];

    if (deepPercentage < 13) {
      optimizationTips.push({
        phase: 'Deep Sleep',
        tip: 'Keep bedroom cool (65-68°F) and avoid alcohol before bed',
        impact: 'high' as const
      });
    }

    if (remPercentage < 20) {
      optimizationTips.push({
        phase: 'REM Sleep',
        tip: 'Ensure 7-9 hours total sleep time and maintain consistent schedule',
        impact: 'high' as const
      });
    }

    return {
      currentSleepPhases: {
        deep: {
          duration: avgDeepSleep / 60,
          percentage: deepPercentage,
          status: getStatus(deepPercentage, { min: 13, max: 23 })
        },
        rem: {
          duration: avgRemSleep / 60,
          percentage: remPercentage,
          status: getStatus(remPercentage, { min: 20, max: 25 })
        },
        light: {
          duration: avgLightSleep / 60,
          percentage: lightPercentage,
          status: getStatus(lightPercentage, { min: 50, max: 60 })
        }
      },
      recommendations: [
        'Maintain a consistent sleep schedule',
        'Create an optimal sleep environment',
        'Avoid blue light 2 hours before bed'
      ],
      optimizationTips
    };
  }

  /**
   * WEEKLY HEALTH REPORT
   * Comprehensive weekly summary
   */
  static generateWeeklyReport(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    weekNumber: number = 1
  ): WeeklyHealthReport {
    const last7Days = {
      sleep: sleep.slice(-7),
      activity: activity.slice(-7),
      readiness: readiness.slice(-7)
    };

    const previous7Days = {
      sleep: sleep.slice(-14, -7),
      activity: activity.slice(-14, -7),
      readiness: readiness.slice(-14, -7)
    };

    const currentWeekAvg = {
      sleep: last7Days.sleep.reduce((sum, s) => sum + s.score, 0) / last7Days.sleep.length,
      activity: last7Days.activity.reduce((sum, a) => sum + a.score, 0) / last7Days.activity.length,
      readiness: last7Days.readiness.reduce((sum, r) => sum + r.score, 0) / last7Days.readiness.length
    };

    const previousWeekAvg = {
      sleep: previous7Days.sleep.reduce((sum, s) => sum + s.score, 0) / Math.max(previous7Days.sleep.length, 1),
      activity: previous7Days.activity.reduce((sum, a) => sum + a.score, 0) / Math.max(previous7Days.activity.length, 1),
      readiness: previous7Days.readiness.reduce((sum, r) => sum + r.score, 0) / Math.max(previous7Days.readiness.length, 1)
    };

    const overallAvg = (currentWeekAvg.sleep + currentWeekAvg.activity + currentWeekAvg.readiness) / 3;

    return {
      weekNumber,
      dateRange: {
        start: last7Days.sleep[0]?.day || '',
        end: last7Days.sleep[last7Days.sleep.length - 1]?.day || ''
      },
      summary: overallAvg >= 85
        ? 'Excellent week! You maintained high performance across all metrics.'
        : overallAvg >= 70
        ? 'Solid week with good overall health metrics.'
        : 'Challenging week - focus on recovery and self-care.',
      highlights: [
        currentWeekAvg.sleep >= 85 ? 'Outstanding sleep quality this week' : null,
        currentWeekAvg.activity >= 85 ? 'Maintained excellent activity levels' : null,
        currentWeekAvg.readiness >= 85 ? 'Optimal recovery throughout the week' : null
      ].filter(Boolean) as string[],
      concerns: [
        currentWeekAvg.sleep < 70 ? 'Sleep quality needs attention' : null,
        currentWeekAvg.activity < 70 ? 'Activity levels below optimal' : null,
        currentWeekAvg.readiness < 70 ? 'Recovery has been compromised' : null
      ].filter(Boolean) as string[],
      achievements: [],
      weekOverWeekComparison: [
        {
          metric: 'Sleep',
          change: Math.round(((currentWeekAvg.sleep - previousWeekAvg.sleep) / previousWeekAvg.sleep) * 100),
          trend: currentWeekAvg.sleep > previousWeekAvg.sleep ? 'up' as const : currentWeekAvg.sleep < previousWeekAvg.sleep ? 'down' as const : 'stable' as const
        },
        {
          metric: 'Activity',
          change: Math.round(((currentWeekAvg.activity - previousWeekAvg.activity) / previousWeekAvg.activity) * 100),
          trend: currentWeekAvg.activity > previousWeekAvg.activity ? 'up' as const : currentWeekAvg.activity < previousWeekAvg.activity ? 'down' as const : 'stable' as const
        },
        {
          metric: 'Readiness',
          change: Math.round(((currentWeekAvg.readiness - previousWeekAvg.readiness) / previousWeekAvg.readiness) * 100),
          trend: currentWeekAvg.readiness > previousWeekAvg.readiness ? 'up' as const : currentWeekAvg.readiness < previousWeekAvg.readiness ? 'down' as const : 'stable' as const
        }
      ],
      recommendations: [
        'Continue monitoring your key metrics',
        'Maintain consistent sleep schedule',
        'Balance activity with adequate recovery'
      ],
      nextWeekFocus: [
        currentWeekAvg.sleep < 80 ? 'Prioritize sleep quality' : 'Maintain excellent sleep habits',
        currentWeekAvg.activity < 80 ? 'Increase daily movement' : 'Keep up great activity levels',
        currentWeekAvg.readiness < 80 ? 'Focus on recovery practices' : 'Sustain optimal readiness'
      ]
    };
  }

  /**
   * ANOMALY DETECTION
   * Detect unusual patterns that may indicate health issues
   */
  static detectHealthAnomalies(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): HealthAnomaly[] {
    const anomalies: HealthAnomaly[] = [];

    if (sleep.length < 7) return anomalies;

    // Calculate baseline statistics
    const sleepScores = sleep.map(s => s.score);
    const readinessScores = readiness.map(r => r.score);
    const activityScores = activity.map(a => a.score);
    const restingHRs = readiness.map(r => r.resting_heart_rate || 60);
    const hrvValues = readiness.map(r => r.hrv_balance || 10);

    const calculateStats = (values: number[]) => {
      const mean = values.reduce((a, b) => a + b) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      return { mean, stdDev };
    };

    // Check for sudden sleep score drop
    const recentSleepAvg = sleep.slice(-3).reduce((sum, s) => sum + s.score, 0) / 3;
    const sleepStats = calculateStats(sleepScores);
    const sleepDeviation = (sleepStats.mean - recentSleepAvg) / sleepStats.stdDev;

    if (sleepDeviation > 1.5) {
      anomalies.push({
        type: 'warning',
        metric: 'Sleep Quality',
        description: `Recent sleep quality significantly below your normal baseline`,
        currentValue: Math.round(recentSleepAvg),
        expectedRange: {
          min: Math.round(sleepStats.mean - sleepStats.stdDev),
          max: Math.round(sleepStats.mean + sleepStats.stdDev)
        },
        deviation: sleepDeviation,
        possibleCauses: [
          'Increased stress or anxiety',
          'Changes in sleep environment',
          'Irregular sleep schedule',
          'Illness or infection brewing'
        ],
        recommendedActions: [
          'Maintain strict sleep schedule for next 3 days',
          'Avoid caffeine after 12 PM',
          'Practice relaxation techniques before bed',
          'Monitor for signs of illness'
        ],
        urgency: sleepDeviation > 2 ? 'high' : 'medium',
        detectedOn: new Date().toISOString().split('T')[0]
      });
    }

    // Check for elevated resting heart rate
    const recentHR = restingHRs.slice(-3).reduce((sum, hr) => sum + hr, 0) / 3;
    const hrStats = calculateStats(restingHRs);
    const hrDeviation = (recentHR - hrStats.mean) / hrStats.stdDev;

    if (hrDeviation > 1.8) {
      anomalies.push({
        type: hrDeviation > 2.5 ? 'critical' : 'warning',
        metric: 'Resting Heart Rate',
        description: `Resting heart rate elevated ${Math.round(recentHR - hrStats.mean)} bpm above normal`,
        currentValue: Math.round(recentHR),
        expectedRange: {
          min: Math.round(hrStats.mean - hrStats.stdDev),
          max: Math.round(hrStats.mean + hrStats.stdDev)
        },
        deviation: hrDeviation,
        possibleCauses: [
          'Overtraining or insufficient recovery',
          'Dehydration',
          'Stress or illness',
          'Poor sleep quality',
          'Caffeine or stimulant use'
        ],
        recommendedActions: [
          'Take 1-2 complete rest days',
          'Increase hydration',
          'Monitor body temperature for fever',
          'Reduce exercise intensity by 50%',
          'Consider consulting healthcare provider if persists'
        ],
        urgency: hrDeviation > 2.5 ? 'critical' : 'high',
        detectedOn: new Date().toISOString().split('T')[0]
      });
    }

    // Check for sudden HRV drop
    const recentHRV = hrvValues.slice(-3).reduce((sum, hrv) => sum + hrv, 0) / 3;
    const hrvStats = calculateStats(hrvValues);
    const hrvDeviation = (hrvStats.mean - recentHRV) / Math.max(hrvStats.stdDev, 1);

    if (hrvDeviation > 1.5 && recentHRV > 0) {
      anomalies.push({
        type: 'warning',
        metric: 'Heart Rate Variability',
        description: `HRV dropped significantly - indicating accumulated stress or fatigue`,
        currentValue: Math.round(recentHRV),
        expectedRange: {
          min: Math.round(hrvStats.mean - hrvStats.stdDev),
          max: Math.round(hrvStats.mean + hrvStats.stdDev)
        },
        deviation: hrvDeviation,
        possibleCauses: [
          'Accumulated training stress',
          'Mental/emotional stress',
          'Insufficient recovery',
          'Alcohol consumption',
          'Late meals or poor nutrition'
        ],
        recommendedActions: [
          'Prioritize stress management techniques',
          'Ensure 8+ hours of sleep',
          'Practice meditation or breathing exercises',
          'Reduce training load by 30-40%',
          'Avoid alcohol for next few days'
        ],
        urgency: 'medium',
        detectedOn: new Date().toISOString().split('T')[0]
      });
    }

    // Check for concerning trends (3+ days of declining readiness)
    const last3Readiness = readiness.slice(-3);
    if (last3Readiness.length === 3) {
      const isDeclining = last3Readiness[0].score > last3Readiness[1].score &&
                          last3Readiness[1].score > last3Readiness[2].score;
      const totalDrop = last3Readiness[0].score - last3Readiness[2].score;

      if (isDeclining && totalDrop > 15) {
        anomalies.push({
          type: 'warning',
          metric: 'Recovery Trend',
          description: `Readiness declining for 3 consecutive days (${totalDrop} point drop)`,
          currentValue: last3Readiness[2].score,
          expectedRange: { min: 70, max: 100 },
          deviation: totalDrop / 10,
          possibleCauses: [
            'Cumulative fatigue building',
            'Insufficient rest days',
            'Poor sleep quality',
            'High stress levels',
            'Overtraining syndrome developing'
          ],
          recommendedActions: [
            'URGENT: Take immediate rest day',
            'Evaluate training load and reduce if necessary',
            'Focus on sleep optimization',
            'Consider active recovery only for next 2-3 days',
            'Monitor closely for signs of burnout'
          ],
          urgency: 'high',
          detectedOn: new Date().toISOString().split('T')[0]
        });
      }
    }

    return anomalies.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  /**
   * PERSONALIZED COACHING
   * Generate dynamic coaching based on individual patterns and goals
   */
  static generatePersonalizedCoaching(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): PersonalizedCoaching {
    const recent7 = {
      sleep: sleep.slice(-7),
      activity: activity.slice(-7),
      readiness: readiness.slice(-7)
    };

    const averages = {
      sleep: recent7.sleep.reduce((sum, s) => sum + s.score, 0) / recent7.sleep.length,
      activity: recent7.activity.reduce((sum, a) => sum + a.score, 0) / recent7.activity.length,
      readiness: recent7.readiness.reduce((sum, r) => sum + r.score, 0) / recent7.readiness.length
    };

    // Identify primary goal based on weakest area
    const scores = [
      { area: 'sleep', score: averages.sleep },
      { area: 'activity', score: averages.activity },
      { area: 'recovery', score: averages.readiness }
    ];
    scores.sort((a, b) => a.score - b.score);
    const weakestArea = scores[0].area;
    const strongestArea = scores[2].area;

    // Goal setting
    let currentGoal: string;
    let weeklyFocus: string;
    let progressToGoal: number;

    if (weakestArea === 'sleep') {
      currentGoal = `Improve sleep quality to 85+ average`;
      weeklyFocus = 'Sleep Optimization';
      progressToGoal = Math.min(100, (averages.sleep / 85) * 100);
    } else if (weakestArea === 'activity') {
      currentGoal = `Achieve consistent 80+ activity scores`;
      weeklyFocus = 'Movement & Exercise';
      progressToGoal = Math.min(100, (averages.activity / 80) * 100);
    } else {
      currentGoal = `Enhance recovery to 85+ readiness`;
      weeklyFocus = 'Recovery & Restoration';
      progressToGoal = Math.min(100, (averages.readiness / 85) * 100);
    }

    // Generate personalized daily tips
    const dailyTips: string[] = [];
    const latestReadiness = readiness[readiness.length - 1];
    const latestSleep = sleep[sleep.length - 1];

    if (latestReadiness.score >= 85) {
      dailyTips.push('Your body is primed for performance - consider a challenging workout');
    } else if (latestReadiness.score < 65) {
      dailyTips.push('Prioritize rest today - your body needs recovery more than activity');
    }

    if (latestSleep.efficiency < 85) {
      dailyTips.push('Consider going to bed 30 minutes earlier tonight to improve sleep efficiency');
    }

    if (latestReadiness.hrv_balance && latestReadiness.hrv_balance < 8) {
      dailyTips.push('Low HRV detected - practice 10 minutes of breathwork or meditation');
    }

    dailyTips.push('Stay hydrated - aim for half your body weight in ounces of water');

    // Custom recommendations
    const customRecommendations = {
      sleep: [
        averages.sleep < 80 ? 'Set consistent bedtime at 10:00-10:30 PM' : 'Maintain your excellent sleep schedule',
        'Keep bedroom temperature at 65-68°F for optimal deep sleep',
        'Avoid screens 60-90 minutes before bed',
        latestSleep.deep_sleep_duration / 60 < 60 ? 'Focus on deep sleep: avoid alcohol, keep room cool' : 'Deep sleep is good - keep current habits'
      ],
      activity: [
        averages.activity < 75 ? 'Aim for 8,000-10,000 steps daily' : 'Great activity level - maintain consistency',
        'Include both cardio and strength training each week',
        'Take movement breaks every 60-90 minutes when sedentary',
        'Schedule workouts during your peak energy windows (9-11 AM)'
      ],
      recovery: [
        'Prioritize 7-9 hours of sleep nightly',
        averages.readiness < 75 ? 'Add one extra rest day per week' : 'Current recovery practices are working well',
        'Practice stress management: meditation, yoga, or nature walks',
        'Consider foam rolling or massage for muscle recovery'
      ]
    };

    // Next milestone
    const daysToAchieve = Math.ceil((85 - scores[0].score) / 2); // Assuming 2 points improvement per day
    const nextMilestone = {
      description: `Achieve ${weakestArea} score of 85+`,
      daysToAchieve: Math.max(3, Math.min(daysToAchieve, 14)),
      requiredActions: [
        weakestArea === 'sleep' ? 'Maintain strict sleep schedule (same bedtime/wake time)' :
        weakestArea === 'activity' ? 'Complete 30 minutes of moderate activity daily' :
        'Take proper rest days and avoid overtraining',
        'Track progress daily and adjust as needed',
        'Stay consistent with healthy habits'
      ]
    };

    // Motivational message
    const motivationalMessages = {
      high: [
        `Outstanding! You're in the top tier of health metrics. Keep pushing your limits! 🚀`,
        `Exceptional performance! Your dedication is paying off in measurable ways. 💪`,
        `You're firing on all cylinders! This is your time to achieve your biggest goals. ⭐`
      ],
      good: [
        `Solid work! You're building great momentum. Small improvements compound over time. 📈`,
        `You're on the right track! Focus on consistency and the results will follow. 🎯`,
        `Good progress! Every healthy choice you make is an investment in your future self. 🌱`
      ],
      fair: [
        `You're making progress, but there's room to level up! Small changes make big impacts. 💡`,
        `This is your opportunity to transform your health. Start with one area and build from there. 🔥`,
        `Remember: every champion was once a contender who refused to give up. Keep going! 🏆`
      ]
    };

    const overallScore = (averages.sleep + averages.activity + averages.readiness) / 3;
    const motivationalTier = overallScore >= 85 ? 'high' : overallScore >= 70 ? 'good' : 'fair';
    const motivationalMessage = motivationalMessages[motivationalTier][
      Math.floor(Math.random() * motivationalMessages[motivationalTier].length)
    ];

    return {
      currentGoal,
      progressToGoal: Math.round(progressToGoal),
      weeklyFocus,
      dailyTips,
      motivationalMessage,
      customRecommendations,
      nextMilestone,
      strengthsToLeverage: [
        strongestArea === 'sleep' ? 'Your sleep quality is excellent - this supports everything else' :
        strongestArea === 'activity' ? 'Your activity levels are strong - you have great energy' :
        'Your recovery is solid - you can handle more challenges',
        `Consistent ${strongestArea} performance gives you a strong foundation`
      ],
      areasForImprovement: [
        weakestArea === 'sleep' ? 'Focus on sleep optimization for better overall health' :
        weakestArea === 'activity' ? 'Increase movement and exercise consistency' :
        'Prioritize recovery and stress management',
        `Improving ${weakestArea} will unlock your next level of performance`
      ]
    };
  }

  /**
   * ADVANCED CORRELATION ANALYSIS
   * Find deep relationships between different health metrics
   */
  static analyzeAdvancedCorrelations(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): AdvancedCorrelation[] {
    const correlations: AdvancedCorrelation[] = [];

    if (sleep.length < 14) return correlations;

    // Helper to calculate Pearson correlation coefficient
    const calculateCorrelation = (x: number[], y: number[]): number => {
      const n = Math.min(x.length, y.length);
      if (n < 2) return 0;

      const meanX = x.reduce((a, b) => a + b) / n;
      const meanY = y.reduce((a, b) => a + b) / n;

      let numerator = 0;
      let denomX = 0;
      let denomY = 0;

      for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
      }

      const denominator = Math.sqrt(denomX * denomY);
      return denominator === 0 ? 0 : numerator / denominator;
    };

    const getRelationshipType = (r: number): AdvancedCorrelation['relationshipType'] => {
      const abs = Math.abs(r);
      if (abs > 0.7) return r > 0 ? 'strong positive' : 'strong negative';
      if (abs > 0.4) return r > 0 ? 'moderate positive' : 'moderate negative';
      if (abs > 0.2) return r > 0 ? 'weak positive' : 'weak negative';
      return 'none';
    };

    // Sleep Efficiency vs Next Day Readiness
    const sleepEfficiencies = sleep.slice(0, -1).map(s => s.efficiency);
    const nextDayReadiness = readiness.slice(1).map(r => r.score);
    const efficiencyReadinessCorr = calculateCorrelation(sleepEfficiencies, nextDayReadiness);

    if (Math.abs(efficiencyReadinessCorr) > 0.3) {
      correlations.push({
        primaryMetric: 'Sleep Efficiency',
        secondaryMetric: 'Next Day Readiness',
        correlationStrength: efficiencyReadinessCorr,
        relationshipType: getRelationshipType(efficiencyReadinessCorr),
        insights: [
          `Every 10% improvement in sleep efficiency correlates with ~${Math.abs(efficiencyReadinessCorr * 10).toFixed(1)} point change in readiness`,
          efficiencyReadinessCorr > 0.5 ? 'Strong evidence that sleep quality drives your readiness' :
          'Moderate connection between sleep efficiency and recovery',
          'This relationship is consistent in your personal data'
        ],
        practicalApplication: efficiencyReadinessCorr > 0.4 ?
          'Prioritize sleep efficiency by maintaining consistent schedule and optimizing sleep environment' :
          'Sleep efficiency affects readiness, but other factors also play a role',
        confidence: Math.min(0.95, 0.6 + (Math.abs(efficiencyReadinessCorr) * 0.4)),
        sampleSize: sleepEfficiencies.length,
        visualData: sleepEfficiencies.map((x, i) => ({ x, y: nextDayReadiness[i] }))
      });
    }

    // Deep Sleep vs Recovery
    const deepSleepDurations = sleep.map(s => s.deep_sleep_duration / 60);
    const readinessScores = readiness.map(r => r.score);
    const deepSleepRecoveryCorr = calculateCorrelation(deepSleepDurations, readinessScores);

    if (Math.abs(deepSleepRecoveryCorr) > 0.25) {
      correlations.push({
        primaryMetric: 'Deep Sleep Duration',
        secondaryMetric: 'Readiness Score',
        correlationStrength: deepSleepRecoveryCorr,
        relationshipType: getRelationshipType(deepSleepRecoveryCorr),
        insights: [
          `${Math.abs(deepSleepRecoveryCorr) > 0.5 ? 'Strong' : 'Moderate'} correlation found between deep sleep and recovery`,
          `Optimal deep sleep range for you appears to be 60-110 minutes`,
          'Deep sleep is when physical recovery primarily occurs'
        ],
        practicalApplication: 'Enhance deep sleep by: keeping room cool (65-68°F), avoiding alcohol, consistent sleep schedule',
        confidence: 0.75,
        sampleSize: deepSleepDurations.length,
        visualData: deepSleepDurations.map((x, i) => ({ x, y: readinessScores[i] }))
      });
    }

    // Activity Load vs Sleep Quality
    const activityScores = activity.map(a => a.score);
    const sleepScores = sleep.map(s => s.score);
    const activitySleepCorr = calculateCorrelation(activityScores, sleepScores);

    if (Math.abs(activitySleepCorr) > 0.2) {
      correlations.push({
        primaryMetric: 'Activity Level',
        secondaryMetric: 'Sleep Quality',
        correlationStrength: activitySleepCorr,
        relationshipType: getRelationshipType(activitySleepCorr),
        insights: [
          activitySleepCorr > 0 ? 'Higher activity levels correlate with better sleep' :
          'Very high activity may be disrupting sleep quality',
          'Balance is key - both too little and too much activity can affect sleep',
          activitySleepCorr < -0.3 ? 'Consider reducing workout intensity or adding rest days' :
          'Current activity levels support good sleep'
        ],
        practicalApplication: activitySleepCorr > 0 ?
          'Maintain regular physical activity to support sleep quality' :
          'Monitor for signs of overtraining affecting sleep - may need more recovery time',
        confidence: 0.70,
        sampleSize: activityScores.length,
        visualData: activityScores.map((x, i) => ({ x, y: sleepScores[i] }))
      });
    }

    // HRV vs Readiness
    const hrvValues = readiness.map(r => r.hrv_balance || 10).filter(h => h > 0);
    const readinessForHRV = readiness.filter(r => (r.hrv_balance || 0) > 0).map(r => r.score);
    const hrvReadinessCorr = calculateCorrelation(hrvValues, readinessForHRV);

    if (Math.abs(hrvReadinessCorr) > 0.3 && hrvValues.length > 5) {
      correlations.push({
        primaryMetric: 'Heart Rate Variability',
        secondaryMetric: 'Readiness',
        correlationStrength: hrvReadinessCorr,
        relationshipType: getRelationshipType(hrvReadinessCorr),
        insights: [
          'HRV is a strong predictor of your recovery state',
          'Higher HRV indicates better stress resilience and recovery',
          hrvReadinessCorr > 0.5 ? 'HRV is one of your most reliable readiness indicators' :
          'HRV provides useful recovery insights for your body'
        ],
        practicalApplication: 'Improve HRV through: consistent sleep, stress management, avoiding alcohol, meditation',
        confidence: 0.85,
        sampleSize: hrvValues.length,
        visualData: hrvValues.map((x, i) => ({ x, y: readinessForHRV[i] }))
      });
    }

    return correlations.sort((a, b) => Math.abs(b.correlationStrength) - Math.abs(a.correlationStrength));
  }

  /**
   * RECOVERY PREDICTION MODEL
   * Predict recovery timeline based on current state
   */
  static predictRecoveryTimeline(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): RecoveryPrediction {
    const latestReadiness = readiness[readiness.length - 1];
    const last7Readiness = readiness.slice(-7);
    const avgReadiness = last7Readiness.reduce((sum, r) => sum + r.score, 0) / last7Readiness.length;

    // Determine current recovery state
    let currentRecoveryState: RecoveryPrediction['currentRecoveryState'];
    if (avgReadiness >= 85) currentRecoveryState = 'fully recovered';
    else if (avgReadiness >= 75) currentRecoveryState = 'well recovered';
    else if (avgReadiness >= 65) currentRecoveryState = 'moderately recovered';
    else if (avgReadiness >= 50) currentRecoveryState = 'poorly recovered';
    else currentRecoveryState = 'severely fatigued';

    // Calculate recovery trajectory
    const targetScore = 85; // Full recovery threshold
    const currentScore = latestReadiness.score;
    const deficit = Math.max(0, targetScore - currentScore);

    // Estimate recovery rate based on recent trends
    const trend = readiness.length >= 3 ?
      (readiness[readiness.length - 1].score - readiness[readiness.length - 3].score) / 2 :
      1;

    const recoveryRate = Math.max(1, trend > 0 ? trend + 1 : 1); // Minimum 1 point per day improvement
    const estimatedDays = Math.ceil(deficit / recoveryRate);

    // Generate recovery trajectory
    const recoveryTrajectory = [];
    for (let day = 1; day <= Math.min(estimatedDays + 2, 7); day++) {
      const predictedScore = Math.min(100, currentScore + (recoveryRate * day));
      recoveryTrajectory.push({
        day,
        predictedReadiness: Math.round(predictedScore),
        confidence: Math.max(0.5, 0.9 - (day * 0.08)) // Confidence decreases with time
      });
    }

    // Identify key factors
    const latestSleep = sleep[sleep.length - 1];
    const latestActivity = activity[activity.length - 1];
    const keyFactors = [];

    if (latestSleep.efficiency >= 85) {
      keyFactors.push({ factor: 'Good sleep efficiency', impact: 'helping' as const, weight: 0.3 });
    } else {
      keyFactors.push({ factor: 'Poor sleep efficiency', impact: 'hindering' as const, weight: 0.3 });
    }

    if (latestReadiness.hrv_balance && latestReadiness.hrv_balance > 10) {
      keyFactors.push({ factor: 'Healthy HRV levels', impact: 'helping' as const, weight: 0.25 });
    } else if (latestReadiness.hrv_balance && latestReadiness.hrv_balance < 8) {
      keyFactors.push({ factor: 'Low HRV indicating stress', impact: 'hindering' as const, weight: 0.25 });
    }

    if (latestActivity.score > 90) {
      keyFactors.push({ factor: 'High activity load', impact: 'hindering' as const, weight: 0.2 });
    } else if (latestActivity.score < 70) {
      keyFactors.push({ factor: 'Appropriate rest level', impact: 'helping' as const, weight: 0.2 });
    }

    if (latestSleep.deep_sleep_duration / 60 >= 60) {
      keyFactors.push({ factor: 'Adequate deep sleep', impact: 'helping' as const, weight: 0.25 });
    }

    // Recommended interventions
    const recommendedInterventions = [];
    if (currentRecoveryState !== 'fully recovered') {
      if (latestSleep.efficiency < 85) {
        recommendedInterventions.push({
          intervention: 'Optimize sleep schedule - consistent 8+ hours',
          expectedBenefit: 'Could accelerate recovery by 1-2 days',
          priority: 'high' as const
        });
      }

      if (latestActivity.score > 85) {
        recommendedInterventions.push({
          intervention: 'Reduce training load by 40-50% for next 2-3 days',
          expectedBenefit: 'Allow body to fully recover and prevent deeper fatigue',
          priority: 'high' as const
        });
      }

      recommendedInterventions.push({
        intervention: 'Practice daily stress management (meditation, breathwork)',
        expectedBenefit: 'Improve HRV and support nervous system recovery',
        priority: 'medium' as const
      });

      if (latestReadiness.hrv_balance && latestReadiness.hrv_balance < 8) {
        recommendedInterventions.push({
          intervention: 'Avoid alcohol and limit caffeine to morning only',
          expectedBenefit: 'Support HRV recovery and sleep quality',
          priority: 'medium' as const
        });
      }
    }

    // Risk factors
    const riskFactors = [];
    if (estimatedDays > 5) riskFactors.push('Extended recovery period may indicate overtraining');
    if (trend < 0) riskFactors.push('Declining readiness trend - intervention needed');
    if (latestReadiness.hrv_balance && latestReadiness.hrv_balance < 5) riskFactors.push('Very low HRV - high stress or fatigue');
    if (avgReadiness < 65) riskFactors.push('Prolonged low readiness increases injury risk');

    return {
      currentRecoveryState,
      estimatedDaysToFullRecovery: Math.max(0, estimatedDays),
      recoveryTrajectory,
      keyFactorsAffectingRecovery: keyFactors,
      recommendedInterventions,
      riskFactors
    };
  }

  /**
   * OPTIMAL TIMING RECOMMENDATIONS
   * Recommend best times for specific activities based on personal patterns
   */
  static getOptimalTimingRecommendations(
    readiness: ReadinessData[],
    activity: ActivityData[],
    activityType: 'workout' | 'important_work' | 'creative_work' | 'social' | 'rest' = 'workout'
  ): OptimalTimingRecommendation {
    const latestReadiness = readiness[readiness.length - 1];
    const avgReadiness = readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / Math.min(7, readiness.length);

    const basePerformance = Math.min(100, latestReadiness.score);

    // Activity-specific optimal windows
    const recommendations: { [key: string]: OptimalTimingRecommendation } = {
      workout: {
        activity: 'Intense Workout',
        optimalTimeWindow: avgReadiness >= 85 ? '9:00 AM - 11:00 AM' : '10:00 AM - 12:00 PM',
        reasoning: [
          'Cortisol and testosterone levels peak in morning, optimizing strength and power',
          'Core body temperature rising supports physical performance',
          'Post-workout recovery won\'t disrupt evening sleep',
          latestReadiness.score >= 85 ? 'Your high readiness supports intense morning training' :
          'Moderate readiness suggests slightly later start after full wake-up'
        ],
        expectedPerformance: Math.min(100, basePerformance * 0.95),
        alternativeWindows: [
          { time: '4:00 PM - 6:00 PM', performance: Math.round(basePerformance * 0.90) },
          { time: '12:00 PM - 2:00 PM', performance: Math.round(basePerformance * 0.80) }
        ],
        avoidTimes: [
          'Before 7:00 AM (insufficient warm-up time)',
          'After 7:00 PM (may disrupt sleep)',
          'Immediately after meals'
        ],
        personalizedTips: [
          'Warm up for 10-15 minutes before intense exercise',
          'Hydrate with 16-20oz water 2 hours before workout',
          latestReadiness.hrv_balance && latestReadiness.hrv_balance < 8 ?
            'Low HRV today - consider reducing intensity by 20%' :
            'HRV supports full intensity training',
          'Finish workouts at least 4 hours before planned bedtime'
        ]
      },
      important_work: {
        activity: 'Important Work/Decisions',
        optimalTimeWindow: '9:00 AM - 12:00 PM',
        reasoning: [
          'Peak cognitive performance occurs 2-4 hours after waking',
          'Prefrontal cortex (decision-making) most active mid-morning',
          'Mental fatigue minimal in morning hours',
          'Fewer distractions early in workday'
        ],
        expectedPerformance: Math.min(100, basePerformance * 0.95),
        alternativeWindows: [
          { time: '2:00 PM - 4:00 PM', performance: Math.round(basePerformance * 0.82) },
          { time: '7:00 AM - 9:00 AM', performance: Math.round(basePerformance * 0.85) }
        ],
        avoidTimes: [
          '1:00 PM - 2:00 PM (post-lunch dip)',
          'After 6:00 PM (decision fatigue high)',
          'First 30 minutes after waking'
        ],
        personalizedTips: [
          'Schedule most critical decisions before noon',
          'Take 5-minute breaks every 90 minutes',
          'Avoid checking email first thing - protect peak hours for important work',
          latestReadiness.score < 70 ?
            'Lower readiness today - allow extra time for important tasks' :
            'High readiness supports complex problem-solving'
        ]
      },
      creative_work: {
        activity: 'Creative/Innovative Work',
        optimalTimeWindow: avgReadiness >= 75 ? '10:00 AM - 12:00 PM' : '3:00 PM - 5:00 PM',
        reasoning: [
          'Default mode network (creativity) most active during relaxed alertness',
          'Morning: structured creativity and problem-solving',
          'Afternoon: associative thinking and ideation peaks',
          latestReadiness.score >= 75 ?
            'Good recovery supports morning creative work' :
            'Lower energy better suited for afternoon creative flow'
        ],
        expectedPerformance: Math.min(100, basePerformance * 0.90),
        alternativeWindows: [
          { time: '7:00 PM - 9:00 PM', performance: Math.round(basePerformance * 0.75) },
          { time: '2:00 PM - 4:00 PM', performance: Math.round(basePerformance * 0.85) }
        ],
        avoidTimes: [
          'Immediately after intense meetings',
          'During peak stress periods',
          'When overly tired (after 9:00 PM)'
        ],
        personalizedTips: [
          'Allow for uninterrupted blocks of 2+ hours',
          'Moderate caffeine - too much can hinder creative flow',
          'Take walking breaks to boost creative thinking',
          'Keep notepad handy for sudden insights throughout day'
        ]
      },
      social: {
        activity: 'Social Activities',
        optimalTimeWindow: '6:00 PM - 9:00 PM',
        reasoning: [
          'Evening cortisol decline supports relaxation and social bonding',
          'Work responsibilities typically complete',
          'Social energy peaks in early evening for most people',
          'Aligns with typical social norms and availability'
        ],
        expectedPerformance: Math.min(100, basePerformance * 0.85),
        alternativeWindows: [
          { time: '12:00 PM - 2:00 PM', performance: Math.round(basePerformance * 0.80) },
          { time: '4:00 PM - 6:00 PM', performance: Math.round(basePerformance * 0.82) }
        ],
        avoidTimes: [
          'Late night (after 10:00 PM) if sleep is priority',
          'Early morning when energy needed for work',
          'During planned rest/recovery periods'
        ],
        personalizedTips: [
          latestReadiness.score < 65 ?
            'Low readiness - consider lighter social activities or postpone' :
            'Good energy for enjoying social connections',
          'Balance social alcohol with water and food',
          'Set boundaries on late nights to protect sleep',
          'Quality social connection supports mental health and recovery'
        ]
      },
      rest: {
        activity: 'Rest & Recovery',
        optimalTimeWindow: '8:00 PM - 10:00 PM',
        reasoning: [
          'Natural melatonin release begins as light fades',
          'Winding down supports quality sleep onset',
          'Parasympathetic nervous system activation peaks',
          'Creating buffer between activity and sleep optimizes recovery'
        ],
        expectedPerformance: 100, // Rest is always beneficial
        alternativeWindows: [
          { time: '1:00 PM - 2:00 PM', performance: 85 },
          { time: '3:00 PM - 4:00 PM', performance: 75 }
        ],
        avoidTimes: [
          'Right before important activities',
          'During peak productivity hours (9-12 AM)',
          'Instead of needed exercise/movement'
        ],
        personalizedTips: [
          'Create consistent evening wind-down routine',
          'Dim lights 2 hours before target bedtime',
          'Avoid screens - try reading, stretching, or meditation',
          latestReadiness.score < 70 ?
            'Prioritize extra rest - your body needs it for recovery' :
            'Good readiness - maintain consistent rest schedule to sustain performance',
          'Quality rest is as important as quality training'
        ]
      }
    };

    return recommendations[activityType] || recommendations.workout;
  }
}

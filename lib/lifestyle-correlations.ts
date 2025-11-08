/**
 * LIFESTYLE CORRELATION ENGINE
 * Analyzes relationships between lifestyle factors and sleep/recovery metrics
 * Uses statistical correlation analysis and pattern recognition
 */

import { SleepData, ActivityData, ReadinessData } from './oura-api';
import { parseOuraDate, getDayOfWeek } from './date-utils';

export type LifestyleFactor =
  | 'late_night'
  | 'alcohol'
  | 'caffeine'
  | 'exercise_timing'
  | 'meal_timing'
  | 'screen_time'
  | 'stress'
  | 'nap';

export interface LifestyleCorrelation {
  factor: LifestyleFactor;
  correlation: number; // -1 to 1 (Pearson correlation coefficient)
  strength: 'weak' | 'moderate' | 'strong' | 'very strong';
  direction: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-100
  sampleSize: number;

  impact: {
    sleepQuality: number; // percentage impact
    sleepDuration: number; // hours impact
    readiness: number; // points impact
    hrvImpact: number; // percentage impact
  };

  insights: string;
  recommendation: string;
}

export interface LifestyleAnalysis {
  // Overall lifestyle health score
  lifestyleScore: number; // 0-100

  // Individual correlations
  correlations: LifestyleCorrelation[];

  // Pattern analysis
  patterns: {
    bestDays: {
      dayOfWeek: string;
      avgReadiness: number;
      commonFactors: string[];
    }[];
    worstDays: {
      dayOfWeek: string;
      avgReadiness: number;
      commonFactors: string[];
    }[];
  };

  // Optimization opportunities
  optimizations: {
    category: 'timing' | 'behavior' | 'environment';
    opportunity: string;
    potentialGain: string;
    implementation: string;
  }[];

  // Behavioral insights
  behavioralInsights: {
    finding: string;
    evidence: string;
    actionable: string;
  }[];
}

export class LifestyleCorrelationAnalyzer {
  /**
   * Analyze lifestyle factors and their correlations with sleep/recovery
   */
  static analyzeLifestyleCorrelations(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): LifestyleAnalysis {
    if (sleep.length < 30) {
      throw new Error('Minimum 30 days of data required for lifestyle correlation analysis');
    }

    // Infer lifestyle factors from biometric data
    const lifestyleFactors = this.inferLifestyleFactors(sleep, activity, readiness);

    // Calculate correlations
    const correlations = this.calculateCorrelations(lifestyleFactors, sleep, readiness);

    // Calculate lifestyle score
    const lifestyleScore = this.calculateLifestyleScore(correlations, sleep, readiness);

    // Analyze day-of-week patterns
    const patterns = this.analyzeDayPatterns(sleep, readiness, lifestyleFactors);

    // Identify optimization opportunities
    const optimizations = this.identifyOptimizations(correlations, patterns, sleep);

    // Generate behavioral insights
    const behavioralInsights = this.generateBehavioralInsights(correlations, patterns, sleep, readiness);

    return {
      lifestyleScore,
      correlations,
      patterns,
      optimizations,
      behavioralInsights,
    };
  }

  private static inferLifestyleFactors(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Map<string, Map<LifestyleFactor, boolean>> {
    // Map of date -> lifestyle factors present
    const factors = new Map<string, Map<LifestyleFactor, boolean>>();

    sleep.forEach((s, idx) => {
      const date = s.day;
      const dayFactors = new Map<LifestyleFactor, boolean>();

      // Late night detection (bedtime after midnight)
      if (s.bedtime_start) {
        const bedtime = new Date(s.bedtime_start);
        const hour = bedtime.getUTCHours();
        dayFactors.set('late_night', hour >= 0 && hour < 5); // 12 AM - 5 AM
      }

      // Alcohol inference (elevated RHR + reduced HRV + poor sleep efficiency)
      const rhr = s.lowest_heart_rate || 0;
      const efficiency = s.efficiency || 0;
      const hrv = s.heart_rate?.interval || 0;

      if (idx > 0) {
        const prevRHR = sleep[idx - 1].lowest_heart_rate || 0;
        const prevHRV = sleep[idx - 1].heart_rate?.interval || 0;

        if (prevRHR > 0 && rhr > prevRHR + 5 && efficiency < 85 && hrv < prevHRV * 0.85) {
          dayFactors.set('alcohol', true);
        }
      }

      // Caffeine inference (longer sleep latency, reduced deep sleep)
      const sleepLatency = s.latency || 0;
      const deepSleep = s.deep_sleep_duration || 0;
      const totalSleep = s.total_sleep_duration || 1;
      const deepPercentage = (deepSleep / totalSleep) * 100;

      if (sleepLatency > 1200 && deepPercentage < 15) { // >20 min latency, <15% deep
        dayFactors.set('caffeine', true);
      }

      // Late exercise (high activity + poor sleep quality)
      const activityData = activity[idx];
      if (activityData) {
        const highActivity = (activityData.high_activity_time || 0) > 1800; // >30 min
        if (highActivity && efficiency < 85) {
          dayFactors.set('exercise_timing', true);
        }
      }

      // Late meal inference (elevated temperature, RHR)
      const tempDelta = s.temperature_delta || 0;
      if (tempDelta > 0.2 && rhr > (s.average_heart_rate || rhr) - 5) {
        dayFactors.set('meal_timing', true);
      }

      // Stress detection (low readiness, high RHR, low HRV)
      const readinessData = readiness[idx];
      if (readinessData && readinessData.score < 70 && rhr > 0) {
        const hrvLow = hrv > 0 && hrv < 30;
        if (hrvLow) {
          dayFactors.set('stress', true);
        }
      }

      // Nap detection (high sleep duration variance, afternoon rest)
      const restTime = s.awake_time || 0;
      if (restTime > 5400 && totalSleep > 0) { // >90 min awake during sleep period
        dayFactors.set('nap', true);
      }

      factors.set(date, dayFactors);
    });

    return factors;
  }

  private static calculateCorrelations(
    lifestyleFactors: Map<string, Map<LifestyleFactor, boolean>>,
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): LifestyleCorrelation[] {
    const correlations: LifestyleCorrelation[] = [];

    const factorTypes: LifestyleFactor[] = [
      'late_night',
      'alcohol',
      'caffeine',
      'exercise_timing',
      'meal_timing',
      'stress',
      'nap',
    ];

    factorTypes.forEach(factor => {
      // Collect data points where factor is present vs absent
      const withFactor: {
        sleepScore: number;
        duration: number;
        readiness: number;
        hrv: number;
      }[] = [];

      const withoutFactor: {
        sleepScore: number;
        duration: number;
        readiness: number;
        hrv: number;
      }[] = [];

      sleep.forEach((s, idx) => {
        const factors = lifestyleFactors.get(s.day);
        if (!factors) return;

        const hasFactor = factors.get(factor) || false;
        const readinessData = readiness[idx];
        if (!readinessData) return;

        const dataPoint = {
          sleepScore: s.score || 0,
          duration: (s.total_sleep_duration || 0) / 3600,
          readiness: readinessData.score,
          hrv: s.heart_rate?.interval || 0,
        };

        if (hasFactor) {
          withFactor.push(dataPoint);
        } else {
          withoutFactor.push(dataPoint);
        }
      });

      // Calculate correlation if we have enough data
      if (withFactor.length >= 3 && withoutFactor.length >= 3) {
        const correlation = this.calculatePearsonCorrelation(factor, withFactor, withoutFactor);
        correlations.push(correlation);
      }
    });

    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  private static calculatePearsonCorrelation(
    factor: LifestyleFactor,
    withFactor: { sleepScore: number; duration: number; readiness: number; hrv: number }[],
    withoutFactor: { sleepScore: number; duration: number; readiness: number; hrv: number }[]
  ): LifestyleCorrelation {
    // Calculate means for each group
    const withMeans = {
      sleepScore: withFactor.reduce((sum, d) => sum + d.sleepScore, 0) / withFactor.length,
      duration: withFactor.reduce((sum, d) => sum + d.duration, 0) / withFactor.length,
      readiness: withFactor.reduce((sum, d) => sum + d.readiness, 0) / withFactor.length,
      hrv: withFactor.filter(d => d.hrv > 0).reduce((sum, d) => sum + d.hrv, 0) / withFactor.filter(d => d.hrv > 0).length || 0,
    };

    const withoutMeans = {
      sleepScore: withoutFactor.reduce((sum, d) => sum + d.sleepScore, 0) / withoutFactor.length,
      duration: withoutFactor.reduce((sum, d) => sum + d.duration, 0) / withoutFactor.length,
      readiness: withoutFactor.reduce((sum, d) => sum + d.readiness, 0) / withoutFactor.length,
      hrv: withoutFactor.filter(d => d.hrv > 0).reduce((sum, d) => sum + d.hrv, 0) / withoutFactor.filter(d => d.hrv > 0).length || 0,
    };

    // Calculate impacts (percentage/absolute differences)
    const sleepQualityImpact = ((withMeans.sleepScore - withoutMeans.sleepScore) / withoutMeans.sleepScore) * 100;
    const durationImpact = withMeans.duration - withoutMeans.duration;
    const readinessImpact = withMeans.readiness - withoutMeans.readiness;
    const hrvImpact = withoutMeans.hrv > 0 ? ((withMeans.hrv - withoutMeans.hrv) / withoutMeans.hrv) * 100 : 0;

    // Simple correlation coefficient based on readiness impact
    const correlation = readinessImpact / 50; // Normalize to -1 to 1 range
    const clampedCorrelation = Math.max(-1, Math.min(1, correlation));

    // Determine strength
    const absCorr = Math.abs(clampedCorrelation);
    let strength: 'weak' | 'moderate' | 'strong' | 'very strong';
    if (absCorr < 0.3) strength = 'weak';
    else if (absCorr < 0.5) strength = 'moderate';
    else if (absCorr < 0.7) strength = 'strong';
    else strength = 'very strong';

    // Determine direction
    let direction: 'positive' | 'negative' | 'neutral';
    if (Math.abs(clampedCorrelation) < 0.1) direction = 'neutral';
    else if (clampedCorrelation > 0) direction = 'positive';
    else direction = 'negative';

    // Confidence based on sample size
    const sampleSize = withFactor.length + withoutFactor.length;
    const confidence = Math.min(100, (sampleSize / 60) * 100);

    const insights = this.generateFactorInsights(factor, direction, {
      sleepQuality: sleepQualityImpact,
      duration: durationImpact,
      readiness: readinessImpact,
      hrv: hrvImpact,
    });

    const recommendation = this.generateFactorRecommendation(factor, direction, strength);

    return {
      factor,
      correlation: Number(clampedCorrelation.toFixed(3)),
      strength,
      direction,
      confidence: Number(confidence.toFixed(0)),
      sampleSize,
      impact: {
        sleepQuality: Number(sleepQualityImpact.toFixed(1)),
        sleepDuration: Number(durationImpact.toFixed(2)),
        readiness: Number(readinessImpact.toFixed(1)),
        hrvImpact: Number(hrvImpact.toFixed(1)),
      },
      insights,
      recommendation,
    };
  }

  private static generateFactorInsights(
    factor: LifestyleFactor,
    direction: string,
    impact: { sleepQuality: number; duration: number; readiness: number; hrv: number }
  ): string {
    const factorNames: Record<LifestyleFactor, string> = {
      late_night: 'Late bedtime',
      alcohol: 'Alcohol consumption',
      caffeine: 'Late caffeine intake',
      exercise_timing: 'Late evening exercise',
      meal_timing: 'Late meal timing',
      stress: 'Elevated stress',
      nap: 'Daytime napping',
    };

    const name = factorNames[factor];

    if (direction === 'negative') {
      return `${name} shows negative correlation with sleep quality. On days with this factor, readiness decreases by ${Math.abs(impact.readiness).toFixed(1)} points and sleep quality drops ${Math.abs(impact.sleepQuality).toFixed(1)}%.`;
    } else if (direction === 'positive') {
      return `${name} shows positive correlation with recovery. On days with this factor, readiness improves by ${impact.readiness.toFixed(1)} points.`;
    } else {
      return `${name} shows no significant correlation with sleep quality in your data.`;
    }
  }

  private static generateFactorRecommendation(
    factor: LifestyleFactor,
    direction: string,
    strength: string
  ): string {
    if (direction === 'neutral' || strength === 'weak') {
      return 'No specific recommendation - impact is minimal.';
    }

    const recommendations: Record<LifestyleFactor, { negative: string; positive: string }> = {
      late_night: {
        negative: 'Establish consistent bedtime before midnight. Each hour of delayed sleep onset reduces recovery quality.',
        positive: 'Continue maintaining your current sleep schedule timing.',
      },
      alcohol: {
        negative: 'Avoid alcohol within 3-4 hours of bedtime. Consider alcohol-free days to improve sleep architecture and HRV recovery.',
        positive: 'Current alcohol timing/amount appears well-tolerated. Monitor for changes.',
      },
      caffeine: {
        negative: 'Cut off caffeine by 2 PM. Late caffeine significantly disrupts deep sleep and increases sleep latency.',
        positive: 'Current caffeine timing works well for your sleep. Maintain current schedule.',
      },
      exercise_timing: {
        negative: 'Move intense workouts to morning or early afternoon. Evening exercise elevates core temperature and heart rate before bed.',
        positive: 'Exercise timing appears optimal for your sleep. Continue current schedule.',
      },
      meal_timing: {
        negative: 'Finish last meal 3 hours before bed. Late eating disrupts thermoregulation and sleep quality.',
        positive: 'Meal timing appears optimal. Maintain current eating schedule.',
      },
      stress: {
        negative: 'Implement evening wind-down routine: Meditation, breathing exercises, or gentle stretching before bed.',
        positive: 'Stress management appears effective. Continue current practices.',
      },
      nap: {
        negative: 'Limit naps to 20-30 minutes before 3 PM if needed. Long/late naps reduce sleep pressure at night.',
        positive: 'Napping schedule supports nighttime sleep. Continue current pattern.',
      },
    };

    return recommendations[factor][direction === 'negative' ? 'negative' : 'positive'];
  }

  private static calculateLifestyleScore(
    correlations: LifestyleCorrelation[],
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): number {
    // Base score from recent readiness
    const recentReadiness = readiness.slice(-7);
    const avgReadiness = recentReadiness.reduce((sum, r) => sum + r.score, 0) / recentReadiness.length;

    // Penalty for negative lifestyle factors
    const negativeFactors = correlations.filter(c => c.direction === 'negative' && c.strength !== 'weak');
    const lifestylePenalty = negativeFactors.reduce((sum, c) => {
      const strengthMultiplier = c.strength === 'very strong' ? 15 : c.strength === 'strong' ? 10 : 5;
      return sum + strengthMultiplier;
    }, 0);

    const score = Math.max(0, Math.min(100, avgReadiness - lifestylePenalty));
    return Number(score.toFixed(0));
  }

  private static analyzeDayPatterns(
    sleep: SleepData[],
    readiness: ReadinessData[],
    lifestyleFactors: Map<string, Map<LifestyleFactor, boolean>>
  ): LifestyleAnalysis['patterns'] {
    // Group by day of week
    const dayGroups: Map<number, { readiness: number[]; factors: Map<LifestyleFactor, number> }> = new Map();

    sleep.forEach((s, idx) => {
      const date = parseOuraDate(s.day);
      const dayOfWeek = date.getDay();
      const readinessData = readiness[idx];
      if (!readinessData) return;

      if (!dayGroups.has(dayOfWeek)) {
        dayGroups.set(dayOfWeek, { readiness: [], factors: new Map() });
      }

      const group = dayGroups.get(dayOfWeek)!;
      group.readiness.push(readinessData.score);

      // Count factors
      const factors = lifestyleFactors.get(s.day);
      if (factors) {
        factors.forEach((present, factor) => {
          if (present) {
            group.factors.set(factor, (group.factors.get(factor) || 0) + 1);
          }
        });
      }
    });

    // Calculate averages and identify best/worst days
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats: Array<{ day: string; avg: number; factors: string[] }> = [];

    dayGroups.forEach((group, dayNum) => {
      const avg = group.readiness.reduce((sum, r) => sum + r, 0) / group.readiness.length;
      const commonFactors: string[] = [];

      group.factors.forEach((count, factor) => {
        if (count >= group.readiness.length * 0.3) { // Present in 30%+ of days
          commonFactors.push(factor.replace('_', ' '));
        }
      });

      dayStats.push({
        day: dayNames[dayNum],
        avg: Number(avg.toFixed(1)),
        factors: commonFactors,
      });
    });

    dayStats.sort((a, b) => b.avg - a.avg);

    const bestDays = dayStats.slice(0, 3).map(d => ({
      dayOfWeek: d.day,
      avgReadiness: d.avg,
      commonFactors: d.factors,
    }));

    const worstDays = dayStats.slice(-3).reverse().map(d => ({
      dayOfWeek: d.day,
      avgReadiness: d.avg,
      commonFactors: d.factors,
    }));

    return { bestDays, worstDays };
  }

  private static identifyOptimizations(
    correlations: LifestyleCorrelation[],
    patterns: LifestyleAnalysis['patterns'],
    sleep: SleepData[]
  ): LifestyleAnalysis['optimizations'] {
    const optimizations: LifestyleAnalysis['optimizations'] = [];

    // Find strongest negative correlations
    const negativeFactors = correlations
      .filter(c => c.direction === 'negative' && Math.abs(c.correlation) > 0.3)
      .slice(0, 3);

    negativeFactors.forEach(factor => {
      const potentialGain = `+${Math.abs(factor.impact.readiness).toFixed(0)} readiness points`;

      let category: 'timing' | 'behavior' | 'environment';
      if (['late_night', 'meal_timing', 'exercise_timing'].includes(factor.factor)) {
        category = 'timing';
      } else if (['alcohol', 'caffeine', 'stress'].includes(factor.factor)) {
        category = 'behavior';
      } else {
        category = 'environment';
      }

      optimizations.push({
        category,
        opportunity: `Optimize ${factor.factor.replace('_', ' ')}`,
        potentialGain,
        implementation: factor.recommendation,
      });
    });

    return optimizations;
  }

  private static generateBehavioralInsights(
    correlations: LifestyleCorrelation[],
    patterns: LifestyleAnalysis['patterns'],
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): LifestyleAnalysis['behavioralInsights'] {
    const insights: LifestyleAnalysis['behavioralInsights'] = [];

    // Insight 1: Strongest lifestyle impact
    const strongestFactor = correlations[0];
    if (strongestFactor && Math.abs(strongestFactor.correlation) > 0.3) {
      insights.push({
        finding: `${strongestFactor.factor.replace('_', ' ')} is your #1 sleep disruptor`,
        evidence: `${strongestFactor.strength} ${strongestFactor.direction} correlation (r=${strongestFactor.correlation.toFixed(2)}) based on ${strongestFactor.sampleSize} days`,
        actionable: strongestFactor.recommendation,
      });
    }

    // Insight 2: Day-of-week patterns
    if (patterns.worstDays.length > 0) {
      const worst = patterns.worstDays[0];
      insights.push({
        finding: `${worst.dayOfWeek} is consistently your lowest recovery day`,
        evidence: `Average readiness: ${worst.avgReadiness} | Common factors: ${worst.commonFactors.join(', ') || 'none detected'}`,
        actionable: `Prioritize sleep hygiene on ${worst.dayOfWeek} evenings. Avoid known disruptors and aim for +30 minutes extra sleep.`,
      });
    }

    // Insight 3: Consistency
    const recentSleep = sleep.slice(-14);
    const bedtimes = recentSleep
      .filter(s => s.bedtime_start)
      .map(s => new Date(s.bedtime_start!).getUTCHours());

    const bedtimeVariance = this.calculateVariance(bedtimes);
    if (bedtimeVariance > 2) {
      insights.push({
        finding: 'High bedtime variability detected',
        evidence: `Bedtime varies by ${Math.sqrt(bedtimeVariance).toFixed(1)} hours across recent nights`,
        actionable: 'Inconsistent sleep schedule disrupts circadian rhythm. Aim for ±30 minutes consistency, even on weekends.',
      });
    }

    return insights;
  }

  private static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return variance;
  }
}

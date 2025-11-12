import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { PersonalBaselines, UserProfile, HealthData } from './types';
import { AdvancedStatistics } from './statistics';

/**
 * Personalization Engine
 * Creates adaptive baselines and learns user-specific patterns
 */
export class PersonalizationEngine {
  /**
   * Generate comprehensive personal baselines from historical data
   */
  static generateBaselines(data: HealthData): PersonalBaselines {
    const { sleep, activity, readiness } = data;

    // Sleep baselines
    const sleepScores = sleep.map(s => s.score);
    const sleepDurations = sleep.map(s => s.total_sleep_duration / 3600); // to hours
    const sleepEfficiency = sleep.map(s => s.efficiency);

    const sleepStats = AdvancedStatistics.describe(sleepScores);

    // Calculate optimal sleep duration (where readiness is highest)
    const optimalDuration = this.findOptimalSleepDuration(sleep, readiness);

    // Activity baselines
    const activityScores = activity.map(a => a.score);
    const steps = activity.map(a => a.steps);
    const calories = activity.map(a => a.active_calories);

    const activityStats = AdvancedStatistics.describe(activityScores);

    // Readiness baselines
    const readinessScores = readiness.map(r => r.score);
    const restingHRs = readiness.map(r => r.resting_heart_rate);
    const hrvs = readiness.map(r => r.hrv_balance || 0).filter(h => h > 0);
    const temps = readiness.map(r => r.temperature_deviation || 0);

    const readinessStats = AdvancedStatistics.describe(readinessScores);
    const hrvStats = hrvs.length > 0 ? AdvancedStatistics.describe(hrvs) : null;

    // Volatility/consistency metrics
    const sleepConsistency = 100 - AdvancedStatistics.coefficientOfVariation(sleepScores);
    const activityConsistency = 100 - AdvancedStatistics.coefficientOfVariation(activityScores);
    const readinessConsistency = 100 - AdvancedStatistics.coefficientOfVariation(readinessScores);

    return {
      sleep: {
        averageScore: sleepStats.mean,
        optimalDuration,
        typicalBedtime: this.estimateTypicalBedtime(sleep),
        typicalWakeTime: this.estimateTypicalWakeTime(sleep),
        efficiency: sleepEfficiency.reduce((a, b) => a + b, 0) / sleepEfficiency.length,
      },
      activity: {
        averageScore: activityStats.mean,
        typicalSteps: steps.reduce((a, b) => a + b, 0) / steps.length,
        typicalCalories: calories.reduce((a, b) => a + b, 0) / calories.length,
      },
      readiness: {
        averageScore: readinessStats.mean,
        restingHR: restingHRs.reduce((a, b) => a + b, 0) / restingHRs.length,
        hrvRange: hrvStats ? { min: hrvStats.min, max: hrvStats.max } : { min: 0, max: 0 },
        temperatureDeviation: temps.reduce((a, b) => a + b, 0) / temps.length,
      },
      volatility: {
        sleepConsistency,
        activityConsistency,
        readinessConsistency,
      },
    };
  }

  /**
   * Determine chronotype from sleep timing patterns
   */
  static determineChronotype(
    sleep: SleepData[]
  ): { chronotype: 'early' | 'intermediate' | 'late'; confidence: number } {
    if (sleep.length < 14) {
      return { chronotype: 'intermediate', confidence: 0.3 };
    }

    const midpoints: number[] = [];

    for (const s of sleep) {
      // Calculate sleep midpoint
      if (s.bedtime_start && s.bedtime_end) {
        const start = new Date(s.bedtime_start).getTime();
        const end = new Date(s.bedtime_end).getTime();
        const midpoint = new Date((start + end) / 2);
        const hourOfDay = midpoint.getHours() + midpoint.getMinutes() / 60;
        midpoints.push(hourOfDay);
      }
    }

    if (midpoints.length < 7) {
      return { chronotype: 'intermediate', confidence: 0.3 };
    }

    const avgMidpoint = midpoints.reduce((a, b) => a + b, 0) / midpoints.length;
    const stdDev = Math.sqrt(
      midpoints.reduce((sum, m) => sum + Math.pow(m - avgMidpoint, 2), 0) / midpoints.length
    );

    // Confidence based on consistency (lower stdDev = higher confidence)
    const confidence = Math.max(0.5, Math.min(0.95, 1 - stdDev / 6));

    // Chronotype determination based on sleep midpoint
    // Early: before 3 AM (27:00 in 24h+ time)
    // Late: after 5 AM (29:00 in 24h+ time)
    // Intermediate: between
    const adjustedMidpoint = avgMidpoint < 12 ? avgMidpoint + 24 : avgMidpoint;

    let chronotype: 'early' | 'intermediate' | 'late';
    if (adjustedMidpoint < 27) {
      chronotype = 'early';
    } else if (adjustedMidpoint > 29) {
      chronotype = 'late';
    } else {
      chronotype = 'intermediate';
    }

    return { chronotype, confidence };
  }

  /**
   * Calculate social jet lag (difference between weekday and weekend sleep timing)
   */
  static calculateSocialJetLag(sleep: SleepData[]): number {
    const weekdayMidpoints: number[] = [];
    const weekendMidpoints: number[] = [];

    for (const s of sleep) {
      if (!s.bedtime_start || !s.bedtime_end) continue;

      const date = new Date(s.day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const start = new Date(s.bedtime_start).getTime();
      const end = new Date(s.bedtime_end).getTime();
      const midpoint = new Date((start + end) / 2);
      const hourOfDay = midpoint.getHours() + midpoint.getMinutes() / 60;

      if (isWeekend) {
        weekendMidpoints.push(hourOfDay);
      } else {
        weekdayMidpoints.push(hourOfDay);
      }
    }

    if (weekdayMidpoints.length < 3 || weekendMidpoints.length < 2) {
      return 0;
    }

    const avgWeekday = weekdayMidpoints.reduce((a, b) => a + b, 0) / weekdayMidpoints.length;
    const avgWeekend = weekendMidpoints.reduce((a, b) => a + b, 0) / weekendMidpoints.length;

    // Handle wrap-around midnight
    let diff = avgWeekend - avgWeekday;
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;

    return Math.abs(diff);
  }

  /**
   * Adaptive threshold calculation based on personal history
   */
  static getAdaptiveThreshold(
    metric: 'sleep' | 'activity' | 'readiness',
    level: 'low' | 'optimal' | 'high',
    baselines: PersonalBaselines
  ): number {
    let baseline: number;
    let stdDevFactor: number;

    switch (metric) {
      case 'sleep':
        baseline = baselines.sleep.averageScore;
        break;
      case 'activity':
        baseline = baselines.activity.averageScore;
        break;
      case 'readiness':
        baseline = baselines.readiness.averageScore;
        break;
    }

    // Adaptive thresholds based on user's typical range
    switch (level) {
      case 'low':
        return Math.max(baseline - 10, 60); // At least 10 below average, min 60
      case 'optimal':
        return Math.max(baseline + 5, 85); // 5 above average, min 85
      case 'high':
        return Math.min(baseline + 15, 95); // 15 above average, max 95
    }
  }

  /**
   * Detect if user is experiencing training stress or overreaching
   */
  static assessTrainingLoad(
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): {
    acuteLoad: number;
    chronicLoad: number;
    ratio: number;
    status: 'optimal' | 'high_but_safe' | 'overreaching' | 'overtraining_risk';
    monotony: number;
  } {
    if (activity.length < 21) {
      return {
        acuteLoad: 0,
        chronicLoad: 0,
        ratio: 1,
        status: 'optimal',
        monotony: 0,
      };
    }

    // Acute load: last 7 days average activity score
    const acuteLoad = activity
      .slice(-7)
      .reduce((sum, a) => sum + a.score, 0) / 7;

    // Chronic load: last 28 days average (or available data)
    const chronicLength = Math.min(28, activity.length);
    const chronicLoad = activity
      .slice(-chronicLength)
      .reduce((sum, a) => sum + a.score, 0) / chronicLength;

    // Acute:Chronic ratio (ACWR)
    const ratio = acuteLoad / chronicLoad;

    // Calculate training monotony (low variation = higher injury risk)
    const last7Scores = activity.slice(-7).map(a => a.score);
    const mean7 = acuteLoad;
    const stdDev7 = Math.sqrt(
      last7Scores.reduce((sum, s) => sum + Math.pow(s - mean7, 2), 0) / 7
    );
    const monotony = stdDev7 === 0 ? 5 : mean7 / stdDev7;

    // Assess recovery alongside load
    const avgReadiness = readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / Math.min(7, readiness.length);

    // Status determination
    let status: 'optimal' | 'high_but_safe' | 'overreaching' | 'overtraining_risk';

    if (ratio < 0.8) {
      status = 'optimal'; // Undertraining or recovery phase
    } else if (ratio >= 0.8 && ratio <= 1.3) {
      status = avgReadiness > 75 ? 'optimal' : 'high_but_safe';
    } else if (ratio > 1.3 && ratio <= 1.5) {
      status = 'overreaching';
    } else {
      status = 'overtraining_risk';
    }

    // High monotony increases risk
    if (monotony > 2.5 && ratio > 1.2) {
      status = status === 'high_but_safe' ? 'overreaching' : status;
      status = status === 'overreaching' ? 'overtraining_risk' : status;
    }

    return {
      acuteLoad,
      chronicLoad,
      ratio,
      status,
      monotony,
    };
  }

  /**
   * Generate personalized recommendations based on baselines and current state
   */
  static getPersonalizedRecommendations(
    currentMetrics: {
      sleep: number;
      activity: number;
      readiness: number;
    },
    baselines: PersonalBaselines
  ): {
    sleep: string[];
    activity: string[];
    recovery: string[];
    priority: 'sleep' | 'activity' | 'recovery';
  } {
    const recommendations = {
      sleep: [] as string[],
      activity: [] as string[],
      recovery: [] as string[],
      priority: 'recovery' as 'sleep' | 'activity' | 'recovery',
    };

    // Sleep recommendations
    if (currentMetrics.sleep < baselines.sleep.averageScore - 10) {
      recommendations.sleep.push(
        `Your sleep score is significantly below your personal average of ${Math.round(baselines.sleep.averageScore)}`
      );
      recommendations.sleep.push(
        `Aim for ${baselines.sleep.optimalDuration.toFixed(1)}h of sleep tonight - your optimal duration`
      );
      recommendations.sleep.push(
        `Consider going to bed around ${this.formatHour(baselines.sleep.typicalBedtime)} (your typical bedtime)`
      );
      recommendations.priority = 'sleep';
    }

    // Activity recommendations
    if (currentMetrics.activity < baselines.activity.averageScore - 15) {
      recommendations.activity.push(
        `Activity is lower than usual. Aim for ${Math.round(baselines.activity.typicalSteps)} steps today`
      );
    } else if (currentMetrics.activity > baselines.activity.averageScore + 20) {
      recommendations.activity.push(
        `High activity detected. Ensure adequate recovery to maintain your performance`
      );
      recommendations.priority = 'recovery';
    }

    // Recovery recommendations based on readiness
    if (currentMetrics.readiness < baselines.readiness.averageScore - 10) {
      recommendations.recovery.push(
        `Readiness is ${Math.round(baselines.readiness.averageScore - currentMetrics.readiness)} points below your baseline`
      );
      recommendations.recovery.push(
        `Focus on recovery today - consider light activity and prioritize sleep`
      );
      recommendations.recovery.push(
        `Monitor your resting HR - your baseline is ${Math.round(baselines.readiness.restingHR)} bpm`
      );
      recommendations.priority = 'recovery';
    }

    // Volatility-based recommendations
    if (baselines.volatility.sleepConsistency < 70) {
      recommendations.sleep.push(
        `Your sleep consistency is ${Math.round(baselines.volatility.sleepConsistency)}% - try maintaining a regular sleep schedule`
      );
    }

    return recommendations;
  }

  // ==================== PRIVATE HELPERS ====================

  private static findOptimalSleepDuration(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): number {
    // Find sleep duration that correlates with best readiness
    const durationReadinessPairs: Array<{ duration: number; readiness: number }> = [];

    for (const s of sleep) {
      const matchingReadiness = readiness.find(r => r.day === s.day);
      if (matchingReadiness) {
        durationReadinessPairs.push({
          duration: s.total_sleep_duration / 3600,
          readiness: matchingReadiness.score,
        });
      }
    }

    if (durationReadinessPairs.length < 5) {
      return 7.5; // default
    }

    // Group by duration (rounded to 0.5h) and find which has highest avg readiness
    const durationGroups = new Map<number, number[]>();
    for (const pair of durationReadinessPairs) {
      const rounded = Math.round(pair.duration * 2) / 2;
      if (!durationGroups.has(rounded)) {
        durationGroups.set(rounded, []);
      }
      durationGroups.get(rounded)!.push(pair.readiness);
    }

    let bestDuration = 7.5;
    let bestAvgReadiness = 0;

    for (const [duration, readinessScores] of durationGroups) {
      if (readinessScores.length >= 2) {
        const avg = readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length;
        if (avg > bestAvgReadiness) {
          bestAvgReadiness = avg;
          bestDuration = duration;
        }
      }
    }

    return bestDuration;
  }

  private static estimateTypicalBedtime(sleep: SleepData[]): number {
    const bedtimes: number[] = [];

    for (const s of sleep) {
      if (s.bedtime_start) {
        const date = new Date(s.bedtime_start);
        const hour = date.getHours() + date.getMinutes() / 60;
        // Normalize to 0-24 range (bedtimes after midnight should be 24+)
        const normalized = hour < 12 ? hour + 24 : hour;
        bedtimes.push(normalized);
      }
    }

    if (bedtimes.length === 0) return 22.5; // default 10:30 PM

    const avg = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    return avg > 24 ? avg - 24 : avg;
  }

  private static estimateTypicalWakeTime(sleep: SleepData[]): number {
    const wakeTimes: number[] = [];

    for (const s of sleep) {
      if (s.bedtime_end) {
        const date = new Date(s.bedtime_end);
        const hour = date.getHours() + date.getMinutes() / 60;
        wakeTimes.push(hour);
      }
    }

    if (wakeTimes.length === 0) return 7; // default 7 AM

    return wakeTimes.reduce((a, b) => a + b, 0) / wakeTimes.length;
  }

  private static formatHour(hour: number): string {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  }
}

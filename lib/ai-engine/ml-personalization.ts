import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { PersonalBaselines } from './types';

/**
 * Machine Learning-Based Personalization Engine
 * Uses clustering, profiling, and adaptive learning for truly personalized insights
 */

export interface UserProfile {
  userId: string;
  archetype: 'athlete' | 'professional' | 'balanced' | 'recovery-focused' | 'night-owl' | 'early-bird';
  archetypeConfidence: number;

  // Learned patterns specific to THIS user
  personalPatterns: {
    bestPerformanceDays: string[]; // e.g., ['Tuesday', 'Wednesday']
    worstPerformanceDays: string[];
    optimalSleepDuration: number; // Hours that work best for THIS user
    optimalBedtime: number; // Hour that works best for THIS user
    recoverySensitivity: 'high' | 'medium' | 'low'; // How quickly they recover
    stressTolerance: 'high' | 'medium' | 'low'; // How much stress they can handle
    activityPreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
  };

  // What actually works for this user (learned from data)
  effectiveInterventions: Array<{
    intervention: string;
    effectSize: number; // How much it helped (correlation)
    confidence: number;
  }>;

  // User-specific thresholds (not generic)
  personalThresholds: {
    minSleepForOptimalPerformance: number;
    maxActivityBeforeBurnout: number;
    recoveryTimeNeeded: number; // days
  };

  lastUpdated: string;
  dataPoints: number; // How much data we have
}

export class MLPersonalizationEngine {
  /**
   * Build comprehensive user profile using ML techniques
   */
  static buildUserProfile(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines
  ): UserProfile {
    // Determine user archetype using clustering-like approach
    const archetype = this.determineUserArchetype(sleep, activity, readiness);

    // Learn personal patterns from data
    const personalPatterns = this.learnPersonalPatterns(sleep, activity, readiness);

    // Find what actually works for THIS user
    const effectiveInterventions = this.discoverEffectiveInterventions(
      sleep,
      activity,
      readiness
    );

    // Calculate user-specific thresholds
    const personalThresholds = this.calculatePersonalThresholds(
      sleep,
      activity,
      readiness,
      personalPatterns
    );

    return {
      userId: 'current-user',
      archetype: archetype.type,
      archetypeConfidence: archetype.confidence,
      personalPatterns,
      effectiveInterventions,
      personalThresholds,
      lastUpdated: new Date().toISOString(),
      dataPoints: sleep.length,
    };
  }

  /**
   * Determine user archetype using clustering on behavioral metrics
   */
  private static determineUserArchetype(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): { type: UserProfile['archetype']; confidence: number } {
    if (sleep.length < 14) {
      return { type: 'balanced', confidence: 0.5 };
    }

    // Calculate behavioral features
    const avgActivityScore = activity.reduce((sum, a) => sum + a.score, 0) / activity.length;
    const avgSleepScore = sleep.reduce((sum, s) => sum + s.score, 0) / sleep.length;
    const avgReadinessScore = readiness.reduce((sum, r) => sum + r.score, 0) / readiness.length;

    const activityVariability = this.calculateCV(activity.map(a => a.score));
    const sleepConsistency = 100 - this.calculateCV(sleep.map(s => s.score));

    const avgBedtime = this.getAverageBedtimeHour(sleep);
    const avgActiveCalories = activity.reduce((sum, a) => sum + a.active_calories, 0) / activity.length;

    // Feature vector for clustering
    const features = {
      activityLevel: avgActivityScore,
      sleepQuality: avgSleepScore,
      recovery: avgReadinessScore,
      activityVariability,
      sleepConsistency,
      bedtimeHour: avgBedtime,
      calorieOutput: avgActiveCalories,
    };

    // Archetype detection (simplified k-means-like clustering)
    const archetypes = [
      {
        type: 'athlete' as const,
        profile: {
          activityLevel: 85,
          sleepQuality: 78,
          recovery: 80,
          activityVariability: 40,
          sleepConsistency: 75,
          calorieOutput: 600,
        },
      },
      {
        type: 'professional' as const,
        profile: {
          activityLevel: 70,
          sleepQuality: 72,
          recovery: 75,
          activityVariability: 25,
          sleepConsistency: 65,
          calorieOutput: 350,
        },
      },
      {
        type: 'balanced' as const,
        profile: {
          activityLevel: 75,
          sleepQuality: 80,
          recovery: 78,
          activityVariability: 30,
          sleepConsistency: 80,
          calorieOutput: 450,
        },
      },
      {
        type: 'recovery-focused' as const,
        profile: {
          activityLevel: 65,
          sleepQuality: 85,
          recovery: 82,
          activityVariability: 20,
          sleepConsistency: 85,
          calorieOutput: 300,
        },
      },
      {
        type: 'night-owl' as const,
        profile: {
          activityLevel: 72,
          sleepQuality: 70,
          recovery: 72,
          activityVariability: 35,
          sleepConsistency: 60,
          bedtimeHour: 1, // 1 AM
          calorieOutput: 400,
        },
      },
      {
        type: 'early-bird' as const,
        profile: {
          activityLevel: 78,
          sleepQuality: 82,
          recovery: 80,
          activityVariability: 28,
          sleepConsistency: 85,
          bedtimeHour: 22, // 10 PM
          calorieOutput: 420,
        },
      },
    ];

    // Find closest archetype (euclidean distance)
    let closestArchetype = archetypes[0];
    let minDistance = Infinity;

    for (const archetype of archetypes) {
      let distance = 0;
      distance += Math.pow((features.activityLevel - archetype.profile.activityLevel) / 100, 2);
      distance += Math.pow((features.sleepQuality - archetype.profile.sleepQuality) / 100, 2);
      distance += Math.pow((features.recovery - archetype.profile.recovery) / 100, 2);
      distance += Math.pow((features.activityVariability - archetype.profile.activityVariability) / 100, 2);
      distance += Math.pow((features.sleepConsistency - archetype.profile.sleepConsistency) / 100, 2);

      if (archetype.profile.bedtimeHour !== undefined && avgBedtime !== null) {
        distance += Math.pow((avgBedtime - archetype.profile.bedtimeHour) / 24, 2);
      }

      distance += Math.pow((features.calorieOutput - archetype.profile.calorieOutput) / 1000, 2);
      distance = Math.sqrt(distance);

      if (distance < minDistance) {
        minDistance = distance;
        closestArchetype = archetype;
      }
    }

    // Confidence based on distance (closer = more confident)
    const confidence = Math.max(0.5, 1 - minDistance / 2);

    return { type: closestArchetype.type, confidence };
  }

  /**
   * Learn personal patterns from historical data (what works for THIS user)
   */
  private static learnPersonalPatterns(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): UserProfile['personalPatterns'] {
    // Find best performance days
    const dayPerformance: Record<string, number[]> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    readiness.forEach(r => {
      const date = new Date(r.day);
      const dayName = dayNames[date.getDay()];
      if (!dayPerformance[dayName]) dayPerformance[dayName] = [];
      dayPerformance[dayName].push(r.score);
    });

    const dayAverages = Object.entries(dayPerformance).map(([day, scores]) => ({
      day,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));

    dayAverages.sort((a, b) => b.avg - a.avg);
    const bestPerformanceDays = dayAverages.slice(0, 2).map(d => d.day);
    const worstPerformanceDays = dayAverages.slice(-2).map(d => d.day);

    // Find optimal sleep duration FOR THIS USER
    const sleepPerformanceCorrelation: Array<{ duration: number; nextDayReadiness: number }> = [];
    for (let i = 0; i < sleep.length - 1; i++) {
      const duration = sleep[i].total_sleep_duration / 3600;
      const nextDayReadiness = readiness[i + 1]?.score;
      if (nextDayReadiness) {
        sleepPerformanceCorrelation.push({ duration, nextDayReadiness });
      }
    }

    // Find duration with highest average readiness
    const durationBuckets: Record<string, number[]> = {};
    sleepPerformanceCorrelation.forEach(({ duration, nextDayReadiness }) => {
      const bucket = Math.floor(duration * 2) / 2; // 0.5h buckets
      if (!durationBuckets[bucket]) durationBuckets[bucket] = [];
      durationBuckets[bucket].push(nextDayReadiness);
    });

    let optimalSleepDuration = 8; // default
    let maxAvgReadiness = 0;
    Object.entries(durationBuckets).forEach(([duration, readinessScores]) => {
      const avg = readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length;
      if (avg > maxAvgReadiness) {
        maxAvgReadiness = avg;
        optimalSleepDuration = parseFloat(duration);
      }
    });

    // Find optimal bedtime FOR THIS USER
    const bedtimePerformance: Array<{ bedtime: number; nextDayReadiness: number }> = [];
    for (let i = 0; i < sleep.length - 1; i++) {
      const bedtime = new Date(sleep[i].bedtime_start).getHours();
      const nextDayReadiness = readiness[i + 1]?.score;
      if (nextDayReadiness) {
        bedtimePerformance.push({ bedtime, nextDayReadiness });
      }
    }

    const bedtimeBuckets: Record<number, number[]> = {};
    bedtimePerformance.forEach(({ bedtime, nextDayReadiness }) => {
      if (!bedtimeBuckets[bedtime]) bedtimeBuckets[bedtime] = [];
      bedtimeBuckets[bedtime].push(nextDayReadiness);
    });

    let optimalBedtime = 22; // default 10 PM
    maxAvgReadiness = 0;
    Object.entries(bedtimeBuckets).forEach(([hour, readinessScores]) => {
      const avg = readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length;
      if (avg > maxAvgReadiness) {
        maxAvgReadiness = avg;
        optimalBedtime = parseInt(hour);
      }
    });

    // Determine recovery sensitivity (how fast readiness bounces back after low days)
    const recoveryTimes: number[] = [];
    for (let i = 1; i < readiness.length; i++) {
      if (readiness[i - 1].score < 70 && readiness[i].score >= 80) {
        recoveryTimes.push(1);
      }
    }
    const avgRecoverySpeed = recoveryTimes.length / readiness.length;
    const recoverySensitivity = avgRecoverySpeed > 0.15 ? 'high' : avgRecoverySpeed > 0.08 ? 'medium' : 'low';

    // Determine stress tolerance (how well they maintain readiness under high activity)
    const highActivityDays = activity.filter(a => a.score >= 85);
    const readinessAfterHighActivity: number[] = [];
    highActivityDays.forEach(a => {
      const dateIndex = readiness.findIndex(r => r.day === a.day);
      if (dateIndex >= 0 && dateIndex < readiness.length - 1) {
        readinessAfterHighActivity.push(readiness[dateIndex + 1].score);
      }
    });
    const avgReadinessAfterHighActivity =
      readinessAfterHighActivity.length > 0
        ? readinessAfterHighActivity.reduce((a, b) => a + b, 0) / readinessAfterHighActivity.length
        : 75;
    const stressTolerance = avgReadinessAfterHighActivity >= 80 ? 'high' : avgReadinessAfterHighActivity >= 70 ? 'medium' : 'low';

    // Activity preference (when do they perform best)
    const activityPreference = optimalBedtime <= 22 ? 'morning' : optimalBedtime >= 1 ? 'evening' : 'afternoon';

    return {
      bestPerformanceDays,
      worstPerformanceDays,
      optimalSleepDuration,
      optimalBedtime,
      recoverySensitivity,
      stressTolerance,
      activityPreference,
    };
  }

  /**
   * Discover what interventions actually work for THIS user (correlation analysis)
   */
  private static discoverEffectiveInterventions(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): UserProfile['effectiveInterventions'] {
    const interventions: UserProfile['effectiveInterventions'] = [];

    if (sleep.length < 14) return interventions;

    // Intervention 1: Sleep duration increase
    const sleepDurationCorrelation = this.calculateSleepDurationEffect(sleep, readiness);
    if (Math.abs(sleepDurationCorrelation) > 0.2) {
      interventions.push({
        intervention: sleepDurationCorrelation > 0
          ? 'Increasing your sleep duration by 30-60 minutes'
          : 'Your sleep quality matters more than duration - focus on consistency',
        effectSize: Math.abs(sleepDurationCorrelation),
        confidence: 0.75,
      });
    }

    // Intervention 2: Sleep consistency
    const consistencyEffect = this.calculateConsistencyEffect(sleep, readiness);
    if (consistencyEffect.significant) {
      interventions.push({
        intervention: `Keeping a consistent sleep schedule (within ${consistencyEffect.optimalWindow} minutes)`,
        effectSize: consistencyEffect.effectSize,
        confidence: 0.8,
      });
    }

    // Intervention 3: Activity modulation
    const activityEffect = this.calculateActivityModulationEffect(activity, readiness);
    if (activityEffect.significant) {
      interventions.push({
        intervention: activityEffect.recommendation,
        effectSize: activityEffect.effectSize,
        confidence: 0.7,
      });
    }

    // Sort by effect size
    interventions.sort((a, b) => b.effectSize - a.effectSize);

    return interventions.slice(0, 3);
  }

  /**
   * Calculate user-specific thresholds (not generic)
   */
  private static calculatePersonalThresholds(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    patterns: UserProfile['personalPatterns']
  ): UserProfile['personalThresholds'] {
    // Find minimum sleep this user needs for optimal performance
    const goodDays = readiness.filter(r => r.score >= 85);
    const sleepOnGoodDays: number[] = [];
    goodDays.forEach(r => {
      const sleepDay = sleep.find(s => s.day === r.day);
      if (sleepDay) {
        sleepOnGoodDays.push(sleepDay.total_sleep_duration / 3600);
      }
    });

    const minSleepForOptimalPerformance =
      sleepOnGoodDays.length > 0
        ? sleepOnGoodDays.reduce((a, b) => a + b, 0) / sleepOnGoodDays.length - 0.5
        : patterns.optimalSleepDuration - 0.5;

    // Find max activity before burnout
    const burnoutDays = readiness.filter(r => r.score < 65);
    const activityBeforeBurnout: number[] = [];
    burnoutDays.forEach(r => {
      const activityDay = activity.find(a => a.day === r.day);
      if (activityDay) {
        activityBeforeBurnout.push(activityDay.active_calories);
      }
    });

    const maxActivityBeforeBurnout =
      activityBeforeBurnout.length > 0
        ? activityBeforeBurnout.reduce((a, b) => a + b, 0) / activityBeforeBurnout.length
        : 600;

    // Calculate recovery time this user needs
    const recoverySequences: number[] = [];
    for (let i = 0; i < readiness.length - 3; i++) {
      if (readiness[i].score < 70) {
        // Found a low day, how long to recover?
        for (let j = i + 1; j < Math.min(i + 7, readiness.length); j++) {
          if (readiness[j].score >= 80) {
            recoverySequences.push(j - i);
            break;
          }
        }
      }
    }

    const recoveryTimeNeeded =
      recoverySequences.length > 0
        ? recoverySequences.reduce((a, b) => a + b, 0) / recoverySequences.length
        : patterns.recoverySensitivity === 'high'
        ? 1
        : patterns.recoverySensitivity === 'medium'
        ? 2
        : 3;

    return {
      minSleepForOptimalPerformance,
      maxActivityBeforeBurnout: Math.round(maxActivityBeforeBurnout),
      recoveryTimeNeeded,
    };
  }

  // ==================== HELPER METHODS ====================

  private static calculateCV(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean * 100;
  }

  private static getAverageBedtimeHour(sleep: SleepData[]): number {
    const bedtimes = sleep.map(s => {
      const date = new Date(s.bedtime_start);
      return date.getHours() + date.getMinutes() / 60;
    });
    return bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
  }

  private static calculateSleepDurationEffect(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): number {
    const pairs: Array<{ duration: number; readiness: number }> = [];
    for (let i = 0; i < sleep.length - 1; i++) {
      const nextDayReadiness = readiness[i + 1]?.score;
      if (nextDayReadiness) {
        pairs.push({
          duration: sleep[i].total_sleep_duration / 3600,
          readiness: nextDayReadiness,
        });
      }
    }

    if (pairs.length < 7) return 0;

    // Calculate Pearson correlation
    const meanDuration = pairs.reduce((sum, p) => sum + p.duration, 0) / pairs.length;
    const meanReadiness = pairs.reduce((sum, p) => sum + p.readiness, 0) / pairs.length;

    let numerator = 0;
    let denomDuration = 0;
    let denomReadiness = 0;

    pairs.forEach(p => {
      const durationDiff = p.duration - meanDuration;
      const readinessDiff = p.readiness - meanReadiness;
      numerator += durationDiff * readinessDiff;
      denomDuration += durationDiff * durationDiff;
      denomReadiness += readinessDiff * readinessDiff;
    });

    if (denomDuration === 0 || denomReadiness === 0) return 0;
    return numerator / Math.sqrt(denomDuration * denomReadiness);
  }

  private static calculateConsistencyEffect(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): { significant: boolean; effectSize: number; optimalWindow: number } {
    // Calculate bedtime variability
    const bedtimes = sleep.map(s => new Date(s.bedtime_start).getHours() * 60 + new Date(s.bedtime_start).getMinutes());
    const meanBedtime = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    const bedtimeStdDev = Math.sqrt(
      bedtimes.reduce((sum, b) => sum + Math.pow(b - meanBedtime, 2), 0) / bedtimes.length
    );

    // Compare readiness on consistent vs inconsistent days
    const consistentDays: number[] = [];
    const inconsistentDays: number[] = [];

    for (let i = 1; i < sleep.length; i++) {
      const bedtimeToday = new Date(sleep[i].bedtime_start).getHours() * 60 + new Date(sleep[i].bedtime_start).getMinutes();
      const bedtimeYesterday = new Date(sleep[i - 1].bedtime_start).getHours() * 60 + new Date(sleep[i - 1].bedtime_start).getMinutes();
      const difference = Math.abs(bedtimeToday - bedtimeYesterday);

      const todayReadiness = readiness[i]?.score;
      if (todayReadiness) {
        if (difference < 60) {
          consistentDays.push(todayReadiness);
        } else {
          inconsistentDays.push(todayReadiness);
        }
      }
    }

    if (consistentDays.length < 3 || inconsistentDays.length < 3) {
      return { significant: false, effectSize: 0, optimalWindow: 60 };
    }

    const avgConsistent = consistentDays.reduce((a, b) => a + b, 0) / consistentDays.length;
    const avgInconsistent = inconsistentDays.reduce((a, b) => a + b, 0) / inconsistentDays.length;
    const difference = avgConsistent - avgInconsistent;

    return {
      significant: difference > 5,
      effectSize: difference / 100,
      optimalWindow: Math.round(bedtimeStdDev * 0.8),
    };
  }

  private static calculateActivityModulationEffect(
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): { significant: boolean; effectSize: number; recommendation: string } {
    // Find correlation between activity variability and readiness
    const activityScores = activity.map(a => a.active_calories);
    const window = 7;

    const variabilityReadinessPairs: Array<{ variability: number; avgReadiness: number }> = [];

    for (let i = window; i < activity.length; i++) {
      const weekActivity = activityScores.slice(i - window, i);
      const weekReadiness = readiness.slice(i - window, i).map(r => r.score);

      const activityMean = weekActivity.reduce((a, b) => a + b, 0) / window;
      const variability = Math.sqrt(
        weekActivity.reduce((sum, a) => sum + Math.pow(a - activityMean, 2), 0) / window
      );
      const avgReadiness = weekReadiness.reduce((a, b) => a + b, 0) / window;

      variabilityReadinessPairs.push({ variability, avgReadiness });
    }

    if (variabilityReadinessPairs.length < 4) {
      return { significant: false, effectSize: 0, recommendation: '' };
    }

    // Correlation between variability and readiness
    const meanVar = variabilityReadinessPairs.reduce((s, p) => s + p.variability, 0) / variabilityReadinessPairs.length;
    const meanRead = variabilityReadinessPairs.reduce((s, p) => s + p.avgReadiness, 0) / variabilityReadinessPairs.length;

    let correlation = 0;
    let denomVar = 0;
    let denomRead = 0;

    variabilityReadinessPairs.forEach(p => {
      const varDiff = p.variability - meanVar;
      const readDiff = p.avgReadiness - meanRead;
      correlation += varDiff * readDiff;
      denomVar += varDiff * varDiff;
      denomRead += readDiff * readDiff;
    });

    if (denomVar === 0 || denomRead === 0) {
      return { significant: false, effectSize: 0, recommendation: '' };
    }

    correlation = correlation / Math.sqrt(denomVar * denomRead);

    if (Math.abs(correlation) < 0.25) {
      return { significant: false, effectSize: 0, recommendation: '' };
    }

    const recommendation =
      correlation < -0.25
        ? 'Maintaining consistent daily activity levels (avoiding big spikes)'
        : 'Incorporating varied activity intensities throughout the week';

    return {
      significant: true,
      effectSize: Math.abs(correlation),
      recommendation,
    };
  }
}

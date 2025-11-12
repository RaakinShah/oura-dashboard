import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { RecoveryAnalysis, PersonalBaselines } from './types';

/**
 * Advanced Recovery & Stress Detection Module
 * Sophisticated recovery scoring using training load, HRV, and sleep debt
 */
export class RecoveryEngine {
  /**
   * Comprehensive recovery analysis using acute:chronic workload ratio
   */
  static analyzeRecoveryState(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines
  ): RecoveryAnalysis {
    if (readiness.length < 7) {
      return {
        currentState: 'recovering',
        recoveryDebt: 0,
        estimatedRecoveryTime: 0,
        acuteWorkload: 0,
        chronicWorkload: 0,
        acuteChronicRatio: 1.0,
        overtrainingRisk: 'low',
        recommendations: ['More data needed for accurate recovery analysis'],
      };
    }

    // Calculate acute workload (last 7 days avg)
    const last7Activity = activity.slice(-7);
    const acuteWorkload = last7Activity.reduce((sum, a) => sum + a.active_calories, 0) / 7;

    // Calculate chronic workload (last 28 days avg, or available data)
    const chronicPeriod = Math.min(28, activity.length);
    const chronicActivity = activity.slice(-chronicPeriod);
    const chronicWorkload = chronicActivity.reduce((sum, a) => sum + a.active_calories, 0) / chronicPeriod;

    // Acute:Chronic Ratio (optimal is 0.8-1.3)
    const acuteChronicRatio = chronicWorkload > 0 ? acuteWorkload / chronicWorkload : 1.0;

    // Calculate sleep debt
    const last7Sleep = sleep.slice(-7);
    const sleepDebt = last7Sleep.reduce((debt, s) => {
      const duration = s.total_sleep_duration / 3600;
      const optimal = baselines.sleep.optimalDuration;
      return debt + Math.max(0, optimal - duration);
    }, 0);

    // Calculate recovery score (0-100)
    const last7Readiness = readiness.slice(-7);
    const avgReadiness = last7Readiness.reduce((sum, r) => sum + r.score, 0) / last7Readiness.length;

    // HRV balance (recent vs baseline)
    const recentHRV = last7Readiness
      .map(r => r.hrv_balance || 0)
      .filter(h => h > 0);
    const avgHRV = recentHRV.length > 0
      ? recentHRV.reduce((a, b) => a + b, 0) / recentHRV.length
      : 0;
    const hrvDeviation = baselines.readiness.hrvRange.max > 0
      ? (avgHRV - (baselines.readiness.hrvRange.min + baselines.readiness.hrvRange.max) / 2) / baselines.readiness.hrvRange.max
      : 0;

    // Determine current state
    let currentState: RecoveryAnalysis['currentState'];
    if (avgReadiness >= 85 && sleepDebt < 2 && acuteChronicRatio < 1.3) {
      currentState = 'recovered';
    } else if (avgReadiness >= 70 && sleepDebt < 4) {
      currentState = 'recovering';
    } else if (avgReadiness >= 60) {
      currentState = 'strained';
    } else {
      currentState = 'exhausted';
    }

    // Overtraining risk assessment
    let overtrainingRisk: RecoveryAnalysis['overtrainingRisk'];
    if (acuteChronicRatio > 1.5 && avgReadiness < 65 && hrvDeviation < -0.2) {
      overtrainingRisk = 'high';
    } else if (acuteChronicRatio > 1.3 || avgReadiness < 70) {
      overtrainingRisk = 'moderate';
    } else {
      overtrainingRisk = 'low';
    }

    // Estimated recovery time
    const recoveryDebt = Math.max(0, sleepDebt / baselines.sleep.optimalDuration);
    const estimatedRecoveryTime = Math.ceil(recoveryDebt + (100 - avgReadiness) / 10);

    // Recommendations
    const recommendations: string[] = [];
    if (currentState === 'exhausted') {
      recommendations.push('URGENT: Take complete rest day(s) - your body is severely depleted');
      recommendations.push('Prioritize 9+ hours sleep for next 3 nights');
      recommendations.push('Consider taking 2-3 days off from intense training');
      recommendations.push('Focus on nutrition and hydration');
    } else if (currentState === 'strained') {
      recommendations.push('Reduce training intensity by 40-50% for the next few days');
      recommendations.push('Add extra 30-60 minutes of sleep per night');
      recommendations.push('Incorporate active recovery: walking, yoga, light swimming');
      recommendations.push('Avoid high-intensity intervals until readiness improves');
    } else if (currentState === 'recovering') {
      recommendations.push('Continue current recovery practices - you are on track');
      recommendations.push('Light to moderate training is appropriate');
      recommendations.push('Maintain consistent sleep schedule');
      recommendations.push('Listen to your body - scale back if fatigue increases');
    } else {
      recommendations.push('Fully recovered - ready for challenging training');
      recommendations.push('This is optimal time for personal records or hard workouts');
      recommendations.push('Maintain recovery habits that brought you here');
      recommendations.push('Monitor for early signs of overreaching');
    }

    if (acuteChronicRatio > 1.3) {
      recommendations.push(`Acute:Chronic ratio (${acuteChronicRatio.toFixed(2)}) is elevated - injury risk increased`);
    }

    if (sleepDebt > 5) {
      recommendations.push(`Significant sleep debt (${sleepDebt.toFixed(1)}h) - prioritize sleep above all`);
    }

    return {
      currentState,
      recoveryDebt,
      estimatedRecoveryTime,
      acuteWorkload: Math.round(acuteWorkload),
      chronicWorkload: Math.round(chronicWorkload),
      acuteChronicRatio: Math.round(acuteChronicRatio * 100) / 100,
      overtrainingRisk,
      recommendations: recommendations.slice(0, 5),
    };
  }

  /**
   * Detect stress patterns using HRV, RHR, temperature, and behavioral markers
   */
  static detectStressSignals(
    sleep: SleepData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines
  ): {
    stressLevel: 'very_high' | 'high' | 'moderate' | 'low';
    stressScore: number;
    signals: Array<{ signal: string; severity: number; description: string }>;
    recommendations: string[];
  } {
    if (readiness.length < 3) {
      return {
        stressLevel: 'low',
        stressScore: 20,
        signals: [],
        recommendations: ['More data needed for stress analysis'],
      };
    }

    const recent = readiness.slice(-3);
    const recentSleep = sleep.slice(-3);
    const signals: Array<{ signal: string; severity: number; description: string }> = [];
    let totalStress = 0;

    // Signal 1: Elevated Resting Heart Rate (autonomic stress)
    const avgRHR = recent.reduce((sum, r) => sum + r.resting_heart_rate, 0) / recent.length;
    const rhrElevation = ((avgRHR - baselines.readiness.restingHR) / baselines.readiness.restingHR) * 100;
    if (rhrElevation > 3) {
      const severity = Math.min(10, rhrElevation * 2);
      signals.push({
        signal: 'Elevated Resting Heart Rate',
        severity,
        description: `RHR is ${rhrElevation.toFixed(1)}% above baseline (${avgRHR.toFixed(0)} bpm vs ${baselines.readiness.restingHR.toFixed(0)} bpm)`,
      });
      totalStress += severity;
    }

    // Signal 2: Reduced HRV (parasympathetic withdrawal)
    const recentHRV = recent.map(r => r.hrv_balance || 0).filter(h => h > 0);
    if (recentHRV.length > 0 && baselines.readiness.hrvRange.max > 0) {
      const avgHRV = recentHRV.reduce((a, b) => a + b, 0) / recentHRV.length;
      const baselineHRV = (baselines.readiness.hrvRange.min + baselines.readiness.hrvRange.max) / 2;
      const hrvReduction = ((baselineHRV - avgHRV) / baselineHRV) * 100;
      if (hrvReduction > 10) {
        const severity = Math.min(10, hrvReduction / 2);
        signals.push({
          signal: 'Reduced Heart Rate Variability',
          severity,
          description: `HRV is ${hrvReduction.toFixed(0)}% below normal - indicates reduced autonomic flexibility`,
        });
        totalStress += severity;
      }
    }

    // Signal 3: Temperature elevation (inflammatory/immune response)
    const avgTemp = recent.reduce((sum, r) => sum + (r.temperature_deviation || 0), 0) / recent.length;
    const tempDeviation = avgTemp - baselines.readiness.temperatureDeviation;
    if (tempDeviation > 0.3) {
      const severity = Math.min(10, tempDeviation * 20);
      signals.push({
        signal: 'Elevated Body Temperature',
        severity,
        description: `Temperature ${tempDeviation > 0 ? '+' : ''}${tempDeviation.toFixed(2)}°C above baseline`,
      });
      totalStress += severity;
    }

    // Signal 4: Sleep fragmentation (sleep quality deterioration)
    const avgAwakenings = recentSleep.reduce((sum, s) => sum + s.awake_time / 60, 0) / recentSleep.length;
    if (avgAwakenings > 30) {
      const severity = Math.min(10, (avgAwakenings - 30) / 5);
      signals.push({
        signal: 'Sleep Fragmentation',
        severity,
        description: `Averaging ${avgAwakenings.toFixed(0)} minutes awake per night - suggests hyperarousal`,
      });
      totalStress += severity;
    }

    // Signal 5: Reduced sleep efficiency (difficulty maintaining sleep)
    const avgEfficiency = recentSleep.reduce((sum, s) => sum + s.efficiency, 0) / recentSleep.length;
    if (avgEfficiency < baselines.sleep.efficiency - 5) {
      const severity = Math.min(10, (baselines.sleep.efficiency - avgEfficiency) / 2);
      signals.push({
        signal: 'Poor Sleep Efficiency',
        severity,
        description: `${avgEfficiency.toFixed(0)}% efficiency (baseline: ${baselines.sleep.efficiency.toFixed(0)}%)`,
      });
      totalStress += severity;
    }

    // Signal 6: Reduced REM sleep (stress hormone impact)
    const avgREM = recentSleep.reduce((sum, s) => sum + (s.rem_sleep_duration || 0) / 3600, 0) / recentSleep.length;
    if (avgREM < 1.5) {
      const severity = Math.min(10, (1.5 - avgREM) * 5);
      signals.push({
        signal: 'Reduced REM Sleep',
        severity,
        description: `Only ${avgREM.toFixed(1)}h REM per night - cortisol may be suppressing REM`,
      });
      totalStress += severity;
    }

    // Calculate stress level
    const stressScore = Math.min(100, totalStress);
    let stressLevel: 'very_high' | 'high' | 'moderate' | 'low';
    if (stressScore >= 40) {
      stressLevel = 'very_high';
    } else if (stressScore >= 25) {
      stressLevel = 'high';
    } else if (stressScore >= 15) {
      stressLevel = 'moderate';
    } else {
      stressLevel = 'low';
    }

    // Recommendations based on stress level
    const recommendations: string[] = [];
    if (stressLevel === 'very_high') {
      recommendations.push('CRITICAL: Your body is under significant stress - immediate action needed');
      recommendations.push('Eliminate non-essential stressors for the next 3-5 days');
      recommendations.push('Practice stress-reduction: meditation, breathwork, nature walks');
      recommendations.push('Reduce or eliminate caffeine and alcohol');
      recommendations.push('Consider professional support if stress persists');
    } else if (stressLevel === 'high') {
      recommendations.push('Elevated stress detected - prioritize stress management now');
      recommendations.push('Add 15-20 minutes of daily relaxation practice');
      recommendations.push('Review and reduce commitments where possible');
      recommendations.push('Ensure 7.5-9 hours sleep opportunity nightly');
    } else if (stressLevel === 'moderate') {
      recommendations.push('Mild stress signals detected - maintain awareness');
      recommendations.push('Continue healthy stress management practices');
      recommendations.push('Monitor for escalation over next few days');
    } else {
      recommendations.push('Low stress indicators - maintain current lifestyle balance');
      recommendations.push('Continue practices that support low stress state');
    }

    return {
      stressLevel,
      stressScore: Math.round(stressScore),
      signals: signals.sort((a, b) => b.severity - a.severity),
      recommendations: recommendations.slice(0, 5),
    };
  }

  /**
   * Calculate recovery capacity - how well someone recovers from stress
   */
  static assessRecoveryCapacity(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): {
    capacity: 'excellent' | 'good' | 'average' | 'poor';
    score: number;
    factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; explanation: string }>;
    insights: string[];
  } {
    if (sleep.length < 14 || activity.length < 14 || readiness.length < 14) {
      return {
        capacity: 'average',
        score: 50,
        factors: [],
        insights: ['Insufficient data for recovery capacity assessment (need 14+ days)'],
      };
    }

    const factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; explanation: string }> = [];
    let score = 50;

    // Factor 1: Sleep consistency
    const sleepDurations = sleep.slice(-14).map(s => s.total_sleep_duration / 3600);
    const sleepStdDev = this.standardDeviation(sleepDurations);
    if (sleepStdDev < 0.5) {
      factors.push({
        factor: 'Exceptional Sleep Consistency',
        impact: 'positive',
        explanation: `Sleep duration varies by only ${(sleepStdDev * 60).toFixed(0)} minutes - enables predictable recovery`,
      });
      score += 15;
    } else if (sleepStdDev > 1.5) {
      factors.push({
        factor: 'Irregular Sleep Schedule',
        impact: 'negative',
        explanation: `Sleep duration varies by ${(sleepStdDev * 60).toFixed(0)} minutes - disrupts recovery rhythm`,
      });
      score -= 10;
    }

    // Factor 2: Deep sleep percentage
    const avgDeepSleep = sleep.slice(-14).reduce((sum, s) => sum + (s.deep_sleep_duration || 0) / s.total_sleep_duration, 0) / 14;
    if (avgDeepSleep > 0.18) {
      factors.push({
        factor: 'High Deep Sleep',
        impact: 'positive',
        explanation: `${(avgDeepSleep * 100).toFixed(0)}% deep sleep - excellent physical recovery capacity`,
      });
      score += 12;
    } else if (avgDeepSleep < 0.12) {
      factors.push({
        factor: 'Low Deep Sleep',
        impact: 'negative',
        explanation: `Only ${(avgDeepSleep * 100).toFixed(0)}% deep sleep - may limit physical recovery`,
      });
      score -= 8;
    }

    // Factor 3: HRV trend
    const last14Readiness = readiness.slice(-14);
    const hrvValues = last14Readiness.map(r => r.hrv_balance || 0).filter(h => h > 0);
    if (hrvValues.length >= 10) {
      const firstHalf = hrvValues.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
      const secondHalf = hrvValues.slice(7).reduce((a, b) => a + b, 0) / 7;
      const hrvImprovement = ((secondHalf - firstHalf) / firstHalf) * 100;
      if (hrvImprovement > 5) {
        factors.push({
          factor: 'Improving HRV Trend',
          impact: 'positive',
          explanation: `HRV increased ${hrvImprovement.toFixed(0)}% - autonomic nervous system adapting well`,
        });
        score += 10;
      } else if (hrvImprovement < -5) {
        factors.push({
          factor: 'Declining HRV Trend',
          impact: 'negative',
          explanation: `HRV decreased ${Math.abs(hrvImprovement).toFixed(0)}% - recovery capacity may be declining`,
        });
        score -= 10;
      }
    }

    // Factor 4: Recovery bounce-back speed
    const readinessScores = last14Readiness.map(r => r.score);
    let bounceBackCount = 0;
    for (let i = 1; i < readinessScores.length; i++) {
      if (readinessScores[i - 1] < 70 && readinessScores[i] >= 80) {
        bounceBackCount++;
      }
    }
    if (bounceBackCount >= 2) {
      factors.push({
        factor: 'Quick Recovery Bounce-Back',
        impact: 'positive',
        explanation: `Rapid recovery from low readiness days - resilient system`,
      });
      score += 8;
    }

    // Factor 5: Activity tolerance
    const last14Activity = activity.slice(-14);
    const highActivityDays = last14Activity.filter(a => a.score >= 85).length;
    const avgReadinessAfterHighActivity: number[] = [];
    for (let i = 0; i < last14Activity.length - 1; i++) {
      if (last14Activity[i].score >= 85) {
        avgReadinessAfterHighActivity.push(last14Readiness[i + 1].score);
      }
    }
    if (avgReadinessAfterHighActivity.length >= 2) {
      const avgRecovery = avgReadinessAfterHighActivity.reduce((a, b) => a + b, 0) / avgReadinessAfterHighActivity.length;
      if (avgRecovery >= 80) {
        factors.push({
          factor: 'High Activity Tolerance',
          impact: 'positive',
          explanation: `Maintains ${avgRecovery.toFixed(0)} readiness after intense activity - excellent recovery capacity`,
        });
        score += 10;
      } else if (avgRecovery < 65) {
        factors.push({
          factor: 'Low Activity Tolerance',
          impact: 'negative',
          explanation: `Readiness drops to ${avgRecovery.toFixed(0)} after intense activity - needs more recovery time`,
        });
        score -= 8;
      }
    }

    // Determine capacity level
    score = Math.max(0, Math.min(100, score));
    let capacity: 'excellent' | 'good' | 'average' | 'poor';
    if (score >= 75) {
      capacity = 'excellent';
    } else if (score >= 60) {
      capacity = 'good';
    } else if (score >= 40) {
      capacity = 'average';
    } else {
      capacity = 'poor';
    }

    // Generate insights
    const insights: string[] = [];
    if (capacity === 'excellent') {
      insights.push('Your body has exceptional recovery capacity - you adapt well to stress');
      insights.push('Can handle higher training loads than average');
      insights.push('Focus on maintaining current recovery practices');
    } else if (capacity === 'good') {
      insights.push('Good recovery capacity - above average adaptation to stress');
      insights.push('Continue current practices while monitoring for signs of overreaching');
    } else if (capacity === 'average') {
      insights.push('Average recovery capacity - need strategic approach to training load');
      insights.push('Focus on improving factors with negative impact');
      insights.push('May benefit from periodized training with built-in recovery weeks');
    } else {
      insights.push('Limited recovery capacity detected - requires careful management');
      insights.push('Prioritize sleep quality and consistency above all else');
      insights.push('May need extended recovery periods between hard training blocks');
      insights.push('Consider consulting with healthcare provider if capacity does not improve');
    }

    return {
      capacity,
      score: Math.round(score),
      factors,
      insights,
    };
  }

  // Helper method
  private static standardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }
}

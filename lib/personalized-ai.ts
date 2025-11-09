import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { DailyNote, getNotes } from './notes-storage';

/**
 * Ultra-Personalized AI Intelligence System
 * Implements root cause detection, personalized thresholds, and intervention tracking
 */

export interface RootCause {
  factor: string;
  impact: number; // Estimated impact in points
  confidence: number; // 0-100
  evidence: string;
  recommendation: string;
}

export interface PersonalizedBaseline {
  metric: string;
  personalOptimal: number;
  personalCritical: number;
  averageValue: number;
  bestPerformanceThreshold: number;
}

export interface InterventionEffect {
  intervention: string;
  averageImpact: number;
  sampleSize: number;
  confidence: number;
  effectiveness: 'highly_effective' | 'moderately_effective' | 'minimally_effective' | 'inconclusive';
  recommendation: string;
}

export class PersonalizedAI {
  /**
   * AI "Why" Detection - Automatically determine root causes
   * Analyzes recent data to explain score changes
   */
  static detectRootCauses(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): RootCause[] {
    if (sleep.length < 7) return [];

    const causes: RootCause[] = [];
    const latest = readiness[readiness.length - 1];
    const latestSleep = sleep[sleep.length - 1];
    const avg = readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / 7;
    const scoreChange = latest.score - avg;

    // Get daily notes for context
    const notes = getNotes();
    const recentNotes = Object.values(notes).slice(-7);

    // Analyze sleep duration impact
    const avgSleepDuration = sleep.slice(-7).reduce((sum, s) => sum + s.total_sleep_duration, 0) / 7 / 3600;
    const optimalSleep = this.calculateOptimalSleep(sleep);
    const sleepDeviation = (latestSleep.total_sleep_duration / 3600) - optimalSleep;

    if (Math.abs(sleepDeviation) > 0.5) {
      causes.push({
        factor: `Sleep Duration (${(latestSleep.total_sleep_duration / 3600).toFixed(1)}h vs optimal ${optimalSleep.toFixed(1)}h)`,
        impact: Math.round(sleepDeviation * -12), // ~12 points per hour deviation
        confidence: 85,
        evidence: `You slept ${Math.abs(sleepDeviation).toFixed(1)} hours ${sleepDeviation > 0 ? 'more' : 'less'} than your personal optimal`,
        recommendation: sleepDeviation < 0
          ? `Aim for ${optimalSleep.toFixed(1)}h tonight to recover`
          : `Your body may need this extra rest - monitor recovery`
      });
    }

    // Analyze alcohol impact from notes
    const lastNight = Object.values(notes).find(n =>
      n.date === new Date(Date.now() - 86400000).toISOString().split('T')[0]
    );
    if (lastNight?.tags?.includes('alcohol')) {
      causes.push({
        factor: 'Alcohol consumption last night',
        impact: -15,
        confidence: 90,
        evidence: 'Note indicates alcohol intake yesterday',
        recommendation: 'Alcohol typically reduces readiness by 10-20 points. Focus on hydration and recovery today'
      });
    }

    // Analyze HRV changes
    const avgHRV = readiness.slice(-7)
      .filter(r => r.hrv_balance)
      .reduce((sum, r) => sum + (r.hrv_balance || 0), 0) / 7;

    if (latest.hrv_balance && avgHRV) {
      const hrvChange = ((latest.hrv_balance - avgHRV) / avgHRV) * 100;
      if (Math.abs(hrvChange) > 15) {
        causes.push({
          factor: `HRV ${hrvChange > 0 ? 'increase' : 'decrease'}`,
          impact: Math.round(hrvChange * 0.3),
          confidence: 80,
          evidence: `HRV is ${Math.abs(hrvChange).toFixed(0)}% ${hrvChange > 0 ? 'higher' : 'lower'} than your 7-day average`,
          recommendation: hrvChange < 0
            ? 'Elevated stress or insufficient recovery detected. Consider light activity only'
            : 'Strong recovery detected. Good day for challenging workouts'
        });
      }
    }

    // Analyze stress from notes
    const stressNotes = recentNotes.filter(n => n.tags?.includes('stress'));
    if (stressNotes.length >= 2) {
      causes.push({
        factor: 'Elevated stress levels',
        impact: -8,
        confidence: 75,
        evidence: `${stressNotes.length} days of stress noted in the past week`,
        recommendation: 'Consider stress management techniques: meditation, deep breathing, or light yoga'
      });
    }

    // Analyze training load
    const recentActivity = activity.slice(-3);
    const highIntensityDays = recentActivity.filter(a => a.active_calories > (activity.reduce((sum, a) => sum + a.active_calories, 0) / activity.length) * 1.3);

    if (highIntensityDays.length >= 2) {
      causes.push({
        factor: 'High training load',
        impact: -10,
        confidence: 85,
        evidence: `${highIntensityDays.length} high-intensity days in the last 3 days`,
        recommendation: 'Your body needs recovery. Consider a rest day or active recovery session'
      });
    }

    // Sort by absolute impact
    return causes.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 5);
  }

  /**
   * Calculate personalized optimal sleep duration
   */
  static calculateOptimalSleep(sleep: SleepData[]): number {
    // Find sleep durations when scores were highest
    const highScoreSleeps = sleep
      .filter(s => s.score >= 85)
      .map(s => s.total_sleep_duration / 3600);

    if (highScoreSleeps.length === 0) {
      return 7.5; // Default
    }

    return highScoreSleeps.reduce((sum, d) => sum + d, 0) / highScoreSleeps.length;
  }

  /**
   * Calculate Personalized Thresholds based on YOUR data
   */
  static calculatePersonalizedThresholds(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): PersonalizedBaseline[] {
    const baselines: PersonalizedBaseline[] = [];

    // Readiness baseline
    const avgReadiness = readiness.reduce((sum, r) => sum + r.score, 0) / readiness.length;
    const topReadiness = readiness.filter(r => r.score >= 85);
    const lowReadiness = readiness.filter(r => r.score < 70);

    baselines.push({
      metric: 'Readiness Score',
      personalOptimal: topReadiness.length > 0
        ? topReadiness.reduce((sum, r) => sum + r.score, 0) / topReadiness.length
        : 85,
      personalCritical: lowReadiness.length > 0
        ? Math.min(...lowReadiness.map(r => r.score)) + 5
        : 65,
      averageValue: Math.round(avgReadiness),
      bestPerformanceThreshold: Math.round(avgReadiness + 10)
    });

    // Sleep baseline
    const avgSleep = sleep.reduce((sum, s) => sum + s.score, 0) / sleep.length;
    baselines.push({
      metric: 'Sleep Score',
      personalOptimal: this.calculateOptimalSleep(sleep),
      personalCritical: Math.min(...sleep.map(s => s.score)) + 10,
      averageValue: Math.round(avgSleep),
      bestPerformanceThreshold: Math.round(avgSleep + 8)
    });

    // Activity baseline
    const avgActivity = activity.reduce((sum, a) => sum + a.score, 0) / activity.length;
    baselines.push({
      metric: 'Activity Score',
      personalOptimal: Math.max(...activity.map(a => a.score)),
      personalCritical: Math.min(...activity.map(a => a.score)) + 10,
      averageValue: Math.round(avgActivity),
      bestPerformanceThreshold: Math.round(avgActivity + 8)
    });

    return baselines;
  }

  /**
   * Track Intervention Effectiveness
   * Analyzes tags in daily notes to determine what works for YOU
   */
  static analyzeInterventionEffectiveness(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): InterventionEffect[] {
    const notes = getNotes();
    const effects: InterventionEffect[] = [];

    const interventionTags = ['workout', 'meditation', 'caffeine', 'alcohol', 'stress'];

    for (const tag of interventionTags) {
      const daysWithTag = Object.values(notes).filter(n => n.tags?.includes(tag));

      if (daysWithTag.length < 3) continue; // Need at least 3 samples

      // Find readiness scores for days following the intervention
      const followingScores: number[] = [];
      daysWithTag.forEach(note => {
        const noteDate = new Date(note.date);
        const nextDay = new Date(noteDate.getTime() + 86400000).toISOString().split('T')[0];
        const nextReadiness = readiness.find(r => r.day === nextDay);
        if (nextReadiness) {
          followingScores.push(nextReadiness.score);
        }
      });

      if (followingScores.length === 0) continue;

      const avgWithIntervention = followingScores.reduce((sum, s) => sum + s, 0) / followingScores.length;
      const overallAvg = readiness.reduce((sum, r) => sum + r.score, 0) / readiness.length;
      const impact = avgWithIntervention - overallAvg;

      let effectiveness: InterventionEffect['effectiveness'];
      if (Math.abs(impact) < 2) effectiveness = 'inconclusive';
      else if (Math.abs(impact) < 5) effectiveness = 'minimally_effective';
      else if (Math.abs(impact) < 10) effectiveness = 'moderately_effective';
      else effectiveness = 'highly_effective';

      effects.push({
        intervention: tag.charAt(0).toUpperCase() + tag.slice(1),
        averageImpact: Math.round(impact * 10) / 10,
        sampleSize: followingScores.length,
        confidence: Math.min(95, 50 + followingScores.length * 5),
        effectiveness,
        recommendation: this.getInterventionRecommendation(tag, impact)
      });
    }

    return effects.sort((a, b) => Math.abs(b.averageImpact) - Math.abs(a.averageImpact));
  }

  private static getInterventionRecommendation(tag: string, impact: number): string {
    if (impact > 3) {
      return `${tag.charAt(0).toUpperCase() + tag.slice(1)} shows positive effects for you (+${impact.toFixed(1)} readiness avg). Continue this practice.`;
    } else if (impact < -3) {
      return `${tag.charAt(0).toUpperCase() + tag.slice(1)} negatively impacts your recovery (${impact.toFixed(1)} readiness avg). Consider reducing or timing differently.`;
    } else {
      return `${tag.charAt(0).toUpperCase() + tag.slice(1)} has minimal measurable impact on your metrics. Effects may be subtle or require more data.`;
    }
  }

  /**
   * Generate natural language summary of root causes
   */
  static generateWhyNarrative(causes: RootCause[], currentScore: number): string {
    if (causes.length === 0) {
      return `Your readiness score is ${currentScore}. Unable to determine specific factors with available data.`;
    }

    const primaryCause = causes[0];
    const secondaryCauses = causes.slice(1, 3);

    let narrative = `Your readiness is ${currentScore} today. `;

    if (causes.length === 1) {
      narrative += `Primary factor: ${primaryCause.factor} (estimated ${primaryCause.impact > 0 ? '+' : ''}${primaryCause.impact} points impact). `;
      narrative += primaryCause.evidence + '. ';
      narrative += primaryCause.recommendation;
    } else {
      narrative += `Likely causes: (1) ${primaryCause.factor} → estimated ${primaryCause.impact > 0 ? '+' : ''}${primaryCause.impact}pts`;

      if (secondaryCauses.length > 0) {
        secondaryCauses.forEach((cause, idx) => {
          narrative += `, (${idx + 2}) ${cause.factor} → ${cause.impact > 0 ? '+' : ''}${cause.impact}pts`;
        });
      }

      narrative += '. Top recommendation: ' + primaryCause.recommendation;
    }

    return narrative;
  }
}

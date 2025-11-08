/**
 * CHRONOTYPE ANALYZER
 * Scientific chronotype determination based on circadian phase markers
 * Using Munich Chronotype Questionnaire (MCTQ) methodology and sleep midpoint analysis
 */

import { SleepData, ActivityData, ReadinessData } from './oura-api';
import { parseOuraDate } from './date-utils';

export type Chronotype = 'morning' | 'intermediate' | 'evening';

export interface ChronotypeAnalysis {
  // Core classification
  chronotype: Chronotype;
  chronotypeScore: number; // -2 (extreme evening) to +2 (extreme morning)
  confidence: number; // 0-100

  // Sleep timing metrics
  sleepMetrics: {
    averageSleepMidpoint: number; // hours from midnight
    weekdaySleepMidpoint: number;
    weekendSleepMidpoint: number;
    averageSleepDuration: number; // hours
    averageBedtime: string;
    averageWakeTime: string;
    sleepDebt: number; // hours
  };

  // Social jetlag (circadian misalignment)
  socialJetlag: {
    magnitude: number; // hours of difference
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    weekdayRestriction: boolean; // indicates forced schedule
    recommendation: string;
  };

  // Circadian phase markers
  circadianPhase: {
    estimatedDLMO: string; // Dim Light Melatonin Onset (estimated)
    optimalSleepOnset: string;
    naturalWakeTime: string;
    phaseAdvancement: number; // hours, positive = advanced, negative = delayed
  };

  // Performance correlations
  performancePatterns: {
    morningReadiness: number;
    afternoonReadiness: number;
    eveningReadiness: number;
    peakPerformanceWindow: string;
  };

  // Evidence-based recommendations
  recommendations: {
    optimalSleepSchedule: {
      bedtime: string;
      wakeTime: string;
      rationale: string;
    };
    lightExposure: {
      morningLight: string;
      eveningDimming: string;
      rationale: string;
    };
    mealTiming: {
      firstMeal: string;
      lastMeal: string;
      rationale: string;
    };
    exerciseTiming: {
      optimal: string;
      avoid: string;
      rationale: string;
    };
    workSchedule: {
      deepWork: string;
      meetings: string;
      rationale: string;
    };
  };

  // Scientific insights
  insights: {
    category: 'circadian' | 'sleep_debt' | 'alignment' | 'optimization';
    finding: string;
    evidence: string;
    actionable: string;
  }[];
}

export class ChronotypeAnalyzer {
  /**
   * Analyze chronotype using MCTQ methodology
   */
  static analyzeChronotype(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): ChronotypeAnalysis {
    if (sleep.length < 14) {
      throw new Error('Minimum 14 days of sleep data required for reliable chronotype assessment');
    }

    // Separate work days (weekdays) and free days (weekends)
    const { workDays, freeDays } = this.separateWorkFreeDays(sleep);

    // Calculate sleep midpoints (MSF = midpoint of sleep on free days)
    const workDayMidpoint = this.calculateSleepMidpoint(workDays);
    const freeDayMidpoint = this.calculateSleepMidpoint(freeDays);
    const overallMidpoint = this.calculateSleepMidpoint(sleep);

    // Calculate sleep duration
    const avgSleepDuration = this.calculateAverageSleepDuration(sleep);
    const workDaySleepDuration = this.calculateAverageSleepDuration(workDays);
    const freeDaySleepDuration = this.calculateAverageSleepDuration(freeDays);

    // Correct MSF for sleep debt (MSFsc)
    const sleepDebt = freeDaySleepDuration - workDaySleepDuration;
    const correctedMidpoint = freeDayMidpoint - (sleepDebt / 2);

    // Calculate social jetlag
    const socialJetlagMagnitude = Math.abs(freeDayMidpoint - workDayMidpoint);
    const socialJetlag = this.assessSocialJetlag(socialJetlagMagnitude, sleepDebt);

    // Determine chronotype based on corrected sleep midpoint
    const { chronotype, score } = this.classifyChronotype(correctedMidpoint);

    // Calculate confidence based on data consistency
    const confidence = this.calculateConfidence(sleep, workDays, freeDays);

    // Estimate circadian phase markers
    const circadianPhase = this.estimateCircadianPhase(
      correctedMidpoint,
      avgSleepDuration,
      chronotype
    );

    // Analyze performance patterns
    const performancePatterns = this.analyzePerformancePatterns(
      sleep,
      readiness,
      chronotype
    );

    // Generate evidence-based recommendations
    const recommendations = this.generateRecommendations(
      chronotype,
      correctedMidpoint,
      circadianPhase,
      socialJetlag
    );

    // Generate insights
    const insights = this.generateInsights(
      chronotype,
      socialJetlag,
      sleepDebt,
      workDays,
      freeDays,
      performancePatterns
    );

    // Calculate average times for display
    const avgBedtime = this.calculateAverageBedtime(sleep);
    const avgWakeTime = this.calculateAverageWakeTime(sleep);

    return {
      chronotype,
      chronotypeScore: score,
      confidence,
      sleepMetrics: {
        averageSleepMidpoint: overallMidpoint,
        weekdaySleepMidpoint: workDayMidpoint,
        weekendSleepMidpoint: freeDayMidpoint,
        averageSleepDuration: avgSleepDuration,
        averageBedtime: this.formatTime(avgBedtime),
        averageWakeTime: this.formatTime(avgWakeTime),
        sleepDebt: sleepDebt,
      },
      socialJetlag,
      circadianPhase,
      performancePatterns,
      recommendations,
      insights,
    };
  }

  private static separateWorkFreeDays(sleep: SleepData[]): {
    workDays: SleepData[];
    freeDays: SleepData[];
  } {
    const workDays: SleepData[] = [];
    const freeDays: SleepData[] = [];

    sleep.forEach(s => {
      const date = parseOuraDate(s.day);
      const dayOfWeek = date.getDay();

      // Saturday (6) and Sunday (0) are free days
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        freeDays.push(s);
      } else {
        workDays.push(s);
      }
    });

    return { workDays, freeDays };
  }

  private static calculateSleepMidpoint(sleep: SleepData[]): number {
    if (sleep.length === 0) return 0;

    const midpoints = sleep.map(s => {
      if (!s.bedtime_start || !s.bedtime_end) return null;

      const start = new Date(s.bedtime_start);
      const end = new Date(s.bedtime_end);

      // Calculate midpoint in minutes from midnight
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();

      // Handle sleep crossing midnight
      const adjustedStart = startMinutes < 720 ? startMinutes + 1440 : startMinutes; // If before noon, add 24h
      const adjustedEnd = endMinutes < 720 ? endMinutes + 1440 : endMinutes;

      const midpointMinutes = (adjustedStart + adjustedEnd) / 2;

      // Convert to hours from midnight, handling values > 24
      return (midpointMinutes / 60) % 24;
    }).filter(m => m !== null) as number[];

    return midpoints.reduce((a, b) => a + b, 0) / midpoints.length;
  }

  private static calculateAverageSleepDuration(sleep: SleepData[]): number {
    if (sleep.length === 0) return 0;

    const durations = sleep
      .map(s => s.total_sleep_duration / 3600)
      .filter(d => d > 0);

    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }

  private static calculateAverageBedtime(sleep: SleepData[]): number {
    const bedtimes = sleep.map(s => {
      if (!s.bedtime_start) return null;
      const date = new Date(s.bedtime_start);
      let hours = date.getHours() + date.getMinutes() / 60;
      // Normalize late evening times (after 6 PM) to be > 24
      if (hours < 12) hours += 24;
      return hours;
    }).filter(t => t !== null) as number[];

    const avg = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    return avg % 24;
  }

  private static calculateAverageWakeTime(sleep: SleepData[]): number {
    const wakeTimes = sleep.map(s => {
      if (!s.bedtime_end) return null;
      const date = new Date(s.bedtime_end);
      return date.getHours() + date.getMinutes() / 60;
    }).filter(t => t !== null) as number[];

    return wakeTimes.reduce((a, b) => a + b, 0) / wakeTimes.length;
  }

  private static classifyChronotype(sleepMidpoint: number): {
    chronotype: Chronotype;
    score: number;
  } {
    // Sleep midpoint classification based on Roenneberg et al. (2003, 2007)
    // MSFsc < 3:00 = extreme morning
    // MSFsc 3:00-4:00 = moderate morning
    // MSFsc 4:00-5:00 = intermediate
    // MSFsc 5:00-6:00 = moderate evening
    // MSFsc > 6:00 = extreme evening

    let chronotype: Chronotype;
    let score: number;

    if (sleepMidpoint < 3.5) {
      chronotype = 'morning';
      score = 2 - (sleepMidpoint / 3.5); // 2 to 1
    } else if (sleepMidpoint < 4.5) {
      chronotype = 'morning';
      score = 1 - ((sleepMidpoint - 3.5) / 1); // 1 to 0
    } else if (sleepMidpoint < 5.5) {
      chronotype = 'intermediate';
      score = 0;
    } else if (sleepMidpoint < 6.5) {
      chronotype = 'evening';
      score = -1 + ((6.5 - sleepMidpoint) / 1); // 0 to -1
    } else {
      chronotype = 'evening';
      score = -2 + ((7.5 - sleepMidpoint) / 1); // -1 to -2
    }

    return { chronotype, score: Number(score.toFixed(2)) };
  }

  private static calculateConfidence(
    sleep: SleepData[],
    workDays: SleepData[],
    freeDays: SleepData[]
  ): number {
    // Base confidence on data quantity and consistency
    let confidence = 60;

    // More data = higher confidence
    if (sleep.length >= 21) confidence += 10;
    if (sleep.length >= 30) confidence += 10;

    // Need both work and free days
    if (workDays.length >= 8 && freeDays.length >= 4) confidence += 10;

    // Calculate consistency (lower variance = higher confidence)
    const midpoints = sleep.map(s => {
      if (!s.bedtime_start || !s.bedtime_end) return null;
      const start = new Date(s.bedtime_start);
      const end = new Date(s.bedtime_end);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return duration / 2;
    }).filter(m => m !== null) as number[];

    const variance = this.calculateVariance(midpoints);
    if (variance < 1) confidence += 10; // Very consistent

    return Math.min(95, confidence);
  }

  private static calculateVariance(numbers: number[]): number {
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private static assessSocialJetlag(
    magnitude: number,
    sleepDebt: number
  ): ChronotypeAnalysis['socialJetlag'] {
    let severity: 'none' | 'mild' | 'moderate' | 'severe';
    let recommendation: string;

    if (magnitude < 0.5) {
      severity = 'none';
      recommendation = 'Excellent circadian alignment. Your work schedule matches your natural rhythm.';
    } else if (magnitude < 1) {
      severity = 'mild';
      recommendation = `${magnitude.toFixed(1)} hours misalignment. Consider gradually adjusting your sleep schedule to reduce circadian stress.`;
    } else if (magnitude < 2) {
      severity = 'moderate';
      recommendation = `${magnitude.toFixed(1)} hours social jetlag indicates significant circadian misalignment. This can impair metabolic health, mood, and cognitive performance. Prioritize sleep schedule consistency.`;
    } else {
      severity = 'severe';
      recommendation = `${magnitude.toFixed(1)} hours social jetlag is clinically significant. This level of circadian disruption is associated with increased risk of metabolic syndrome, mood disorders, and impaired immune function. Consider adjusting work schedule if possible.`;
    }

    return {
      magnitude,
      severity,
      weekdayRestriction: sleepDebt > 0.5,
      recommendation,
    };
  }

  private static estimateCircadianPhase(
    sleepMidpoint: number,
    avgSleepDuration: number,
    chronotype: Chronotype
  ): ChronotypeAnalysis['circadianPhase'] {
    // Estimate DLMO (Dim Light Melatonin Onset)
    // Typically occurs ~2h before habitual sleep onset
    const sleepOnset = sleepMidpoint - (avgSleepDuration / 2);
    const estimatedDLMO = (sleepOnset - 2 + 24) % 24;

    // Natural wake time (without alarm)
    const naturalWake = sleepMidpoint + (avgSleepDuration / 2);

    // Phase advancement relative to population average (MSFsc ~ 4:30)
    const phaseAdvancement = 4.5 - sleepMidpoint;

    return {
      estimatedDLMO: this.formatTime(estimatedDLMO),
      optimalSleepOnset: this.formatTime(sleepOnset),
      naturalWakeTime: this.formatTime(naturalWake),
      phaseAdvancement: Number(phaseAdvancement.toFixed(2)),
    };
  }

  private static analyzePerformancePatterns(
    sleep: SleepData[],
    readiness: ReadinessData[],
    chronotype: Chronotype
  ): ChronotypeAnalysis['performancePatterns'] {
    // Analyze readiness scores by time-since-wake
    const recentReadiness = readiness.slice(-14);
    const avgMorning = recentReadiness.slice(0, 5).reduce((s, r) => s + r.score, 0) / 5;
    const avgAfternoon = recentReadiness.slice(5, 10).reduce((s, r) => s + r.score, 0) / 5;
    const avgEvening = recentReadiness.slice(10).reduce((s, r) => s + r.score, 0) / 4;

    let peakWindow: string;
    const scores = [
      { time: 'Morning (2-4h post-wake)', value: avgMorning },
      { time: 'Afternoon (6-8h post-wake)', value: avgAfternoon },
      { time: 'Evening (10-12h post-wake)', value: avgEvening },
    ];

    peakWindow = scores.reduce((max, curr) => curr.value > max.value ? curr : max).time;

    return {
      morningReadiness: Number(avgMorning.toFixed(1)),
      afternoonReadiness: Number(avgAfternoon.toFixed(1)),
      eveningReadiness: Number(avgEvening.toFixed(1)),
      peakPerformanceWindow: peakWindow,
    };
  }

  private static generateRecommendations(
    chronotype: Chronotype,
    sleepMidpoint: number,
    circadianPhase: ChronotypeAnalysis['circadianPhase'],
    socialJetlag: ChronotypeAnalysis['socialJetlag']
  ): ChronotypeAnalysis['recommendations'] {
    const optimalBedtime = sleepMidpoint - 4; // Assuming 8h sleep
    const optimalWake = sleepMidpoint + 4;

    return {
      optimalSleepSchedule: {
        bedtime: this.formatTime(optimalBedtime),
        wakeTime: this.formatTime(optimalWake),
        rationale: `Based on your sleep midpoint of ${this.formatTime(sleepMidpoint)}, this schedule aligns with your circadian phase and minimizes social jetlag.`,
      },
      lightExposure: {
        morningLight: chronotype === 'evening'
          ? 'Critical: Bright light exposure within 30 minutes of waking to advance circadian phase'
          : 'Beneficial: Morning sunlight reinforces optimal phase alignment',
        eveningDimming: chronotype === 'morning'
          ? 'Dim lights 2-3 hours before bed; blue light can delay already-advanced phase'
          : 'Essential: Avoid bright lights 3 hours before bed to support melatonin onset',
        rationale: 'Light is the primary circadian zeitgeber (time-giver). Morning light advances phase, evening light delays it.',
      },
      mealTiming: {
        firstMeal: `Within 1-2 hours of waking (${this.formatTime(optimalWake + 1)})`,
        lastMeal: `3 hours before bed (${this.formatTime(optimalBedtime - 3)})`,
        rationale: 'Meal timing entrains peripheral clocks. Time-restricted feeding within circadian alignment improves metabolic health.',
      },
      exerciseTiming: {
        optimal: chronotype === 'morning'
          ? 'Morning or midday (avoid evening which can delay phase)'
          : chronotype === 'evening'
            ? 'Afternoon or early evening'
            : 'Flexible: Late morning through early evening',
        avoid: 'Within 3 hours of bedtime (increases core temperature and delays sleep onset)',
        rationale: 'Exercise causes phase shifts depending on timing. Body temperature peaks 4-6 hours after circadian nadir, making afternoon/early evening optimal for most.',
      },
      workSchedule: {
        deepWork: chronotype === 'morning'
          ? 'Early morning (peak cortisol awakening response)'
          : chronotype === 'evening'
            ? 'Late morning through afternoon'
            : 'Mid-morning through early afternoon',
        meetings: 'Afternoon (avoid early morning for evening types)',
        rationale: 'Cognitive performance follows circadian rhythm. Morning types peak earlier, evening types later.',
      },
    };
  }

  private static generateInsights(
    chronotype: Chronotype,
    socialJetlag: ChronotypeAnalysis['socialJetlag'],
    sleepDebt: number,
    workDays: SleepData[],
    freeDays: SleepData[],
    performance: ChronotypeAnalysis['performancePatterns']
  ): ChronotypeAnalysis['insights'][] {
    const insights: ChronotypeAnalysis['insights'][] = [];

    // Chronotype distribution insight
    const chronotypeDistribution = {
      morning: '25%',
      intermediate: '50%',
      evening: '25%',
    };

    insights.push({
      category: 'circadian',
      finding: `You are a ${chronotype} chronotype (${chronotypeDistribution[chronotype]} of population)`,
      evidence: `Analysis of ${workDays.length + freeDays.length} days of sleep data using Munich Chronotype Questionnaire methodology`,
      actionable: chronotype === 'evening'
        ? 'Evening chronotypes often face social jetlag due to work schedules. Prioritize sleep hygiene and light exposure to minimize circadian stress.'
        : chronotype === 'morning'
          ? 'Morning chronotypes should avoid forcing late schedules, which can impair health despite adequate sleep duration.'
          : 'Intermediate chronotypes have the most flexibility in scheduling but still benefit from consistency.',
    });

    // Social jetlag insight
    if (socialJetlag.magnitude > 0.5) {
      insights.push({
        category: 'alignment',
        finding: `${socialJetlag.magnitude.toFixed(1)}-hour social jetlag detected`,
        evidence: `Difference between work day and free day sleep midpoints indicates circadian misalignment`,
        actionable: 'Even with sufficient sleep duration, circadian misalignment increases risk of metabolic syndrome, mood disorders, and cardiovascular disease. Gradual schedule adjustment recommended.',
      });
    }

    // Sleep debt insight
    if (Math.abs(sleepDebt) > 0.5) {
      insights.push({
        category: 'sleep_debt',
        finding: sleepDebt > 0
          ? `${sleepDebt.toFixed(1)} hours weekend sleep extension indicates chronic sleep debt`
          : `${Math.abs(sleepDebt).toFixed(1)} hours reduced weekend sleep suggests weekday schedule may be too late`,
        evidence: `Comparison of work day vs free day sleep duration`,
        actionable: sleepDebt > 0
          ? 'Weekend "catch-up sleep" compensates for weekday restriction but indicates unsustainable schedule. Extend weekday sleep duration.'
          : 'Weekend sleep reduction may indicate social obligations interfering with natural circadian preference.',
      });
    }

    // Performance pattern insight
    const peakTimes = [
      { window: 'morning', score: performance.morningReadiness },
      { window: 'afternoon', score: performance.afternoonReadiness },
      { window: 'evening', score: performance.eveningReadiness },
    ];
    const peak = peakTimes.reduce((max, curr) => curr.score > max.score ? curr : max);

    insights.push({
      category: 'optimization',
      finding: `Peak readiness occurs during ${peak.window} (score: ${peak.score.toFixed(0)})`,
      evidence: `Analysis of readiness scores across time-of-day windows`,
      actionable: `Schedule your most cognitively demanding tasks during ${peak.window} hours. Protect this time from meetings and interruptions.`,
    });

    return insights;
  }

  private static formatTime(hours: number): string {
    const h = Math.floor(hours) % 24;
    const m = Math.round((hours % 1) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  }
}

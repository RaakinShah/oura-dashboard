/**
 * SLEEP DEBT CALCULATOR
 * Tracks accumulated sleep deficit and estimates recovery time
 * Based on two-process model of sleep regulation (Borbély, 1982)
 */

import { SleepData } from './oura-api';
import { parseOuraDate } from './date-utils';

export interface SleepDebtAnalysis {
  // Current debt status
  currentDebt: number; // hours
  severity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical';

  // Historical tracking
  debtTrend: 'improving' | 'worsening' | 'stable';
  debtHistory: {
    date: string;
    debt: number;
    dailyDeficit: number;
  }[];

  // Optimal sleep need
  estimatedSleepNeed: number; // hours per night
  confidence: number; // 0-100

  // Recovery analysis
  recoveryEstimate: {
    daysToRecovery: number;
    hoursNeededTonight: number;
    weekendRecoveryPlan: string;
  };

  // Performance impact
  impact: {
    cognitiveImpairment: number; // percentage
    equivalentBAC: number; // blood alcohol content equivalent
    accidentRisk: number; // relative risk multiplier
    description: string;
  };

  // Recommendations
  recommendations: {
    immediate: string[];
    weekly: string[];
    longTerm: string[];
  };

  // Scientific insights
  insights: {
    finding: string;
    evidence: string;
    recommendation: string;
  }[];
}

export class SleepDebtCalculator {
  /**
   * Calculate sleep debt using homeostatic sleep pressure model
   */
  static analyzeSleepDebt(sleep: SleepData[]): SleepDebtAnalysis {
    if (sleep.length < 7) {
      throw new Error('Minimum 7 days of sleep data required for debt analysis');
    }

    // Estimate individual sleep need
    const { sleepNeed, confidence } = this.estimateSleepNeed(sleep);

    // Calculate daily deficits and cumulative debt
    const debtHistory = this.calculateDebtHistory(sleep, sleepNeed);
    const currentDebt = debtHistory[debtHistory.length - 1]?.debt || 0;

    // Assess severity
    const severity = this.assessSeverity(currentDebt);

    // Analyze trend
    const debtTrend = this.analyzeTrend(debtHistory);

    // Calculate performance impact
    const impact = this.calculateImpact(currentDebt);

    // Generate recovery plan
    const recoveryEstimate = this.generateRecoveryPlan(currentDebt, sleepNeed);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      currentDebt,
      severity,
      sleepNeed,
      debtHistory
    );

    // Generate insights
    const insights = this.generateInsights(
      currentDebt,
      severity,
      debtHistory,
      sleepNeed
    );

    return {
      currentDebt,
      severity,
      debtTrend,
      debtHistory: debtHistory.slice(-30), // Last 30 days
      estimatedSleepNeed: sleepNeed,
      confidence,
      recoveryEstimate,
      impact,
      recommendations,
      insights,
    };
  }

  private static estimateSleepNeed(sleep: SleepData[]): {
    sleepNeed: number;
    confidence: number;
  } {
    // Use weekend/free day sleep as proxy for unrestricted sleep need
    // Separate weekdays and weekends
    const weekendSleep = sleep.filter(s => {
      const date = parseOuraDate(s.day);
      const day = date.getDay();
      return day === 0 || day === 6;
    });

    if (weekendSleep.length < 4) {
      // Fallback: use days with >8h sleep
      const longSleepDays = sleep.filter(s => s.total_sleep_duration / 3600 > 8);

      if (longSleepDays.length >= 3) {
        const avgLongSleep = longSleepDays.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / longSleepDays.length;
        return {
          sleepNeed: Number(avgLongSleep.toFixed(1)),
          confidence: 60,
        };
      }

      // Last resort: assume 8 hours
      return {
        sleepNeed: 8.0,
        confidence: 40,
      };
    }

    // Average weekend sleep duration
    const avgWeekendSleep = weekendSleep.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / weekendSleep.length;

    // Adjust for sleep debt (people with chronic debt sleep longer on weekends)
    const weekdaySleep = sleep.filter(s => {
      const date = parseOuraDate(s.day);
      const day = date.getDay();
      return day !== 0 && day !== 6;
    });

    const avgWeekdaySleep = weekdaySleep.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / weekdaySleep.length;

    // If weekend sleep >> weekday sleep, true need is likely between them
    const weekendExtension = avgWeekendSleep - avgWeekdaySleep;

    let estimatedNeed: number;
    let confidence: number;

    if (weekendExtension < 0.5) {
      // Minimal extension = sleep need likely met
      estimatedNeed = avgWeekdaySleep;
      confidence = 85;
    } else if (weekendExtension < 1.5) {
      // Moderate extension = need is weekend sleep minus half the extension
      estimatedNeed = avgWeekendSleep - (weekendExtension * 0.3);
      confidence = 75;
    } else {
      // Large extension = chronic debt, harder to estimate true need
      estimatedNeed = avgWeekdaySleep + 1;
      confidence = 60;
    }

    return {
      sleepNeed: Number(estimatedNeed.toFixed(1)),
      confidence,
    };
  }

  private static calculateDebtHistory(
    sleep: SleepData[],
    sleepNeed: number
  ): SleepDebtAnalysis['debtHistory'] {
    let cumulativeDebt = 0;
    const history: SleepDebtAnalysis['debtHistory'] = [];

    // Calculate with decay factor (debt recovers slightly each day even without extra sleep)
    const DAILY_DECAY = 0.05; // 5% natural recovery per day

    sleep.forEach(s => {
      const actualSleep = s.total_sleep_duration / 3600;
      const dailyDeficit = sleepNeed - actualSleep;

      // Update cumulative debt with decay
      cumulativeDebt = (cumulativeDebt * (1 - DAILY_DECAY)) + dailyDeficit;

      // Don't allow negative debt (sleep bank doesn't exist long-term)
      cumulativeDebt = Math.max(0, cumulativeDebt);

      history.push({
        date: s.day,
        debt: Number(cumulativeDebt.toFixed(2)),
        dailyDeficit: Number(dailyDeficit.toFixed(2)),
      });
    });

    return history;
  }

  private static assessSeverity(debt: number): SleepDebtAnalysis['severity'] {
    if (debt < 2) return 'none';
    if (debt < 5) return 'mild';
    if (debt < 10) return 'moderate';
    if (debt < 15) return 'severe';
    return 'critical';
  }

  private static analyzeTrend(
    history: SleepDebtAnalysis['debtHistory']
  ): SleepDebtAnalysis['debtTrend'] {
    if (history.length < 7) return 'stable';

    const recentWeek = history.slice(-7);
    const previousWeek = history.slice(-14, -7);

    if (previousWeek.length === 0) return 'stable';

    const recentAvg = recentWeek.reduce((sum, h) => sum + h.debt, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, h) => sum + h.debt, 0) / previousWeek.length;

    const change = recentAvg - previousAvg;

    if (Math.abs(change) < 1) return 'stable';
    if (change < 0) return 'improving';
    return 'worsening';
  }

  private static calculateImpact(debt: number): SleepDebtAnalysis['impact'] {
    // Research-based impact calculations

    // Cognitive impairment: roughly 10% per 2 hours of debt
    const cognitiveImpairment = Math.min(50, (debt / 2) * 10);

    // BAC equivalent: 17-19 hours awake ≈ 0.05% BAC
    // Each 2h of debt roughly equivalent to 4h of wakefulness
    const equivalentBAC = Number(((debt / 2) * 0.02).toFixed(3));

    // Accident risk multiplier
    let accidentRisk: number;
    if (debt < 2) accidentRisk = 1.0;
    else if (debt < 5) accidentRisk = 1.5;
    else if (debt < 10) accidentRisk = 2.0;
    else if (debt < 15) accidentRisk = 3.0;
    else accidentRisk = 4.0;

    // Description
    let description: string;
    if (debt < 2) {
      description = 'Minimal impairment. Normal cognitive and physical function.';
    } else if (debt < 5) {
      description = 'Mild impairment. Slight decreases in attention, reaction time, and mood. Performance on complex tasks affected.';
    } else if (debt < 10) {
      description = 'Moderate impairment. Significant deficits in attention, memory, and executive function. Equivalent to mild alcohol intoxication.';
    } else if (debt < 15) {
      description = 'Severe impairment. Major cognitive deficits, emotional dysregulation, increased accident risk. Equivalent to moderate alcohol intoxication.';
    } else {
      description = 'Critical impairment. Profound cognitive dysfunction, microsleeps, severely increased accident risk. Operating vehicle or machinery is dangerous.';
    }

    return {
      cognitiveImpairment: Number(cognitiveImpairment.toFixed(1)),
      equivalentBAC,
      accidentRisk,
      description,
    };
  }

  private static generateRecoveryPlan(
    debt: number,
    sleepNeed: number
  ): SleepDebtAnalysis['recoveryEstimate'] {
    // Recovery is slower than accumulation (can't fully catch up in one night)
    // Rule of thumb: recover ~25% of debt per night of extended sleep

    const RECOVERY_RATE = 0.25;

    // Hours of extra sleep needed tonight for meaningful recovery
    const hoursNeededTonight = Math.min(
      2, // Cap at 2 extra hours (more isn't better)
      debt * RECOVERY_RATE
    );

    // Days to full recovery with optimal sleep
    const daysToRecovery = Math.ceil(debt / (sleepNeed * 0.1)); // 10% recovery per optimal night

    // Weekend recovery plan
    let weekendRecoveryPlan: string;
    if (debt < 2) {
      weekendRecoveryPlan = 'No special recovery needed. Maintain your current schedule.';
    } else if (debt < 5) {
      weekendRecoveryPlan = `Sleep ${sleepNeed + 1} hours Fri-Sat and Sat-Sun to recover ${(2 * RECOVERY_RATE * 4).toFixed(1)}h of debt.`;
    } else {
      weekendRecoveryPlan = `Priority recovery: Sleep ${sleepNeed + 1.5} hours Fri-Sun. This weekend can recover ~${(2 * RECOVERY_RATE * 6).toFixed(1)}h. Full recovery requires ${daysToRecovery} days of optimal sleep.`;
    }

    return {
      daysToRecovery,
      hoursNeededTonight: Number(hoursNeededTonight.toFixed(1)),
      weekendRecoveryPlan,
    };
  }

  private static generateRecommendations(
    debt: number,
    severity: SleepDebtAnalysis['severity'],
    sleepNeed: number,
    history: SleepDebtAnalysis['debtHistory']
  ): SleepDebtAnalysis['recommendations'] {
    const immediate: string[] = [];
    const weekly: string[] = [];
    const longTerm: string[] = [];

    // Immediate recommendations based on severity
    if (severity === 'severe' || severity === 'critical') {
      immediate.push(`URGENT: Sleep ${sleepNeed + 2}+ hours tonight - Set bedtime ${Math.ceil(sleepNeed + 2)} hours before wake time`);
      immediate.push('Cancel non-essential obligations today to prioritize sleep');
      immediate.push('Avoid driving or operating machinery if possible');
      immediate.push('No alcohol tonight (impairs recovery sleep quality)');
    } else if (severity === 'moderate') {
      immediate.push(`Tonight: Target ${sleepNeed + 1}+ hours of sleep`);
      immediate.push('Minimize caffeine after 2 PM');
      immediate.push('Dim lights and avoid screens 2 hours before bed');
    } else if (severity === 'mild') {
      immediate.push(`Aim for ${sleepNeed} hours of sleep tonight`);
      immediate.push('Consider earlier bedtime tonight if possible');
    } else {
      immediate.push(`Maintain current schedule (${sleepNeed} hours per night)`);
    }

    // Weekly recommendations
    weekly.push(`Establish consistent sleep schedule: Bed by ${this.formatRecommendedBedtime(sleepNeed)}`);
    weekly.push('Protect weeknight sleep - Decline evening commitments if needed');

    if (debt > 3) {
      weekly.push('Weekend recovery: Sleep 1-2 hours extra Friday and Saturday nights');
      weekly.push('Get morning sunlight exposure to strengthen circadian rhythm');
    }

    weekly.push('Track sleep daily to prevent debt accumulation');

    // Long-term recommendations
    longTerm.push('Identify and eliminate chronic sleep restrictors (work schedule, evening habits, environment)');
    longTerm.push(`Build sleep buffer: Target ${sleepNeed} + 15 minutes to account for variability`);

    if (history.slice(-14).filter(h => h.dailyDeficit > 1).length > 7) {
      longTerm.push('Chronic sleep restriction detected - Consider schedule restructuring or sleep medicine consultation');
    }

    longTerm.push('Develop automated sleep hygiene routine (remove decision fatigue)');
    longTerm.push('Create environmental optimization: Temperature, darkness, noise control');

    return {
      immediate,
      weekly,
      longTerm,
    };
  }

  private static generateInsights(
    debt: number,
    severity: SleepDebtAnalysis['severity'],
    history: SleepDebtAnalysis['debtHistory'],
    sleepNeed: number
  ): SleepDebtAnalysis['insights'] {
    const insights: SleepDebtAnalysis['insights'] = [];

    // Main debt status insight
    insights.push({
      finding: `Current sleep debt: ${debt.toFixed(1)} hours (${severity} severity)`,
      evidence: `Cumulative calculation based on ${history.length} days of sleep data vs estimated need of ${sleepNeed}h/night`,
      recommendation: debt > 5
        ? 'Sleep debt above 5 hours significantly impairs cognitive function and metabolic health. Prioritize recovery this week.'
        : debt > 2
          ? 'Moderate sleep debt is recoverable with consistent optimal sleep this week.'
          : 'Minimal sleep debt. Focus on maintaining current sleep duration.',
    });

    // Pattern analysis
    const consecutiveDeficits = this.findConsecutiveDeficits(history);
    if (consecutiveDeficits >= 3) {
      insights.push({
        finding: `${consecutiveDeficits} consecutive days of sleep restriction detected`,
        evidence: 'Chronic restriction pattern in recent history',
        recommendation: 'Consecutive deficits compound rapidly. Break the cycle tonight with extended sleep opportunity.',
      });
    }

    // Weekend pattern
    const recentWeekends = history.slice(-30).filter((h, i) => {
      const date = parseOuraDate(h.date);
      const day = date.getDay();
      return day === 0 || day === 6;
    });

    if (recentWeekends.length >= 4) {
      const weekendDeficitAvg = recentWeekends.reduce((sum, h) => sum + h.dailyDeficit, 0) / recentWeekends.length;

      if (weekendDeficitAvg > 0.5) {
        insights.push({
          finding: 'Weekend sleep restriction pattern',
          evidence: `Average ${weekendDeficitAvg.toFixed(1)}h deficit even on weekends`,
          recommendation: 'Weekend restriction often indicates social obligations interfering with recovery. Protect weekend morning sleep.',
        });
      }
    }

    // Recovery capacity insight
    const improvementPotential = debt * 0.25; // 25% recoverable this weekend
    if (debt > 5) {
      insights.push({
        finding: `Optimal weekend can recover ~${improvementPotential.toFixed(1)}h of debt`,
        evidence: 'Recovery sleep yields ~25% debt reduction per extended night',
        recommendation: `Full recovery requires sustained optimal sleep, not just one weekend. Budget ${Math.ceil(debt / (sleepNeed * 0.1))} days for complete recovery.`,
      });
    }

    return insights;
  }

  private static findConsecutiveDeficits(history: SleepDebtAnalysis['debtHistory']): number {
    let maxConsecutive = 0;
    let currentStreak = 0;

    history.slice(-14).forEach(h => {
      if (h.dailyDeficit > 0.5) {
        currentStreak++;
        maxConsecutive = Math.max(maxConsecutive, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxConsecutive;
  }

  private static formatRecommendedBedtime(sleepNeed: number): string {
    // Assume 7 AM wake time for general recommendation
    const wakeTime = 7;
    const bedtime = (wakeTime - sleepNeed + 24) % 24;

    const h = Math.floor(bedtime);
    const m = Math.round((bedtime % 1) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);

    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  }
}

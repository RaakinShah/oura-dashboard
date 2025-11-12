import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { AdvancedStatistics } from './statistics';
import { Pattern, CorrelationResult } from './types';

/**
 * Advanced Pattern Recognition Engine
 * Detects complex, multi-metric patterns in health data
 */
export class PatternRecognition {
  /**
   * Discover hidden correlations between all metrics
   */
  static discoverCorrelations(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Array<{
    metric1: string;
    metric2: string;
    correlation: CorrelationResult;
    insight: string;
  }> {
    const correlations: Array<{
      metric1: string;
      metric2: string;
      correlation: CorrelationResult;
      insight: string;
    }> = [];

    // Extract time-aligned metrics
    const metrics = this.extractAlignedMetrics(sleep, activity, readiness);
    if (metrics.length < 7) return correlations;

    // Test all meaningful correlations
    const tests = [
      { x: metrics.map(m => m.sleepDuration), y: metrics.map(m => m.readiness),
        name1: 'Sleep Duration', name2: 'Readiness' },
      { x: metrics.map(m => m.sleepEfficiency), y: metrics.map(m => m.readiness),
        name1: 'Sleep Efficiency', name2: 'Readiness' },
      { x: metrics.map(m => m.deepSleep), y: metrics.map(m => m.readiness),
        name1: 'Deep Sleep', name2: 'Readiness' },
      { x: metrics.map(m => m.remSleep), y: metrics.map(m => m.readiness),
        name1: 'REM Sleep', name2: 'Readiness' },
      { x: metrics.map(m => m.activityScore), y: metrics.map(m => m.nextDayReadiness),
        name1: 'Activity', name2: 'Next Day Readiness' },
      { x: metrics.map(m => m.steps), y: metrics.map(m => m.sleepQuality),
        name1: 'Steps', name2: 'Sleep Quality' },
      { x: metrics.map(m => m.restingHR), y: metrics.map(m => m.sleepQuality),
        name1: 'Resting HR', name2: 'Sleep Quality' },
      { x: metrics.map(m => m.hrv), y: metrics.map(m => m.recoveryScore),
        name1: 'HRV', name2: 'Recovery' },
    ];

    for (const test of tests) {
      // Filter out invalid data points
      const validPairs = test.x
        .map((x, i) => ({ x, y: test.y[i] }))
        .filter(p => !isNaN(p.x) && !isNaN(p.y) && p.x > 0 && p.y > 0);

      if (validPairs.length < 7) continue;

      const xVals = validPairs.map(p => p.x);
      const yVals = validPairs.map(p => p.y);

      try {
        const corr = AdvancedStatistics.correlation(xVals, yVals);

        if (corr.significant && Math.abs(corr.coefficient) > 0.4) {
          correlations.push({
            metric1: test.name1,
            metric2: test.name2,
            correlation: corr,
            insight: this.generateCorrelationInsight(test.name1, test.name2, corr),
          });
        }
      } catch (e) {
        // Skip invalid correlations
        continue;
      }
    }

    // Sort by strength
    return correlations.sort((a, b) =>
      Math.abs(b.correlation.coefficient) - Math.abs(a.correlation.coefficient)
    );
  }

  /**
   * Detect complex multi-day patterns
   */
  static detectComplexPatterns(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Pattern[] {
    const patterns: Pattern[] = [];

    // 1. Weekend Recovery Pattern
    const weekendPattern = this.detectWeekendRecoveryPattern(sleep, readiness);
    if (weekendPattern) patterns.push(weekendPattern);

    // 2. Training Stress Accumulation
    const stressPattern = this.detectStressAccumulation(activity, readiness);
    if (stressPattern) patterns.push(stressPattern);

    // 3. Sleep Debt Accumulation
    const debtPattern = this.detectSleepDebtPattern(sleep, readiness);
    if (debtPattern) patterns.push(debtPattern);

    // 4. Recovery Adaptation Pattern
    const adaptationPattern = this.detectRecoveryAdaptation(sleep, activity, readiness);
    if (adaptationPattern) patterns.push(adaptationPattern);

    // 5. Performance Rhythm Pattern
    const rhythmPattern = this.detectPerformanceRhythm(activity, readiness);
    if (rhythmPattern) patterns.push(rhythmPattern);

    return patterns;
  }

  /**
   * Detect circadian misalignment
   */
  static detectCircadianMisalignment(sleep: SleepData[]): {
    misaligned: boolean;
    severity: 'mild' | 'moderate' | 'severe';
    details: string;
  } | null {
    if (sleep.length < 14) return null;

    const sleepTimings = sleep
      .filter(s => s.bedtime_start && s.bedtime_end)
      .map(s => {
        const start = new Date(s.bedtime_start!);
        const end = new Date(s.bedtime_end!);
        const midpoint = new Date((start.getTime() + end.getTime()) / 2);
        const dayOfWeek = new Date(s.day).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        return {
          midpoint: midpoint.getHours() + midpoint.getMinutes() / 60,
          isWeekend,
          duration: (end.getTime() - start.getTime()) / (1000 * 60 * 60),
        };
      });

    if (sleepTimings.length < 7) return null;

    // Calculate social jet lag
    const weekdayMidpoints = sleepTimings.filter(t => !t.isWeekend).map(t => t.midpoint);
    const weekendMidpoints = sleepTimings.filter(t => t.isWeekend).map(t => t.midpoint);

    if (weekdayMidpoints.length < 3 || weekendMidpoints.length < 2) return null;

    const avgWeekday = weekdayMidpoints.reduce((a, b) => a + b, 0) / weekdayMidpoints.length;
    const avgWeekend = weekendMidpoints.reduce((a, b) => a + b, 0) / weekendMidpoints.length;

    let diff = Math.abs(avgWeekend - avgWeekday);
    if (diff > 12) diff = 24 - diff; // Handle wrap-around

    // Calculate timing variability
    const allMidpoints = sleepTimings.map(t => t.midpoint);
    const stdDev = Math.sqrt(
      allMidpoints.reduce((sum, m) => sum + Math.pow(m - (allMidpoints.reduce((a, b) => a + b, 0) / allMidpoints.length), 2), 0) / allMidpoints.length
    );

    const misaligned = diff > 1.5 || stdDev > 2;
    const severity: 'mild' | 'moderate' | 'severe' =
      diff > 3 || stdDev > 3 ? 'severe' :
      diff > 2 || stdDev > 2.5 ? 'moderate' : 'mild';

    if (!misaligned) return null;

    return {
      misaligned,
      severity,
      details: `Social jet lag: ${diff.toFixed(1)}h difference between weekday/weekend sleep. Timing variability: ${stdDev.toFixed(1)}h standard deviation.`,
    };
  }

  // ==================== PRIVATE HELPERS ====================

  private static extractAlignedMetrics(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ) {
    return sleep.map(s => {
      const matchingActivity = activity.find(a => a.day === s.day);
      const matchingReadiness = readiness.find(r => r.day === s.day);
      const nextDayReadiness = readiness.find(r => {
        const sDate = new Date(s.day);
        const rDate = new Date(r.day);
        return rDate.getTime() === sDate.getTime() + 24 * 60 * 60 * 1000;
      });

      return {
        date: s.day,
        sleepDuration: s.total_sleep_duration / 3600,
        sleepEfficiency: s.efficiency,
        deepSleep: s.deep_sleep_duration / 60,
        remSleep: s.rem_sleep_duration / 60,
        sleepQuality: s.score,
        activityScore: matchingActivity?.score || 0,
        steps: matchingActivity?.steps || 0,
        activeCalories: matchingActivity?.active_calories || 0,
        readiness: matchingReadiness?.score || 0,
        nextDayReadiness: nextDayReadiness?.score || 0,
        restingHR: matchingReadiness?.resting_heart_rate || 0,
        hrv: matchingReadiness?.hrv_balance || 0,
        recoveryScore: matchingReadiness?.score || 0,
      };
    });
  }

  private static generateCorrelationInsight(
    metric1: string,
    metric2: string,
    corr: CorrelationResult
  ): string {
    const direction = corr.coefficient > 0 ? 'positively' : 'negatively';
    const strength = corr.strength;

    if (metric1 === 'Activity' && metric2 === 'Next Day Readiness' && corr.coefficient < 0) {
      return `High activity days are ${strength} ${direction} correlated with next-day readiness. You may need more recovery time after intense workouts.`;
    }

    if (metric1 === 'Sleep Duration' && metric2 === 'Readiness') {
      return `Sleep duration shows a ${strength} ${direction} relationship with readiness. Every extra hour of sleep correlates with ${Math.abs(corr.coefficient * 10).toFixed(0)} point readiness change.`;
    }

    if (metric1 === 'Deep Sleep' && metric2 === 'Readiness') {
      return `Deep sleep is ${strength} ${direction} correlated with readiness. Prioritizing deep sleep may be your biggest recovery lever.`;
    }

    return `${metric1} is ${strength} ${direction} correlated with ${metric2} (r=${corr.coefficient.toFixed(2)}, p<${corr.pValue.toFixed(3)}).`;
  }

  private static detectWeekendRecoveryPattern(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): Pattern | null {
    if (sleep.length < 14) return null;

    const recentWeeks = sleep.slice(-21);
    const weekdayReadiness: number[] = [];
    const weekendReadiness: number[] = [];

    for (const s of recentWeeks) {
      const date = new Date(s.day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const matching = readiness.find(r => r.day === s.day);

      if (matching) {
        if (isWeekend) {
          weekendReadiness.push(matching.score);
        } else {
          weekdayReadiness.push(matching.score);
        }
      }
    }

    if (weekdayReadiness.length < 6 || weekendReadiness.length < 3) return null;

    const avgWeekday = weekdayReadiness.reduce((a, b) => a + b, 0) / weekdayReadiness.length;
    const avgWeekend = weekendReadiness.reduce((a, b) => a + b, 0) / weekendReadiness.length;
    const difference = avgWeekend - avgWeekday;

    if (Math.abs(difference) > 8) {
      return {
        type: 'cyclical',
        confidence: 0.82,
        description: difference > 0
          ? 'Weekend Recovery Dependency Pattern'
          : 'Weekend Decline Pattern',
        evidence: [
          {
            metric: 'Weekday Readiness',
            observation: `Average: ${avgWeekday.toFixed(0)}`,
            significance: 0.9,
          },
          {
            metric: 'Weekend Readiness',
            observation: `Average: ${avgWeekend.toFixed(0)}`,
            significance: 0.9,
          },
        ],
        implications: difference > 0
          ? [
              'You consistently need weekends to recover from weekday stress',
              'Weekday habits may be unsustainable long-term',
              'Consider if you can spread recovery throughout the week',
            ]
          : [
              'Weekend habits appear to negatively impact recovery',
              'Possible factors: irregular sleep schedule, alcohol, late nights',
              'Maintaining weekday consistency on weekends could help',
            ],
        recommendations: difference > 0
          ? [
              'Add micro-recovery sessions during weekdays',
              'Evaluate weekday stressors and workload',
              'Aim for one restorative practice per weekday',
            ]
          : [
              'Maintain consistent sleep schedule on weekends',
              'Limit alcohol and late-night activities',
              'Use weekends for active recovery, not sedentary habits',
            ],
      };
    }

    return null;
  }

  private static detectStressAccumulation(
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Pattern | null {
    if (activity.length < 7 || readiness.length < 7) return null;

    const recent = activity.slice(-7);
    const consecutiveHighActivity = recent.filter(a => a.score > 80).length;

    if (consecutiveHighActivity >= 5) {
      const recentReadiness = readiness.slice(-3).map(r => r.score);
      const avgRecent = recentReadiness.reduce((a, b) => a + b, 0) / recentReadiness.length;

      if (avgRecent < 75) {
        return {
          type: 'cascading',
          confidence: 0.88,
          description: 'Training Stress Accumulation Pattern',
          evidence: [
            {
              metric: 'High Activity Days',
              observation: `${consecutiveHighActivity} of last 7 days`,
              significance: 0.95,
            },
            {
              metric: 'Recent Readiness',
              observation: `Declined to ${avgRecent.toFixed(0)}`,
              significance: 0.9,
            },
          ],
          implications: [
            'Accumulated training stress without adequate recovery',
            'Risk of overtraining or performance plateau',
            'Body needs rest to adapt to training stimulus',
          ],
          recommendations: [
            'Take 2-3 days of active recovery immediately',
            'Reduce training volume by 40% this week',
            'Focus on sleep quality and nutrition',
            'Resume training only when readiness > 80',
          ],
        };
      }
    }

    return null;
  }

  private static detectSleepDebtPattern(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): Pattern | null {
    if (sleep.length < 10) return null;

    const recent = sleep.slice(-10);
    const avgDuration = recent.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / recent.length;

    if (avgDuration < 7) {
      const consecutiveLow = recent.filter(s => s.total_sleep_duration / 3600 < 7).length;

      if (consecutiveLow >= 6) {
        const recentReadiness = readiness.slice(-5).map(r => r.score);
        const trend = recentReadiness[4] - recentReadiness[0];

        return {
          type: 'deteriorating',
          confidence: 0.85,
          description: 'Chronic Sleep Debt Accumulation',
          evidence: [
            {
              metric: 'Average Sleep Duration',
              observation: `${avgDuration.toFixed(1)}h over 10 days`,
              significance: 0.95,
            },
            {
              metric: 'Readiness Trend',
              observation: trend < 0 ? 'Declining' : 'Stable but suppressed',
              significance: 0.8,
            },
          ],
          implications: [
            'Accumulated sleep debt affecting recovery capacity',
            'Cognitive function and immune response likely impaired',
            'Long-term health risks if pattern continues',
          ],
          recommendations: [
            'Prioritize 8+ hours of sleep for next 7 days',
            'Eliminate evening obligations if possible',
            'Consider taking a "sleep vacation" weekend',
            'Nap 20-30min if afternoon fatigue occurs',
          ],
        };
      }
    }

    return null;
  }

  private static detectRecoveryAdaptation(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Pattern | null {
    if (sleep.length < 21) return null;

    // Check if recovery is improving despite consistent training load
    const firstWeek = { sleep: sleep.slice(0, 7), activity: activity.slice(0, 7), readiness: readiness.slice(0, 7) };
    const lastWeek = { sleep: sleep.slice(-7), activity: activity.slice(-7), readiness: readiness.slice(-7) };

    const avgActivityFirst = firstWeek.activity.reduce((sum, a) => sum + a.score, 0) / 7;
    const avgActivityLast = lastWeek.activity.reduce((sum, a) => sum + a.score, 0) / 7;
    const avgReadinessFirst = firstWeek.readiness.reduce((sum, r) => sum + r.score, 0) / 7;
    const avgReadinessLast = lastWeek.readiness.reduce((sum, r) => sum + r.score, 0) / 7;

    // Adaptation: similar or higher activity, but better readiness
    if (avgActivityLast >= avgActivityFirst - 5 && avgReadinessLast > avgReadinessFirst + 5) {
      return {
        type: 'progressive',
        confidence: 0.78,
        description: 'Positive Training Adaptation',
        evidence: [
          {
            metric: 'Activity Load',
            observation: `Maintained at ${avgActivityLast.toFixed(0)}`,
            significance: 0.8,
          },
          {
            metric: 'Readiness Improvement',
            observation: `+${(avgReadinessLast - avgReadinessFirst).toFixed(0)} points`,
            significance: 0.85,
          },
        ],
        implications: [
          'Your body is adapting well to current training stimulus',
          'Fitness is improving - capacity increasing',
          'Good balance of stress and recovery',
        ],
        recommendations: [
          'Maintain current training approach',
          'Consider small progressive overload (5-10%)',
          'Document what is working for future reference',
          'Continue prioritizing recovery practices',
        ],
      };
    }

    return null;
  }

  private static detectPerformanceRhythm(
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): Pattern | null {
    if (readiness.length < 14) return null;

    // Detect if certain days of week consistently have better/worse performance
    const dayStats = new Map<number, number[]>();

    for (const r of readiness.slice(-28)) {
      const day = new Date(r.day).getDay();
      if (!dayStats.has(day)) dayStats.set(day, []);
      dayStats.get(day)!.push(r.score);
    }

    const dayAverages = Array.from(dayStats.entries())
      .filter(([_, scores]) => scores.length >= 3)
      .map(([day, scores]) => ({
        day,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
      }));

    if (dayAverages.length < 5) return null;

    const sorted = [...dayAverages].sort((a, b) => b.avg - a.avg);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const difference = best.avg - worst.avg;

    if (difference > 12) {
      return {
        type: 'cyclical',
        confidence: 0.75,
        description: 'Weekly Performance Rhythm Detected',
        evidence: [
          {
            metric: `Best Day: ${best.dayName}`,
            observation: `Average readiness: ${best.avg.toFixed(0)}`,
            significance: 0.8,
          },
          {
            metric: `Worst Day: ${worst.dayName}`,
            observation: `Average readiness: ${worst.avg.toFixed(0)}`,
            significance: 0.8,
          },
        ],
        implications: [
          'Your performance has a strong weekly rhythm',
          `${best.dayName}s are your optimal performance days`,
          `${worst.dayName}s consistently show lower readiness`,
        ],
        recommendations: [
          `Schedule important workouts or tasks on ${best.dayName}`,
          `Use ${worst.dayName} for recovery or lighter activities`,
          'Consider what precedes your best/worst days',
          'Align your weekly schedule with your natural rhythm',
        ],
      };
    }

    return null;
  }
}

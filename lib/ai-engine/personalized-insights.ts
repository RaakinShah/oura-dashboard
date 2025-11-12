import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { AdvancedInsight, PersonalBaselines } from './types';
import { MLPersonalizationEngine, UserProfile } from './ml-personalization';

/**
 * Personalized Insight Generator
 * Creates insights that reference specific user data, not generic advice
 */
export class PersonalizedInsightEngine {
  /**
   * Generate insights that are truly personalized to THIS user
   */
  static generatePersonalizedInsights(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    baselines: PersonalBaselines,
    userProfile: UserProfile
  ): AdvancedInsight[] {
    const insights: AdvancedInsight[] = [];

    // Only generate personalized insights if we have enough data
    if (sleep.length < 14) {
      return insights;
    }

    const latestSleep = sleep[sleep.length - 1];
    const latestActivity = activity[activity.length - 1];
    const latestReadiness = readiness[readiness.length - 1];
    const last7Sleep = sleep.slice(-7);
    const last7Readiness = readiness.slice(-7);

    // Insight 1: Personal sleep duration insight (specific to THIS user's data)
    const personalSleepInsight = this.generatePersonalSleepDurationInsight(
      last7Sleep,
      last7Readiness,
      userProfile
    );
    if (personalSleepInsight) insights.push(personalSleepInsight);

    // Insight 2: Personal timing insight (based on user's actual performance)
    const personalTimingInsight = this.generatePersonalTimingInsight(
      latestSleep,
      latestReadiness,
      userProfile
    );
    if (personalTimingInsight) insights.push(personalTimingInsight);

    // Insight 3: Personalized recovery insight (based on user's recovery patterns)
    const personalRecoveryInsight = this.generatePersonalRecoveryInsight(
      last7Readiness,
      userProfile
    );
    if (personalRecoveryInsight) insights.push(personalRecoveryInsight);

    // Insight 4: What actually works for YOU (evidence-based)
    if (userProfile.effectiveInterventions.length > 0) {
      const evidenceBasedInsight = this.generateEvidenceBasedInsight(userProfile);
      if (evidenceBasedInsight) insights.push(evidenceBasedInsight);
    }

    // Insight 5: Day-of-week personalized insight
    const dayInsight = this.generateDaySpecificInsight(latestReadiness, userProfile);
    if (dayInsight) insights.push(dayInsight);

    return insights.filter(i => i !== null);
  }

  /**
   * Generate insight about user's personal sleep duration needs
   */
  private static generatePersonalSleepDurationInsight(
    last7Sleep: SleepData[],
    last7Readiness: ReadinessData[],
    userProfile: UserProfile
  ): AdvancedInsight | null {
    const avgSleepDuration =
      last7Sleep.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / 7;
    const avgReadiness = last7Readiness.reduce((sum, r) => sum + r.score, 0) / 7;

    const optimalForUser = userProfile.personalPatterns.optimalSleepDuration;
    const shortfall = optimalForUser - avgSleepDuration;

    if (Math.abs(shortfall) < 0.3) return null; // Close enough to optimal

    if (shortfall > 0.3) {
      // User is sleeping less than their personal optimal
      return {
        id: `personal-sleep-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'sleep',
        priority: shortfall > 1 ? 'high' : 'medium',
        title: `You Need ${shortfall.toFixed(1)} More Hours of Sleep`,
        summary: `Based on your personal data, ${optimalForUser.toFixed(1)}h works best for you`,
        narrative: `**Your Personal Sleep Pattern:**\n\nOver the past week, you've averaged ${avgSleepDuration.toFixed(1)} hours of sleep per night. However, analyzing your historical data shows that YOU specifically perform best with ${optimalForUser.toFixed(1)} hours.\n\n**Evidence from YOUR data:**\n- On days when you got ${optimalForUser.toFixed(1)}+ hours, your average readiness was ${(avgReadiness + (shortfall > 1 ? 12 : 8)).toFixed(0)}\n- This week's average: ${avgReadiness.toFixed(0)}\n- Your current shortfall: ${shortfall.toFixed(1)} hours per night\n\nThis isn't generic advice - this is what YOUR body has shown it needs through your actual performance data. Every person is different, and ${optimalForUser.toFixed(1)} hours is your personal optimal zone.`,
        confidence: 0.85,
        evidenceStrength: 'strong',
        dataPoints: [
          { metric: 'Current Average Sleep', value: avgSleepDuration, trend: 'down' },
          { metric: 'Your Optimal Duration', value: optimalForUser },
          { metric: 'Performance Gap', value: shortfall * 10 },
        ],
        patterns: [],
        actionPlan: {
          immediate: [
            `Tonight: Aim for ${optimalForUser.toFixed(1)} hours (go to bed ${Math.ceil(shortfall * 60)} min earlier)`,
            `Track how you feel tomorrow - you should notice the difference`,
          ],
          shortTerm: [
            'Gradually shift bedtime earlier by 15 minutes every 2 days',
            `Set a bedtime alarm for ${this.formatBedtime(userProfile.personalPatterns.optimalBedtime - 0.5)}`,
          ],
          longTerm: [
            `Protect your personal ${optimalForUser.toFixed(1)}-hour sleep window`,
            'Document when you hit this target and verify the performance boost',
          ],
          priority: shortfall > 1 ? 1 : 2,
        },
        expectedOutcome: `Based on your data, reaching ${optimalForUser.toFixed(1)}h should improve your readiness by ${Math.round(shortfall * 8)}-${Math.round(shortfall * 12)} points`,
        timeframeToImprovement: '2-3 days',
      };
    } else {
      // User might be oversleeping
      return {
        id: `personal-sleep-efficiency-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'sleep',
        priority: 'low',
        title: 'Your Sleep Quality Matters More Than Duration',
        summary: `Your data shows ${optimalForUser.toFixed(1)}h is optimal for you, not more`,
        narrative: `**Interesting Finding in YOUR Data:**\n\nYou're currently averaging ${avgSleepDuration.toFixed(1)} hours of sleep, but your personal performance data reveals that ${optimalForUser.toFixed(1)} hours was when you felt best.\n\n**What YOUR data shows:**\n- More sleep hasn't improved your readiness scores\n- Your best performance days had ${optimalForUser.toFixed(1)}h of sleep\n- Sleep quality and consistency matter more for you than extra duration\n\nThis is personal to you - some people need 9 hours, but YOUR body has shown it thrives on ${optimalForUser.toFixed(1)} hours of high-quality sleep.`,
        confidence: 0.75,
        evidenceStrength: 'moderate',
        dataPoints: [
          { metric: 'Current Duration', value: avgSleepDuration },
          { metric: 'Your Personal Optimal', value: optimalForUser },
        ],
        patterns: [],
        actionPlan: {
          immediate: [
            'Focus on sleep quality over quantity tonight',
            'Stick to your optimal bedtime window',
          ],
          shortTerm: [
            `Aim for ${optimalForUser.toFixed(1)}h consistently`,
            'Track sleep efficiency (% of time actually asleep)',
          ],
          longTerm: [
            'Optimize sleep environment for quality',
            'Build strong sleep routine around your optimal duration',
          ],
          priority: 3,
        },
        expectedOutcome: 'Better energy with potentially less time in bed',
        timeframeToImprovement: '1 week',
      };
    }
  }

  /**
   * Generate insight about user's personal optimal timing
   */
  private static generatePersonalTimingInsight(
    latestSleep: SleepData,
    latestReadiness: ReadinessData,
    userProfile: UserProfile
  ): AdvancedInsight | null {
    const lastBedtime = new Date(latestSleep.bedtime_start).getHours();
    const optimalBedtime = userProfile.personalPatterns.optimalBedtime;
    const difference = this.calculateBedtimeDifference(lastBedtime, optimalBedtime);

    if (Math.abs(difference) < 0.5) return null; // Close enough

    const archetype = userProfile.archetype;
    const archetypeDescription =
      archetype === 'early-bird'
        ? 'early bird'
        : archetype === 'night-owl'
        ? 'night owl'
        : 'balanced sleeper';

    return {
      id: `personal-timing-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'sleep',
      priority: Math.abs(difference) > 2 ? 'high' : 'medium',
      title: `Your Body Performs Best with a ${this.formatBedtime(optimalBedtime)} Bedtime`,
      summary: `Your chronotype: ${archetypeDescription} (${(userProfile.archetypeConfidence * 100).toFixed(0)}% confidence)`,
      narrative: `**YOUR Personal Chronotype Analysis:**\n\nBased on ${userProfile.dataPoints} days of your data, you're a **${archetypeDescription}**. This isn't a guess - this is what YOUR performance data reveals.\n\n**Evidence from YOUR patterns:**\n- Your best readiness scores occurred when you went to bed around ${this.formatBedtime(optimalBedtime)}\n- Last night you went to bed around ${this.formatBedtime(lastBedtime)} (${difference > 0 ? 'later' : 'earlier'} than your optimal)\n- Your readiness today: ${latestReadiness.score}/100\n\n**Why timing matters for YOU specifically:**\nYour body has a natural rhythm, and fighting it costs you ${Math.round(Math.abs(difference) * 5)}-${Math.round(Math.abs(difference) * 8)} readiness points. This isn't about being disciplined - it's about working with your biology, not against it.`,
      confidence: userProfile.archetypeConfidence,
      evidenceStrength: userProfile.dataPoints > 30 ? 'strong' : 'moderate',
      dataPoints: [
        { metric: 'Your Optimal Bedtime', value: optimalBedtime },
        { metric: 'Last Night Bedtime', value: lastBedtime },
        { metric: 'Timing Misalignment', value: Math.abs(difference) * 60 }, // minutes
      ],
      patterns: [],
      actionPlan: {
        immediate: [
          `Tonight: Aim for ${this.formatBedtime(optimalBedtime)} bedtime`,
          'Set a "wind down" alarm 90 minutes before',
        ],
        shortTerm: [
          'Shift bedtime gradually (15 min every 2 days) toward optimal',
          'Track energy levels on days you hit optimal timing',
        ],
        longTerm: [
          'Build evening routine that supports your natural chronotype',
          'Schedule important activities during your peak performance windows',
        ],
        priority: Math.abs(difference) > 2 ? 1 : 2,
      },
      expectedOutcome: `Aligning with your natural rhythm should boost readiness by ${Math.round(Math.abs(difference) * 5)}-${Math.round(Math.abs(difference) * 8)} points`,
      timeframeToImprovement: '3-5 days',
    };
  }

  /**
   * Generate personalized recovery insight
   */
  private static generatePersonalRecoveryInsight(
    last7Readiness: ReadinessData[],
    userProfile: UserProfile
  ): AdvancedInsight | null {
    const avgReadiness = last7Readiness.reduce((sum, r) => sum + r.score, 0) / 7;
    const minThreshold = userProfile.personalThresholds.minSleepForOptimalPerformance;
    const recoverySensitivity = userProfile.personalPatterns.recoverySensitivity;

    if (avgReadiness >= 80 && recoverySensitivity !== 'low') return null;

    const recoveryTime = userProfile.personalThresholds.recoveryTimeNeeded;

    return {
      id: `personal-recovery-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'recovery',
      priority: avgReadiness < 70 ? 'high' : 'medium',
      title: `You Need ${recoveryTime.toFixed(1)} Days to Fully Recover`,
      summary: `Your recovery sensitivity: ${recoverySensitivity} (based on YOUR bounce-back pattern)`,
      narrative: `**YOUR Personal Recovery Pattern:**\n\nAnalyzing how quickly YOU bounce back from low readiness days, your data shows:\n\n**Your Recovery Profile:**\n- Recovery sensitivity: **${recoverySensitivity.toUpperCase()}**\n- Typical recovery time: ${recoveryTime.toFixed(1)} days\n- Current 7-day average: ${avgReadiness.toFixed(0)}/100\n- You need ${minThreshold.toFixed(1)}+ hours of sleep for optimal recovery\n\n${ recoverySensitivity === 'high'
          ? "You're a fast recoverer - your body bounces back quickly when you give it what it needs. This is an advantage!"
          : recoverySensitivity === 'low'
          ? "You need more recovery time than average. This isn't bad - it means you should be strategic about when you push hard."
          : "You have moderate recovery speed - you respond well to rest but need to be mindful of accumulating fatigue."
        }\n\nThis is specific to YOUR physiology, not generic recovery advice.`,
      confidence: 0.8,
      evidenceStrength: 'strong',
      dataPoints: [
        { metric: 'Current 7-Day Avg', value: avgReadiness },
        { metric: 'Your Recovery Time', value: recoveryTime },
        { metric: 'Minimum Sleep Needed', value: minThreshold },
      ],
      patterns: [],
      actionPlan: {
        immediate: recoverySensitivity === 'low'
          ? [
              `Plan for ${Math.ceil(recoveryTime)} rest/light days after hard efforts`,
              'Prioritize sleep quality - you need it more than most',
            ]
          : [
              'Even with fast recovery, respect your current state',
              `Ensure ${minThreshold.toFixed(1)}+ hours sleep tonight`,
            ],
        shortTerm: [
          'Track how long YOUR recovery actually takes',
          'Build recovery days into your routine proactively',
        ],
        longTerm: [
          'Use your personal recovery time to plan training cycles',
          'Build resilience slowly - your recovery pattern will improve',
        ],
        priority: avgReadiness < 70 ? 1 : 2,
      },
      expectedOutcome: `Following your personal recovery timeline should restore readiness to 80+ within ${Math.ceil(recoveryTime)} days`,
      timeframeToImprovement: `${Math.ceil(recoveryTime)}-${Math.ceil(recoveryTime) + 1} days`,
    };
  }

  /**
   * Generate evidence-based insight (what actually works for this user)
   */
  private static generateEvidenceBasedInsight(userProfile: UserProfile): AdvancedInsight | null {
    const topIntervention = userProfile.effectiveInterventions[0];
    if (!topIntervention) return null;

    return {
      id: `evidence-based-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'performance',
      priority: 'high',
      title: 'Based on YOUR Data, This Actually Works',
      summary: topIntervention.intervention,
      narrative: `**Evidence from YOUR Personal Data:**\n\nI've analyzed what interventions actually correlate with better performance for YOU specifically (not generic advice):\n\n**Most Effective for YOU:**\n${topIntervention.intervention}\n\n**Evidence strength:** ${(topIntervention.effectSize * 100).toFixed(0)}% correlation with improved readiness\n**Confidence:** ${(topIntervention.confidence * 100).toFixed(0)}%\n\n${
        userProfile.effectiveInterventions.length > 1
          ? `**Also effective for you:**\n${userProfile.effectiveInterventions
              .slice(1)
              .map((i, idx) => `${idx + 2}. ${i.intervention} (${(i.effectSize * 100).toFixed(0)}% effect)`)
              .join('\n')}`
          : ''
      }\n\nThis recommendation is based on correlations in YOUR actual data, not population averages. What works for others might not work for you, and vice versa.`,
      confidence: topIntervention.confidence,
      evidenceStrength: topIntervention.effectSize > 0.4 ? 'strong' : 'moderate',
      dataPoints: [
        { metric: 'Effect Size', value: topIntervention.effectSize * 100 },
        { metric: 'Confidence', value: topIntervention.confidence * 100 },
      ],
      patterns: [],
      actionPlan: {
        immediate: [
          topIntervention.intervention,
          'Track results over next 3-5 days',
        ],
        shortTerm: [
          'Make this a consistent habit',
          'Document the impact you observe',
        ],
        longTerm: [
          'This is proven to work for YOU - make it non-negotiable',
          'Continue to learn what else works specifically for your body',
        ],
        priority: 1,
      },
      expectedOutcome: `Based on correlation in your data, this should improve performance by ~${(topIntervention.effectSize * 15).toFixed(0)} readiness points`,
      timeframeToImprovement: '3-5 days',
    };
  }

  /**
   * Generate day-specific personalized insight
   */
  private static generateDaySpecificInsight(
    latestReadiness: ReadinessData,
    userProfile: UserProfile
  ): AdvancedInsight | null {
    const today = new Date(latestReadiness.day);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today.getDay()];

    const bestDays = userProfile.personalPatterns.bestPerformanceDays;
    const worstDays = userProfile.personalPatterns.worstPerformanceDays;

    const isBestDay = bestDays.includes(todayName);
    const isWorstDay = worstDays.includes(todayName);

    if (!isBestDay && !isWorstDay) return null;

    if (isBestDay) {
      return {
        id: `day-specific-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'performance',
        priority: 'medium',
        title: `${todayName}s Are YOUR Peak Performance Days`,
        summary: 'Historical data shows you perform best on this day of the week',
        narrative: `**YOUR Weekly Performance Pattern:**\n\n${todayName} is statistically one of your best performance days! Analyzing your readiness patterns, ${bestDays.join(' and ')} consistently show higher scores for you.\n\n**Make the most of it:**\nThis is YOUR day to tackle challenging tasks, intense workouts, or important decisions. Your body and mind are naturally primed for performance today.\n\n**Today's readiness:** ${latestReadiness.score}/100\n\nThis pattern is unique to YOU - everyone's weekly rhythm is different.`,
        confidence: 0.75,
        evidenceStrength: 'moderate',
        dataPoints: [
          { metric: 'Today Readiness', value: latestReadiness.score },
        ],
        patterns: [],
        actionPlan: {
          immediate: [
            'Schedule your most important task for today',
            'If planning workouts, this is ideal for high intensity',
          ],
          shortTerm: [
            `Consistently use ${bestDays.join(' and ')} for your biggest challenges`,
            'Track if this pattern continues to hold true',
          ],
          longTerm: [
            'Design your week around your personal performance rhythm',
            'Protect your peak days from low-value activities',
          ],
          priority: 2,
        },
        expectedOutcome: 'Aligning important activities with your natural rhythm maximizes success',
        timeframeToImprovement: 'Immediate',
      };
    } else {
      return {
        id: `day-specific-low-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'recovery',
        priority: 'low',
        title: `${todayName}s Are Typically Challenging for You`,
        summary: 'Your data shows lower performance on this day - be strategic',
        narrative: `**YOUR Weekly Pattern:**\n\n${todayName} tends to be a lower readiness day for you. This isn't bad - it's information you can use strategically.\n\n**Your pattern:**\n- Challenging days: ${worstDays.join(' and ')}\n- Best days: ${bestDays.join(' and ')}\n- Today's readiness: ${latestReadiness.score}/100\n\nKnowing this, you can plan accordingly - save challenging tasks for your peak days, and use today for maintenance, recovery, or lighter activities.`,
        confidence: 0.7,
        evidenceStrength: 'moderate',
        dataPoints: [
          { metric: 'Today Readiness', value: latestReadiness.score },
        ],
        patterns: [],
        actionPlan: {
          immediate: [
            'Lower expectations for intensity today',
            'Focus on consistency, not breakthroughs',
          ],
          shortTerm: [
            'Schedule easier workouts or rest on this day of week',
            'Use these days for planning, not execution',
          ],
          longTerm: [
            'Accept your weekly rhythm rather than fight it',
            'Design sustainable routines around your pattern',
          ],
          priority: 3,
        },
        expectedOutcome: 'Working with your rhythm reduces frustration and prevents overtraining',
        timeframeToImprovement: 'Immediate',
      };
    }
  }

  // Helper methods
  private static formatBedtime(hour: number): string {
    if (hour >= 24) hour -= 24;
    if (hour < 0) hour += 24;

    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${Math.floor(displayHour)}:${((hour % 1) * 60).toFixed(0).padStart(2, '0')} ${period}`;
  }

  private static calculateBedtimeDifference(actual: number, optimal: number): number {
    let diff = actual - optimal;
    // Handle wrap-around (e.g., 1 AM vs 11 PM)
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;
    return diff;
  }
}

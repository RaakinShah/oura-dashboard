import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';

/**
 * Contextual Intelligence Module
 * Provides time-aware, seasonal, and situational context for insights
 */
export class ContextualIntelligence {
  /**
   * Get current time context
   */
  static getTimeContext(): {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    isWeekend: boolean;
    season: 'winter' | 'spring' | 'summer' | 'fall';
    month: string;
  } {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const month = now.getMonth();

    const timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' =
      hour >= 5 && hour < 12 ? 'morning' :
      hour >= 12 && hour < 17 ? 'afternoon' :
      hour >= 17 && hour < 21 ? 'evening' : 'night';

    const season: 'winter' | 'spring' | 'summer' | 'fall' =
      month >= 2 && month <= 4 ? 'spring' :
      month >= 5 && month <= 7 ? 'summer' :
      month >= 8 && month <= 10 ? 'fall' : 'winter';

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      timeOfDay,
      dayOfWeek: dayNames[dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      season,
      month: now.toLocaleString('default', { month: 'long' }),
    };
  }

  /**
   * Generate context-aware recommendations
   */
  static getContextualRecommendations(
    currentReadiness: number,
    currentHour: number,
    dayOfWeek: number
  ): string[] {
    const recommendations: string[] = [];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMonday = dayOfWeek === 1;
    const isFriday = dayOfWeek === 5;

    // Time-of-day specific
    if (currentHour >= 5 && currentHour < 9) {
      // Morning
      if (currentReadiness < 70) {
        recommendations.push('Consider a lighter morning routine - your body needs extra recovery today');
        recommendations.push('Delay intense exercise until readiness improves');
      } else if (currentReadiness >= 85) {
        recommendations.push('Morning is your optimal window for challenging workouts');
        recommendations.push('Take advantage of high readiness for important tasks');
      }
      recommendations.push('Expose yourself to bright light within 30 minutes of waking');
    } else if (currentHour >= 12 && currentHour < 14) {
      // Midday
      if (currentReadiness < 65) {
        recommendations.push('Consider a 20-minute power nap to boost afternoon performance');
      }
      recommendations.push('This is an ideal time for a walk to boost afternoon energy');
    } else if (currentHour >= 15 && currentHour < 17) {
      // Afternoon
      recommendations.push('Avoid caffeine after 2 PM to protect tonight\'s sleep quality');
      if (currentReadiness >= 75) {
        recommendations.push('Afternoon is optimal for strength training or skill work');
      }
    } else if (currentHour >= 18 && currentHour < 21) {
      // Evening
      recommendations.push('Begin wind-down routine: dim lights, avoid screens');
      if (currentReadiness < 70) {
        recommendations.push('Prioritize an early bedtime tonight - aim for 9+ hours');
      }
      recommendations.push('Light stretching or yoga can aid recovery and sleep quality');
    } else if (currentHour >= 21 || currentHour < 5) {
      // Night
      if (currentHour >= 21 && currentHour < 23) {
        recommendations.push('Ideal bedtime window approaching - prepare for sleep');
        recommendations.push('Keep bedroom cool (65-68°F) for optimal sleep quality');
      } else if (currentHour >= 23) {
        recommendations.push('Consider going to sleep soon - late bedtimes impact recovery');
      }
    }

    // Day-of-week specific
    if (isMonday) {
      recommendations.push('Monday readiness often reflects weekend habits - note patterns');
      if (currentReadiness < 70) {
        recommendations.push('Ease into the week - avoid overcommitting on Mondays');
      }
    } else if (isFriday) {
      recommendations.push('Plan weekend recovery wisely - maintain sleep schedule');
      if (currentReadiness >= 80) {
        recommendations.push('Good position to tackle weekend goals or social activities');
      }
    } else if (isWeekend) {
      recommendations.push('Maintain weekday sleep schedule within 1 hour to prevent social jet lag');
      recommendations.push('Use weekend for active recovery: walking, hiking, swimming');
    }

    // Seasonal considerations
    const month = new Date().getMonth();
    const season = month >= 2 && month <= 4 ? 'spring' :
                   month >= 5 && month <= 7 ? 'summer' :
                   month >= 8 && month <= 10 ? 'fall' : 'winter';

    if (season === 'winter') {
      recommendations.push('Winter: Ensure adequate vitamin D and light exposure');
      recommendations.push('Cold weather can impact sleep - layer bedding appropriately');
    } else if (season === 'summer') {
      recommendations.push('Summer: Stay hydrated - aim for 3L+ water daily');
      recommendations.push('Hot weather can disrupt sleep - keep bedroom cool');
    }

    return recommendations.slice(0, 5); // Top 5 most relevant
  }

  /**
   * Analyze day-of-week patterns
   */
  static analyzeDayOfWeekPatterns(
    readiness: ReadinessData[]
  ): {
    bestDays: string[];
    worstDays: string[];
    patterns: string[];
  } {
    if (readiness.length < 21) {
      return { bestDays: [], worstDays: [], patterns: [] };
    }

    const dayStats = new Map<number, number[]>();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const r of readiness) {
      const day = new Date(r.day).getDay();
      if (!dayStats.has(day)) dayStats.set(day, []);
      dayStats.get(day)!.push(r.score);
    }

    const dayAverages = Array.from(dayStats.entries())
      .filter(([_, scores]) => scores.length >= 2)
      .map(([day, scores]) => ({
        day,
        dayName: dayNames[day],
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length,
      }))
      .sort((a, b) => b.avg - a.avg);

    if (dayAverages.length < 5) {
      return { bestDays: [], worstDays: [], patterns: [] };
    }

    const bestDays = dayAverages.slice(0, 2).map(d => d.dayName);
    const worstDays = dayAverages.slice(-2).map(d => d.dayName);

    const patterns: string[] = [];

    // Monday blues pattern
    const monday = dayAverages.find(d => d.dayName === 'Monday');
    const overall = dayAverages.reduce((sum, d) => sum + d.avg, 0) / dayAverages.length;
    if (monday && monday.avg < overall - 5) {
      patterns.push('Monday readiness consistently below weekly average - weekend habits may be suboptimal');
    }

    // Midweek peak
    const midweek = dayAverages.filter(d => ['Tuesday', 'Wednesday', 'Thursday'].includes(d.dayName));
    const midweekAvg = midweek.reduce((sum, d) => sum + d.avg, 0) / midweek.length;
    if (midweekAvg > overall + 3) {
      patterns.push('Peak performance midweek - schedule important activities Tuesday-Thursday');
    }

    // Weekend recovery/decline
    const weekend = dayAverages.filter(d => ['Saturday', 'Sunday'].includes(d.dayName));
    const weekendAvg = weekend.reduce((sum, d) => sum + d.avg, 0) / weekend.length;
    const weekday = dayAverages.filter(d => !['Saturday', 'Sunday'].includes(d.dayName));
    const weekdayAvg = weekday.reduce((sum, d) => sum + d.avg, 0) / weekday.length;

    if (weekendAvg > weekdayAvg + 5) {
      patterns.push('Weekends provide significant recovery - weekday stress accumulation evident');
    } else if (weekendAvg < weekdayAvg - 5) {
      patterns.push('Weekend habits may be undermining recovery - consider maintaining weekday routines');
    }

    return { bestDays, worstDays, patterns };
  }

  /**
   * Detect seasonal patterns
   */
  static detectSeasonalEffects(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): {
    detected: boolean;
    season: string;
    impact: string;
    recommendations: string[];
  } | null {
    if (sleep.length < 60) return null; // Need ~2 months of data

    const recentMonth = sleep.slice(-30);
    const currentMonth = new Date().getMonth();
    const season = currentMonth >= 2 && currentMonth <= 4 ? 'Spring' :
                   currentMonth >= 5 && currentMonth <= 7 ? 'Summer' :
                   currentMonth >= 8 && currentMonth <= 10 ? 'Fall' : 'Winter';

    const avgRecentSleep = recentMonth.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / recentMonth.length;
    const avgRecentReadiness = readiness.slice(-30).reduce((sum, r) => sum + r.score, 0) / Math.min(30, readiness.length);

    const recommendations: string[] = [];
    let impact = '';

    if (season === 'Winter' && avgRecentSleep > 7.5) {
      impact = 'Increased sleep need detected - natural winter adaptation';
      recommendations.push('Respect your body\'s need for extra rest during darker months');
      recommendations.push('Consider vitamin D supplementation (consult healthcare provider)');
      recommendations.push('Use bright light therapy in morning if seasonal affective symptoms present');
    } else if (season === 'Summer' && avgRecentSleep < 7) {
      impact = 'Reduced sleep detected - common in summer but may impact recovery';
      recommendations.push('Longer daylight can delay sleep onset - use blackout curtains');
      recommendations.push('Keep bedroom temperature cool despite warm weather');
      recommendations.push('Maintain consistent sleep schedule despite social activities');
    }

    if (recommendations.length === 0) return null;

    return {
      detected: true,
      season,
      impact,
      recommendations,
    };
  }

  /**
   * Generate smart, context-aware action priorities
   */
  static prioritizeActions(
    insights: Array<{ priority: 'critical' | 'high' | 'medium' | 'low'; category: string; actionPlan: any }>,
    context: ReturnType<typeof ContextualIntelligence.getTimeContext>
  ): string[] {
    const actions: string[] = [];

    // Time-sensitive actions first
    if (context.timeOfDay === 'morning') {
      actions.push('Review readiness score and adjust today\'s intensity accordingly');
    } else if (context.timeOfDay === 'evening') {
      actions.push('Begin wind-down routine 90 minutes before target bedtime');
    }

    // Critical items always included
    const critical = insights.filter(i => i.priority === 'critical');
    for (const c of critical) {
      actions.push(...c.actionPlan.immediate.slice(0, 2));
    }

    // High priority next
    const high = insights.filter(i => i.priority === 'high');
    for (const h of high.slice(0, 2)) {
      actions.push(...h.actionPlan.immediate.slice(0, 1));
    }

    // Weekend-specific
    if (context.isWeekend) {
      actions.push('Use weekend for active recovery rather than complete rest');
      actions.push('Maintain sleep schedule within 1 hour of weekday timing');
    }

    // Dedupe and return top 7
    return [...new Set(actions)].slice(0, 7);
  }

  /**
   * Get motivational message based on context and performance
   */
  static getMotivationalMessage(
    readinessScore: number,
    trend: 'improving' | 'declining' | 'stable',
    context: ReturnType<typeof ContextualIntelligence.getTimeContext>
  ): string {
    const messages = {
      high_improving: [
        `Outstanding! Your ${readinessScore} readiness on a ${context.dayOfWeek} shows excellent momentum.`,
        `You're in the zone! ${readinessScore} readiness means your body is primed for performance.`,
        `Peak state achieved! This ${context.timeOfDay} is perfect for tackling your biggest goals.`,
      ],
      high_stable: [
        `Solid ${readinessScore} readiness - you're maintaining excellent consistency.`,
        `Your disciplined approach is paying off with steady ${readinessScore} readiness.`,
        `Consistency is key, and you're nailing it with ${readinessScore} readiness.`,
      ],
      moderate_improving: [
        `Recovery in progress! ${readinessScore} and climbing - keep up the good habits.`,
        `Nice rebound! Your ${readinessScore} readiness shows your body is adapting well.`,
        `Upward trajectory! From here, small improvements compound quickly.`,
      ],
      moderate_stable: [
        `${readinessScore} readiness is your baseline - reliable and functional.`,
        `Steady state at ${readinessScore}. Consider what might push you to the next level.`,
        `Maintaining ${readinessScore} is good. Ready to optimize further?`,
      ],
      low_improving: [
        `Recovery is underway! Every point of improvement matters.`,
        `You're doing the right things - patience during recovery is crucial.`,
        `Trend is your friend! Keep prioritizing recovery and you'll bounce back.`,
      ],
      low_stable: [
        `${readinessScore} readiness signals need for recovery. Listen to your body today.`,
        `Your body is asking for rest. Honor that signal for long-term success.`,
        `Low readiness is temporary. Strategic rest now prevents forced rest later.`,
      ],
      low_declining: [
        `${readinessScore} readiness requires immediate attention. Prioritize recovery now.`,
        `Your body needs support. Scale back and focus on fundamentals: sleep, nutrition, stress.`,
        `Decline is a signal, not a failure. Time to reset and rebuild stronger.`,
      ],
    };

    const level = readinessScore >= 85 ? 'high' : readinessScore >= 70 ? 'moderate' : 'low';
    const key = `${level}_${trend}` as keyof typeof messages;
    const options = messages[key] || messages.moderate_stable;

    return options[Math.floor(Math.random() * options.length)];
  }
}

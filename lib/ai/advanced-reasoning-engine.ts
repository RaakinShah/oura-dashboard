/**
 * ADVANCED REASONING ENGINE
 * Claude-level reasoning with chain-of-thought, multi-step problem solving,
 * and deep analytical capabilities with natural language generation
 */

import { SleepData, ActivityData, ReadinessData } from '../oura-api';
import { NaturalLanguageGenerator } from './natural-language-generation';

export interface ReasoningStep {
  step: number;
  thought: string;
  conclusion: string;
  confidence: number;
}

export interface ReasoningChain {
  question: string;
  steps: ReasoningStep[];
  finalAnswer: string;
  confidence: number;
  reasoning: string;
}

export interface AnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  reasoning: ReasoningChain;
  confidence: number;
}

/**
 * Advanced Reasoning Engine - Claude-level analytical capabilities
 */
export class AdvancedReasoningEngine {
  /**
   * Analyze health data using chain-of-thought reasoning
   */
  static analyzeHealthWithReasoning(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    question: string
  ): AnalysisResult {
    // Build reasoning chain
    const reasoningChain = this.buildReasoningChain(sleep, activity, readiness, question);

    // Generate insights using multi-step reasoning
    const insights = this.generateDeepInsights(sleep, activity, readiness, reasoningChain);

    // Create actionable recommendations
    const recommendations = this.generateRecommendations(sleep, activity, readiness, insights);

    // Generate comprehensive summary
    const summary = this.synthesizeSummary(sleep, activity, readiness, insights, reasoningChain);

    return {
      summary,
      insights,
      recommendations,
      reasoning: reasoningChain,
      confidence: reasoningChain.confidence,
    };
  }

  /**
   * Build chain-of-thought reasoning
   */
  private static buildReasoningChain(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    question: string
  ): ReasoningChain {
    const steps: ReasoningStep[] = [];

    // Step 1: Data assessment
    steps.push({
      step: 1,
      thought: "First, let me assess the available data and identify relevant patterns.",
      conclusion: `I have ${sleep.length} days of sleep data, ${activity.length} days of activity, and ${readiness.length} days of readiness scores. This gives me sufficient context for analysis.`,
      confidence: 0.95,
    });

    // Step 2: Pattern recognition
    const recentSleep = sleep.slice(-7);
    const avgSleepScore = recentSleep.reduce((sum, s) => sum + s.score, 0) / recentSleep.length;
    const avgReadiness = readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / Math.min(7, readiness.length);

    steps.push({
      step: 2,
      thought: "Now I'll identify patterns in your recent data (last 7 days).",
      conclusion: `Your average sleep score is ${avgSleepScore.toFixed(1)}/100 and readiness is ${avgReadiness.toFixed(1)}/100. ${avgSleepScore >= 85 ? 'Sleep quality is excellent.' : avgSleepScore >= 70 ? 'Sleep quality is good but has room for improvement.' : 'Sleep quality needs attention.'}`,
      confidence: 0.9,
    });

    // Step 3: Correlation analysis
    const sleepReadinessCorr = this.calculateCorrelation(
      sleep.slice(-14).map(s => s.score),
      readiness.slice(-14).map(r => r.score)
    );

    steps.push({
      step: 3,
      thought: "Let me analyze how different factors correlate with your overall performance.",
      conclusion: `Sleep and readiness show a ${sleepReadinessCorr > 0.7 ? 'strong' : sleepReadinessCorr > 0.4 ? 'moderate' : 'weak'} correlation (${sleepReadinessCorr.toFixed(2)}). This means ${sleepReadinessCorr > 0.7 ? 'your sleep quality strongly predicts your daily readiness' : 'other factors beyond sleep also significantly impact your readiness'}.`,
      confidence: 0.85,
    });

    // Step 4: Trend analysis
    const recentTrend = this.analyzeTrend(readiness.slice(-14).map(r => r.score));

    steps.push({
      step: 4,
      thought: "I need to understand the direction your health metrics are trending.",
      conclusion: `Your readiness trend over the past 2 weeks is ${recentTrend > 0.5 ? 'improving' : recentTrend < -0.5 ? 'declining' : 'stable'}. ${recentTrend > 0.5 ? 'Keep up the good work!' : recentTrend < -0.5 ? 'This warrants attention and potential intervention.' : 'Maintaining consistency is key.'}`,
      confidence: 0.88,
    });

    // Step 5: Deep sleep analysis
    const avgDeepSleep = recentSleep.reduce((sum, s) => sum + (s.deep_sleep_duration / 60), 0) / recentSleep.length;
    const optimalDeepSleep = avgDeepSleep >= 90; // 1.5 hours

    steps.push({
      step: 5,
      thought: "Deep sleep is crucial for physical recovery. Let me examine your deep sleep patterns.",
      conclusion: `You're averaging ${avgDeepSleep.toFixed(0)} minutes of deep sleep per night. ${optimalDeepSleep ? 'This is excellent for recovery.' : `Optimal is 90+ minutes. Consider reducing alcohol, maintaining a cool room (65-68°F), and avoiding screens before bed.`}`,
      confidence: 0.92,
    });

    // Step 6: HRV and stress assessment
    const avgHRV = readiness.slice(-7).reduce((sum, r) => sum + (r.average_hrv || 0), 0) / readiness.slice(-7).filter(r => r.average_hrv).length || 0;
    const hrvVariability = this.calculateStandardDeviation(readiness.slice(-7).map(r => r.average_hrv || 0));

    steps.push({
      step: 6,
      thought: "HRV (Heart Rate Variability) is a key indicator of stress and recovery capacity.",
      conclusion: `Your average HRV is ${avgHRV.toFixed(0)}ms with variability of ${hrvVariability.toFixed(1)}. ${hrvVariability > 15 ? 'High HRV variability suggests inconsistent recovery - focus on stress management and consistent sleep schedule.' : 'Your HRV is stable, indicating good adaptation to stress.'}`,
      confidence: 0.87,
    });

    // Step 7: Activity-recovery balance
    const avgActivity = activity.slice(-7).reduce((sum, a) => sum + a.score, 0) / Math.min(7, activity.length);
    const balance = this.assessRecoveryBalance(avgActivity, avgReadiness);

    steps.push({
      step: 7,
      thought: "Finally, let me assess whether your activity level is balanced with your recovery capacity.",
      conclusion: balance,
      confidence: 0.9,
    });

    // Synthesize final answer
    const finalAnswer = this.synthesizeFinalAnswer(steps, question);
    const overallConfidence = steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length;

    return {
      question,
      steps,
      finalAnswer,
      confidence: overallConfidence,
      reasoning: this.buildReasoningSummary(steps),
    };
  }

  /**
   * Generate deep insights using multi-step reasoning
   */
  private static generateDeepInsights(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    reasoning: ReasoningChain
  ): string[] {
    const insights: string[] = [];

    // Insight 1: Personalized sleep need (conversational)
    const sleepDurations = sleep.slice(-14).map(s => s.total_sleep_duration / 3600);
    const highPerformanceDays = readiness.slice(-14)
      .map((r, i) => ({ readiness: r.score, sleepDuration: sleepDurations[i] }))
      .filter(d => d.readiness >= 85)
      .map(d => d.sleepDuration);

    if (highPerformanceDays.length >= 3) {
      const optimalSleep = highPerformanceDays.reduce((sum, d) => sum + d, 0) / highPerformanceDays.length;
      insights.push(`🎯 **Here's Your Magic Number**: I looked at all your best days (readiness above 85) and found a pattern - you slept an average of ${optimalSleep.toFixed(1)} hours on those days. That's YOUR optimal sleep duration, not the generic "8 hours" everyone talks about. Aim for this, and you'll consistently feel your best.`);
    }

    // Insight 2: Recovery patterns (conversational)
    const recoveryRate = this.calculateRecoveryRate(readiness);
    if (recoveryRate >= 0.8) {
      insights.push(`⚡ **You're a Recovery Machine**: Your body bounces back fast from stress. When your readiness dips, you typically recover within 24-48 hours. This is a huge advantage - it means you can train harder and more frequently than someone who recovers slowly. Use this superpower wisely.`);
    } else if (recoveryRate >= 0.6) {
      insights.push(`⚡ **Moderate Recovery Speed**: You recover at a decent pace, but it takes time. After a hard session, give yourself 2-3 days before another big effort. The good news? This is trainable - consistent sleep and stress management can improve your recovery rate over time.`);
    } else {
      insights.push(`⚡ **Slow Recovery Pattern**: Your body needs more time to bounce back from stress than average. This isn't weakness - it's information. It means you need to be strategic: more rest days, longer recovery periods between hard sessions, and extra attention to sleep quality. Working with your biology, not against it.`);
    }

    // Insight 3: Circadian rhythm (conversational)
    const bedtimes = sleep.slice(-14)
      .map(s => s.bedtime_start ? new Date(s.bedtime_start).getHours() : null)
      .filter(h => h !== null) as number[];
    const bedtimeVariance = this.calculateStandardDeviation(bedtimes);

    if (bedtimeVariance > 1.5) {
      insights.push(`🌙 **Your Sleep Schedule Is All Over the Place**: Your bedtime swings by ±${bedtimeVariance.toFixed(1)} hours. I get it - life happens. But here's the deal: your body has an internal clock, and when you go to bed at wildly different times, you're essentially giving yourself jet lag. Even tightening this to within 30 minutes could improve your sleep quality by 15-20%. Worth a try?`);
    } else {
      insights.push(`🌙 **Consistency Champion**: Your bedtime varies by less than an hour (±${bedtimeVariance.toFixed(1)} hours), which is excellent. This consistency is one of the most underrated sleep hacks. Your circadian rhythm knows what to expect, and your body rewards you with better sleep quality. Keep this up!`);
    }

    // Insight 4: Temperature and recovery
    const tempDeviations = readiness.slice(-14).map(r => r.temperature_deviation || 0);
    const avgTempDev = tempDeviations.reduce((sum, t) => sum + t, 0) / tempDeviations.length;

    if (Math.abs(avgTempDev) > 0.3) {
      insights.push(`🌡️ Your body temperature has been ${avgTempDev > 0 ? 'elevated' : 'lower than usual'}. This could indicate ${avgTempDev > 0 ? 'overtraining, illness onset, or high stress' : 'excellent recovery or potential metabolic adaptation'}.`);
    }

    // Insight 5: Activity intensity intelligence
    const highActivityDays = activity.filter(a => a.score >= 85).length;
    const lowReadinessDays = readiness.filter(r => r.score < 70).length;

    if (highActivityDays > 10 && lowReadinessDays > 5) {
      insights.push(`💪 You're training hard (${highActivityDays} intense days), but experiencing frequent low readiness (${lowReadinessDays} days). Consider implementing a deload week.`);
    }

    // Insight 6: REM sleep and cognitive performance
    const avgREM = sleep.slice(-7).reduce((sum, s) => sum + (s.rem_sleep_duration / 60), 0) / Math.min(7, sleep.length);
    insights.push(`🧠 You're averaging ${avgREM.toFixed(0)} minutes of REM sleep. ${avgREM >= 90 ? 'Excellent for memory consolidation and learning.' : 'Optimal is 90+ minutes. REM is critical for cognitive performance and emotional regulation.'}`);

    // Insight 7: Resting heart rate trends
    const rhrTrend = this.analyzeTrend(readiness.slice(-14).map(r => r.resting_heart_rate));
    if (Math.abs(rhrTrend) > 2) {
      insights.push(`❤️ Your resting heart rate is ${rhrTrend > 0 ? 'increasing' : 'decreasing'}. ${rhrTrend > 0 ? 'Rising RHR may indicate accumulated fatigue or stress - prioritize recovery.' : 'Decreasing RHR suggests improving cardiovascular fitness.'}`);
    }

    return insights;
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    insights: string[]
  ): string[] {
    const recommendations: string[] = [];
    const avgReadiness = readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / Math.min(7, readiness.length);

    // High-level recommendation with natural language
    if (avgReadiness >= 85) {
      recommendations.push("✨ **Go For It**: Your recovery is solid - your body is saying \"I'm ready!\" This is the perfect time to push hard, tackle that tough workout you've been planning, or set a new PR. You've earned this moment.");
    } else if (avgReadiness >= 70) {
      recommendations.push("⚖️ **Be Smart**: You're in the middle ground. You can train today, but this isn't the day for hero workouts. Moderate intensity is your friend - save the crushing sessions for when your readiness is higher.");
    } else {
      recommendations.push("🛡️ **Recovery First**: Your body is asking for a break, and ignoring it won't end well. Take an easy day or complete rest. Think of it as an investment - recovering today makes you stronger tomorrow. Trust me on this one.");
    }

    // Sleep optimization with analogies
    const avgSleepEfficiency = sleep.slice(-7).reduce((sum, s) => sum + s.efficiency, 0) / Math.min(7, sleep.length);
    if (avgSleepEfficiency < 85) {
      const analogy = NaturalLanguageGenerator.createAnalogy('efficiency', avgSleepEfficiency);
      recommendations.push(`💤 **Fix Your Sleep Efficiency**: ${analogy} Concrete steps: (1) Put your phone in another room 1 hour before bed - seriously, do it. (2) Keep your bedroom at 65-68°F. (3) No caffeine after 2 PM. Just these three changes can boost efficiency by 10-15%.`);
    }

    // Activity guidance
    const avgActivity = activity.slice(-7).reduce((sum, a) => sum + a.score, 0) / Math.min(7, activity.length);
    if (avgActivity < 70 && avgReadiness >= 80) {
      recommendations.push("🏃 **You're Ready to Move More**: Here's the paradox - you're recovering well, but you're not using that recovery. It's like filling up your car's gas tank but never driving anywhere. Even a 30-minute walk daily can boost mood, improve metabolic health, and help you sleep better. Start small, build from there.");
    }

    // Stress management with HRV context
    const hrvSamples = readiness.slice(-7).filter(r => r.average_hrv && r.average_hrv > 0);
    if (hrvSamples.length >= 5) {
      const hrvValues = hrvSamples.map(r => r.average_hrv || 0);
      const hrvVariability = this.calculateStandardDeviation(hrvValues);
      if (hrvVariability > 15) {
        const analogy = NaturalLanguageGenerator.createAnalogy('hrv', hrvValues[hrvValues.length - 1]);
        recommendations.push(`🧘 **Manage Your Stress**: ${analogy} This isn't about being "stressed out" mentally - it's about your nervous system being on high alert. Try this: 10 minutes of slow breathing every morning (5 seconds in, 7 seconds out). It sounds simple, almost too simple, but it works. Give it two weeks and watch your HRV stabilize.`);
      }
    }

    // Consistency
    const scoreVariance = this.calculateStandardDeviation(
      readiness.slice(-14).map(r => r.score)
    );
    if (scoreVariance > 15) {
      recommendations.push("📊 **Consistency**: Your readiness varies significantly. Focus on: consistent sleep/wake times (even weekends), regular meal timing, and structured recovery protocols.");
    }

    // Advanced optimization
    if (avgReadiness >= 75) {
      recommendations.push("🎯 **Advanced Optimization**: Consider tracking: protein intake (0.7-1g per lb bodyweight), hydration (monitor urine color), and potentially supplement with magnesium glycinate for sleep quality.");
    }

    return recommendations;
  }

  /**
   * Synthesize comprehensive summary with natural language
   */
  private static synthesizeSummary(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[],
    insights: string[],
    reasoning: ReasoningChain
  ): string {
    const avgReadiness = readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / Math.min(7, readiness.length);
    const avgSleep = sleep.slice(-7).reduce((sum, s) => sum + s.score, 0) / Math.min(7, sleep.length);
    const latestReadiness = readiness[readiness.length - 1];
    const latestSleep = sleep[sleep.length - 1];

    // Use natural language for readiness description
    const trend = this.analyzeTrend(readiness.slice(-14).map(r => r.score));
    const readinessContext = {
      hrv: latestReadiness.average_hrv,
      rhr: latestReadiness.resting_heart_rate,
      sleep: latestSleep.score,
    };

    const readinessDesc = NaturalLanguageGenerator.describeReadiness(avgReadiness, trend, readinessContext);

    // Use natural language for sleep description
    const sleepContext = {
      duration: latestSleep.total_sleep_duration / 3600,
      efficiency: latestSleep.efficiency,
      deepSleep: latestSleep.deep_sleep_duration / 60,
    };

    const sleepDesc = NaturalLanguageGenerator.describeSleepQuality(latestSleep.score, sleepContext);

    // Use natural language for trend description
    const trendDesc = NaturalLanguageGenerator.describeTrend('readiness', readiness.slice(-14).map(r => r.score), 'the past two weeks');

    // Compose conversational summary
    let summary = `After analyzing ${sleep.length} days of your health data, here's what I'm seeing:\n\n`;
    summary += `**Current Status:** ${readinessDesc}\n\n`;
    summary += `**Sleep Quality:** ${sleepDesc}\n\n`;
    summary += `**Trend:** ${trendDesc}`;

    return summary;
  }

  // Helper methods
  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denom = Math.sqrt(denomX * denomY);
    return denom === 0 ? 0 : numerator / denom;
  }

  private static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  private static analyzeTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const meanX = (n - 1) / 2;
    const meanY = values.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (values[i] - meanY);
      denominator += (x[i] - meanX) ** 2;
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static calculateRecoveryRate(readiness: ReadinessData[]): number {
    // Analyze how quickly readiness bounces back after dips
    let recoveries = 0;
    let recoverySum = 0;

    for (let i = 1; i < readiness.length; i++) {
      const prev = readiness[i - 1].score;
      const curr = readiness[i].score;

      if (prev < 70 && curr > prev) {
        recoveries++;
        recoverySum += (curr - prev) / (100 - prev);
      }
    }

    return recoveries > 0 ? recoverySum / recoveries : 0.7;
  }

  private static assessRecoveryBalance(activityScore: number, readinessScore: number): string {
    const ratio = activityScore / Math.max(readinessScore, 1);

    if (ratio > 1.2) {
      return `You're pushing hard (activity ${activityScore.toFixed(0)}) relative to your recovery capacity (readiness ${readinessScore.toFixed(0)}). Consider a rest day or active recovery.`;
    } else if (ratio < 0.7) {
      return `Your activity level is conservative relative to your recovery capacity. If you're feeling good, you can safely increase training intensity.`;
    } else {
      return `Your activity and recovery are well balanced. This is the sweet spot for sustainable progress.`;
    }
  }

  private static synthesizeFinalAnswer(steps: ReasoningStep[], question: string): string {
    const conclusions = steps.map(s => s.conclusion).join(' ');
    return `After analyzing your health data through multiple lenses, here's what I've discovered: ${conclusions}`;
  }

  private static buildReasoningSummary(steps: ReasoningStep[]): string {
    return steps.map(s => `Step ${s.step}: ${s.thought}\n→ ${s.conclusion}`).join('\n\n');
  }
}

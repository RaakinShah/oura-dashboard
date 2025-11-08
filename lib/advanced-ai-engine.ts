/**
 * ADVANCED AI ENGINE
 * Sophisticated health intelligence system with deep pattern recognition,
 * natural language generation, and multi-dimensional analysis
 */

import { SleepData, ActivityData, ReadinessData } from './oura-api';
import { parseOuraDate, getDayOfWeek } from './date-utils';

// ============= ADVANCED INTERFACES =============

export interface DeepHealthInsight {
  title: string;
  narrative: string; // Natural language explanation
  confidence: number;
  severity: 'critical' | 'important' | 'moderate' | 'minor' | 'positive';
  evidence: {
    metric: string;
    observation: string;
    significance: number; // 0-100
  }[];
  actionPlan: {
    immediate: string[];
    shortTerm: string[]; // 1-7 days
    longTerm: string[]; // 2+ weeks
  };
  expectedOutcome: string;
  timeframe: string;
}

export interface MultiDimensionalPattern {
  patternType: 'cascading' | 'cyclical' | 'progressive' | 'compensatory' | 'synergistic';
  description: string;
  involvedMetrics: string[];
  strength: number; // 0-100
  temporalContext: {
    dayOfWeek?: string[];
    timeOfMonth?: string;
    seasonalEffect?: boolean;
  };
  rootCause?: string;
  rippleEffects: string[];
  interventionPoints: {
    point: string;
    leverage: number; // How much impact intervention here would have
    difficulty: 'easy' | 'moderate' | 'hard';
  }[];
}

export interface PredictiveModel {
  metric: string;
  forecastDays: number;
  predictions: {
    day: number;
    value: number;
    confidenceInterval: { lower: number; upper: number };
    confidence: number;
  }[];
  trendDirection: 'improving' | 'stable' | 'declining' | 'volatile';
  volatility: number; // 0-100
  inflectionPoints: {
    day: number;
    event: string;
    probability: number;
  }[];
  scenarioAnalysis: {
    scenario: 'best_case' | 'expected' | 'worst_case';
    outcome: string;
    probability: number;
  }[];
}

export interface ContextualIntelligence {
  currentContext: {
    dayOfWeek: string;
    weekOfMonth: number;
    recentStressors: string[];
    likelyUpcomingDemands: string[];
  };
  historicalContext: {
    similarDaysPerformance: number;
    typicalPatternForToday: string;
    deviationFromNorm: number;
  };
  environmentalFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }[];
  adaptiveRecommendations: string[];
}

export interface HolisticHealthAssessment {
  overallState: string; // Natural language summary
  systemicHealth: {
    system: 'nervous' | 'cardiovascular' | 'metabolic' | 'recovery' | 'cognitive';
    status: string;
    score: number;
    keyIndicators: string[];
  }[];
  balanceAnalysis: {
    workload: number; // 0-100
    recovery: number;
    balance: number; // -100 (overtrained) to +100 (undertrained)
    recommendation: string;
  };
  resilience: {
    score: number;
    trend: 'building' | 'stable' | 'declining';
    factors: string[];
  };
  lifeOptimization: {
    area: string;
    currentLevel: number;
    potential: number;
    gap: number;
    topActions: string[];
  }[];
}

export interface IntelligentNarrative {
  opening: string;
  bodyParagraphs: string[];
  conclusion: string;
  tone: 'encouraging' | 'cautionary' | 'celebratory' | 'informative';
  keyTakeaways: string[];
}

// ============= ADVANCED AI ENGINE CLASS =============

export class AdvancedAIEngine {
  /**
   * NATURAL LANGUAGE GENERATION SYSTEM
   * Generates human-like, contextual narratives
   */
  private static generateNarrative(
    context: string,
    data: any,
    tone: 'encouraging' | 'cautionary' | 'celebratory' | 'informative'
  ): string {
    const templates = {
      encouraging: [
        `The data shows ${context}, which indicates you are making meaningful progress.`,
        `Your data reveals ${context}—this is a positive sign of adaptation.`,
        `There is encouraging evidence of ${context} in your recent patterns.`,
      ],
      cautionary: [
        `The data indicates ${context}, which warrants attention.`,
        `The analysis shows ${context}, suggesting it is time to adjust your approach.`,
        `Your metrics show ${context}—this is an important signal to address.`,
      ],
      celebratory: [
        `Excellent! ${context} demonstrates outstanding performance.`,
        `This is impressive: ${context} puts you in optimal territory.`,
        `Your body is thriving—${context} reflects exceptional health.`,
      ],
      informative: [
        `Your current data shows ${context}.`,
        `The analysis reveals ${context}.`,
        `Based on your patterns, ${context}.`,
      ],
    };

    const template = templates[tone][Math.floor(Math.random() * templates[tone].length)];
    return template;
  }

  /**
   * DEEP HEALTH INSIGHTS
   * Multi-layered analysis with sophisticated pattern recognition
   */
  static generateDeepInsights(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): DeepHealthInsight[] {
    const insights: DeepHealthInsight[] = [];

    if (sleep.length < 14) return insights;

    // INSIGHT 1: Sleep Architecture Analysis
    const recentSleep = sleep.slice(-14);
    const deepSleepMinutes = recentSleep.map(s => s.deep_sleep_duration / 60);
    const remSleepMinutes = recentSleep.map(s => s.rem_sleep_duration / 60);
    const avgDeep = deepSleepMinutes.reduce((a, b) => a + b) / deepSleepMinutes.length;
    const avgRem = remSleepMinutes.reduce((a, b) => a + b) / remSleepMinutes.length;

    const deepTrend = this.calculateTrend(deepSleepMinutes);
    const remTrend = this.calculateTrend(remSleepMinutes);

    if (avgDeep < 60 || avgRem < 90) {
      const narrative = this.buildComplexNarrative([
        `Your sleep architecture analysis reveals a nuanced picture:`,
        avgDeep < 60 ?
          `Deep sleep averaging ${avgDeep.toFixed(0)} minutes is below the optimal 60-110 minute range. Deep sleep is when your body performs critical physical repair, muscle recovery, and immune system strengthening.` :
          null,
        avgRem < 90 ?
          `REM sleep at ${avgRem.toFixed(0)} minutes falls short of the ideal 90-120 minutes. REM sleep is essential for memory consolidation, emotional processing, and cognitive function.` :
          null,
        deepTrend < 0 && remTrend < 0 ?
          `Both stages are trending downward, indicating a systematic sleep quality issue rather than random variation.` :
          deepTrend < 0 ?
            `Deep sleep is declining, possibly due to stress, late eating, alcohol, or elevated bedroom temperature.` :
            remTrend < 0 ?
              `REM sleep decline suggests either insufficient total sleep duration or sleep fragmentation.` :
              null,
        `This creates a cascading effect: inadequate physical recovery (deep sleep deficit) combined with impaired cognitive recovery (REM deficit) compounds into reduced daytime performance and slower adaptation to training.`,
      ]);

      insights.push({
        title: 'Sleep Architecture Optimization Needed',
        narrative,
        confidence: 0.88,
        severity: avgDeep < 45 || avgRem < 70 ? 'important' : 'moderate',
        evidence: [
          { metric: 'Deep Sleep', observation: `${avgDeep.toFixed(0)} min average (target: 60-110 min)`, significance: 85 },
          { metric: 'REM Sleep', observation: `${avgRem.toFixed(0)} min average (target: 90-120 min)`, significance: 80 },
          { metric: 'Trend', observation: deepTrend < 0 ? 'Declining over 2 weeks' : 'Stable', significance: deepTrend < 0 ? 75 : 40 },
        ],
        actionPlan: {
          immediate: [
            'Tonight: Go to bed 30-45 minutes earlier to increase total sleep time',
            'Set bedroom temperature to 65-68°F (18-20°C) to optimize deep sleep',
            'Avoid all alcohol today—even one drink reduces deep sleep by 20-50%',
          ],
          shortTerm: [
            'Establish strict sleep schedule: same bedtime/wake time for 7 consecutive days',
            'Implement "wind-down protocol": dim lights, no screens 90 min before bed',
            'Track correlation between dinner timing and sleep quality (eat 3+ hours before bed)',
            'Morning sunlight exposure within 30 min of waking to regulate circadian rhythm',
          ],
          longTerm: [
            'Evaluate sleep environment: blackout curtains, white noise, optimal mattress',
            'Consider sleep study if architecture doesn\'t improve within 3 weeks',
            'Build consistent pre-sleep routine to signal body it\'s time for recovery',
          ],
        },
        expectedOutcome: 'With consistent implementation, you should see 15-25% improvement in deep and REM sleep within 10-14 days, leading to measurably better readiness scores and subjective energy.',
        timeframe: '2-3 weeks for significant improvement',
      });
    }

    // INSIGHT 2: Recovery Debt Accumulation
    const last14Readiness = readiness.slice(-14);
    const recoveryDeficit = last14Readiness.filter(r => r.score < 70).length;
    const consecutiveLowDays = this.findConsecutiveLowDays(last14Readiness);

    if (recoveryDeficit >= 5 || consecutiveLowDays >= 3) {
      const narrative = this.buildComplexNarrative([
        `Your recovery data reveals a concerning pattern of accumulated fatigue:`,
        `${recoveryDeficit} out of 14 days show readiness below 70, indicating your body has not been able to fully recover before the next day's demands.`,
        consecutiveLowDays >= 3 ?
          `Most critically, you have had ${consecutiveLowDays} consecutive days of insufficient recovery—this is a red flag for overtraining syndrome development.` :
          null,
        `This creates a "recovery debt" similar to sleep debt. Each day of inadequate recovery compounds, making the body less resilient to stress and more prone to injury, illness, and performance plateau.`,
        `The physiological markers support this: ${this.analyzePhysiologicalMarkers(last14Readiness)}`,
        `If left unaddressed, this pattern typically leads to: (1) Plateaued or declining performance despite continued effort, (2) Increased injury risk, (3) Suppressed immune function, (4) Hormonal disruption, (5) Chronic fatigue.`,
      ]);

      insights.push({
        title: 'Accumulated Recovery Debt Detected',
        narrative,
        confidence: 0.92,
        severity: consecutiveLowDays >= 4 ? 'critical' : 'important',
        evidence: [
          { metric: 'Recovery Frequency', observation: `${recoveryDeficit}/14 days below threshold`, significance: 95 },
          { metric: 'Consecutive Low Days', observation: `${consecutiveLowDays} days in a row`, significance: 90 },
          { metric: 'Trend', observation: this.assessRecoveryTrend(last14Readiness), significance: 85 },
        ],
        actionPlan: {
          immediate: [
            'URGENT: Take complete rest day today—no structured exercise',
            'Prioritize 9+ hours of sleep tonight (set multiple alarms for early bedtime)',
            'Reduce all non-essential stressors for next 48 hours',
            'Hydrate aggressively: aim for 100+ oz water today',
          ],
          shortTerm: [
            'Implement deload week: reduce training volume by 50-60% for 7 days',
            'Add one extra complete rest day per week',
            'Focus on recovery modalities: gentle yoga, meditation, massage, sauna',
            'Optimize nutrition: increase anti-inflammatory foods, ensure adequate protein',
            'Monitor morning resting heart rate—should decrease by 3-5 bpm when recovered',
          ],
          longTerm: [
            'Restructure training program: periodize with planned recovery weeks',
            'Develop better awareness of early overtraining signs',
            'Build in proactive recovery: don\'t wait until metrics crash',
            'Consider stress management coaching or therapy if life stress is contributing',
          ],
        },
        expectedOutcome: 'With aggressive recovery focus, readiness should improve 10-15 points within 4-5 days. Full recovery from accumulated debt typically takes 1.5-2x the duration of deficit accumulation.',
        timeframe: consecutiveLowDays >= 4 ? '10-14 days to baseline' : '5-7 days to baseline',
      });
    }

    // INSIGHT 3: Activity-Recovery Imbalance
    const last14Activity = activity.slice(-14);
    const avgActivityScore = last14Activity.reduce((sum, a) => sum + a.score, 0) / last14Activity.length;
    const avgReadinessScore = last14Readiness.reduce((sum, r) => sum + r.score, 0) / last14Readiness.length;
    const imbalance = avgActivityScore - avgReadinessScore;

    if (imbalance > 15) {
      const narrative = this.buildComplexNarrative([
        `Your data reveals a significant imbalance between activity load and recovery capacity:`,
        `Activity scores averaging ${avgActivityScore.toFixed(0)} significantly outpace readiness scores of ${avgReadinessScore.toFixed(0)}—a ${imbalance.toFixed(0)} point gap.`,
        `This indicates you are consistently demanding more from your body than it is prepared to deliver. This is analogous to withdrawing more from a bank account than you are depositing.`,
        `The fundamental principle of adaptation is: stress + recovery = growth. When stress exceeds recovery capacity, the equation becomes: excessive stress - insufficient recovery = breakdown.`,
        `Interestingly, ${this.analyzeCompensatoryPatterns(sleep, activity, readiness)}.`,
        `This pattern is unsustainable. The body has finite compensatory mechanisms, and you are depleting them.`,
      ]);

      insights.push({
        title: 'Activity-Recovery Imbalance',
        narrative,
        confidence: 0.87,
        severity: imbalance > 20 ? 'important' : 'moderate',
        evidence: [
          { metric: 'Activity Level', observation: `${avgActivityScore.toFixed(0)} average score`, significance: 70 },
          { metric: 'Recovery Level', observation: `${avgReadinessScore.toFixed(0)} average score`, significance: 70 },
          { metric: 'Gap', observation: `${imbalance.toFixed(0)} point imbalance`, significance: 90 },
        ],
        actionPlan: {
          immediate: [
            'Reduce today\'s workout intensity by 30-40%',
            'Focus on technique and form rather than volume or intensity',
          ],
          shortTerm: [
            'Realign activity with readiness: on low readiness days, do light movement only',
            'Implement "readiness-based training": adjust daily intensity based on morning readiness',
            'Add one full rest day per week minimum',
            'Cap high-intensity sessions to 2-3 per week',
          ],
          longTerm: [
            'Develop periodized training plan that includes planned recovery weeks',
            'Build better recovery practices: sleep optimization, nutrition, stress management',
            'Learn to distinguish "good discomfort" (adaptation) from "bad discomfort" (overtraining)',
          ],
        },
        expectedOutcome: 'Properly balancing activity with recovery typically shows improvement within one training cycle (2-3 weeks), with readiness scores catching up to activity levels.',
        timeframe: '2-3 weeks',
      });
    }

    // INSIGHT 4: Positive Momentum Detection
    const recentReadiness = readiness.slice(-7);
    const recentReadinessScores = recentReadiness.map(r => r.score);
    const readinessTrend = this.calculateTrend(recentReadinessScores);
    const avgRecentReadiness = recentReadinessScores.reduce((a, b) => a + b) / recentReadinessScores.length;

    if (readinessTrend > 2 && avgRecentReadiness >= 75) {
      const narrative = this.buildComplexNarrative([
        `Your recent trajectory is excellent—this is what positive adaptation looks like:`,
        `Readiness is trending upward at ${readinessTrend.toFixed(1)} points per day, with a 7-day average of ${avgRecentReadiness.toFixed(0)}.`,
        `This indicates your current balance of stress and recovery is in the optimal zone—enough challenge to drive adaptation, sufficient recovery to actualize it.`,
        `The physiological markers support this positive state: ${this.analyzePositiveMarkers(recentReadiness, sleep.slice(-7))}.`,
        `This is your window of opportunity—your body is primed for challenges and new personal bests.`,
      ]);

      insights.push({
        title: 'Positive Momentum Detected',
        narrative,
        confidence: 0.85,
        severity: 'positive',
        evidence: [
          { metric: 'Readiness Trend', observation: `+${readinessTrend.toFixed(1)} points/day`, significance: 85 },
          { metric: 'Average Level', observation: `${avgRecentReadiness.toFixed(0)} (strong)`, significance: 80 },
          { metric: 'Consistency', observation: this.assessConsistency(recentReadinessScores), significance: 75 },
        ],
        actionPlan: {
          immediate: [
            'Capitalize on this state: tackle your most challenging goal today',
            'This is ideal timing for PRs, competitions, or important presentations',
          ],
          shortTerm: [
            'Maintain current routine—you have found a formula that works',
            'Document what you are doing right: sleep, nutrition, training, stress management',
            'Do not prematurely increase training load; let adaptation solidify',
          ],
          longTerm: [
            'Use this data as your baseline "success pattern"',
            'When metrics decline in future, compare to this period to identify what changed',
            'This demonstrates your potential when all factors align',
          ],
        },
        expectedOutcome: 'This positive momentum can be sustained with consistent practices. Use this period to establish new performance benchmarks.',
        timeframe: 'Sustainable with proper maintenance',
      });
    }

    // INSIGHT 5: Specific Sleep Duration Impact Analysis
    if (sleep.length >= 14 && readiness.length >= 14) {
      const recentDays = sleep.slice(-14);
      const sleepDurations = recentDays.map(s => s.total_sleep_duration / 3600);
      const readinessScores = readiness.slice(-14).map(r => r.score);

      // Find days with <7h sleep and >8h sleep
      const shortSleepDays = recentDays.filter((s, i) => sleepDurations[i] < 7);
      const goodSleepDays = recentDays.filter((s, i) => sleepDurations[i] >= 7.5);

      if (shortSleepDays.length >= 3 && goodSleepDays.length >= 3) {
        const shortSleepReadiness = shortSleepDays.map((s, idx) => {
          const origIdx = recentDays.indexOf(s);
          return readinessScores[origIdx];
        });
        const goodSleepReadiness = goodSleepDays.map((s, idx) => {
          const origIdx = recentDays.indexOf(s);
          return readinessScores[origIdx];
        });

        const shortSleepAvg = shortSleepReadiness.reduce((a, b) => a + b, 0) / shortSleepReadiness.length;
        const goodSleepAvg = goodSleepReadiness.reduce((a, b) => a + b, 0) / goodSleepReadiness.length;
        const impactScore = goodSleepAvg - shortSleepAvg;

        if (impactScore > 5) {
          const avgShortDuration = shortSleepDays.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / shortSleepDays.length;
          const avgGoodDuration = goodSleepDays.reduce((sum, s) => sum + s.total_sleep_duration / 3600, 0) / goodSleepDays.length;

          const narrative = this.buildComplexNarrative([
            `I've identified a clear, quantifiable relationship between your sleep duration and next-day performance:`,
            `On the ${shortSleepDays.length} days you slept ${avgShortDuration.toFixed(1)} hours or less, your average readiness was ${shortSleepAvg.toFixed(0)}.`,
            `By contrast, on the ${goodSleepDays.length} days you slept ${avgGoodDuration.toFixed(1)}+ hours, your readiness averaged ${goodSleepAvg.toFixed(0)}.`,
            `That's a ${impactScore.toFixed(0)}-point difference directly attributable to sleep duration—equivalent to ${(impactScore / 100 * 100).toFixed(0)}% better recovery capacity.`,
            `This isn't theoretical—this is YOUR body's specific dose-response relationship. Every hour of sleep below ${avgGoodDuration.toFixed(1)}h costs you approximately ${(impactScore / ((avgGoodDuration - avgShortDuration))).toFixed(0)} readiness points.`,
            `The pattern shows that ${avgGoodDuration.toFixed(1)} hours appears to be your personal sleep threshold for optimal recovery.`,
          ]);

          insights.push({
            title: `Your Sleep "Sweet Spot": ${avgGoodDuration.toFixed(1)}+ Hours`,
            narrative,
            confidence: 0.91,
            severity: impactScore > 15 ? 'important' : 'moderate',
            evidence: [
              { metric: 'Short Sleep Impact', observation: `${shortSleepDays.length} days averaging ${avgShortDuration.toFixed(1)}h → ${shortSleepAvg.toFixed(0)} readiness`, significance: 90 },
              { metric: 'Optimal Sleep Impact', observation: `${goodSleepDays.length} days averaging ${avgGoodDuration.toFixed(1)}h → ${goodSleepAvg.toFixed(0)} readiness`, significance: 90 },
              { metric: 'Performance Delta', observation: `${impactScore.toFixed(0)} point difference`, significance: 95 },
            ],
            actionPlan: {
              immediate: [
                `Tonight: target ${avgGoodDuration.toFixed(1)}+ hours of sleep by setting bedtime for ${Math.ceil(avgGoodDuration + 0.5)} hours before your wake time`,
                `Calculate backwards from wake time: if you wake at 7am, you should be in bed by ${this.calculateBedtime(7, avgGoodDuration + 0.5)}`,
              ],
              shortTerm: [
                `Lock in ${avgGoodDuration.toFixed(1)}h as your non-negotiable baseline for the next 7 days`,
                `Track the impact: you should see ${(impactScore * 0.7).toFixed(0)}+ point readiness improvement`,
                `Identify and eliminate your common "sleep stealers" (late meetings, evening scrolling, etc.)`,
              ],
              longTerm: [
                `Build your schedule around this ${avgGoodDuration.toFixed(1)}h requirement, not as an afterthought`,
                `Your body has shown you its needs—honor them consistently`,
                `Experiment with ${avgGoodDuration + 0.5}h to see if even more sleep yields further gains`,
              ],
            },
            expectedOutcome: `Based on your data, consistently hitting ${avgGoodDuration.toFixed(1)}+ hours should maintain readiness in the ${goodSleepAvg.toFixed(0)}+ range, a ${impactScore.toFixed(0)}-point improvement from short sleep days.`,
            timeframe: 'Immediate (next-day impact)',
          });
        }
      }
    }

    // INSIGHT 6: Day-of-Week Performance Patterns
    if (sleep.length >= 21) {
      const dayPatterns: { [key: number]: { sleep: number[]; readiness: number[]; activity: number[] } } = {};

      sleep.forEach((s, i) => {
        const day = parseOuraDate(s.day).getDay();
        if (!dayPatterns[day]) dayPatterns[day] = { sleep: [], readiness: [], activity: [] };
        dayPatterns[day].sleep.push(s.score);
        if (readiness[i]) dayPatterns[day].readiness.push(readiness[i].score);
        if (activity[i]) dayPatterns[day].activity.push(activity[i].score);
      });

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayAverages = Object.entries(dayPatterns).map(([day, data]) => ({
        day: parseInt(day),
        name: dayNames[parseInt(day)],
        readinessAvg: data.readiness.length > 0 ? data.readiness.reduce((a, b) => a + b) / data.readiness.length : 0,
        sleepAvg: data.sleep.length > 0 ? data.sleep.reduce((a, b) => a + b) / data.sleep.length : 0,
        activityAvg: data.activity.length > 0 ? data.activity.reduce((a, b) => a + b) / data.activity.length : 0,
        count: data.readiness.length,
      })).filter(d => d.count >= 2);

      if (dayAverages.length >= 4) {
        const bestDay = dayAverages.reduce((max, d) => d.readinessAvg > max.readinessAvg ? d : max);
        const worstDay = dayAverages.reduce((min, d) => d.readinessAvg < min.readinessAvg ? d : min);
        const gap = bestDay.readinessAvg - worstDay.readinessAvg;

        if (gap > 10) {
          const narrative = this.buildComplexNarrative([
            `Your data reveals a striking weekly performance rhythm:`,
            `${bestDay.name}s are your peak performance days, averaging ${bestDay.readinessAvg.toFixed(0)} readiness (${bestDay.count} data points).`,
            `${worstDay.name}s are consistently your most challenging, averaging just ${worstDay.readinessAvg.toFixed(0)} readiness.`,
            `That's a ${gap.toFixed(0)}-point weekly swing—this isn't random variation, it's a systematic pattern driven by your weekly routine.`,
            worstDay.sleepAvg < bestDay.sleepAvg - 5 ?
              `The root cause appears to be sleep: ${worstDay.name}s show ${(bestDay.sleepAvg - worstDay.sleepAvg).toFixed(0)} points lower sleep scores than ${bestDay.name}s.` :
              `Interestingly, sleep scores are similar, suggesting the issue is lifestyle stress or activity patterns specific to ${worstDay.name}s.`,
            `This pattern means you effectively lose one day per week to suboptimal performance—that's ${(1/7*100).toFixed(0)}% of your potential capacity.`,
          ]);

          insights.push({
            title: `Weekly Performance Pattern: ${bestDay.name} Peak vs ${worstDay.name} Dip`,
            narrative,
            confidence: 0.86,
            severity: gap > 15 ? 'important' : 'moderate',
            evidence: [
              { metric: `${bestDay.name} Performance`, observation: `${bestDay.readinessAvg.toFixed(0)} average readiness (${bestDay.count} samples)`, significance: 85 },
              { metric: `${worstDay.name} Performance`, observation: `${worstDay.readinessAvg.toFixed(0)} average readiness (${worstDay.count} samples)`, significance: 85 },
              { metric: 'Weekly Volatility', observation: `${gap.toFixed(0)} point weekly swing`, significance: 90 },
            ],
            actionPlan: {
              immediate: [
                `This week: protect ${worstDay.name} evening—prioritize sleep over social/work commitments`,
                `Plan lighter activity/workload for ${worstDay.name}s until pattern improves`,
              ],
              shortTerm: [
                `Identify what's different about your ${worstDay.name} routine: late nights? Alcohol? Stress?`,
                `Experiment: treat ${worstDay.name} evening like a ${bestDay.name} evening for 3 weeks`,
                `Track the variables: bedtime, screen time, meals, alcohol, stress level`,
              ],
              longTerm: [
                `Restructure weekly schedule to minimize ${worstDay.name} stressors`,
                `Build in protective habits specifically for ${worstDay.name}s`,
                `Goal: flatten the weekly curve to ±5 points instead of ${gap.toFixed(0)} points`,
              ],
            },
            expectedOutcome: `Addressing the ${worstDay.name} pattern should recover ${(gap * 0.6).toFixed(0)}+ points, adding one high-quality day per week to your performance capacity.`,
            timeframe: '3-4 weeks to establish new pattern',
          });
        }
      }
    }

    return insights.sort((a, b) => {
      const severityOrder = { critical: 5, important: 4, moderate: 3, minor: 2, positive: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * MULTI-DIMENSIONAL PATTERN RECOGNITION
   * Identifies complex, interrelated patterns across multiple metrics
   */
  static detectMultiDimensionalPatterns(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): MultiDimensionalPattern[] {
    const patterns: MultiDimensionalPattern[] = [];

    if (sleep.length < 21) return patterns;

    // PATTERN 1: Cascading Fatigue Pattern
    const cascadingEffect = this.detectCascadingEffect(sleep, activity, readiness);
    if (cascadingEffect) patterns.push(cascadingEffect);

    // PATTERN 2: Cyclical Weekly Pattern
    const weeklyPattern = this.detectWeeklyPattern(sleep, activity, readiness);
    if (weeklyPattern) patterns.push(weeklyPattern);

    // PATTERN 3: Compensatory Behavior Pattern
    const compensatory = this.detectCompensatoryPattern(sleep, activity, readiness);
    if (compensatory) patterns.push(compensatory);

    // PATTERN 4: Progressive Improvement Pattern
    const progressive = this.detectProgressivePattern(sleep, readiness);
    if (progressive) patterns.push(progressive);

    // PATTERN 5: Synergistic Pattern (everything working together)
    const synergistic = this.detectSynergisticPattern(sleep, activity, readiness);
    if (synergistic) patterns.push(synergistic);

    return patterns;
  }

  /**
   * SOPHISTICATED PREDICTIVE MODELING
   * Advanced forecasting with confidence intervals and scenario analysis
   */
  static generatePredictiveModel(
    metric: 'sleep' | 'activity' | 'readiness',
    historicalData: SleepData[] | ActivityData[] | ReadinessData[],
    forecastDays: number = 7
  ): PredictiveModel {
    const scores = historicalData.map((d: any) => d.score);
    const trend = this.calculateWeightedTrend(scores);
    const volatility = this.calculateVolatility(scores);
    const cyclicalComponent = this.detectCyclicalComponent(scores);

    const predictions = [];
    const currentValue = scores[scores.length - 1];

    for (let day = 1; day <= forecastDays; day++) {
      // Sophisticated prediction combining trend, mean reversion, and cyclical patterns
      const trendComponent = trend * day;
      const meanReversionForce = (scores.reduce((a, b) => a + b) / scores.length - currentValue) * 0.1 * day;
      const cyclicalOffset = cyclicalComponent * Math.sin((day / 7) * Math.PI * 2);
      const randomNoise = (Math.random() - 0.5) * volatility * 0.3;

      const predictedValue = Math.max(0, Math.min(100,
        currentValue + trendComponent + meanReversionForce + cyclicalOffset + randomNoise
      ));

      const uncertaintyMultiplier = 1 + (day * 0.15); // Uncertainty increases with time
      const intervalWidth = volatility * uncertaintyMultiplier;

      predictions.push({
        day,
        value: Math.round(predictedValue),
        confidenceInterval: {
          lower: Math.round(Math.max(0, predictedValue - intervalWidth)),
          upper: Math.round(Math.min(100, predictedValue + intervalWidth)),
        },
        confidence: Math.max(0.3, 0.9 - (day * 0.08)),
      });
    }

    // Identify potential inflection points
    const inflectionPoints = this.identifyInflectionPoints(predictions, historicalData);

    // Scenario analysis
    const scenarioAnalysis = [
      {
        scenario: 'best_case' as const,
        outcome: `${metric} scores reach ${Math.min(100, predictions[predictions.length - 1].confidenceInterval.upper)} if all optimization strategies are implemented`,
        probability: 0.25,
      },
      {
        scenario: 'expected' as const,
        outcome: `${metric} scores stabilize around ${predictions[predictions.length - 1].value} with current practices`,
        probability: 0.50,
      },
      {
        scenario: 'worst_case' as const,
        outcome: `${metric} scores decline to ${predictions[predictions.length - 1].confidenceInterval.lower} if recovery is neglected`,
        probability: 0.25,
      },
    ];

    return {
      metric,
      forecastDays,
      predictions,
      trendDirection: trend > 1 ? 'improving' : trend < -1 ? 'declining' : volatility > 15 ? 'volatile' : 'stable',
      volatility: Math.round(volatility),
      inflectionPoints,
      scenarioAnalysis,
    };
  }

  /**
   * CONTEXTUAL INTELLIGENCE
   * Understand the broader context and adapt recommendations accordingly
   */
  static analyzeContext(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): ContextualIntelligence {
    const latestDate = parseOuraDate(sleep[sleep.length - 1].day);
    const dayOfWeek = getDayOfWeek(latestDate);
    const weekOfMonth = Math.ceil(latestDate.getDate() / 7);

    // Analyze similar days historically
    const similarDays = sleep.filter(s => {
      const date = parseOuraDate(s.day);
      return date.getDay() === latestDate.getDay();
    });
    const similarDaysPerformance = similarDays.length > 0 ?
      similarDays.reduce((sum, s) => sum + s.score, 0) / similarDays.length : 0;

    // Detect recent stressors
    const recentStressors = this.detectStressors(sleep.slice(-7), readiness.slice(-7));

    // Predict upcoming demands
    const likelyUpcomingDemands = this.predictUpcomingDemands(dayOfWeek);

    // Environmental factor analysis
    const environmentalFactors = this.analyzeEnvironmentalFactors(sleep, activity, readiness);

    // Generate adaptive recommendations based on context
    const adaptiveRecommendations = this.generateAdaptiveRecommendations(
      dayOfWeek,
      recentStressors,
      environmentalFactors,
      readiness[readiness.length - 1]
    );

    return {
      currentContext: {
        dayOfWeek,
        weekOfMonth,
        recentStressors,
        likelyUpcomingDemands,
      },
      historicalContext: {
        similarDaysPerformance: Math.round(similarDaysPerformance),
        typicalPatternForToday: this.describeTypicalPattern(dayOfWeek, similarDaysPerformance),
        deviationFromNorm: Math.round(sleep[sleep.length - 1].score - similarDaysPerformance),
      },
      environmentalFactors,
      adaptiveRecommendations,
    };
  }

  /**
   * HOLISTIC HEALTH ASSESSMENT
   * Comprehensive analysis of overall health state
   */
  static generateHolisticAssessment(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): HolisticHealthAssessment {
    const recent14 = {
      sleep: sleep.slice(-14),
      activity: activity.slice(-14),
      readiness: readiness.slice(-14),
    };

    // Assess different body systems
    const systemicHealth = [
      this.assessNervousSystem(recent14.readiness, recent14.sleep),
      this.assessCardiovascularSystem(recent14.readiness, recent14.activity),
      this.assessMetabolicSystem(recent14.sleep, recent14.activity),
      this.assessRecoverySystem(recent14.readiness, recent14.sleep),
      this.assessCognitiveSystem(recent14.sleep),
    ];

    // Balance analysis
    const totalActivityLoad = recent14.activity.reduce((sum, a) => sum + a.score, 0) / recent14.activity.length;
    const totalRecovery = recent14.readiness.reduce((sum, r) => sum + r.score, 0) / recent14.readiness.length;
    const balance = totalRecovery - totalActivityLoad;

    const balanceAnalysis = {
      workload: Math.round(totalActivityLoad),
      recovery: Math.round(totalRecovery),
      balance: Math.round(balance),
      recommendation: this.generateBalanceRecommendation(balance),
    };

    // Resilience assessment
    const resilience = this.assessResilience(sleep, readiness);

    // Life optimization areas
    const lifeOptimization = this.identifyOptimizationAreas(sleep, activity, readiness);

    // Overall narrative
    const overallState = this.generateOverallNarrative(systemicHealth, balanceAnalysis, resilience);

    return {
      overallState,
      systemicHealth,
      balanceAnalysis,
      resilience,
      lifeOptimization,
    };
  }

  // ============= HELPER METHODS =============

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b);
    const sumY = values.reduce((a, b) => a + b);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private static calculateWeightedTrend(values: number[]): number {
    // Recent data points get more weight
    const weighted = values.map((v, i) => {
      const weight = (i + 1) / values.length; // Later values weighted more
      return { value: v, weight, index: i };
    });

    const trend = this.calculateTrend(values);
    const recentWeight = weighted.slice(-5).reduce((sum, w) => sum + w.weight, 0) / 5;

    return trend * (0.5 + recentWeight * 0.5);
  }

  private static calculateVolatility(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private static detectCyclicalComponent(values: number[]): number {
    // Simplified cyclical detection - looks for 7-day patterns
    if (values.length < 14) return 0;

    const lastWeek = values.slice(-7);
    const weekBefore = values.slice(-14, -7);

    const correlation = this.correlate(lastWeek, weekBefore);
    return correlation > 0.5 ? correlation * 5 : 0; // Returns cyclical strength
  }

  private static correlate(arr1: number[], arr2: number[]): number {
    const n = Math.min(arr1.length, arr2.length);
    if (n === 0) return 0;

    const mean1 = arr1.reduce((a, b) => a + b) / n;
    const mean2 = arr2.reduce((a, b) => a + b) / n;

    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = arr1[i] - mean1;
      const diff2 = arr2[i] - mean2;
      numerator += diff1 * diff2;
      denom1 += diff1 * diff1;
      denom2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(denom1 * denom2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static buildComplexNarrative(segments: (string | null)[]): string {
    return segments.filter(s => s !== null).join(' ');
  }

  private static calculateBedtime(wakeHour: number, hoursNeeded: number): string {
    const bedtimeHour = wakeHour - hoursNeeded;
    const adjustedHour = bedtimeHour < 0 ? 24 + bedtimeHour : bedtimeHour;
    const hour = Math.floor(adjustedHour);
    const minutes = Math.round((adjustedHour - hour) * 60);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minutes.toString().padStart(2, '0')}${period}`;
  }

  private static findConsecutiveLowDays(readiness: ReadinessData[]): number {
    let maxConsecutive = 0;
    let current = 0;

    for (const r of readiness) {
      if (r.score < 70) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 0;
      }
    }

    return maxConsecutive;
  }

  private static analyzePhysiologicalMarkers(readiness: ReadinessData[]): string {
    const avgHRV = readiness.reduce((sum, r) => sum + (r.hrv_balance || 10), 0) / readiness.length;
    const avgHR = readiness.reduce((sum, r) => sum + (r.resting_heart_rate || 60), 0) / readiness.length;

    const markers = [];
    if (avgHRV < 8) markers.push('suppressed heart rate variability');
    if (avgHR > 65) markers.push('elevated resting heart rate');
    if (readiness.slice(-3).every(r => r.score < 70)) markers.push('persistent low readiness');

    return markers.length > 0 ? markers.join(', ') : 'general fatigue markers';
  }

  private static assessRecoveryTrend(readiness: ReadinessData[]): string {
    const trend = this.calculateTrend(readiness.map(r => r.score));
    if (trend < -1) return 'Declining steadily';
    if (trend > 1) return 'Improving';
    return 'Stagnant';
  }

  private static analyzeCompensatoryPatterns(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): string {
    const sleepDurations = sleep.slice(-14).map(s => s.total_sleep_duration / 3600);
    const avgDuration = sleepDurations.reduce((a, b) => a + b) / sleepDurations.length;

    if (avgDuration > 8.5) {
      return `you are attempting to compensate with longer sleep (${avgDuration.toFixed(1)}h average), but sleep duration alone cannot overcome chronic underrecovery`;
    }

    return `your sleep duration of ${avgDuration.toFixed(1)}h suggests you have not yet recognized the need for increased recovery`;
  }

  private static analyzePositiveMarkers(readiness: ReadinessData[], sleep: SleepData[]): string {
    const markers = [];
    const avgHRV = readiness.reduce((sum, r) => sum + (r.hrv_balance || 10), 0) / readiness.length;
    const avgEfficiency = sleep.reduce((sum, s) => sum + s.efficiency, 0) / sleep.length;

    if (avgHRV > 12) markers.push(`healthy HRV averaging ${avgHRV.toFixed(0)}`);
    if (avgEfficiency > 88) markers.push(`excellent sleep efficiency at ${avgEfficiency.toFixed(0)}%`);

    return markers.length > 0 ? markers.join(', ') : 'well-balanced physiological markers';
  }

  private static assessConsistency(values: number[]): string {
    const volatility = this.calculateVolatility(values);
    if (volatility < 5) return 'Very consistent';
    if (volatility < 10) return 'Reasonably stable';
    return 'Some variability';
  }

  private static detectCascadingEffect(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): MultiDimensionalPattern | null {
    // Detect if poor sleep → low readiness → reduced activity is occurring
    const last14 = {
      sleep: sleep.slice(-14),
      activity: activity.slice(-14),
      readiness: readiness.slice(-14),
    };

    const poorSleepDays = last14.sleep.filter((s, i) => {
      const nextDayReadiness = last14.readiness[i + 1];
      const dayAfterActivity = last14.activity[i + 2];

      return s.score < 70 &&
             nextDayReadiness && nextDayReadiness.score < 70 &&
             dayAfterActivity && dayAfterActivity.score < 75;
    });

    if (poorSleepDays.length >= 3) {
      return {
        patternType: 'cascading',
        description: 'Poor sleep quality cascades into low readiness, which limits activity capacity, creating a downward spiral',
        involvedMetrics: ['Sleep Quality', 'Readiness', 'Activity Capacity'],
        strength: Math.min(100, (poorSleepDays.length / 14) * 100 * 1.5),
        temporalContext: {},
        rootCause: 'Sleep quality degradation',
        rippleEffects: [
          'Impaired recovery leading to suppressed readiness',
          'Reduced capacity for physical activity',
          'Potential mood and cognitive impacts',
          'Compromised immune function',
        ],
        interventionPoints: [
          { point: 'Sleep optimization', leverage: 95, difficulty: 'moderate' },
          { point: 'Stress management', leverage: 70, difficulty: 'hard' },
          { point: 'Activity scaling', leverage: 40, difficulty: 'easy' },
        ],
      };
    }

    return null;
  }

  private static detectWeeklyPattern(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): MultiDimensionalPattern | null {
    if (sleep.length < 21) return null;

    // Group by day of week
    const byDayOfWeek: { [key: number]: { sleep: number[]; activity: number[]; readiness: number[] } } = {};

    sleep.forEach((s, i) => {
      const day = parseOuraDate(s.day).getDay();
      if (!byDayOfWeek[day]) byDayOfWeek[day] = { sleep: [], activity: [], readiness: [] };
      byDayOfWeek[day].sleep.push(s.score);
      if (activity[i]) byDayOfWeek[day].activity.push(activity[i].score);
      if (readiness[i]) byDayOfWeek[day].readiness.push(readiness[i].score);
    });

    // Calculate variance across days
    const dayAverages = Object.entries(byDayOfWeek).map(([day, data]) => ({
      day: parseInt(day),
      avgSleep: data.sleep.reduce((a, b) => a + b) / data.sleep.length,
      avgActivity: data.activity.reduce((a, b) => a + b) / data.activity.length,
      avgReadiness: data.readiness.reduce((a, b) => a + b) / data.readiness.length,
    }));

    const sleepVariance = this.calculateVolatility(dayAverages.map(d => d.avgSleep));

    if (sleepVariance > 8) {
      const worstDay = dayAverages.reduce((min, d) => d.avgSleep < min.avgSleep ? d : min);
      const bestDay = dayAverages.reduce((max, d) => d.avgSleep > max.avgSleep ? d : max);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      return {
        patternType: 'cyclical',
        description: `Strong weekly pattern detected: ${dayNames[bestDay.day]} shows peak performance (${bestDay.avgSleep.toFixed(0)} sleep score) while ${dayNames[worstDay.day]} consistently underperforms (${worstDay.avgSleep.toFixed(0)} sleep score)`,
        involvedMetrics: ['Sleep', 'Readiness', 'Activity'],
        strength: Math.min(100, sleepVariance * 8),
        temporalContext: {
          dayOfWeek: [dayNames[worstDay.day], dayNames[bestDay.day]],
        },
        rootCause: 'Weekly schedule and lifestyle patterns',
        rippleEffects: [
          `Predictable performance dips on ${dayNames[worstDay.day]}`,
          'Opportunity to optimize weekly schedule',
          'Can plan high-priority tasks around peak days',
        ],
        interventionPoints: [
          {
            point: `Protect sleep on ${dayNames[(worstDay.day - 1 + 7) % 7]} nights`,
            leverage: 85,
            difficulty: 'moderate',
          },
          {
            point: `Reduce commitments on ${dayNames[worstDay.day]}`,
            leverage: 60,
            difficulty: 'hard',
          },
          {
            point: `Leverage ${dayNames[bestDay.day]} for peak performance activities`,
            leverage: 70,
            difficulty: 'easy',
          },
        ],
      };
    }

    return null;
  }

  private static detectCompensatoryPattern(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): MultiDimensionalPattern | null {
    // Detect if increased sleep is compensating for high activity
    const correlationSleepActivity = this.correlate(
      sleep.slice(-14).map(s => s.total_sleep_duration / 3600),
      activity.slice(-14).map(a => a.score)
    );

    if (correlationSleepActivity > 0.5) {
      return {
        patternType: 'compensatory',
        description: 'You instinctively sleep longer after high-activity days—a healthy adaptive response showing good body awareness',
        involvedMetrics: ['Sleep Duration', 'Activity Level'],
        strength: Math.round(correlationSleepActivity * 100),
        temporalContext: {},
        rootCause: 'Natural recovery drive responding to training load',
        rippleEffects: [
          'Demonstrates good intuitive recovery',
          'Suggests adequate sleep flexibility in schedule',
          'Helps prevent overtraining',
        ],
        interventionPoints: [
          {
            point: 'Formalize this pattern: plan extra sleep after hard training',
            leverage: 70,
            difficulty: 'easy',
          },
          {
            point: 'Ensure calendar flexibility for recovery sleep',
            leverage: 60,
            difficulty: 'moderate',
          },
        ],
      };
    }

    return null;
  }

  private static detectProgressivePattern(
    sleep: SleepData[],
    readiness: ReadinessData[]
  ): MultiDimensionalPattern | null {
    const trend = this.calculateTrend(sleep.slice(-21).map(s => s.score));

    if (trend > 1.5) {
      return {
        patternType: 'progressive',
        description: `Consistent upward trajectory in sleep quality (+${trend.toFixed(1)} points per day)—evidence of successful behavior change taking hold`,
        involvedMetrics: ['Sleep Quality', 'Sleep Efficiency', 'Recovery'],
        strength: Math.min(100, Math.abs(trend) * 20),
        temporalContext: {},
        rootCause: 'Positive habit formation and adaptation',
        rippleEffects: [
          'Improved readiness scores should follow',
          'Increased resilience to stress',
          'Better mood and cognitive function',
        ],
        interventionPoints: [
          {
            point: 'Document what changed - replicate this success',
            leverage: 90,
            difficulty: 'easy',
          },
          {
            point: 'Maintain consistency - do not prematurely change what is working',
            leverage: 85,
            difficulty: 'moderate',
          },
        ],
      };
    }

    return null;
  }

  private static detectSynergisticPattern(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): MultiDimensionalPattern | null {
    const avgSleep = sleep.slice(-7).reduce((sum, s) => sum + s.score, 0) / 7;
    const avgActivity = activity.slice(-7).reduce((sum, a) => sum + a.score, 0) / 7;
    const avgReadiness = readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / 7;

    if (avgSleep >= 80 && avgActivity >= 80 && avgReadiness >= 80) {
      return {
        patternType: 'synergistic',
        description: 'All systems firing optimally—sleep, activity, and recovery in harmonious balance. This is the state where breakthrough performance happens.',
        involvedMetrics: ['Sleep', 'Activity', 'Readiness'],
        strength: Math.round((avgSleep + avgActivity + avgReadiness) / 3),
        temporalContext: {},
        rootCause: 'Optimal balance of stress and recovery',
        rippleEffects: [
          'Peak cognitive and physical performance',
          'Optimal adaptation to training',
          'Enhanced mood and motivation',
          'Ideal time for personal bests',
        ],
        interventionPoints: [
          {
            point: 'Capitalize on this state - tackle biggest goals',
            leverage: 95,
            difficulty: 'easy',
          },
          {
            point: 'Document your current routine as "success template"',
            leverage: 90,
            difficulty: 'easy',
          },
        ],
      };
    }

    return null;
  }

  private static identifyInflectionPoints(
    predictions: any[],
    historicalData: any[]
  ): { day: number; event: string; probability: number }[] {
    const inflectionPoints = [];

    // Detect potential trend reversals
    for (let i = 1; i < predictions.length - 1; i++) {
      const prev = predictions[i - 1].value;
      const curr = predictions[i].value;
      const next = predictions[i + 1].value;

      if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
        inflectionPoints.push({
          day: predictions[i].day,
          event: curr > prev ? 'Potential peak - trend may reverse' : 'Potential trough - recovery opportunity',
          probability: 0.6 - (i * 0.05),
        });
      }
    }

    return inflectionPoints;
  }

  private static detectStressors(sleep: SleepData[], readiness: ReadinessData[]): string[] {
    const stressors = [];

    const avgHRV = readiness.reduce((sum, r) => sum + (r.hrv_balance || 10), 0) / readiness.length;
    const avgRHR = readiness.reduce((sum, r) => sum + (r.resting_heart_rate || 60), 0) / readiness.length;
    const avgEfficiency = sleep.reduce((sum, s) => sum + s.efficiency, 0) / sleep.length;

    if (avgHRV < 8) stressors.push('Elevated stress levels (low HRV)');
    if (avgRHR > 65) stressors.push('Increased sympathetic activity (elevated RHR)');
    if (avgEfficiency < 85) stressors.push('Sleep disruption');

    return stressors;
  }

  private static predictUpcomingDemands(dayOfWeek: string): string[] {
    const demands: { [key: string]: string[] } = {
      'Monday': ['Week startup energy needed', 'Multiple decisions and meetings typical'],
      'Tuesday': ['Peak productivity day', 'Good for challenging tasks'],
      'Wednesday': ['Mid-week fatigue may appear', 'Maintain momentum'],
      'Thursday': ['Energy reserves may deplete', 'Consider lighter intensity'],
      'Friday': ['End-of-week fatigue typical', 'Recovery weekend approaching'],
      'Saturday': ['Recovery or adventure opportunity', 'Social demands possible'],
      'Sunday': ['Preparation for week ahead', 'Sleep schedule critical'],
    };

    return demands[dayOfWeek] || ['Typical daily demands'];
  }

  private static analyzeEnvironmentalFactors(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): { factor: string; impact: 'positive' | 'negative' | 'neutral'; confidence: number }[] {
    const factors = [];

    const sleepConsistency = this.calculateVolatility(sleep.slice(-7).map(s => s.total_sleep_duration / 3600));

    if (sleepConsistency < 0.5) {
      factors.push({
        factor: 'Highly consistent sleep schedule',
        impact: 'positive' as const,
        confidence: 0.85,
      });
    } else if (sleepConsistency > 1.5) {
      factors.push({
        factor: 'Irregular sleep schedule',
        impact: 'negative' as const,
        confidence: 0.80,
      });
    }

    return factors;
  }

  private static generateAdaptiveRecommendations(
    dayOfWeek: string,
    stressors: string[],
    environmentalFactors: any[],
    currentReadiness: ReadinessData
  ): string[] {
    const recommendations = [];
    const score = currentReadiness.score;
    const hrvBalance = currentReadiness.hrv_balance || 10;
    const restingHR = currentReadiness.resting_heart_rate || 60;

    // Day-specific recommendations
    if (dayOfWeek === 'Monday' && score < 70) {
      recommendations.push('Monday blues + low readiness: ease into the week, do not overcommit today');
    } else if (dayOfWeek === 'Monday' && score >= 85) {
      recommendations.push('Strong start to the week! Use this energy for your most demanding tasks');
    }

    if (dayOfWeek === 'Friday') {
      recommendations.push('Protect your weekend recovery: avoid overindulgence that compromises sleep');
    }

    if (['Wednesday', 'Thursday'].includes(dayOfWeek) && score >= 80) {
      recommendations.push('Mid-week energy peak: ideal time for high-intensity training or challenging projects');
    }

    if (['Tuesday', 'Wednesday', 'Thursday'].includes(dayOfWeek) && score < 65) {
      recommendations.push('Mid-week fatigue: consider a light recovery day to prevent burnout');
    }

    // Readiness-based recommendations
    if (score >= 85) {
      recommendations.push('Optimal readiness: push limits with high-intensity workouts or tackle complex challenges');
    } else if (score >= 70 && score < 85) {
      recommendations.push('Good recovery: moderate activity recommended, listen to your body during exertion');
    } else if (score >= 60 && score < 70) {
      recommendations.push('Below average readiness: prioritize active recovery, light movement, avoid intense stress');
    } else if (score < 60) {
      recommendations.push('Low readiness: focus on rest, sleep optimization, and stress reduction today');
    }

    // HRV-based recommendations
    if (hrvBalance < 5) {
      recommendations.push('Very low HRV detected: your nervous system needs recovery - avoid stimulants, prioritize sleep');
    } else if (hrvBalance > 15) {
      recommendations.push('Excellent HRV: your body is primed for adaptation - good day for challenging workouts');
    }

    // Heart rate recommendations
    if (restingHR > 70) {
      recommendations.push('Elevated resting HR: possible stress or insufficient recovery - consider a rest day');
    } else if (restingHR < 55) {
      recommendations.push('Low resting HR indicates strong cardiovascular fitness - maintain your training consistency');
    }

    // Stressor-based recommendations
    if (stressors.length > 2) {
      recommendations.push('Multiple stressors detected: prioritize stress management over performance today');
    } else if (stressors.length === 0 && score >= 75) {
      recommendations.push('No stress markers and good recovery: excellent opportunity for progressive overload');
    }

    // Environmental factors
    const negativeFactors = environmentalFactors.filter(f => f.impact === 'negative');
    if (negativeFactors.length > 2) {
      recommendations.push('Environmental stressors detected: manage controllable factors like sleep hygiene and nutrition');
    }

    // Temperature deviation recommendations
    const tempDev = Math.abs(currentReadiness.temperature_deviation || 0);
    if (tempDev > 0.3) {
      recommendations.push(`Body temperature deviation (${tempDev.toFixed(2)}°C): possible early illness or high stress - monitor symptoms`);
    }

    // Always ensure at least one recommendation
    if (recommendations.length === 0) {
      recommendations.push(`Maintain consistency: your ${dayOfWeek} performance is stable, continue your current routine`);
    }

    return recommendations;
  }

  private static describeTypicalPattern(dayOfWeek: string, avgScore: number): string {
    if (avgScore >= 85) return `${dayOfWeek}s are typically your peak performance days`;
    if (avgScore >= 70) return `${dayOfWeek}s generally show solid performance`;
    return `${dayOfWeek}s tend to be more challenging for recovery`;
  }

  private static assessNervousSystem(readiness: ReadinessData[], sleep: SleepData[]): any {
    const avgHRV = readiness.reduce((sum, r) => sum + (r.hrv_balance || 10), 0) / readiness.length;
    const avgRHR = readiness.reduce((sum, r) => sum + (r.resting_heart_rate || 60), 0) / readiness.length;

    let status: string;
    let score: number;

    if (avgHRV > 12 && avgRHR < 60) {
      status = 'Excellent parasympathetic tone - high stress resilience';
      score = 90;
    } else if (avgHRV > 8 && avgRHR < 65) {
      status = 'Good autonomic balance - healthy recovery capacity';
      score = 75;
    } else if (avgHRV < 8 || avgRHR > 70) {
      status = 'Sympathetic dominance - elevated stress response';
      score = 50;
    } else {
      status = 'Moderate function - some stress accumulation';
      score = 65;
    }

    return {
      system: 'nervous' as const,
      status,
      score,
      keyIndicators: [`HRV: ${avgHRV.toFixed(0)}`, `RHR: ${avgRHR.toFixed(0)} bpm`],
    };
  }

  private static assessCardiovascularSystem(readiness: ReadinessData[], activity: ActivityData[]): any {
    const avgRHR = readiness.reduce((sum, r) => sum + (r.resting_heart_rate || 60), 0) / readiness.length;
    const avgActivity = activity.reduce((sum, a) => sum + a.score, 0) / activity.length;

    let status: string;
    let score: number;

    if (avgRHR < 55 && avgActivity > 80) {
      status = 'Elite cardiovascular fitness - excellent adaptation';
      score = 95;
    } else if (avgRHR < 65) {
      status = 'Good cardiovascular health - efficient system';
      score = 80;
    } else {
      status = 'Moderate cardiovascular demand - room for improvement';
      score = 65;
    }

    return {
      system: 'cardiovascular' as const,
      status,
      score,
      keyIndicators: [`Resting HR: ${avgRHR.toFixed(0)}`, `Activity capacity: ${avgActivity.toFixed(0)}`],
    };
  }

  private static assessMetabolicSystem(sleep: SleepData[], activity: ActivityData[]): any {
    const avgSleep = sleep.reduce((sum, s) => sum + s.total_sleep_duration, 0) / sleep.length / 3600;
    const avgActivity = activity.reduce((sum, a) => sum + a.active_calories, 0) / activity.length;

    return {
      system: 'metabolic' as const,
      status: avgSleep >= 7.5 ? 'Optimal metabolic function' : 'Metabolic stress from insufficient sleep',
      score: avgSleep >= 7.5 ? 85 : 65,
      keyIndicators: [`Sleep duration: ${avgSleep.toFixed(1)}h`, `Active calories: ${avgActivity.toFixed(0)}`],
    };
  }

  private static assessRecoverySystem(readiness: ReadinessData[], sleep: SleepData[]): any {
    const avgReadiness = readiness.reduce((sum, r) => sum + r.score, 0) / readiness.length;
    const avgEfficiency = sleep.reduce((sum, s) => sum + s.efficiency, 0) / sleep.length;

    return {
      system: 'recovery' as const,
      status: avgReadiness >= 80 && avgEfficiency >= 85 ?
        'Excellent recovery capacity' :
        avgReadiness >= 70 ? 'Adequate recovery' : 'Recovery deficit',
      score: Math.round((avgReadiness + avgEfficiency) / 2),
      keyIndicators: [`Readiness: ${avgReadiness.toFixed(0)}`, `Sleep efficiency: ${avgEfficiency.toFixed(0)}%`],
    };
  }

  private static assessCognitiveSystem(sleep: SleepData[]): any {
    const avgREM = sleep.reduce((sum, s) => sum + s.rem_sleep_duration, 0) / sleep.length / 60;

    return {
      system: 'cognitive' as const,
      status: avgREM >= 90 ?
        'Optimal cognitive recovery' :
        avgREM >= 70 ? 'Good cognitive function' : 'Cognitive recovery compromised',
      score: Math.round((avgREM / 120) * 100),
      keyIndicators: [`REM sleep: ${avgREM.toFixed(0)} min`],
    };
  }

  private static generateBalanceRecommendation(balance: number): string {
    if (balance > 10) {
      return 'Well recovered - opportunity to increase training load';
    } else if (balance < -10) {
      return 'Overreaching detected - reduce intensity and add recovery';
    }
    return 'Good balance - maintain current approach';
  }

  private static assessResilience(sleep: SleepData[], readiness: ReadinessData[]): any {
    const volatility = this.calculateVolatility(readiness.slice(-14).map(r => r.score));
    const trend = this.calculateTrend(readiness.slice(-14).map(r => r.score));

    let resilienceScore: number;
    let resilienceTrend: 'building' | 'stable' | 'declining';

    if (volatility < 8 && trend > 0) {
      resilienceScore = 85;
      resilienceTrend = 'building';
    } else if (volatility < 12) {
      resilienceScore = 70;
      resilienceTrend = 'stable';
    } else {
      resilienceScore = 55;
      resilienceTrend = 'declining';
    }

    return {
      score: resilienceScore,
      trend: resilienceTrend,
      factors: [
        volatility < 8 ? 'Consistent performance' : 'Variable performance',
        trend > 0 ? 'Improving trajectory' : trend < 0 ? 'Declining trajectory' : 'Stable trajectory',
      ],
    };
  }

  private static identifyOptimizationAreas(
    sleep: SleepData[],
    activity: ActivityData[],
    readiness: ReadinessData[]
  ): any[] {
    const areas = [];

    const avgSleep = sleep.slice(-14).reduce((sum, s) => sum + s.score, 0) / 14;
    const avgActivity = activity.slice(-14).reduce((sum, a) => sum + a.score, 0) / 14;
    const avgReadiness = readiness.slice(-14).reduce((sum, r) => sum + r.score, 0) / 14;

    if (avgSleep < 85) {
      areas.push({
        area: 'Sleep Quality',
        currentLevel: Math.round(avgSleep),
        potential: 90,
        gap: Math.round(90 - avgSleep),
        topActions: [
          'Establish consistent sleep schedule',
          'Optimize bedroom environment',
          'Implement pre-sleep wind-down routine',
        ],
      });
    }

    if (avgActivity < 80) {
      areas.push({
        area: 'Activity Consistency',
        currentLevel: Math.round(avgActivity),
        potential: 85,
        gap: Math.round(85 - avgActivity),
        topActions: [
          'Increase daily movement (aim for 8-10k steps)',
          'Add structured exercise 3-4x per week',
          'Incorporate movement breaks throughout day',
        ],
      });
    }

    return areas;
  }

  private static generateOverallNarrative(
    systemicHealth: any[],
    balanceAnalysis: any,
    resilience: any
  ): string {
    const avgSystemScore = systemicHealth.reduce((sum, s) => sum + s.score, 0) / systemicHealth.length;

    if (avgSystemScore >= 85 && resilience.score >= 80) {
      return `You are in an exceptional state of health. All body systems are functioning optimally, with a ${balanceAnalysis.balance >= 0 ? 'positive' : 'negative'} balance between workload and recovery. Your resilience is ${resilience.trend}, positioning you for sustained high performance.`;
    } else if (avgSystemScore >= 70) {
      return `Your health is solid overall. Most systems are functioning well, though there is room for optimization. ${balanceAnalysis.recommendation} Your resilience is ${resilience.trend}.`;
    } else {
      return `Your health metrics indicate accumulated stress across multiple systems. Focus on recovery and system restoration before pushing performance. ${balanceAnalysis.recommendation}`;
    }
  }
}

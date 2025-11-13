/**
 * Report generation utilities
 */

import { calculateStatistics } from './statistics';
import { generateSleepInsight, generateActivityInsight } from './healthInsights';
import { aggregateByPeriod } from './aggregation';

export interface HealthReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalDays: number;
    sleepAverage: number;
    stepsAverage: number;
    activeCaloriesAverage: number;
  };
  trends: {
    sleep: 'improving' | 'declining' | 'stable';
    activity: 'improving' | 'declining' | 'stable';
    readiness: 'improving' | 'declining' | 'stable';
  };
  insights: string[];
  recommendations: string[];
  highlights: string[];
}

/**
 * Generate comprehensive health report
 */
export function generateHealthReport(data: {
  sleep: any[];
  activity: any[];
  readiness: any[];
  startDate: Date;
  endDate: Date;
}): HealthReport {
  const { sleep, activity, readiness, startDate, endDate } = data;

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate averages
  const sleepDurations = sleep.map((s) => s.total_sleep_duration / 3600).filter((d) => d > 0);
  const steps = activity.map((a) => a.steps).filter((s) => s > 0);
  const activeCalories = activity.map((a) => a.cal_active).filter((c) => c > 0);

  const sleepAverage = sleepDurations.reduce((sum, val) => sum + val, 0) / (sleepDurations.length || 1);
  const stepsAverage = steps.reduce((sum, val) => sum + val, 0) / (steps.length || 1);
  const activeCaloriesAverage = activeCalories.reduce((sum, val) => sum + val, 0) / (activeCalories.length || 1);

  // Detect trends
  const sleepTrend = detectTrend(sleepDurations);
  const activityTrend = detectTrend(steps);
  const readinessTrend = detectTrend(readiness.map((r) => r.score).filter((s) => s > 0));

  // Generate insights
  const insights: string[] = [];
  const recommendations: string[] = [];
  const highlights: string[] = [];

  // Sleep insights
  if (sleepAverage < 7) {
    insights.push(`Your average sleep duration (${sleepAverage.toFixed(1)}h) is below the recommended 7-9 hours.`);
    recommendations.push('Prioritize getting at least 7 hours of sleep per night');
  } else if (sleepAverage >= 8) {
    highlights.push(`Excellent sleep duration averaging ${sleepAverage.toFixed(1)} hours`);
  }

  // Activity insights
  if (stepsAverage < 8000) {
    insights.push(`Your average daily steps (${Math.round(stepsAverage)}) could be improved.`);
    recommendations.push('Aim for at least 8,000-10,000 steps daily');
  } else if (stepsAverage >= 10000) {
    highlights.push(`Great activity level with ${Math.round(stepsAverage)} average daily steps`);
  }

  // Trend insights
  if (sleepTrend === 'declining') {
    insights.push('Your sleep quality has been declining recently.');
    recommendations.push('Review your sleep environment and habits');
  } else if (sleepTrend === 'improving') {
    highlights.push('Your sleep quality is improving - keep up the good work!');
  }

  if (activityTrend === 'declining') {
    insights.push('Your activity levels have been decreasing.');
    recommendations.push('Set daily movement goals and track your progress');
  } else if (activityTrend === 'improving') {
    highlights.push('Your activity levels are trending upward!');
  }

  // Best and worst days
  const bestSleep = Math.max(...sleepDurations);
  const worstSleep = Math.min(...sleepDurations);

  if (bestSleep - worstSleep > 3) {
    insights.push('Your sleep duration varies significantly (from ${worstSleep.toFixed(1)}h to ${bestSleep.toFixed(1)}h).');
    recommendations.push('Try to maintain a more consistent sleep schedule');
  }

  return {
    period: {
      start: startDate,
      end: endDate,
    },
    summary: {
      totalDays,
      sleepAverage: Math.round(sleepAverage * 10) / 10,
      stepsAverage: Math.round(stepsAverage),
      activeCaloriesAverage: Math.round(activeCaloriesAverage),
    },
    trends: {
      sleep: sleepTrend,
      activity: activityTrend,
      readiness: readinessTrend,
    },
    insights,
    recommendations,
    highlights,
  };
}

function detectTrend(data: number[]): 'improving' | 'declining' | 'stable' {
  if (data.length < 3) return 'stable';

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (Math.abs(change) < 5) return 'stable';
  return change > 0 ? 'improving' : 'declining';
}

/**
 * Generate weekly summary
 */
export function generateWeeklySummary(data: {
  sleep: any[];
  activity: any[];
}): {
  weekNumber: number;
  year: number;
  sleepScore: number;
  activityScore: number;
  keyMetrics: Record<string, number>;
  topAchievements: string[];
} {
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();

  // Calculate scores
  const sleepEfficiency = data.sleep.map((s) => s.efficiency || 0);
  const steps = data.activity.map((a) => a.steps || 0);

  const sleepScore = Math.round(
    sleepEfficiency.reduce((sum, val) => sum + val, 0) / (sleepEfficiency.length || 1)
  );

  const avgSteps = steps.reduce((sum, val) => sum + val, 0) / (steps.length || 1);
  const activityScore = Math.min(100, Math.round((avgSteps / 10000) * 100));

  const keyMetrics = {
    avgSleep: data.sleep.reduce((sum, s) => sum + (s.total_sleep_duration / 3600), 0) / (data.sleep.length || 1),
    avgSteps: avgSteps,
    avgActiveCalories: data.activity.reduce((sum, a) => sum + (a.cal_active || 0), 0) / (data.activity.length || 1),
    totalActiveMinutes: data.activity.reduce((sum, a) => sum + (a.met_min_medium || 0) + (a.met_min_high || 0), 0),
  };

  const topAchievements: string[] = [];

  if (keyMetrics.avgSteps >= 10000) {
    topAchievements.push('Hit 10K+ step average!');
  }
  if (keyMetrics.avgSleep >= 8) {
    topAchievements.push('Maintained 8+ hours sleep');
  }
  if (sleepScore >= 85) {
    topAchievements.push('Excellent sleep quality');
  }

  return {
    weekNumber,
    year,
    sleepScore,
    activityScore,
    keyMetrics,
    topAchievements,
  };
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Export report as text
 */
export function exportReportAsText(report: HealthReport): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('HEALTH REPORT');
  lines.push('='.repeat(60));
  lines.push('');

  lines.push(`Period: ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}`);
  lines.push(`Total Days: ${report.summary.totalDays}`);
  lines.push('');

  lines.push('SUMMARY');
  lines.push('-'.repeat(60));
  lines.push(`Average Sleep: ${report.summary.sleepAverage} hours`);
  lines.push(`Average Steps: ${report.summary.stepsAverage}`);
  lines.push(`Average Active Calories: ${report.summary.activeCaloriesAverage}`);
  lines.push('');

  lines.push('TRENDS');
  lines.push('-'.repeat(60));
  lines.push(`Sleep: ${report.trends.sleep}`);
  lines.push(`Activity: ${report.trends.activity}`);
  lines.push(`Readiness: ${report.trends.readiness}`);
  lines.push('');

  if (report.highlights.length > 0) {
    lines.push('HIGHLIGHTS');
    lines.push('-'.repeat(60));
    report.highlights.forEach((highlight) => {
      lines.push(`✓ ${highlight}`);
    });
    lines.push('');
  }

  if (report.insights.length > 0) {
    lines.push('INSIGHTS');
    lines.push('-'.repeat(60));
    report.insights.forEach((insight, index) => {
      lines.push(`${index + 1}. ${insight}`);
    });
    lines.push('');
  }

  if (report.recommendations.length > 0) {
    lines.push('RECOMMENDATIONS');
    lines.push('-'.repeat(60));
    report.recommendations.forEach((rec, index) => {
      lines.push(`${index + 1}. ${rec}`);
    });
    lines.push('');
  }

  lines.push('='.repeat(60));

  return lines.join('\n');
}

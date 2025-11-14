/**
 * Health insights and analysis utilities
 */

import { calculateStatistics } from './statistics';

export interface SleepInsight {
  type: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
  recommendations: string[];
  metrics: {
    efficiency: number;
    duration: number;
    deepSleepPercentage: number;
    remSleepPercentage: number;
  };
}

export interface ActivityInsight {
  type: 'very_active' | 'active' | 'moderate' | 'sedentary';
  message: string;
  recommendations: string[];
  metrics: {
    steps: number;
    activeCalories: number;
    activeMinutes: number;
  };
}

/**
 * Generate sleep quality insight
 */
export function generateSleepInsight(sleepData: any): SleepInsight {
  const efficiency = sleepData.efficiency || 0;
  const duration = sleepData.total_sleep_duration || 0;
  const deepSleep = sleepData.deep_sleep_duration || 0;
  const remSleep = sleepData.rem_sleep_duration || 0;

  const durationHours = duration / 3600;
  const deepSleepPercentage = (deepSleep / duration) * 100;
  const remSleepPercentage = (remSleep / duration) * 100;

  let type: SleepInsight['type'];
  let message: string;
  const recommendations: string[] = [];

  // Determine sleep quality
  if (efficiency >= 85 && durationHours >= 7 && deepSleepPercentage >= 15) {
    type = 'excellent';
    message = 'Your sleep quality is excellent! You\'re getting high-quality, restorative sleep.';
  } else if (efficiency >= 75 && durationHours >= 6.5) {
    type = 'good';
    message = 'Your sleep quality is good. Minor improvements could optimize your rest.';
    if (deepSleepPercentage < 15) {
      recommendations.push('Try to increase deep sleep by maintaining a cool bedroom temperature');
    }
  } else if (efficiency >= 65 && durationHours >= 6) {
    type = 'fair';
    message = 'Your sleep quality is fair. There\'s room for improvement in your sleep habits.';
    recommendations.push('Establish a consistent sleep schedule');
    recommendations.push('Avoid screens 1-2 hours before bedtime');
  } else {
    type = 'poor';
    message = 'Your sleep quality needs attention. Consider implementing better sleep hygiene.';
    recommendations.push('Set a consistent bedtime and wake time');
    recommendations.push('Create a relaxing bedtime routine');
    recommendations.push('Limit caffeine intake after 2 PM');
  }

  // Additional recommendations based on metrics
  if (durationHours < 7) {
    recommendations.push(`Aim for at least 7-9 hours of sleep (currently: ${durationHours.toFixed(1)}h)`);
  }
  if (efficiency < 85) {
    recommendations.push('Improve sleep efficiency by reducing time awake in bed');
  }
  if (remSleepPercentage < 20) {
    recommendations.push('REM sleep is low - ensure you\'re getting enough total sleep time');
  }

  return {
    type,
    message,
    recommendations: Array.from(new Set(recommendations)),
    metrics: {
      efficiency,
      duration: durationHours,
      deepSleepPercentage,
      remSleepPercentage,
    },
  };
}

/**
 * Generate activity insight
 */
export function generateActivityInsight(activityData: any): ActivityInsight {
  const steps = activityData.steps || 0;
  const activeCalories = activityData.cal_active || 0;
  const activeMinutes = (activityData.met_min_medium || 0) + (activityData.met_min_high || 0);

  let type: ActivityInsight['type'];
  let message: string;
  const recommendations: string[] = [];

  if (steps >= 10000 && activeMinutes >= 30) {
    type = 'very_active';
    message = 'Excellent activity level! You\'re meeting and exceeding recommended activity goals.';
  } else if (steps >= 7500 && activeMinutes >= 20) {
    type = 'active';
    message = 'Good activity level. You\'re staying active throughout the day.';
    recommendations.push('Try to reach 10,000 steps daily for optimal health');
  } else if (steps >= 5000 && activeMinutes >= 10) {
    type = 'moderate';
    message = 'Moderate activity level. Consider increasing daily movement.';
    recommendations.push('Take short walking breaks every hour');
    recommendations.push('Use stairs instead of elevators');
  } else {
    type = 'sedentary';
    message = 'Low activity level. It\'s important to incorporate more movement into your day.';
    recommendations.push('Start with a goal of 5,000 steps daily');
    recommendations.push('Schedule 15-minute walking breaks');
    recommendations.push('Consider a standing desk or regular stretch breaks');
  }

  if (activeMinutes < 30) {
    recommendations.push('Aim for at least 30 minutes of moderate activity daily');
  }

  return {
    type,
    message,
    recommendations: Array.from(new Set(recommendations)),
    metrics: {
      steps,
      activeCalories,
      activeMinutes,
    },
  };
}

/**
 * Detect patterns in sleep data
 */
export function detectSleepPatterns(sleepData: any[]): {
  averageBedtime: string;
  averageWakeTime: string;
  consistency: number;
  weekdayVsWeekend: { weekday: number; weekend: number };
} {
  if (sleepData.length === 0) {
    return {
      averageBedtime: '00:00',
      averageWakeTime: '00:00',
      consistency: 0,
      weekdayVsWeekend: { weekday: 0, weekend: 0 },
    };
  }

  // Calculate average bedtime and wake time
  const bedtimes: number[] = [];
  const wakeTimes: number[] = [];
  const weekdayDurations: number[] = [];
  const weekendDurations: number[] = [];

  sleepData.forEach((sleep) => {
    if (sleep.bedtime_start) {
      const bedtime = new Date(sleep.bedtime_start);
      bedtimes.push(bedtime.getHours() * 60 + bedtime.getMinutes());

      const dayOfWeek = bedtime.getDay();
      const duration = sleep.total_sleep_duration / 3600;

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDurations.push(duration);
      } else {
        weekdayDurations.push(duration);
      }
    }
    if (sleep.bedtime_end) {
      const wakeTime = new Date(sleep.bedtime_end);
      wakeTimes.push(wakeTime.getHours() * 60 + wakeTime.getMinutes());
    }
  });

  const avgBedtimeMinutes = bedtimes.reduce((sum, val) => sum + val, 0) / bedtimes.length;
  const avgWakeTimeMinutes = wakeTimes.reduce((sum, val) => sum + val, 0) / wakeTimes.length;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Calculate consistency (inverse of standard deviation of bedtimes)
  const bedtimeStats = calculateStatistics(bedtimes);
  const consistency = Math.max(0, 100 - (bedtimeStats.standardDeviation / 60) * 10);

  return {
    averageBedtime: formatTime(avgBedtimeMinutes),
    averageWakeTime: formatTime(avgWakeTimeMinutes),
    consistency: Math.round(consistency),
    weekdayVsWeekend: {
      weekday: weekdayDurations.reduce((sum, val) => sum + val, 0) / (weekdayDurations.length || 1),
      weekend: weekendDurations.reduce((sum, val) => sum + val, 0) / (weekendDurations.length || 1),
    },
  };
}

/**
 * Calculate recovery score based on multiple factors
 */
export function calculateRecoveryScore(data: {
  sleepEfficiency: number;
  sleepDuration: number;
  restingHeartRate?: number;
  hrv?: number;
  activityLoad?: number;
}): {
  score: number;
  level: 'optimal' | 'good' | 'fair' | 'poor';
  factors: Record<string, number>;
} {
  let score = 0;
  const factors: Record<string, number> = {};

  // Sleep efficiency (30%)
  const sleepScore = Math.min(100, (data.sleepEfficiency / 85) * 30);
  factors.sleep = sleepScore;
  score += sleepScore;

  // Sleep duration (20%)
  const optimalDuration = 8;
  const durationHours = data.sleepDuration / 3600;
  const durationScore = Math.max(0, 20 - Math.abs(durationHours - optimalDuration) * 5);
  factors.duration = durationScore;
  score += durationScore;

  // Resting heart rate (25%)
  if (data.restingHeartRate) {
    const normalRHR = 60;
    const rhrScore = Math.max(0, 25 - Math.abs(data.restingHeartRate - normalRHR) * 0.5);
    factors.restingHeartRate = rhrScore;
    score += rhrScore;
  } else {
    score += 12.5; // Neutral
  }

  // HRV (15%)
  if (data.hrv) {
    const optimalHRV = 50;
    const hrvScore = Math.min(15, (data.hrv / optimalHRV) * 15);
    factors.hrv = hrvScore;
    score += hrvScore;
  } else {
    score += 7.5; // Neutral
  }

  // Activity load (10%)
  if (data.activityLoad) {
    const loadScore = Math.max(0, 10 - (data.activityLoad - 300) * 0.01);
    factors.activityLoad = loadScore;
    score += loadScore;
  } else {
    score += 5; // Neutral
  }

  let level: 'optimal' | 'good' | 'fair' | 'poor';
  if (score >= 80) level = 'optimal';
  else if (score >= 65) level = 'good';
  else if (score >= 50) level = 'fair';
  else level = 'poor';

  return {
    score: Math.round(score),
    level,
    factors,
  };
}

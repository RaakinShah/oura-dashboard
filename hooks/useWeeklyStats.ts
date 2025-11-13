import { useMemo } from 'react';
import { calculateWeeklyStats, type MetricData } from '@/lib/utils/calculations';

export interface WeeklyStats {
  current: number;
  previous: number;
  trend: number;
  data: MetricData[];
}

export interface UseWeeklyStatsReturn {
  sleep: WeeklyStats;
  activity: WeeklyStats;
  readiness: WeeklyStats;
}

/**
 * Custom hook to calculate weekly statistics for all metrics
 * Memoizes calculations to prevent unnecessary recalculations
 */
export function useWeeklyStats(
  sleep: MetricData[],
  activity: MetricData[],
  readiness: MetricData[]
): UseWeeklyStatsReturn {
  const sleepStats = useMemo(() => calculateWeeklyStats(sleep), [sleep]);
  const activityStats = useMemo(() => calculateWeeklyStats(activity), [activity]);
  const readinessStats = useMemo(() => calculateWeeklyStats(readiness), [readiness]);

  return {
    sleep: sleepStats,
    activity: activityStats,
    readiness: readinessStats,
  };
}

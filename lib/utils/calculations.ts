/**
 * Health metrics calculation utilities
 */

export interface MetricData {
  score: number;
  [key: string]: any;
}

/**
 * Calculate average score from an array of metric data
 */
export function calculateAverage(data: MetricData[]): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + item.score, 0);
  return Math.round(sum / data.length);
}

/**
 * Get the last N items from an array
 */
export function getLastN<T>(array: T[], n: number): T[] {
  return array.slice(-n);
}

/**
 * Calculate trend between two periods
 */
export function calculateTrend(current: number, previous: number): number {
  return current - previous;
}

/**
 * Calculate weekly statistics
 */
export function calculateWeeklyStats(data: MetricData[]) {
  const last7 = getLastN(data, 7);
  const prev7 = data.length >= 14 ? data.slice(-14, -7) : last7;

  const currentAvg = calculateAverage(last7);
  const previousAvg = calculateAverage(prev7);
  const trend = calculateTrend(currentAvg, previousAvg);

  return {
    current: currentAvg,
    previous: previousAvg,
    trend,
    data: last7,
  };
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Get badge level based on score
 */
export function getBadgeLevel(score: number): 'excellent' | 'good' | 'fair' | 'low' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  return 'low';
}

/**
 * Format duration in seconds to hours
 */
export function formatDuration(seconds: number): string {
  return `${(seconds / 3600).toFixed(1)}h`;
}

/**
 * Format minutes to readable string
 */
export function formatMinutes(minutes: number): string {
  return `${Math.round(minutes)}min`;
}

/**
 * Validate if data set has minimum required entries
 */
export function hasMinimumData(data: any[], minimum: number = 1): boolean {
  return data && data.length >= minimum;
}

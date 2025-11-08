/**
 * Oura API Client
 * Handles all API calls to Oura Ring API v2 via Next.js API routes
 */

const OURA_API_BASE = '/api/oura';

export interface OuraTokenConfig {
  accessToken: string;
}

export interface SleepData {
  id: string;
  day: string;
  bedtime_start: string;
  bedtime_end: string;
  total_sleep_duration: number;
  efficiency: number;
  deep_sleep_duration: number;
  rem_sleep_duration: number;
  light_sleep_duration: number;
  awake_time: number;
  restless_periods: number;
  score: number;
  average_heart_rate?: number;
  lowest_heart_rate?: number;
  average_hrv?: number;
  temperature_delta?: number;
  latency?: number;
  heart_rate?: {
    interval: number;
    source: string;
  };
}

export interface ActivityData {
  id: string;
  day: string;
  score: number;
  active_calories: number;
  steps: number;
  equivalent_walking_distance: number;
  high_activity_time: number;
  medium_activity_time: number;
  low_activity_time: number;
  sedentary_time: number;
}

export interface ReadinessData {
  id: string;
  day: string;
  score: number;
  temperature_deviation: number;
  temperature_trend_deviation: number;
  resting_heart_rate: number;  // actual BPM value from sleep data
  hrv_balance: number;  // contributor score 0-100
  average_hrv?: number;  // actual HRV value from sleep data
  lowest_heart_rate?: number;  // lowest HR from sleep data
}

export class OuraAPIClient {
  private accessToken: string;

  constructor(config: OuraTokenConfig) {
    this.accessToken = config.accessToken;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${OURA_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      cache: 'no-store', // Next.js specific
    });

    if (!response.ok) {
      throw new Error(`Oura API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getSleep(startDate?: string, endDate?: string): Promise<{ data: SleepData[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    // Fetch both daily summaries (for scores) and detailed sessions (for metrics)
    const [dailySummaries, detailedSessions] = await Promise.all([
      this.fetch<{ data: any[] }>(`/sleep/daily?${params.toString()}`),
      this.fetch<{ data: any[] }>(`/sleep?${params.toString()}`)
    ]);

    // Create a map of daily summaries by day
    const summariesByDay = new Map(
      dailySummaries.data.map(s => [s.day, s])
    );

    // Group sleep sessions by day and take the primary session (longest or type=long_sleep)
    const sessionsByDay = new Map<string, any>();
    detailedSessions.data.forEach(session => {
      const existing = sessionsByDay.get(session.day);
      if (!existing || session.type === 'long_sleep' ||
          (session.total_sleep_duration > (existing.total_sleep_duration || 0))) {
        sessionsByDay.set(session.day, session);
      }
    });

    // Merge the data
    const mergedData: SleepData[] = [];
    summariesByDay.forEach((summary, day) => {
      const session = sessionsByDay.get(day);
      if (session) {
        mergedData.push({
          id: session.id,
          day: day,
          bedtime_start: session.bedtime_start,
          bedtime_end: session.bedtime_end,
          total_sleep_duration: session.total_sleep_duration,
          efficiency: session.efficiency,
          deep_sleep_duration: session.deep_sleep_duration,
          rem_sleep_duration: session.rem_sleep_duration,
          light_sleep_duration: session.light_sleep_duration,
          awake_time: session.awake_time,
          restless_periods: session.restless_periods,
          score: summary.score,
          average_heart_rate: session.average_heart_rate,
          lowest_heart_rate: session.lowest_heart_rate,
          average_hrv: session.average_hrv,
          temperature_delta: session.temperature_delta,
          latency: session.latency,
          heart_rate: session.average_hrv ? {
            interval: session.average_hrv,
            source: 'hrv'
          } : undefined
        });
      }
    });

    return { data: mergedData };
  }

  async getActivity(startDate?: string, endDate?: string): Promise<{ data: ActivityData[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return this.fetch(`/activity?${params.toString()}`);
  }

  async getReadiness(startDate?: string, endDate?: string): Promise<{ data: ReadinessData[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    // Fetch both readiness summaries and sleep sessions (for actual HR/HRV values)
    const [readinessSummaries, sleepSessions] = await Promise.all([
      this.fetch<{ data: any[] }>(`/readiness?${params.toString()}`),
      this.fetch<{ data: any[] }>(`/sleep?${params.toString()}`)
    ]);

    // Group sleep sessions by day and take the primary session
    const sleepByDay = new Map<string, any>();
    sleepSessions.data.forEach(session => {
      const existing = sleepByDay.get(session.day);
      if (!existing || session.type === 'long_sleep' ||
          (session.total_sleep_duration > (existing.total_sleep_duration || 0))) {
        sleepByDay.set(session.day, session);
      }
    });

    // Merge readiness with actual heart rate values from sleep
    const mergedData: ReadinessData[] = readinessSummaries.data.map(readiness => {
      const sleep = sleepByDay.get(readiness.day);
      return {
        id: readiness.id,
        day: readiness.day,
        score: readiness.score,
        temperature_deviation: readiness.temperature_deviation,
        temperature_trend_deviation: readiness.temperature_trend_deviation,
        resting_heart_rate: sleep?.lowest_heart_rate || sleep?.average_heart_rate || 0,
        hrv_balance: readiness.contributors?.hrv_balance || 0,
        average_hrv: sleep?.average_hrv,
        lowest_heart_rate: sleep?.lowest_heart_rate
      };
    });

    return { data: mergedData };
  }
}

/**
 * Helper function to fetch all Oura data types
 */
export async function fetchOuraData(token: string) {
  const client = new OuraAPIClient({ accessToken: token });

  // Get date range (last 30 days + today)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const [sleepResponse, activityResponse, readinessResponse] = await Promise.all([
    client.getSleep(formatDate(startDate), formatDate(endDate)),
    client.getActivity(formatDate(startDate), formatDate(endDate)),
    client.getReadiness(formatDate(startDate), formatDate(endDate)),
  ]);

  return {
    sleep: sleepResponse.data,
    activity: activityResponse.data,
    readiness: readinessResponse.data,
  };
}

/**
 * Mock data for testing the UI without an API token
 */

import { SleepData, ActivityData, ReadinessData } from './oura-api';

export const mockSleepData: SleepData[] = [
  {
    id: '1',
    day: '2025-11-04',
    bedtime_start: '2025-11-04T23:30:00',
    bedtime_end: '2025-11-05T07:15:00',
    total_sleep_duration: 27900, // 7h 45m in seconds
    efficiency: 87,
    deep_sleep_duration: 7200,
    rem_sleep_duration: 6300,
    light_sleep_duration: 12600,
    awake_time: 1800,
    restless_periods: 15,
    score: 84,
  },
  {
    id: '2',
    day: '2025-11-03',
    bedtime_start: '2025-11-03T23:00:00',
    bedtime_end: '2025-11-04T06:45:00',
    total_sleep_duration: 26100, // 7h 15m
    efficiency: 82,
    deep_sleep_duration: 6900,
    rem_sleep_duration: 5400,
    light_sleep_duration: 11700,
    awake_time: 2100,
    restless_periods: 18,
    score: 78,
  },
  {
    id: '3',
    day: '2025-11-02',
    bedtime_start: '2025-11-02T22:45:00',
    bedtime_end: '2025-11-03T07:30:00',
    total_sleep_duration: 30600, // 8h 30m
    efficiency: 91,
    deep_sleep_duration: 7800,
    rem_sleep_duration: 7200,
    light_sleep_duration: 14400,
    awake_time: 1200,
    restless_periods: 10,
    score: 92,
  },
];

export const mockActivityData: ActivityData[] = [
  {
    id: '1',
    day: '2025-11-04',
    score: 82,
    active_calories: 520,
    steps: 8342,
    equivalent_walking_distance: 6200,
    high_activity_time: 1800,
    medium_activity_time: 3600,
    low_activity_time: 7200,
    sedentary_time: 28800,
  },
  {
    id: '2',
    day: '2025-11-03',
    score: 75,
    active_calories: 420,
    steps: 6234,
    equivalent_walking_distance: 4800,
    high_activity_time: 1200,
    medium_activity_time: 2700,
    low_activity_time: 5400,
    sedentary_time: 32400,
  },
  {
    id: '3',
    day: '2025-11-02',
    score: 88,
    active_calories: 680,
    steps: 12456,
    equivalent_walking_distance: 9500,
    high_activity_time: 2400,
    medium_activity_time: 4500,
    low_activity_time: 8100,
    sedentary_time: 25200,
  },
];

export const mockReadinessData: ReadinessData[] = [
  {
    id: '1',
    day: '2025-11-04',
    score: 81,
    temperature_deviation: 0.1,
    temperature_trend_deviation: 0.05,
    resting_heart_rate: 58,
    hrv_balance: 12,
  },
  {
    id: '2',
    day: '2025-11-03',
    score: 76,
    temperature_deviation: 0.3,
    temperature_trend_deviation: 0.15,
    resting_heart_rate: 62,
    hrv_balance: 8,
  },
  {
    id: '3',
    day: '2025-11-02',
    score: 89,
    temperature_deviation: -0.1,
    temperature_trend_deviation: -0.05,
    resting_heart_rate: 55,
    hrv_balance: 15,
  },
];

/**
 * Application constants
 */

/**
 * Score thresholds for badge levels
 */
export const SCORE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 70,
  FAIR: 55,
} as const;

/**
 * Badge labels
 */
export const BADGE_LABELS = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  LOW: 'Low',
} as const;

/**
 * Animation delays (in seconds)
 */
export const ANIMATION_DELAYS = {
  HERO: '0s',
  INSIGHT: '0.2s',
  METRICS: '0.3s',
  NAVIGATION: '0.4s',
} as const;

/**
 * Data thresholds
 */
export const DATA_REQUIREMENTS = {
  MINIMUM_FOR_TRENDS: 7,
  MINIMUM_FOR_FORECAST: 14,
  WEEKLY_WINDOW: 7,
  BIWEEKLY_WINDOW: 14,
} as const;

/**
 * Time periods
 */
export const TIME_PERIODS = {
  LAST_NIGHT: 'Last Night',
  YESTERDAY: 'Yesterday',
  TODAY: 'Today',
  LAST_7_DAYS: 'Last 7 Days',
  LAST_30_DAYS: 'Last 30 Days',
} as const;

/**
 * Greeting time ranges
 */
export const GREETING_HOURS = {
  MORNING_END: 12,
  AFTERNOON_END: 18,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  API_TOKEN: 'oura_api_token_v2',
  THEME: 'oura_theme',
  USER_PREFERENCES: 'oura_preferences',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  SLEEP: '/api/oura/sleep',
  ACTIVITY: '/api/oura/activity',
  READINESS: '/api/oura/readiness',
  TEST: '/api/oura/test',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NO_TOKEN: 'No API token found. Please configure your token in Settings.',
  FETCH_FAILED: 'Failed to fetch data. Please try again.',
  INSUFFICIENT_DATA: 'Not enough data available for analysis.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  TOKEN_SAVED: 'Token saved successfully!',
  TOKEN_VALIDATED: 'Token is valid!',
  DATA_REFRESHED: 'Data refreshed successfully!',
} as const;

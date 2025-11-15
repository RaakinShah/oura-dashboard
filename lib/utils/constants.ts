/**
 * Application constants
 * Extracts magic numbers into named constants for better maintainability
 */

// Time constants
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

// Data fetching constants
export const DEFAULT_DATA_DAYS = 30;
export const MAX_DATA_DAYS = 90;
export const MIN_DATA_DAYS = 7;

// Cache constants
export const DEFAULT_CACHE_TTL_MINUTES = 60;
export const SHORT_CACHE_TTL_MINUTES = 15;
export const LONG_CACHE_TTL_MINUTES = 240;

// Score thresholds
export const SCORE_EXCELLENT = 85;
export const SCORE_GOOD = 70;
export const SCORE_FAIR = 60;
export const SCORE_POOR = 40;

// API constants
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY_MS = 1000;
export const API_TIMEOUT_MS = 30000;

// UI constants
export const TOAST_DURATION_MS = 3000;
export const TOAST_DURATION_LONG_MS = 5000;
export const ANIMATION_DURATION_MS = 300;
export const DEBOUNCE_DELAY_MS = 300;
export const THROTTLE_DELAY_MS = 100;

// Validation constants
export const MIN_TOKEN_LENGTH = 20;
export const MIN_SLEEP_HOURS = 0;
export const MAX_SLEEP_HOURS = 24;
export const MIN_STEPS = 0;
export const MAX_STEPS = 100000;

// Accessibility
export const MIN_TOUCH_TARGET_SIZE = 44; // pixels
export const MIN_CONTRAST_RATIO = 4.5; // WCAG AA

// Chart constants
export const DEFAULT_CHART_WIDTH = 600;
export const DEFAULT_CHART_HEIGHT = 400;
export const CHART_ANIMATION_DURATION = 1000;

// Feature flags (for gradual rollout)
export const FEATURE_FLAGS = {
  HABIT_TRACKING: true,
  AI_INSIGHTS: true,
  VOICE_COMMANDS: false,
  PHOTO_JOURNAL: false,
  SOCIAL_FEATURES: false,
  AR_VISUALIZATION: false,
} as const;

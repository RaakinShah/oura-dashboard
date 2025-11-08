/**
 * Date utility functions for handling Oura Ring dates
 * Oura dates are in "YYYY-MM-DD" format and should be treated as local dates, not UTC
 */

/**
 * Parse an Oura date string (YYYY-MM-DD) as a local date
 * This prevents timezone issues where dates appear as the previous day
 */
export function parseOuraDate(dateString: string): Date {
  // Split the date string into components
  const [year, month, day] = dateString.split('-').map(Number);

  // Create a date in local timezone (month is 0-indexed in JavaScript)
  return new Date(year, month - 1, day);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? parseOuraDate(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  return dateObj.toLocaleDateString('en-US', options || defaultOptions);
}

/**
 * Format date in short form (e.g., "Nov 6")
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseOuraDate(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with day of week (e.g., "Wednesday, November 6")
 */
export function formatLongDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseOuraDate(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date with full details (e.g., "Wednesday, November 6, 2024")
 */
export function formatFullDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseOuraDate(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get day of week from Oura date
 */
export function getDayOfWeek(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseOuraDate(date) : date;

  return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseOuraDate(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get relative date string (e.g., "Today", "Yesterday", or formatted date)
 */
export function getRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseOuraDate(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  ) {
    return 'Today';
  }

  if (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  return formatShortDate(dateObj);
}

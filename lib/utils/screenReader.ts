/**
 * Screen reader utilities
 */

/**
 * Detect if screen reader is active (heuristic)
 */
export function detectScreenReader(): boolean {
  // Check for common screen reader indicators
  const hasScreenReaderClass = document.body.classList.contains('screen-reader');
  const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  const hasForcedColors = window.matchMedia('(forced-colors: active)').matches;

  return hasScreenReaderClass || hasHighContrast || hasForcedColors;
}

/**
 * Hide element from screen readers
 */
export function hideFromScreenReader(element: HTMLElement): void {
  element.setAttribute('aria-hidden', 'true');
}

/**
 * Show element to screen readers
 */
export function showToScreenReader(element: HTMLElement): void {
  element.removeAttribute('aria-hidden');
}

/**
 * Make element screen reader only (visually hidden)
 */
export function makeScreenReaderOnly(element: HTMLElement): void {
  element.className += ' sr-only';
  element.style.position = 'absolute';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.padding = '0';
  element.style.margin = '-1px';
  element.style.overflow = 'hidden';
  element.style.clip = 'rect(0, 0, 0, 0)';
  element.style.whiteSpace = 'nowrap';
  element.style.borderWidth = '0';
}

/**
 * Create screen reader announcement
 */
export function createAnnouncement(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
  duration: number = 1000
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  makeScreenReaderOnly(announcement);
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, duration);
}

/**
 * Format progress for screen readers
 */
export function formatProgress(current: number, total: number): string {
  const percentage = Math.round((current / total) * 100);
  return `${current} of ${total}, ${percentage} percent complete`;
}

/**
 * Format list for screen readers
 */
export function formatList(items: string[], conjunction: 'and' | 'or' = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast}, ${conjunction} ${last}`;
}

/**
 * Format duration for screen readers
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
  }

  return formatList(parts, 'and');
}

/**
 * Format file size for screen readers
 */
export function formatFileSize(bytes: number): string {
  const units = ['bytes', 'kilobytes', 'megabytes', 'gigabytes'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Create accessible table summary
 */
export function createTableSummary(data: {
  rows: number;
  columns: number;
  hasHeaders: boolean;
  caption?: string;
}): string {
  const parts: string[] = [];

  if (data.caption) {
    parts.push(data.caption);
  }

  parts.push(`Table with ${data.rows} rows and ${data.columns} columns`);

  if (data.hasHeaders) {
    parts.push('First row contains column headers');
  }

  return parts.join('. ');
}

/**
 * Format keyboard shortcut for screen readers
 */
export function formatShortcut(keys: string[]): string {
  const formattedKeys = keys.map((key) => {
    const keyMap: Record<string, string> = {
      ctrl: 'Control',
      cmd: 'Command',
      shift: 'Shift',
      alt: 'Alt',
      enter: 'Enter',
      esc: 'Escape',
      space: 'Space',
      tab: 'Tab',
    };

    return keyMap[key.toLowerCase()] || key;
  });

  return formatList(formattedKeys, 'and');
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  return true;
}

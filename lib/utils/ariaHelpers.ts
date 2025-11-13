/**
 * ARIA helper utilities for accessibility
 */

/**
 * Generate unique ARIA IDs
 */
let idCounter = 0;
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Create ARIA label from text
 */
export function createAriaLabel(text: string, context?: string): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  return context ? `${context}: ${cleaned}` : cleaned;
}

/**
 * Get ARIA role for element type
 */
export function getAriaRole(elementType: string): string {
  const roleMap: Record<string, string> = {
    button: 'button',
    link: 'link',
    heading: 'heading',
    list: 'list',
    listitem: 'listitem',
    navigation: 'navigation',
    main: 'main',
    article: 'article',
    section: 'region',
    aside: 'complementary',
    form: 'form',
    search: 'search',
    dialog: 'dialog',
    alert: 'alert',
    status: 'status',
    table: 'table',
  };

  return roleMap[elementType] || '';
}

/**
 * Create ARIA attributes object
 */
export function createAriaAttributes(config: {
  role?: string;
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  live?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  hidden?: boolean;
  controls?: string;
  owns?: string;
  haspopup?: boolean | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
}): Record<string, any> {
  const attributes: Record<string, any> = {};

  if (config.role) attributes.role = config.role;
  if (config.label) attributes['aria-label'] = config.label;
  if (config.labelledBy) attributes['aria-labelledby'] = config.labelledBy;
  if (config.describedBy) attributes['aria-describedby'] = config.describedBy;
  if (config.expanded !== undefined) attributes['aria-expanded'] = config.expanded;
  if (config.selected !== undefined) attributes['aria-selected'] = config.selected;
  if (config.disabled !== undefined) attributes['aria-disabled'] = config.disabled;
  if (config.required !== undefined) attributes['aria-required'] = config.required;
  if (config.invalid !== undefined) attributes['aria-invalid'] = config.invalid;
  if (config.live) attributes['aria-live'] = config.live;
  if (config.atomic !== undefined) attributes['aria-atomic'] = config.atomic;
  if (config.hidden !== undefined) attributes['aria-hidden'] = config.hidden;
  if (config.controls) attributes['aria-controls'] = config.controls;
  if (config.owns) attributes['aria-owns'] = config.owns;
  if (config.haspopup !== undefined) attributes['aria-haspopup'] = config.haspopup;

  return attributes;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Create live region element
 */
export function createLiveRegion(
  priority: 'polite' | 'assertive' = 'polite',
  atomic: boolean = true
): HTMLDivElement {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', String(atomic));
  liveRegion.className = 'sr-only';
  return liveRegion;
}

/**
 * Validate ARIA attributes
 */
export function validateAriaAttributes(
  element: HTMLElement
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for aria-label or aria-labelledby
  const role = element.getAttribute('role');
  if (role && ['button', 'link', 'checkbox', 'radio'].includes(role)) {
    const hasLabel = element.hasAttribute('aria-label');
    const hasLabelledBy = element.hasAttribute('aria-labelledby');
    const hasTextContent = element.textContent?.trim();

    if (!hasLabel && !hasLabelledBy && !hasTextContent) {
      errors.push(`Element with role="${role}" should have an accessible name`);
    }
  }

  // Check aria-expanded usage
  if (element.hasAttribute('aria-expanded')) {
    const expanded = element.getAttribute('aria-expanded');
    if (expanded !== 'true' && expanded !== 'false') {
      errors.push('aria-expanded must be "true" or "false"');
    }
  }

  // Check aria-invalid usage
  if (element.hasAttribute('aria-invalid')) {
    const invalid = element.getAttribute('aria-invalid');
    if (invalid === 'true' && !element.hasAttribute('aria-describedby')) {
      errors.push('When aria-invalid="true", provide aria-describedby with error message');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format number for screen readers
 */
export function formatNumberForScreenReader(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} thousand`;
  }
  return num.toString();
}

/**
 * Format date for screen readers
 */
export function formatDateForScreenReader(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format time for screen readers
 */
export function formatTimeForScreenReader(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  return date.toLocaleTimeString('en-US', options);
}

/**
 * Create accessible table caption
 */
export function createTableCaption(
  rowCount: number,
  columnCount: number,
  title?: string
): string {
  const caption = title || 'Data table';
  return `${caption} with ${rowCount} rows and ${columnCount} columns`;
}

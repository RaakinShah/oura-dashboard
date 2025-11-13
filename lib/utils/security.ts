/**
 * Security and data sanitization utilities
 */

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize URL to prevent javascript: protocol
 */
export function sanitizeURL(url: string): string {
  const decoded = decodeURIComponent(url);
  const lower = decoded.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '';
  }

  return url;
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash string using SHA-256
 */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(
  input: string,
  options: {
    maxLength?: number;
    allowedCharacters?: RegExp;
    trim?: boolean;
  } = {}
): string {
  const { maxLength = 1000, allowedCharacters, trim = true } = options;

  let sanitized = escapeHTML(input);

  if (trim) {
    sanitized = sanitized.trim();
  }

  if (maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  if (allowedCharacters) {
    sanitized = sanitized.replace(new RegExp(`[^${allowedCharacters.source}]`, 'g'), '');
  }

  return sanitized;
}

/**
 * Check if string contains SQL injection patterns
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bOR\b|\bAND\b).*?=.*?=/i,
    /UNION.*?SELECT/i,
    /INSERT.*?INTO/i,
    /DELETE.*?FROM/i,
    /UPDATE.*?SET/i,
    /DROP.*?TABLE/i,
    /--/,
    /;/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Mask sensitive data (credit card, SSN, etc.)
 */
export function maskSensitiveData(
  value: string,
  type: 'email' | 'phone' | 'card' | 'ssn' = 'email'
): string {
  switch (type) {
    case 'email': {
      const [local, domain] = value.split('@');
      if (!domain) return value;
      const masked = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
      return `${masked}@${domain}`;
    }
    case 'phone': {
      return value.replace(/\d(?=\d{4})/g, '*');
    }
    case 'card': {
      return value.replace(/\d(?=\d{4})/g, '*');
    }
    case 'ssn': {
      return value.replace(/\d(?=\d{4})/g, '*');
    }
    default:
      return value;
  }
}

/**
 * Content Security Policy header generator
 */
export function generateCSPHeader(config: {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  fontSrc?: string[];
  connectSrc?: string[];
}): string {
  const directives: string[] = [];

  Object.entries(config).forEach(([key, values]) => {
    if (values && values.length > 0) {
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      directives.push(`${directive} ${values.join(' ')}`);
    }
  });

  return directives.join('; ');
}

/**
 * Rate limiting checker
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  check(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < windowMs);

    if (validRequests.length >= limit) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

export const sanitizers = {
  trim: (value: string): string => {
    return value.trim();
  },

  lowercase: (value: string): string => {
    return value.toLowerCase();
  },

  uppercase: (value: string): string => {
    return value.toUpperCase();
  },

  stripHtml: (value: string): string => {
    return value.replace(/<[^>]*>/g, '');
  },

  escapeHtml: (value: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return value.replace(/[&<>"']/g, (char) => map[char]);
  },

  normalizeWhitespace: (value: string): string => {
    return value.replace(/\s+/g, ' ').trim();
  },

  removeNonAlphanumeric: (value: string): string => {
    return value.replace(/[^a-zA-Z0-9]/g, '');
  },

  removeNonNumeric: (value: string): string => {
    return value.replace(/[^0-9]/g, '');
  },

  normalizeEmail: (value: string): string => {
    return value.toLowerCase().trim();
  },

  normalizePhone: (value: string): string => {
    return value.replace(/[^\d+]/g, '');
  },

  capitalize: (value: string): string => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  },

  truncate: (value: string, maxLength: number, suffix: string = '...'): string => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength - suffix.length) + suffix;
  },

  stripSpecialChars: (value: string, keep: string = ''): string => {
    const regex = new RegExp(`[^a-zA-Z0-9${keep}]`, 'g');
    return value.replace(regex, '');
  },

  normalizeUrl: (value: string): string => {
    let url = value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  },

  removeExtraSpaces: (value: string): string => {
    return value.replace(/\s{2,}/g, ' ').trim();
  },

  sanitizeFilename: (value: string): string => {
    return value
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  },
};

export function sanitize(value: string, sanitizerNames: (keyof typeof sanitizers)[]): string {
  return sanitizerNames.reduce((acc, name) => {
    const sanitizer = sanitizers[name];
    return sanitizer ? (sanitizer as any)(acc) : acc;
  }, value);
}

export type Sanitizer = keyof typeof sanitizers;

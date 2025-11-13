/**
 * Internationalization utilities
 */

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export class I18n {
  private locale: Locale = 'en';
  private translations: Map<Locale, TranslationDictionary> = new Map();
  private fallbackLocale: Locale = 'en';

  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  getLocale(): Locale {
    return this.locale;
  }

  addTranslations(locale: Locale, translations: TranslationDictionary): void {
    this.translations.set(locale, translations);
  }

  t(key: string, params?: Record<string, any>): string {
    const keys = key.split('.');
    let translation = this.getNestedValue(
      this.translations.get(this.locale),
      keys
    );

    if (!translation) {
      translation = this.getNestedValue(
        this.translations.get(this.fallbackLocale),
        keys
      );
    }

    if (!translation || typeof translation !== 'string') {
      return key;
    }

    return this.interpolate(translation, params);
  }

  private getNestedValue(
    obj: any,
    keys: string[]
  ): string | TranslationDictionary | undefined {
    return keys.reduce((acc, key) => acc?.[key], obj);
  }

  private interpolate(text: string, params?: Record<string, any>): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }
}

/**
 * Format number according to locale
 */
export function formatNumber(
  value: number,
  locale: Locale = 'en',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: Locale = 'en'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date,
  locale: Locale = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(
  date: Date,
  locale: Locale = 'en'
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return new Intl.RelativeTimeFormat(locale).format(-diffDay, 'day');
  } else if (diffHour > 0) {
    return new Intl.RelativeTimeFormat(locale).format(-diffHour, 'hour');
  } else if (diffMin > 0) {
    return new Intl.RelativeTimeFormat(locale).format(-diffMin, 'minute');
  } else {
    return new Intl.RelativeTimeFormat(locale).format(-diffSec, 'second');
  }
}

/**
 * Pluralization helper
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
  locale: Locale = 'en'
): string {
  const rules = new Intl.PluralRules(locale);
  const rule = rules.select(count);

  if (rule === 'one') {
    return `${count} ${singular}`;
  } else {
    return `${count} ${plural || singular + 's'}`;
  }
}

/**
 * Detect user's preferred locale
 */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language.split('-')[0];
  const supportedLocales: Locale[] = ['en', 'es', 'fr', 'de', 'ja', 'zh'];

  return supportedLocales.includes(browserLang as Locale)
    ? (browserLang as Locale)
    : 'en';
}

/**
 * Sort strings according to locale
 */
export function sortByLocale(
  strings: string[],
  locale: Locale = 'en'
): string[] {
  return strings.sort((a, b) => a.localeCompare(b, locale));
}

export const i18n = new I18n();

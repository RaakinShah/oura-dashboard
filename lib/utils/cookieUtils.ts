/**
 * Cookie management utilities
 */

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    const expires = typeof options.expires === 'number'
      ? new Date(Date.now() + options.expires * 86400000)
      : options.expires;
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  } else {
    cookieString += '; path=/';
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += '; secure';
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (decodeURIComponent(cookieName) === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
}

export function deleteCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
  });
}

export function getAllCookies(): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieStrings = document.cookie.split(';');

  for (const cookie of cookieStrings) {
    const [name, value] = cookie.trim().split('=');
    if (name) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value || '');
    }
  }

  return cookies;
}

export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

export function clearAllCookies(): void {
  const cookies = getAllCookies();
  Object.keys(cookies).forEach((name) => deleteCookie(name));
}

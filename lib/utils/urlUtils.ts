/**
 * URL and query parameter utilities
 */

export function parseQueryString(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URL(url, window.location.origin).searchParams;

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

export function updateQueryParam(url: string, key: string, value: string): string {
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.set(key, value);
  return urlObj.toString();
}

export function removeQueryParam(url: string, key: string): string {
  const urlObj = new URL(url, window.location.origin);
  urlObj.searchParams.delete(key);
  return urlObj.toString();
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function getPathname(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return '';
  }
}

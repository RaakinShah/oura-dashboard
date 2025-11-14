/**
 * Browser utility functions
 */

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (!isBrowser()) return 'desktop';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function getBrowserInfo() {
  if (!isBrowser()) return null;

  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edge\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }

  return { name: browserName, version: browserVersion };
}

export function getOS(): string {
  if (!isBrowser()) return 'Unknown';

  const ua = navigator.userAgent;
  if (ua.indexOf('Win') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'macOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('iOS') > -1) return 'iOS';

  return 'Unknown';
}

export function supportsLocalStorage(): boolean {
  if (!isBrowser()) return false;

  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function supportsWebP(): boolean {
  if (!isBrowser()) return false;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) return Promise.resolve(false);

  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function fullscreenElement(): Element | null {
  return document.fullscreenElement;
}

export function isOnline(): boolean {
  return navigator.onLine;
}

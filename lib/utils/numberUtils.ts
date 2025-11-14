/**
 * Number utility functions
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isEven(n: number): boolean {
  return n % 2 === 0;
}

export function isOdd(n: number): boolean {
  return n % 2 !== 0;
}

export function percentage(value: number, total: number): number {
  return total === 0 ? 0 : (value / total) * 100;
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

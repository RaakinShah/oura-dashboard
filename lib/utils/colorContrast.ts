/**
 * Color contrast checking utilities for WCAG compliance
 */

export interface ContrastResult {
  ratio: number;
  AA: boolean;
  AAA: boolean;
  AALarge: boolean;
  AAALarge: boolean;
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex colors (e.g., #FFFFFF)');
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function checkContrast(
  foreground: string,
  background: string,
  largeText: boolean = false
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: largeText ? ratio >= 3 : ratio >= 4.5,
    AAA: largeText ? ratio >= 4.5 : ratio >= 7,
    AALarge: ratio >= 3,
    AAALarge: ratio >= 4.5,
  };
}

/**
 * Suggest accessible color adjustments
 */
export function suggestAccessibleColor(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string {
  const bgRgb = hexToRgb(background);
  if (!bgRgb) throw new Error('Invalid background color');

  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Determine if we need to go lighter or darker
  const targetLum =
    bgLum > 0.5
      ? (bgLum + 0.05) / targetRatio - 0.05
      : (bgLum + 0.05) * targetRatio - 0.05;

  // Convert target luminance back to RGB (simplified)
  const value = targetLum > 0.5 ? 255 : 0;
  return `#${value.toString(16).padStart(2, '0').repeat(3)}`;
}

/**
 * Check if color is light or dark
 */
export function isLight(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) throw new Error('Invalid color format');

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5;
}

/**
 * Get optimal text color (black or white) for background
 */
export function getOptimalTextColor(backgroundColor: string): '#000000' | '#FFFFFF' {
  return isLight(backgroundColor) ? '#000000' : '#FFFFFF';
}

/**
 * Validate color palette for accessibility
 */
export function validatePalette(
  palette: Record<string, string>,
  background: string = '#FFFFFF'
): Record<string, ContrastResult> {
  const results: Record<string, ContrastResult> = {};

  Object.keys(palette).forEach((key) => {
    results[key] = checkContrast(palette[key], background);
  });

  return results;
}

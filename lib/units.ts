/**
 * Unit conversion utilities
 * Convert metric to imperial units
 */

export const units = {
  /**
   * Convert Celsius to Fahrenheit
   */
  celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9 / 5) + 32;
  },

  /**
   * Convert meters to miles
   */
  metersToMiles(meters: number): number {
    return meters * 0.000621371;
  },

  /**
   * Convert kilometers to miles
   */
  kilometersToMiles(kilometers: number): number {
    return kilometers * 0.621371;
  },

  /**
   * Format temperature in Fahrenheit
   */
  formatTemperature(celsius: number, showUnit: boolean = true): string {
    const fahrenheit = this.celsiusToFahrenheit(celsius);
    return `${fahrenheit.toFixed(1)}${showUnit ? '°F' : ''}`;
  },

  /**
   * Format distance in miles
   */
  formatDistance(meters: number, decimals: number = 1): string {
    const miles = this.metersToMiles(meters);
    return `${miles.toFixed(decimals)} mi`;
  },

  /**
   * Format distance from kilometers to miles
   */
  formatDistanceFromKm(kilometers: number, decimals: number = 1): string {
    const miles = this.kilometersToMiles(kilometers);
    return `${miles.toFixed(decimals)} mi`;
  }
};

/**
 * Data export utilities for CSV, JSON, and PDF
 */

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return '';

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV header row
  const headerRow = csvHeaders.join(',');

  // Create data rows
  const dataRows = data.map((item) => {
    return csvHeaders
      .map((header) => {
        const value = item[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: any[], filename: string, headers?: string[]) {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any, filename: string, pretty = true) {
  const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Oura data with proper formatting
 */
export function exportOuraData(
  sleep: any[],
  activity: any[],
  readiness: any[],
  format: 'csv' | 'json' = 'json'
) {
  const exportData = {
    exported_at: new Date().toISOString(),
    data: {
      sleep: sleep.map((s) => ({
        date: s.day,
        score: s.score,
        duration_hours: (s.total_sleep_duration / 3600).toFixed(2),
        efficiency: s.efficiency,
        deep_sleep_minutes: Math.round(s.deep_sleep_duration / 60),
        rem_sleep_minutes: Math.round(s.rem_sleep_duration / 60),
        light_sleep_minutes: Math.round(s.light_sleep_duration / 60),
      })),
      activity: activity.map((a) => ({
        date: a.day,
        score: a.score,
        steps: a.steps,
        active_calories: a.active_calories,
        high_activity_minutes: Math.round(a.high_activity_time / 60),
        medium_activity_minutes: Math.round(a.medium_activity_time / 60),
        low_activity_minutes: Math.round(a.low_activity_time / 60),
      })),
      readiness: readiness.map((r) => ({
        date: r.day,
        score: r.score,
        resting_heart_rate: r.resting_heart_rate,
        hrv_balance: r.hrv_balance,
        temperature_deviation: r.temperature_deviation,
        recovery_index: r.recovery_index,
      })),
    },
  };

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `oura-data-${timestamp}`;

  if (format === 'csv') {
    // Export each category as separate CSV
    downloadCSV(exportData.data.sleep, `${filename}-sleep`);
    downloadCSV(exportData.data.activity, `${filename}-activity`);
    downloadCSV(exportData.data.readiness, `${filename}-readiness`);
  } else {
    downloadJSON(exportData, filename);
  }
}

/**
 * Copy data to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Format data for sharing
 */
export function formatForSharing(sleep: any[], activity: any[], readiness: any[]): string {
  const latest = {
    sleep: sleep[sleep.length - 1],
    activity: activity[activity.length - 1],
    readiness: readiness[readiness.length - 1],
  };

  return `
📊 My Oura Stats for ${latest.sleep.day}

💤 Sleep: ${latest.sleep.score}/100
🏃 Activity: ${latest.activity.score}/100
❤️ Readiness: ${latest.readiness.score}/100

Tracked with Oura Ring
  `.trim();
}

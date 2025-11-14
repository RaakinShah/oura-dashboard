/**
 * Data Export Utilities
 * Functions to export data in various formats
 */

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): void {
  const {
    filename = 'data.csv',
    includeHeaders = true,
  } = options;

  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  let csv = '';

  if (includeHeaders) {
    csv += headers.join(',') + '\n';
  }

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];

      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      }

      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma
        return value.includes(',') || value.includes('"')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      return String(value);
    });

    csv += values.join(',') + '\n';
  });

  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(
  data: T,
  options: ExportOptions = {}
): void {
  const { filename = 'data.json' } = options;

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * Export statistical results to formatted text
 */
export function exportStatisticalResults(
  results: Record<string, any>,
  options: ExportOptions = {}
): void {
  const { filename = 'statistical-results.txt' } = options;

  let text = 'Statistical Analysis Results\n';
  text += '='.repeat(50) + '\n\n';

  Object.entries(results).forEach(([key, value]) => {
    text += `${key}:\n`;

    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        text += `  ${subKey}: ${formatValue(subValue)}\n`;
      });
    } else {
      text += `  ${formatValue(value)}\n`;
    }

    text += '\n';
  });

  downloadFile(text, filename, 'text/plain;charset=utf-8;');
}

/**
 * Export chart data as image (requires canvas)
 */
export async function exportChartAsImage(
  svgElement: SVGElement,
  options: ExportOptions & { format?: 'png' | 'svg' } = {}
): Promise<void> {
  const {
    filename = 'chart.png',
    format = 'png',
  } = options;

  if (format === 'svg') {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    downloadFile(svgUrl, filename.replace('.png', '.svg'), '', true);
    URL.revokeObjectURL(svgUrl);
    return;
  }

  // Convert SVG to PNG
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const img = new Image();

  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(blob => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          downloadFile(pngUrl, filename, '', true);
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
          resolve();
        } else {
          reject(new Error('Failed to create blob'));
        }
      });
    };

    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Create a downloadable Excel-compatible file
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): void {
  const { filename = 'data.xlsx' } = options;

  // Create Excel-compatible HTML table
  let html = '<html><head><meta charset="UTF-8"></head><body><table>';

  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);

  // Headers
  html += '<tr>';
  headers.forEach(header => {
    html += `<th>${escapeHtml(header)}</th>`;
  });
  html += '</tr>';

  // Data rows
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      const value = row[header];
      html += `<td>${escapeHtml(String(value ?? ''))}</td>`;
    });
    html += '</tr>';
  });

  html += '</table></body></html>';

  downloadFile(
    html,
    filename.replace('.xlsx', '.xls'),
    'application/vnd.ms-excel;charset=utf-8;'
  );
}

/**
 * Download file helper
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
  isUrl: boolean = false
): void {
  const link = document.createElement('a');

  if (isUrl) {
    link.href = content;
  } else {
    const blob = new Blob([content], { type: mimeType });
    link.href = URL.createObjectURL(blob);
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (!isUrl) {
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }
}

/**
 * Format value for display
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  if (typeof value === 'number') {
    return value.toFixed(4);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Copy data to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

/**
 * Format data for copying to Excel
 */
export function formatForExcelCopy<T extends Record<string, any>>(
  data: T[]
): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  let result = headers.join('\t') + '\n';

  data.forEach(row => {
    const values = headers.map(header => String(row[header] ?? ''));
    result += values.join('\t') + '\n';
  });

  return result;
}

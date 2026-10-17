import html2canvas from 'html2canvas';

/**
 * Export data to CSV file
 */
export function exportToCSV(data: object | object[], filename: string) {
  let rows: object[] = [];
  
  if (Array.isArray(data)) {
    rows = data;
  } else if (data && typeof data === 'object') {
    // Handle single object or nested data
    const record = data as Record<string, unknown>;
    const possibleData = record.data || record.records || record.results;
    if (Array.isArray(possibleData)) {
      rows = possibleData.filter((item): item is object => item !== null && typeof item === 'object');
    } else {
      rows = [data];
    }
  }

  if (!rows.length) return;
  
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(h => {
        const val = (row as Record<string, unknown>)[h];
        // Escape commas and quotes
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val ?? '';
      }).join(',')
    )
  ];
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to JSON file
 */
export function exportToJSON(data: object | object[], filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Export widget as PNG image
 */
export async function exportToPNG(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0a0a', // Match theme background
      useCORS: true,
    });
    
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${filename}.png`);
    }, 'image/png');
  } catch (error) {
    console.error('Failed to export as PNG:', error);
  }
}

/**
 * Helper to trigger file download
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

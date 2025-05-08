// src/utils/csvUtils.ts

export function convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
      return '';
    }
  
    const keys = Object.keys(data[0]);
    const csvRows = [];
  
    // Header row
    csvRows.push(keys.join(','));
  
    // Data rows
    for (const row of data) {
      const values = keys.map((key) => {
        let value = row[key];
        // Escape quotes and commas
        if (typeof value === 'string') {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
  
    return csvRows.join('\n');
}

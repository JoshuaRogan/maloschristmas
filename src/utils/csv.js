import Papa from 'papaparse';

export function parseCsv(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });
}

export function sanitizeRow(row) {
  const clean = { Person: (row.Person || row['Person '] || '').trim() };
  Object.keys(row).forEach((k) => {
    if (k === 'Person' || k === 'Person ') return;
    const v = row[k];
    if (v === undefined || v === null || v === '') return;
    const num = Number(String(v).replace(/[^0-9.-]/g, ''));
    if (!isNaN(num)) clean[k.trim()] = num;
  });
  return clean;
}

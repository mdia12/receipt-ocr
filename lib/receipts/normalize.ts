
/**
 * Parses a value into a number.
 * Handles strings with currency symbols, spaces, and various decimal separators.
 * "12,34" -> 12.34
 * "1 234,56 €" -> 1234.56
 * Returns 0 if NaN.
 */
export function parseAmount(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  if (typeof value === 'string') {
    // 1. Remove spaces and currency symbols (keep digits, dots, commas, minus)
    // We also remove letters just in case
    let clean = value.replace(/\s/g, '').replace(/[^\d.,-]/g, '');

    // 2. Handle comma vs dot
    // If we have both, assume the last one is the decimal separator
    // e.g. 1.234,56 -> comma is decimal
    // e.g. 1,234.56 -> dot is decimal
    
    const lastCommaIndex = clean.lastIndexOf(',');
    const lastDotIndex = clean.lastIndexOf('.');

    if (lastCommaIndex > -1 && lastDotIndex > -1) {
      if (lastCommaIndex > lastDotIndex) {
        // Comma is decimal (1.234,56)
        // Remove dots, replace comma with dot
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        // Dot is decimal (1,234.56)
        // Remove commas
        clean = clean.replace(/,/g, '');
      }
    } else if (lastCommaIndex > -1) {
      // Only comma -> replace with dot
      clean = clean.replace(',', '.');
    }
    // If only dot, it's already fine

    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  }
  
  return 0;
}

/**
 * Normalizes a date value into a Date object or null.
 * Handles ISO strings and "DD/MM/YYYY" formats.
 */
export function normalizeDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  // 1. Try standard Date constructor (ISO, etc.)
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    return d;
  }

  // 2. Handle DD/MM/YYYY or DD-MM-YYYY
  // Normalize separators
  const cleanStr = value.replace(/-/g, '/');
  const parts = cleanStr.split('/');

  if (parts.length === 3) {
    let day, month, year;

    // Check if YYYY/MM/DD (year is first and > 31)
    if (parseInt(parts[0]) > 31) {
      year = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
    } else {
      // Assume DD/MM/YYYY
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      year = parseInt(parts[2]);
    }

    const d2 = new Date(year, month, day);
    if (!isNaN(d2.getTime())) {
      return d2;
    }
  }

  return null;
}

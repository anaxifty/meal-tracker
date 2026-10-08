// Utility to convert Bengali numerals to standard English numbers and format dates

export const BENGALI_TO_ENGLISH_DIGITS: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export const ENGLISH_TO_BENGALI_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export function convertBengaliDigitsToEnglish(text: string): string {
  if (!text) return '';
  return text.replace(/[০-৯]/g, (match) => BENGALI_TO_ENGLISH_DIGITS[match] || match);
}

export function convertEnglishDigitsToBengali(numStr: string | number): string {
  const str = String(numStr);
  return str.replace(/[0-9]/g, (match) => ENGLISH_TO_BENGALI_DIGITS[match] || match);
}

export function formatBdt(amount: number, options?: { showBnDigits?: boolean }): string {
  const formatted = Math.round(amount * 100) / 100;
  const numStr = formatted.toLocaleString('en-IN', {
    minimumFractionDigits: formatted % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  if (options?.showBnDigits) {
    return `৳${convertEnglishDigitsToBengali(numStr)}`;
  }
  return `৳${numStr}`;
}

/**
 * Attempts to parse dates like:
 * "০৮-১০-২৬", "08-10-26", "08/10/2026", "2026-10-08", "8 oct", "today", "yesterday"
 */
export function normalizeDate(input: string, fallbackDate?: string): string {
  const today = fallbackDate ? new Date(fallbackDate) : new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-indexed

  if (!input || !input.trim()) {
    return today.toISOString().split('T')[0];
  }

  const clean = convertBengaliDigitsToEnglish(input.trim().toLowerCase());

  if (clean.includes('today') || clean.includes('আজ') || clean.includes('আজকে')) {
    return today.toISOString().split('T')[0];
  }

  if (clean.includes('yesterday') || clean.includes('গতকাল') || clean.includes('কালকে')) {
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    return yest.toISOString().split('T')[0];
  }

  // Check DD-MM-YY or DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) {
      year += 2000;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  // Check YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  // Just day number: e.g. "8" or "08"
  const dayOnlyMatch = clean.match(/^(\d{1,2})$/);
  if (dayOnlyMatch) {
    const day = parseInt(dayOnlyMatch[1], 10);
    if (day >= 1 && day <= 31) {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${currentYear}-${pad(currentMonth)}-${pad(day)}`;
    }
  }

  return today.toISOString().split('T')[0];
}

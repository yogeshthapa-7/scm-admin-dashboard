const BS_EPOCH_OFFSET = 56; // Approximate offset between Gregorian and Bikram Sambat years

export const toEnglishDate = (bsDate: string): string => {
  // Expected BS format: "YYYY-MM-DD" (Bikram Sambat)
  const [bsYear, bsMonth, bsDay] = bsDate.split('-').map(Number);
  if (!bsYear || !bsMonth || !bsDay) return '';

  let gregorianYear = bsYear - BS_EPOCH_OFFSET;
  // Approximate month/day mapping (BS is ~56 years 8.5 months ahead of Gregorian)
  let gregorianMonth = bsMonth - 8;
  let gregorianDay = bsDay;

  if (gregorianMonth <= 0) {
    gregorianMonth += 12;
    gregorianYear -= 1;
  }

  return `${gregorianYear}-${String(gregorianMonth).padStart(2, '0')}-${String(gregorianDay).padStart(2, '0')}`;
};

export const toNepaliDate = (englishDate: string): string => {
  // Expected English format: "YYYY-MM-DD"
  const [gy, gm, gd] = englishDate.split('-').map(Number);
  if (!gy || !gm || !gd) return '';

  let bsYear = gy + BS_EPOCH_OFFSET;
  let bsMonth = gm + 8;
  let bsDay = gd;

  if (bsMonth > 12) {
    bsMonth -= 12;
    bsYear += 1;
  }

  return `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;
};

export const formatDisplayDate = (englishDate: string): string => {
  const [year, month, day] = englishDate.split('-');
  if (!year || !month || !day) return englishDate;
  const nepali = toNepaliDate(englishDate);
  const [bsYear, bsMonth, bsDay] = nepali.split('-');
  return `${bsDay}/${bsMonth}/${bsYear}`;
};

export const parseDisplayDate = (nepaliDate: string): string => {
  const [day, month, year] = nepaliDate.split('/');
  if (!day || !month || !year) return '';
  return toEnglishDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
};

export const todayEnglish = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const todayNepali = (): string => {
  return toNepaliDate(todayEnglish());
};

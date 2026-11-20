import { formatNepaliDate, getNepaliToday, toAD, toBS } from '@arclogi/nepali-date-picker/core';

function parseEnglishDate(value: string): Date | null {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const toEnglishDate = (bsDate: string): string => {
  const [year, month, day] = bsDate.split('-').map(Number);
  if (!year || !month || !day) return '';
  const date = toAD({ year, month, day });
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const toNepaliDate = (englishDate: string): string => {
  const date = parseEnglishDate(englishDate);
  if (!date) return '';
  const bs = toBS(date);
  return `${bs.year}-${String(bs.month).padStart(2, '0')}-${String(bs.day).padStart(2, '0')}`;
};

export const formatDisplayDate = (englishDate: string): string => {
  const date = parseEnglishDate(englishDate);
  if (!date) return englishDate;
  return formatNepaliDate(toBS(date), 'YYYY/MM/DD', 'ne');
};

export const parseDisplayDate = (nepaliDate: string): string => {
  const [day, month, year] = nepaliDate.split('/').map(Number);
  return day && month && year ? toEnglishDate(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`) : '';
};

export const todayEnglish = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const todayNepali = (): string => {
  const bs = getNepaliToday('Asia/Kathmandu');
  return `${bs.year}-${String(bs.month).padStart(2, '0')}-${String(bs.day).padStart(2, '0')}`;
};

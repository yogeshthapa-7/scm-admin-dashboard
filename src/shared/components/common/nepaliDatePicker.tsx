import type { CSSProperties } from 'react';
import {
  NepaliDateInput,
  getNepaliToday,
  parseNepaliDate,
  toAD,
  toBS,
  type NepaliDateValue,
} from '@arclogi/nepali-date-picker';

interface NepaliDatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  returnEnglishDate?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  popoverClassName?: string;
}

function parseValue(value: string | undefined, returnEnglishDate: boolean): NepaliDateValue | null {
  if (!value) return null;
  if (!returnEnglishDate) return parseNepaliDate(value.replace(/\//g, '-'));
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : toBS(date);
}

function formatEnglishDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function NepaliDatePicker({
  value,
  onChange,
  label,
  placeholder = 'YYYY/MM/DD',
  className = '',
  returnEnglishDate = false,
  disabled = false,
  style,
  popoverClassName = 'ndp-popover-above-navbar',
}: NepaliDatePickerProps) {
  const selected = parseValue(value, returnEnglishDate);
  const today = getNepaliToday('Asia/Kathmandu');

  return (
    <NepaliDateInput
      aria-label={label}
      value={selected}
      defaultViewDate={{ year: today.year, month: today.month }}
      locale="ne"
      format="YYYY/MM/DD"
      placeholder={placeholder}
      disabled={disabled}
      inputClassName={className}
      style={style}
      popoverClassName={popoverClassName}
      todayButtonPlacement="header"
      onChange={(date) => {
        if (!date) {
          onChange?.('');
          return;
        }
        onChange?.(returnEnglishDate ? formatEnglishDate(toAD(date)) : `${date.year}/${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}`);
      }}
    />
  );
}

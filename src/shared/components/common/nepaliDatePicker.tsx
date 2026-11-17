import { useState, useEffect, useMemo } from 'react';
import { Popover, Input } from 'antd';
import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

interface NepaliDatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  returnEnglishDate?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

// --- Nepali Constants ---
const NEPALI_MONTHS_NP = [
  'वैशाख', 'जेठ', 'असार', 'साउन',
  'भदौ', 'असोज', 'कात्तिक', 'मंसिर',
  'पुस', 'माघ', 'फागुन', 'चैत',
];

const NEPALI_DAYS_NP = ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श'];

const NEPALI_NUMERALS: Record<string, string> = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
};

const toNepaliNumerals = (num: number | string): string =>
  String(num).replace(/\d/g, (d) => NEPALI_NUMERALS[d] || d);

const padZero = (num: number): string => String(num).padStart(2, '0');

// Approximate BS days per month (varies by year, using typical values)
const BS_DAYS_PER_MONTH = [30, 31, 32, 31, 31, 31, 30, 29, 29, 29, 29, 30];

// Approximate AD start of each BS month for year 2083 (2026-2027)
// These are approximate Gregorian dates when each BS month starts
const BS_MONTH_START_AD_2083: Record<number, { month: number; day: number }> = {
  1: { month: 4, day: 13 },   // Baisakh starts ~Apr 13
  2: { month: 5, day: 14 },   // Jestha starts ~May 14
  3: { month: 6, day: 14 },   // Asar starts ~Jun 14
  4: { month: 7, day: 16 },   // Shrawan starts ~Jul 16
  5: { month: 8, day: 17 },   // Bhadra starts ~Aug 17
  6: { month: 9, day: 17 },   // Ashwin starts ~Sep 17
  7: { month: 10, day: 17 },  // Kartik starts ~Oct 17
  8: { month: 11, day: 16 },  // Mangsir starts ~Nov 16
  9: { month: 12, day: 15 },  // Poush starts ~Dec 15
  10: { month: 1, day: 14 },  // Magh starts ~Jan 14
  11: { month: 2, day: 12 },  // Falgun starts ~Feb 12
  12: { month: 3, day: 13 },  // Chaitra starts ~Mar 13
};

// Approximate AD start of each BS month for year 2082 (2025-2026)
const BS_MONTH_START_AD_2082: Record<number, { month: number; day: number }> = {
  1: { month: 4, day: 12 },
  2: { month: 5, day: 12 },
  3: { month: 6, day: 13 },
  4: { month: 7, day: 15 },
  5: { month: 8, day: 16 },
  6: { month: 9, day: 16 },
  7: { month: 10, day: 16 },
  8: { month: 11, day: 15 },
  9: { month: 12, day: 15 },
  10: { month: 1, day: 13 },
  11: { month: 2, day: 11 },
  12: { month: 3, day: 12 },
};

const BS_MONTH_START_AD: Record<number, Record<number, { month: number; day: number }>> = {
  2082: BS_MONTH_START_AD_2082,
  2083: BS_MONTH_START_AD_2083,
};

const getBsMonthStartAd = (bsYear: number, bsMonth: number): { month: number; day: number } | null => {
  const yearData = BS_MONTH_START_AD[bsYear];
  if (!yearData) return null;
  return yearData[bsMonth] || null;
};

const getDaysInBsMonth = (_bsYear: number, bsMonth: number): number => {
  return BS_DAYS_PER_MONTH[bsMonth - 1] || 30;
};

const adToBs = (adYear: number, adMonth: number, adDay: number) => {
  const adDate = new Date(adYear, adMonth - 1, adDay);
  const adYearNum = adDate.getFullYear();

  // Approximate: BS year = AD year + 57 (around mid-April boundary)
  let bsYear = adYearNum + 57;
  if (adMonth < 4 || (adMonth === 4 && adDay < 13)) {
    bsYear -= 1;
  }

  const yearData = BS_MONTH_START_AD[bsYear];
  if (!yearData) {
    return { year: bsYear, month: 1, day: 1 };
  }

  // Find which BS month this AD date falls in
  for (let m = 1; m <= 12; m++) {
    const start = yearData[m];
    if (!start) continue;
    const startDate = new Date(adYearNum, start.month - 1, start.day);
    const nextStart = m < 12 ? new Date(adYearNum, (yearData[m + 1]?.month || 1) - 1, yearData[m + 1]?.day || 1) : null;

    if (nextStart) {
      if (adDate >= startDate && adDate < nextStart) {
        const diffDays = Math.floor((adDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return { year: bsYear, month: m, day: diffDays + 1 };
      }
    } else {
      // Last month - check if after start
      if (adDate >= startDate) {
        const diffDays = Math.floor((adDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return { year: bsYear, month: m, day: diffDays + 1 };
      }
    }
  }

  return { year: bsYear, month: 1, day: 1 };
};

const bsToAd = ({ year, month, day }: { year: number; month: number; day: number }) => {
  const start = getBsMonthStartAd(year, month);
  if (!start) return null;

  // Determine AD year for the BS month start
  let adYear: number;
  if (start.month >= 4) {
    adYear = year - 57;  // BS months starting Apr-Dec map to AD year = BS - 57
  } else {
    adYear = year - 58;  // BS months starting Jan-Mar map to AD year = BS - 58
  }

  const startDate = new Date(adYear, start.month - 1, start.day);
  const targetDate = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);

  return {
    year: targetDate.getFullYear(),
    month: targetDate.getMonth() + 1,
    day: targetDate.getDate(),
  };
};

export default function NepaliDatePicker({
  value,
  onChange,
  label,
  placeholder = 'YYYY/MM/DD',
  className = '',
  returnEnglishDate = false,
  disabled = false,
  style,
}: NepaliDatePickerProps) {
  const [open, setOpen] = useState(false);

  const [viewYear, setViewYear] = useState<number>(2083);
  const [viewMonth, setViewMonth] = useState<number>(1);
  const [selectedBs, setSelectedBs] = useState<{
    year: number;
    month: number;
    date: number;
  } | null>(null);

  useEffect(() => {
    if (value) {
      if (returnEnglishDate) {
        const parts = value.split('-').map(Number);
        if (parts.length === 3) {
          const bs = adToBs(parts[0], parts[1], parts[2]);
          if (bs) {
            setSelectedBs({ year: bs.year, month: bs.month, date: bs.day });
            setViewYear(bs.year);
            setViewMonth(bs.month);
          }
        }
      } else {
        const parts = value.replace(/-/g, '/').split('/').map(Number);
        if (parts.length === 3) {
          setSelectedBs({ year: parts[0], month: parts[1], date: parts[2] });
          setViewYear(parts[0]);
          setViewMonth(parts[1]);
        }
      }
    } else {
      setSelectedBs(null);
    }
  }, [value, returnEnglishDate]);

  const monthInfo = useMemo(() => {
    const daysInMonth = getDaysInBsMonth(viewYear, viewMonth);
    const startAd = getBsMonthStartAd(viewYear, viewMonth);
    const startDay = startAd ? new Date(2026, startAd.month - 1, startAd.day).getDay() : 0;

    const adDays: Record<number, number> = {};
    const saturdays = new Set<number>();

    for (let d = 1; d <= daysInMonth; d++) {
      const ad = bsToAd({ year: viewYear, month: viewMonth, day: d });
      if (ad) {
        adDays[d] = ad.day;
        if (new Date(ad.year, ad.month - 1, ad.day).getDay() === 6) {
          saturdays.add(d);
        }
      } else {
        adDays[d] = d;
      }
    }

    return { startDay, daysInMonth, saturdays, adDays };
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedBs({ year: viewYear, month: viewMonth, date: day });

    if (returnEnglishDate) {
      const ad = bsToAd({ year: viewYear, month: viewMonth, day });
      onChange?.(
        ad ? `${ad.year}-${padZero(ad.month)}-${padZero(ad.day)}` : ''
      );
    } else {
      onChange?.(`${viewYear}/${padZero(viewMonth)}/${padZero(day)}`);
    }
    setOpen(false);
  };

  const displayValue = selectedBs
    ? `${toNepaliNumerals(selectedBs.year)}/${toNepaliNumerals(padZero(selectedBs.month))}/${toNepaliNumerals(padZero(selectedBs.date))}`
    : '';

  const calendarContent = (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        width: 280,
        padding: '10px 8px 8px',
        userSelect: 'none',
        boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          onClick={handlePrevMonth}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
          }}
        >
          <LeftOutlined />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              lineHeight: 1.3,
            }}
          >
            {NEPALI_MONTHS_NP[viewMonth - 1]} {toNepaliNumerals(viewYear)}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
          }}
        >
          <RightOutlined />
        </button>
      </div>

      <div
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 6,
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        {NEPALI_DAYS_NP.map((day, idx) => (
          <span
            key={day}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: idx === 6 ? '#f87171' : '#ffffff',
              padding: '3px 0',
            }}
          >
            {day}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px 0',
        }}
      >
        {Array.from({ length: monthInfo.startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: monthInfo.daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isSelected =
            selectedBs?.year === viewYear &&
            selectedBs?.month === viewMonth &&
            selectedBs?.date === dayNum;

          const isSaturday = monthInfo.saturdays.has(dayNum);

          let nepaliColor = 'rgba(255,255,255,0.92)';
          let engColor = 'rgba(255,255,255,0.38)';

          if (isSelected) {
            nepaliColor = '#fff';
            engColor = 'rgba(255,255,255,0.85)';
          } else if (isSaturday) {
            nepaliColor = '#f87171';
            engColor = 'rgba(248,113,113,0.7)';
          }

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => handleSelectDay(dayNum)}
              style={{
                height: 36,
                border: 'none',
                borderRadius: 6,
                background: isSelected ? '#2563eb' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                position: 'relative',
                transition: 'background 0.12s',
                outline: 'none',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.15,
                  color: nepaliColor,
                }}
              >
                {toNepaliNumerals(dayNum)}
              </span>
              <span
                style={{
                  fontSize: 9,
                  lineHeight: 1,
                  marginTop: 1,
                  color: engColor,
                  position: 'absolute',
                  bottom: 2,
                  right: 4,
                }}
              >
                {monthInfo.adDays[dayNum] ?? dayNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Popover
        content={calendarContent}
        trigger="click"
        open={open && !disabled}
        onOpenChange={(v) => !disabled && setOpen(v)}
        placement="bottomLeft"
        getPopupContainer={() => document.body}
      >
        <Input
          readOnly
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          className={`cursor-pointer ${className}`}
          style={style}
          suffix={<CalendarOutlined className="text-gray-400" />}
        />
      </Popover>
    </div>
  );
}

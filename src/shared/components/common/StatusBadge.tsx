import React from 'react';

export interface StatusBadgeProps {
  status?: string | number | null;
  label?: string;
  colorCode?: string;
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  colorCode,
  dot = true,
  className = '',
}) => {
  const statusStr = String(label || status || '').trim();
  const lower = statusStr.toLowerCase();

  // If custom colorCode provided from DB (like in DeviceStatus)
  if (colorCode) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}
        style={{
          backgroundColor: `${colorCode}18`,
          color: colorCode,
        }}
      >
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: colorCode }}
          />
        )}
        <span>{statusStr}</span>
      </div>
    );
  }

  // Pre-configured status styles matching the exact design
  let bg = '#F1F5F9';
  let text = '#475569';
  let dotColor = '#94A3B8';

  if (
    lower === 'approved' ||
    lower === 'active' ||
    lower === 'completed' ||
    lower === '1' ||
    lower === 'success'
  ) {
    bg = '#DCFCE7'; // light mint green
    text = '#15803D'; // dark forest green
    dotColor = '#16A34A'; // vivid green
  } else if (
    lower === 'draft' ||
    lower === '2' ||
    lower === 'in review' ||
    lower === 'review'
  ) {
    bg = '#FFEDD5'; // light peach / warm apricot
    text = '#1E293B'; // dark text as shown in image
    dotColor = '#EA580C'; // vivid orange dot
  } else if (
    lower === 'generated' ||
    lower === '3' ||
    lower === 'processing' ||
    lower === 'pending'
  ) {
    bg = '#E0E7FF'; // soft indigo / blue
    text = '#3730A3';
    dotColor = '#4F46E5';
  } else if (
    lower === 'rejected' ||
    lower === 'inactive' ||
    lower === '4' ||
    lower === 'deleted' ||
    lower === '0' ||
    lower === 'error'
  ) {
    bg = '#FEE2E2'; // soft red / pink
    text = '#B91C1C';
    dotColor = '#EF4444';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}
      style={{
        backgroundColor: bg,
        color: text,
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      <span>{statusStr}</span>
    </div>
  );
};

export default StatusBadge;

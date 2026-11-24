import React from 'react';
import { Pagination, Select } from 'antd';
import type { PaginationProps } from 'antd';

export interface AppPaginationProps extends Omit<PaginationProps, 'onChange'> {
  current?: number;
  pageSize?: number;
  total?: number;
  pageSizeOptions?: (number | string)[];
  onChange?: (page: number, pageSize: number) => void;
  showSummary?: boolean;
}

export const AppPagination: React.FC<AppPaginationProps> = ({
  current = 1,
  pageSize = 12,
  total = 0,
  pageSizeOptions = [12, 24, 48],
  onChange,
  showSummary = true,
  ...props
}) => {
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  const numericOptions = pageSizeOptions.map((opt) => Number(opt));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#171d2b]">
      {showSummary && (
        <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-normal">
          Showing {start} to {end} of {total} items
        </span>
      )}
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          <span>Rows per page</span>
          <Select
            size="small"
            value={pageSize}
            onChange={(newPageSize) => onChange?.(1, newPageSize)}
            options={numericOptions.map((size) => ({
              value: size,
              label: size,
            }))}
            className="w-16 h-8 text-xs font-medium"
            popupMatchSelectWidth={false}
          />
        </div>
        <Pagination
          current={current}
          pageSize={pageSize}
          total={total}
          showSizeChanger={false}
          onChange={(page, pSize) => onChange?.(page, pSize || pageSize)}
          className="app-custom-pagination flex items-center"
          {...props}
        />
      </div>
    </div>
  );
};

export default AppPagination;

import React from 'react';
import { Button, Input } from 'antd';
import { Search, Filter } from 'lucide-react';

export interface PageHeaderCardProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeaderCard: React.FC<PageHeaderCardProps> = ({
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`w-full rounded-2xl px-7 py-6 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md ${className}`}
      style={{
        background: 'linear-gradient(135deg, #092347 0%, #0d3468 100%)',
      }}
    >
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight m-0 font-sans">
          {title}
        </h1>
        <p className="text-slate-300 text-sm mt-1 m-0 font-normal">
          {description}
        </p>
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
};

export interface PageToolbarCardProps {
  children?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  showFilterButton?: boolean;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  filterContent?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

export const PageToolbarCard: React.FC<PageToolbarCardProps> = ({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showFilterButton = true,
  filtersOpen = false,
  onToggleFilters,
  filterContent,
  extra,
  className = '',
}) => {
  return (
    <div className={`mb-4 flex flex-col gap-3 ${className}`}>
      <div className="w-full bg-white dark:bg-[#1e2538] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[260px] max-w-md">
          {onSearchChange && (
            <Input
              allowClear
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              suffix={<Search size={17} className="text-slate-400" />}
              className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#171d2b] dark:text-slate-100 text-sm"
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          {extra}
          {showFilterButton && onToggleFilters && (
            <Button
              className={`h-10 px-4 rounded-lg font-medium flex items-center gap-2 text-sm border transition-colors ${
                filtersOpen
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300'
                  : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1e2538] hover:border-blue-500'
              }`}
              icon={<Filter size={16} />}
              onClick={onToggleFilters}
            >
              Filters
            </Button>
          )}
        </div>
      </div>

      {filtersOpen && filterContent && (
        <div className="w-full bg-white dark:bg-[#1e2538] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          {filterContent}
        </div>
      )}
    </div>
  );
};

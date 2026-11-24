import React, { useState } from 'react';
import { Table, Typography, Empty } from 'antd';
import type { TableProps } from 'antd';
import { AppPagination, type AppPaginationProps } from './AppPagination';

const { Title, Text } = Typography;

export interface AppTableProps<RecordType = any> extends Omit<TableProps<RecordType>, 'rowKey' | 'title'> {
  columns: TableProps<RecordType>['columns'];
  dataSource: RecordType[];
  rowKey?: string | ((record: RecordType) => React.Key);
  size?: TableProps<RecordType>['size'];
  pagination?: TableProps<RecordType>['pagination'];
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extraHeader?: React.ReactNode;
  emptyDescription?: string;
  loading?: boolean;
  bordered?: boolean;
  serverPagination?: AppPaginationProps;
  selectable?: boolean;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (selectedKeys: React.Key[], selectedRows: RecordType[]) => void;
}

export const AppTable = <RecordType = any>({
  columns = [],
  dataSource = [],
  rowKey = 'id',
  size = 'middle',
  pagination = false,
  className,
  title,
  subtitle,
  extraHeader,
  emptyDescription = 'No records found',
  loading = false,
  bordered = false,
  serverPagination,
  selectable = true,
  selectedRowKeys: controlledKeys,
  onSelectionChange,
  rowSelection: customRowSelection,
  ...rest
}: AppTableProps<RecordType>) => {
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>([]);
  const selectedKeys = controlledKeys !== undefined ? controlledKeys : internalSelectedKeys;

  // Preserve column alignments instead of forcing center on everything
  const formattedColumns = columns.map((col) => ({
    ...col,
    align: col.align || 'left',
  }));

  const effectiveRowSelection = customRowSelection !== undefined
    ? customRowSelection
    : selectable
    ? {
        selectedRowKeys: selectedKeys,
        onChange: (newKeys: React.Key[], selectedRows: RecordType[]) => {
          setInternalSelectedKeys(newKeys);
          onSelectionChange?.(newKeys, selectedRows);
        },
      }
    : undefined;

  const hasHeader = title || subtitle || extraHeader;

  return (
    <div className={`app-table-container bg-white dark:bg-[#171d2b] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden ${className ?? ''}`}>
      {hasHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            {typeof title === 'string' ? (
              <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }} className="dark:!text-slate-100 text-lg sm:text-xl">
                {title}
              </Title>
            ) : (
              title
            )}
            {subtitle && (
              <div className="mt-0.5">
                {typeof subtitle === 'string' ? (
                  <Text className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                    {subtitle}
                  </Text>
                ) : (
                  subtitle
                )}
              </div>
            )}
          </div>
          {extraHeader && <div className="flex items-center gap-2.5 flex-wrap">{extraHeader}</div>}
        </div>
      )}

      <div className="app-table-scroll">
        <Table
          columns={formattedColumns}
          dataSource={dataSource}
          rowKey={rowKey}
          size={size}
          pagination={pagination}
          loading={loading}
          bordered={bordered}
          rowSelection={effectiveRowSelection}
          scroll={{ x: 'max-content', ...rest.scroll }}
          locale={{
            emptyText: <Empty description={emptyDescription} />,
          }}
          {...rest}
        />
      </div>
      {serverPagination && <AppPagination {...serverPagination} />}
    </div>
  );
};

export default AppTable;

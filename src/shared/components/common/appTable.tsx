import React from 'react';
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
  sectionTitle?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extraHeader?: React.ReactNode;
  emptyDescription?: string;
  loading?: boolean;
  bordered?: boolean;
  serverPagination?: AppPaginationProps;
}

export const AppTable = <RecordType = any>({
  columns = [],
  dataSource = [],
  rowKey = 'id',
  size = 'middle',
  pagination = false,
  className,
  sectionTitle,
  title,
  subtitle,
  extraHeader,
  emptyDescription = 'No records found',
  loading = false,
  bordered = false,
  serverPagination,
  ...rest
}: AppTableProps<RecordType>) => {
  // Preserve column alignments instead of forcing center on everything
  const formattedColumns = columns.map((col) => ({
    ...col,
    align: col.align || 'left',
  }));

  const hasHeader = title || subtitle || extraHeader;

  return (
    <>
      {sectionTitle && (
        <h2 className="mb-2 text-base font-semibold leading-6 text-slate-700 dark:text-slate-200">
          {sectionTitle}
        </h2>
      )}
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
                    <Text className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
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
            rowSelection={undefined}
            components={{
              body: {
                cell: ({ children, className: cellClassName, ...props }: any) => (
                  <td {...props} className={`${cellClassName ?? ''} !text-black dark:!text-slate-100`}>
                    {children}
                  </td>
                ),
              },
            }}
            scroll={{ x: 'max-content', ...rest.scroll }}
            locale={{
              emptyText: <Empty description={emptyDescription} />,
            }}
            {...rest}
          />
        </div>
        {serverPagination && <AppPagination {...serverPagination} />}
      </div>
    </>
  );
};

export default AppTable;

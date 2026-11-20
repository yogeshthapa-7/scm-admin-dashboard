import React from 'react';
import { Table, Typography, Empty } from 'antd';
import type { TableProps } from 'antd';
import { AppPagination, type AppPaginationProps } from './AppPagination';

const { Title } = Typography;

export interface AppTableProps<RecordType = any> extends Omit<TableProps<RecordType>, 'rowKey' | 'title'> {
  columns: TableProps<RecordType>['columns'];
  dataSource: RecordType[];
  rowKey?: string | ((record: RecordType) => React.Key);
  size?: TableProps<RecordType>['size'];
  pagination?: TableProps<RecordType>['pagination'];
  className?: string;
  title?: string;
  emptyDescription?: string;
  loading?: boolean;
  bordered?: boolean;
  serverPagination?: AppPaginationProps;
}

export const AppTable = <RecordType = any>({
  columns = [],
  dataSource = [],
  rowKey = 'id',
  size = 'small',
  pagination = false,
  className,
  title,
  emptyDescription = 'No records found',
  loading = false,
  bordered = true,
  serverPagination,
  ...rest
}: AppTableProps<RecordType>) => {
  const centeredColumns = columns.map((col) => ({
    ...col,
    align: 'center' as const,
    headerAlign: 'center' as const,
  }));

  return (
    <div className={`app-table-container ${className ?? ''}`}>
      {title && (
        <div className="mb-4">
          <Title level={4} style={{ marginBottom: 16 }}>
            {title}
          </Title>
        </div>
      )}
      <div className="app-table-scroll">
        <Table
          columns={centeredColumns}
          dataSource={dataSource}
          rowKey={rowKey}
          size={size}
          pagination={pagination}
          loading={loading}
          bordered={bordered}
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

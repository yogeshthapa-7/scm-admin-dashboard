import { Table, Typography, Empty } from 'antd';
import type { TableProps } from 'antd';

const { Title } = Typography;

interface AppTableProps<RecordType = any> extends Omit<TableProps<RecordType>, 'rowKey' | 'title'> {
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
  ...rest
}: AppTableProps<RecordType>) => {
  const centeredColumns = columns.map((col) => ({
    ...col,
    align: 'center' as const,
    headerAlign: 'center' as const,
  }));

  return (
    <div className={className}>
      {title && (
        <div className="mb-4">
          <Title level={4} style={{ marginBottom: 16 }}>
            {title}
          </Title>
        </div>
      )}
      <Table
        columns={centeredColumns}
        dataSource={dataSource}
        rowKey={rowKey}
        size={size}
        pagination={pagination}
        loading={loading}
        bordered={bordered}
        locale={{
          emptyText: <Empty description={emptyDescription} />,
        }}
        {...rest}
      />
    </div>
  );
};

export default AppTable;

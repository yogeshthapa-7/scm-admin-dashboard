import { Pagination } from 'antd';
import type { PaginationProps } from 'antd';

export type AppPaginationProps = PaginationProps;

export const AppPagination = ({
  current = 1,
  pageSize = 12,
  total = 0,
  showSizeChanger = true,
  pageSizeOptions = [12, 24, 48],
  showTotal = (value) => `Total ${value} items`,
  onChange,
  ...props
}: AppPaginationProps) => (
  <div className="flex justify-end py-4">
    <Pagination current={current} pageSize={pageSize} total={total} showSizeChanger={showSizeChanger} pageSizeOptions={pageSizeOptions} showTotal={showTotal} onChange={onChange} {...props} />
  </div>
);

export default AppPagination;

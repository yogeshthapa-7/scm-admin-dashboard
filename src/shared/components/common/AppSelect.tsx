import { Select, type SelectProps } from 'antd';

type AppSelectProps = SelectProps & {
  // Add any custom props here
};

export const AppSelect = ({ ...props }: AppSelectProps) => {
  return <Select {...props} />;
};


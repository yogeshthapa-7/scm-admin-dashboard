import { Input, type InputProps } from 'antd';

type AppInputProps = InputProps & {
  // Add any custom props here
};

export const AppInput = ({ ...props }: AppInputProps) => {
  return <Input {...props} />;
};


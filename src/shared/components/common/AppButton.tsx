import { Button, type ButtonProps } from 'antd';

type AppButtonProps = ButtonProps & {
  // Add any custom props here
};

export const AppButton = ({ children, ...props }: AppButtonProps) => {
  return (
    <Button {...props}>
      {children}
    </Button>
  );
};


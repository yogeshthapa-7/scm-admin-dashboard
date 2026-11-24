import { Drawer, Form, Button, type DrawerProps } from 'antd';
import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  confirmText?: string;
  width?: number | string;
  rootClassName?: string;
  hideFormActions?: boolean;
  hideCancelButton?: boolean;
  children: React.ReactNode;
  onSave: (values: Record<string, unknown>) => void | Promise<void>;
  initialValues?: Record<string, unknown>;
}

export const AppDrawer = ({
  open,
  onClose,
  title = 'Add New Item',
  confirmText = 'Add',
  width = 700,
  rootClassName,
  hideFormActions = false,
  hideCancelButton = false,
  children,
  onSave,
  initialValues,
}: AppDrawerProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { mode } = useTheme();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSave(values);
      form.resetFields();
      onClose();
    } catch {
      // validation or save error (handled by caller)
    } finally {
      setLoading(false);
    }
  };

  const drawerStyles: DrawerProps['styles'] = mode === 'light'
    ? {
        section: {
          background: 'linear-gradient(135deg, #dbeafe 0%, #e2e8f0 52%, #cbd5e1 100%)',
        },
        header: { background: 'transparent' },
        body: { background: 'transparent' },
        footer: { background: 'transparent' },
      }
    : undefined;

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      width={width}
      styles={drawerStyles}
      rootClassName={`responsive-app-drawer ${rootClassName ?? ''}`.trim()}
      bodyStyle={{ paddingBottom: 0 }}
      drawerStyle={{ paddingBottom: 24 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="
          [&_.ant-form-item]:mb-[12px]

          [&_.ant-input-affix-wrapper]:h-[38px]
          [&_.ant-input-affix-wrapper]:rounded-[8px]
          [&_.ant-input-affix-wrapper]:border-[1.5px]
          [&_.ant-input-affix-wrapper]:border-[#d1def2]
          [&_.ant-input-affix-wrapper]:bg-white
          [&_.ant-input-affix-wrapper]:px-[12px]
          [&_.ant-input-affix-wrapper]:shadow-none

          [&_.ant-select-selector]:h-[38px]
          [&_.ant-select-selector]:rounded-[8px]
          [&_.ant-select-selector]:border-[1.5px]
          [&_.ant-select-selector]:border-[#d1def2]
          [&_.ant-select-selector]:bg-white
          [&_.ant-select-selector]:px-[12px]
          [&_.ant-select-selector]:shadow-none

          [&_.ant-input]:bg-transparent
          [&_.ant-input]:text-[13px]
          [&_.ant-input]:text-[#17376c]
          [&_.ant-input::placeholder]:text-[#899bbd]

          [&_.ant-select-selection-item]:text-[13px]
          [&_.ant-select-selection-item]:text-[#17376c]
          [&_.ant-select-selection-placeholder]:text-[#899bbd]
        "
      >
        {children}

        {!hideFormActions && (
          <div className="flex justify-end gap-3 pt-6">
            {!hideCancelButton && (
              <Button
                onClick={onClose}
                className="h-[38px] rounded-[8px] border-[1.5px] border-[#d1def2] bg-transparent text-[#17376c] font-medium px-5 transition-colors hover:bg-[#f5f7fa]"
              >
                Cancel
              </Button>
            )}
            <Button
              htmlType="submit"
              type="primary"
              loading={loading}
              className="h-[38px] rounded-[8px] bg-gradient-to-r from-[#168bff] to-[#0862e9] text-white font-medium px-5 shadow-[0_4px_12px_rgba(22,119,255,0.2)] hover:from-[#0879f5] transition-all"
            >
              {confirmText}
            </Button>
          </div>
        )}
      </Form>
    </Drawer>
  );
};

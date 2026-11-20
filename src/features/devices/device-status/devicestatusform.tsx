import {
  Form,
  Input,
} from 'antd';

export const DeviceStatusFormItems = () => {
  return (
    <>
      <Form.Item
        name="statusName"
        label="Device Status Name"
        rules={[{ required: true, message: 'Please enter status name' }]}
      >
        <Input placeholder="e.g. Active, In-Stock, Under Repair" />
      </Form.Item>

      <Form.Item
        name="code"
        label="Device Status Code"
        rules={[{ required: true, message: 'Please enter a code' }]}
      >
        <Input
          placeholder="e.g. ACT, INSTOCK, UR"
        />
      </Form.Item>

      <Form.Item
        name="colorCode"
        label="Color Code"
        rules={[{ required: true, message: 'Please select a color' }]}
        initialValue="#52c41a"
      >
        <input
          type="color"
          defaultValue="#52c41a"
          className="w-full h-[38px] rounded-[8px] border-none p-0 cursor-pointer"
          style={{ border: 'none', background: 'transparent', height: '38px', width: '100%', padding: 0 }}
        />
      </Form.Item>

      <Form.Item
        name="orderKey"
        label="Order Key"
        rules={[
          {
            validator: (_: any, value: any) => {
              if (value === '' || value === undefined || value === null) {
                return Promise.resolve();
              }
              const num = Number(value);
              if (Number.isNaN(num)) {
                return Promise.reject(new Error('Order key must be a number'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input
          type="number"
          placeholder="e.g. 1, 2, 3"
        />
      </Form.Item>
    </>
  );
};

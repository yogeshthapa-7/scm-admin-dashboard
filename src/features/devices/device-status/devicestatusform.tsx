import { Form, Input } from 'antd';

export const DeviceStatusFormItems = () => {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Form.Item
          name="statusName"
          label="Device Status Name"
          rules={[{ required: true, message: 'Please enter status name' }]}
          className="w-full"
        >
          <Input placeholder="e.g. Active, In-Stock, Under Repair" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Device Status Code"
          rules={[{ required: true, message: 'Please enter a code' }]}
          className="w-full"
        >
          <Input placeholder="e.g. ACT, INSTOCK, UR" />
        </Form.Item>

        <Form.Item
          name="colorCode"
          label="Color Code"
          rules={[{ required: true, message: 'Please select a color' }]}
          initialValue="#52c41a"
          getValueFromEvent={(e) => (e as React.ChangeEvent<HTMLInputElement>).target.value}
          className="w-full"
        >
          <Input type="color" style={{ height: 38, width: '100%', padding: 4 }} />
        </Form.Item>

        <Form.Item
          name="orderKey"
          label="Order Key"
          initialValue={0}
          className="w-full"
        >
          <Input type="number" placeholder="e.g. 1, 2, 3" />
        </Form.Item>
      </div>
    </>
  );
};

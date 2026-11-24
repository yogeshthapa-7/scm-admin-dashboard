import { Form, Input, Select, InputNumber, Typography } from 'antd';
import NepaliDatePicker from '@/shared/components/common/nepaliDatePicker';

const { Text } = Typography;

export interface PurchaseFormValues {
  trnDate: string;
  refNo: string;
  narration: string;
  deviceModelId: string;
  make: string;
  snPrefix: string;
  snPadding: number;
  totalItem: number;
  startingNumber: number;
}

interface PurchaseFormProps {
  deviceModels: { id: string; name: string; make: string }[];
  companyName: string;
  make: string;
}

export const PurchaseForm = ({
  deviceModels,
  companyName,
  make,
}: PurchaseFormProps) => {
  return (
    <>
      <div>
        <Text
          className="mb-4 block border-b border-gray-100 pb-2 text-sm font-semibold text-gray-800 uppercase tracking-wider"
        >
          Purchase Information
        </Text>

        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item
            name="trnDate"
            label="Transaction Date"
            rules={[{ required: true, message: 'Please enter transaction date' }]}
          >
            <NepaliDatePicker
              returnEnglishDate
              className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-[#202a3d] dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </Form.Item>

          <Form.Item
            name="refNo"
            label="Reference Number"
            rules={[{ required: true, message: 'Please enter reference number' }]}
          >
            <Input
              placeholder="e.g. PUR-004"
              className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </Form.Item>

          <Form.Item
            name="narration"
            label="Narration"
            className="sm:col-span-2"
          >
            <Input.TextArea
              rows={2}
              placeholder="Enter purchase description..."
              className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </Form.Item>
        </div>
      </div>

      <div>
        <Text
          className="mb-4 block border-b border-gray-100 pb-2 text-sm font-semibold text-gray-800 uppercase tracking-wider"
        >
          Company Information
        </Text>

        <div className="grid gap-4 sm:grid-cols-3">
          <Form.Item label="Company">
            <Input
              disabled
              value={companyName}
              className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-gray-50 px-3 text-sm text-gray-500"
            />
          </Form.Item>

          <Form.Item label="Make">
            <Input
              disabled
              value={make}
              className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-gray-50 px-3 text-sm text-gray-500"
            />
          </Form.Item>
        </div>
      </div>

      <div>
        <Text
          className="mb-4 block border-b border-gray-100 pb-2 text-sm font-semibold text-gray-800 uppercase tracking-wider"
        >
          Device Information
        </Text>

        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item
            name="deviceModelId"
            label="Device Model"
            rules={[{ required: true, message: 'Please select device model' }]}
          >
            <Select
              showSearch
              allowClear
              options={deviceModels.map((m) => ({ label: m.name, value: String(m.id) }))}
              placeholder="Select device model"
              className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </Form.Item>
        </div>
      </div>

      <div>
        <Text
          className="mb-4 block border-b border-gray-100 pb-2 text-sm font-semibold text-gray-800 uppercase tracking-wider"
        >
          Serial Number Configuration
        </Text>

        <div className="grid gap-4 sm:grid-cols-4">
          <Form.Item
            name="snPrefix"
            label="SN Prefix"
            rules={[{ required: true, message: 'Please enter SN prefix' }]}
          >
            <Input
              placeholder="SN"
              className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </Form.Item>

          <Form.Item
            name="snPadding"
            label="SN Padding (Digits)"
            rules={[{ required: true, message: 'Please enter padding digits' }]}
          >
            <InputNumber
              min={1}
              max={12}
              className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </Form.Item>

            <Form.Item
            name="startingNumber"
            label="Starting Number"
            rules={[{ required: true, message: 'Please enter starting number' }]}
          >
            <InputNumber
              min={1}
              className="w-[60px] h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </Form.Item>

          <Form.Item
            name="totalItem"
            label="Total Items"
            rules={[{ required: true, message: 'Please enter total items' }]}
          >
            <InputNumber
              min={1}
              className="w-full h-[38px] rounded-[8px] border-[1.5px] border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </Form.Item>

        
        </div>
      </div>
    </>
  );
};

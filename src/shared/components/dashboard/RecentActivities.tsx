import { List, Typography } from 'antd';

const activities = [
  { id: 1, text: 'Device #DEV-1024 added to inventory', time: '2 min ago' },
  { id: 2, text: 'Purchase order #PO-2026-078 approved', time: '15 min ago' },
  { id: 3, text: 'Company "TechSource Pvt. Ltd." profile updated', time: '1 hour ago' },
  { id: 4, text: 'User rajesh.k@scm.gov registered', time: '2 hours ago' },
  { id: 5, text: 'Monthly inventory report generated', time: '3 hours ago' },
  { id: 6, text: 'Device #DEV-0891 assigned to IT Dept', time: '5 hours ago' },
];

export const RecentActivities = () => {
  return (
    <List
      dataSource={activities}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={<Typography.Text style={{ color: '#172033', fontSize: 14 }}>{item.text}</Typography.Text>}
            description={<Typography.Text style={{ color: '#172033', fontSize: 12 }}>{item.time}</Typography.Text>}
          />
        </List.Item>
      )}
    />
  );
};



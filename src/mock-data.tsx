// ============================================================================
// Mock Data — SCM Device Management Dashboard
// Replace with API calls once backend is implemented.
// ============================================================================

// ---------------------------------------------------------------------------
// Dashboard — stat cards & activities
// ---------------------------------------------------------------------------

export const dashboardStats = {
  totalDevices: 248,
  totalPurchases: 56,
  totalCompanies: 32,
  totalUsers: 124,
};

export type RecentActivity = {
  id: number;
  text: string;
  time: string;
  type: 'device' | 'purchase' | 'company' | 'user' | 'system';
};

export const recentActivities: RecentActivity[] = [
  { id: 1, text: 'Device #DEV-1024 added to inventory', time: '2 min ago', type: 'device' },
  { id: 2, text: 'Purchase order #PO-2026-078 approved', time: '15 min ago', type: 'purchase' },
  { id: 3, text: 'Company "TechSource Pvt. Ltd." profile updated', time: '1 hour ago', type: 'company' },
  { id: 4, text: 'User rajesh.k@scm.gov registered', time: '2 hours ago', type: 'user' },
  { id: 5, text: 'Monthly inventory report generated', time: '3 hours ago', type: 'system' },
  { id: 6, text: 'Device #DEV-0891 assigned to IT Dept', time: '5 hours ago', type: 'device' },
  { id: 7, text: 'Purchase record #PR-0456 status changed to Delivered', time: '6 hours ago', type: 'purchase' },
];

// ---------------------------------------------------------------------------
// Inventory chart data (last 6 months)
// ---------------------------------------------------------------------------

export type InventoryChartPoint = {
  month: string;
  received: number;
  issued: number;
  available: number;
};

export const inventoryChartData: InventoryChartPoint[] = [
  { month: 'Jun', received: 32, issued: 18, available: 162 },
  { month: 'Jul', received: 45, issued: 25, available: 182 },
  { month: 'Aug', received: 28, issued: 20, available: 190 },
  { month: 'Sep', received: 50, issued: 35, available: 205 },
  { month: 'Oct', received: 38, issued: 22, available: 221 },
  { month: 'Nov', received: 53, issued: 26, available: 248 },
];

// ---------------------------------------------------------------------------
// Purchases
// ---------------------------------------------------------------------------

export type PurchaseStatus = 'Pending' | 'Approved' | 'Ordered' | 'Delivered' | 'Cancelled';

export type PurchaseRecord = {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: number;
  currency: string;
  status: PurchaseStatus;
  itemCount: number;
  approvedBy: string;
};

export const purchaseRecords: PurchaseRecord[] = [
  {
    id: 'PUR-001',
    orderNumber: 'PO-2026-012',
    vendorId: 'COM-001',
    vendorName: 'TechSource Pvt. Ltd.',
    orderDate: '2026-01-10',
    expectedDelivery: '2026-01-18',
    totalAmount: 1245000,
    currency: 'NPR',
    status: 'Delivered',
    itemCount: 25,
    approvedBy: 'System Admin',
  },
  {
    id: 'PUR-002',
    orderNumber: 'PO-2026-020',
    vendorId: 'COM-002',
    vendorName: 'InfoTech Solutions',
    orderDate: '2026-02-05',
    expectedDelivery: '2026-02-15',
    totalAmount: 890000,
    currency: 'NPR',
    status: 'Delivered',
    itemCount: 20,
    approvedBy: 'System Admin',
  },
  {
    id: 'PUR-003',
    orderNumber: 'PO-2026-025',
    vendorId: 'COM-001',
    vendorName: 'TechSource Pvt. Ltd.',
    orderDate: '2026-02-25',
    expectedDelivery: '2026-03-05',
    totalAmount: 456000,
    currency: 'NPR',
    status: 'Delivered',
    itemCount: 15,
    approvedBy: 'System Admin',
  },
  {
    id: 'PUR-004',
    orderNumber: 'PO-2026-031',
    vendorId: 'COM-003',
    vendorName: 'GovTech Supplies',
    orderDate: '2026-03-10',
    expectedDelivery: '2026-03-25',
    totalAmount: 2300000,
    currency: 'NPR',
    status: 'Ordered',
    itemCount: 50,
    approvedBy: 'System Admin',
  },
  {
    id: 'PUR-005',
    orderNumber: 'PO-2026-034',
    vendorId: 'COM-004',
    vendorName: 'OfficeMart Nepal',
    orderDate: '2026-03-15',
    expectedDelivery: '2026-03-28',
    totalAmount: 125000,
    currency: 'NPR',
    status: 'Approved',
    itemCount: 10,
    approvedBy: 'System Admin',
  },
  {
    id: 'PUR-006',
    orderNumber: 'PO-2026-038',
    vendorId: 'COM-002',
    vendorName: 'InfoTech Solutions',
    orderDate: '2026-04-01',
    expectedDelivery: '2026-04-15',
    totalAmount: 670000,
    currency: 'NPR',
    status: 'Pending',
    itemCount: 30,
    approvedBy: '—',
  },
];

// ---------------------------------------------------------------------------
// Purchase Master (vendors / suppliers)
// ---------------------------------------------------------------------------

export type PurchaseMasterVendor = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  tinNumber: string;
  totalOrders: number;
  totalValue: number;
};

export const purchaseMasterVendors: PurchaseMasterVendor[] = [
  { id: 'COM-001', name: 'TechSource Pvt. Ltd.', contactPerson: 'Suresh Adhikari', email: 'suresh@techsource.com.np', phone: '+977-1-4412345', tinNumber: '301234567', totalOrders: 18, totalValue: 4500000 },
  { id: 'COM-002', name: 'InfoTech Solutions', contactPerson: 'Meera Thapa', email: 'meera@infotech.com.np', phone: '+977-1-4567890', tinNumber: '302345678', totalOrders: 14, totalValue: 3200000 },
  { id: 'COM-003', name: 'GovTech Supplies', contactPerson: 'Hari Prasad Sharma', email: 'hari@govtech.com.np', phone: '+977-1-5332211', tinNumber: '303456789', totalOrders: 12, totalValue: 5800000 },
  { id: 'COM-004', name: 'OfficeMart Nepal', contactPerson: 'Sita Gurung', email: 'sita@officemart.com.np', phone: '+977-1-4778899', tinNumber: '304567890', totalOrders: 8, totalValue: 980000 },
  { id: 'COM-005', name: 'Global Network Systems', contactPerson: 'Bikash Rai', email: 'bikash@gns.com.np', phone: '+977-1-5556677', tinNumber: '305678901', totalOrders: 4, totalValue: 1500000 },
];

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export type CompanyType = 'Vendor' | 'Client' | 'Partner';

export type Company = {
  id: string;
  name: string;
  type: CompanyType;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  tinNumber: string;
  registrationDate: string;
  status: 'Active' | 'Inactive';
};

export const companies: Company[] = [
  { id: 'COM-001', name: 'TechSource Pvt. Ltd.', type: 'Vendor', contactPerson: 'Suresh Adhikari', email: 'suresh@techsource.com.np', phone: '+977-1-4412345', address: 'Jhamsikhel, Lalitpur', tinNumber: '301234567', registrationDate: '2020-04-12', status: 'Active' },
  { id: 'COM-002', name: 'InfoTech Solutions', type: 'Vendor', contactPerson: 'Meera Thapa', email: 'meera@infotech.com.np', phone: '+977-1-4567890', address: 'Baneshwor, Kathmandu', tinNumber: '302345678', registrationDate: '2019-08-23', status: 'Active' },
  { id: 'COM-003', name: 'GovTech Supplies', type: 'Vendor', contactPerson: 'Hari Prasad Sharma', email: 'hari@govtech.com.np', phone: '+977-1-5332211', address: 'Putalisadak, Kathmandu', tinNumber: '303456789', registrationDate: '2018-01-05', status: 'Active' },
  { id: 'COM-004', name: 'OfficeMart Nepal', type: 'Vendor', contactPerson: 'Sita Gurung', email: 'sita@officemart.com.np', phone: '+977-1-4778899', address: 'Asan, Kathmandu', tinNumber: '304567890', registrationDate: '2021-06-15', status: 'Active' },
  { id: 'COM-005', name: 'Global Network Systems', type: 'Partner', contactPerson: 'Bikash Rai', email: 'bikash@gns.com.np', phone: '+977-1-5556677', address: 'Maharajgunj, Kathmandu', tinNumber: '305678901', registrationDate: '2022-03-10', status: 'Active' },
  { id: 'COM-006', name: 'Ministry of Communication', type: 'Client', contactPerson: 'Dr. Ramesh Karki', email: 'ramesh@moc.gov.np', phone: '+977-1-4211000', address: 'Singha Durbar, Kathmandu', tinNumber: '300111222', registrationDate: '2017-12-01', status: 'Active' },
  { id: 'COM-007', name: 'Nepal Telecom Authority', type: 'Client', contactPerson: 'Sunita Basnet', email: 'sunita@nta.gov.np', phone: '+977-1-4318888', address: 'Ramshah Path, Kathmandu', tinNumber: '300222333', registrationDate: '2018-09-20', status: 'Active' },
];

// ---------------------------------------------------------------------------
// Change Records (audit trail)
// ---------------------------------------------------------------------------

export type ChangeRecordType = 'Create' | 'Update' | 'Delete' | 'Assign' | 'Status-Change';

export type ChangeRecord = {
  id: string;
  entityType: 'Device' | 'Purchase' | 'Company' | 'User' | 'System';
  entityId: string;
  action: ChangeRecordType;
  description: string;
  changedBy: string;
  timestamp: string;
  ipAddress: string;
};

export const changeRecords: ChangeRecord[] = [
  { id: 'CHG-0001', entityType: 'Device', entityId: 'DEV-1001', action: 'Create', description: 'New device added to inventory', changedBy: 'admin@scm.gov', timestamp: '2026-11-16 09:15:00', ipAddress: '10.0.0.12' },
  { id: 'CHG-0002', entityType: 'Purchase', entityId: 'PUR-004', action: 'Status-Change', description: 'Status changed from Pending to Ordered', changedBy: 'admin@scm.gov', timestamp: '2026-11-16 08:45:00', ipAddress: '10.0.0.12' },
  { id: 'CHG-0003', entityType: 'Device', entityId: 'DEV-1005', action: 'Assign', description: 'Device assigned to Rajesh Kumar (Field Operations)', changedBy: 'it.manager@scm.gov', timestamp: '2026-11-15 16:30:00', ipAddress: '10.0.0.15' },
  { id: 'CHG-0004', entityType: 'Company', entityId: 'COM-003', action: 'Update', description: 'Contact person updated to Hari Prasad Sharma', changedBy: 'admin@scm.gov', timestamp: '2026-11-15 14:20:00', ipAddress: '10.0.0.12' },
  { id: 'CHG-0005', entityType: 'User', entityId: 'USR-042', action: 'Create', description: 'New user account created for rajesh.k@scm.gov', changedBy: 'admin@scm.gov', timestamp: '2026-11-15 11:00:00', ipAddress: '10.0.0.12' },
  { id: 'CHG-0006', entityType: 'Device', entityId: 'DEV-1004', action: 'Status-Change', description: 'Status changed from Assigned to Under-Repair', changedBy: 'it.manager@scm.gov', timestamp: '2026-11-14 15:45:00', ipAddress: '10.0.0.15' },
  { id: 'CHG-0007', entityType: 'Purchase', entityId: 'PUR-002', action: 'Update', description: 'Expected delivery date updated', changedBy: 'admin@scm.gov', timestamp: '2026-11-14 10:30:00', ipAddress: '10.0.0.12' },
  { id: 'CHG-0008', entityType: 'System', entityId: 'SYS-001', action: 'Update', description: 'System configuration backup completed', changedBy: 'system', timestamp: '2026-11-13 23:00:00', ipAddress: '127.0.0.1' },
  { id: 'CHG-0009', entityType: 'Device', entityId: 'DEV-1008', action: 'Status-Change', description: 'Device retired — warranty expired', changedBy: 'it.manager@scm.gov', timestamp: '2026-11-12 09:15:00', ipAddress: '10.0.0.15' },
  { id: 'CHG-0010', entityType: 'Company', entityId: 'COM-005', action: 'Create', description: 'New partner company registered', changedBy: 'admin@scm.gov', timestamp: '2026-11-11 14:00:00', ipAddress: '10.0.0.12' },
];

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export type UserRole = 'Admin' | 'Manager' | 'Officer' | 'Viewer';

export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
};

export const users: User[] = [
  { id: 'USR-001', name: 'System Administrator', email: 'admin@scm.gov', role: 'Admin', department: 'IT', status: 'Active', lastLogin: '2026-11-16 09:30', createdAt: '2020-01-01' },
  { id: 'USR-002', name: 'IT Manager', email: 'it.manager@scm.gov', role: 'Manager', department: 'IT', status: 'Active', lastLogin: '2026-11-16 08:15', createdAt: '2020-03-15' },
  { id: 'USR-003', name: 'Amit Sharma', email: 'amit.s@scm.gov', role: 'Officer', department: 'IT', status: 'Active', lastLogin: '2026-11-15 17:00', createdAt: '2021-06-10' },
  { id: 'USR-004', name: 'Priya Nair', email: 'priya.n@scm.gov', role: 'Officer', department: 'Finance', status: 'Active', lastLogin: '2026-11-15 16:45', createdAt: '2021-09-20' },
  { id: 'USR-005', name: 'Rajesh Kumar', email: 'rajesh.k@scm.gov', role: 'Officer', department: 'Field Operations', status: 'Active', lastLogin: '2026-11-16 07:50', createdAt: '2022-01-10' },
  { id: 'USR-006', name: 'Sita Gurung', email: 'sita.g@scm.gov', role: 'Viewer', department: 'Admin', status: 'Active', lastLogin: '2026-11-14 15:30', createdAt: '2022-04-05' },
  { id: 'USR-007', name: 'Bikash Rai', email: 'bikash.r@scm.gov', role: 'Manager', department: 'Procurement', status: 'Active', lastLogin: '2026-11-16 09:00', createdAt: '2021-11-15' },
  { id: 'USR-008', name: 'Hari Sharma', email: 'hari.s@scm.gov', role: 'Officer', department: 'Admin', status: 'Inactive', lastLogin: '2026-10-20 14:00', createdAt: '2022-08-12' },
  { id: 'USR-009', name: 'Meera Thapa', email: 'meera.t@scm.gov', role: 'Viewer', department: 'Finance', status: 'Active', lastLogin: '2026-11-15 13:20', createdAt: '2023-02-01' },
  { id: 'USR-010', name: 'Sunita Basnet', email: 'sunita.b@scm.gov', role: 'Manager', department: 'IT', status: 'Suspended', lastLogin: '2026-09-30 10:00', createdAt: '2022-05-18' },
];

// ---------------------------------------------------------------------------
// Reports — summary data
// ---------------------------------------------------------------------------

export const reportSummary = {
  totalDeviceValue: 15800000,
  totalPurchaseValue: 15980000,
  devicesByStatus: {
    Active: 45,
    'In-Stock': 38,
    Assigned: 120,
    'Under-Repair': 12,
    Retired: 33,
  },
  devicesByDepartment: [
    { department: 'IT', count: 68 },
    { department: 'Admin', count: 42 },
    { department: 'Finance', count: 30 },
    { department: 'Field Operations', count: 55 },
    { department: 'Procurement', count: 18 },
    { department: 'HR', count: 35 },
  ],
  devicesByBrand: [
    { brand: 'Dell', count: 72 },
    { brand: 'HP', count: 65 },
    { brand: 'Lenovo', count: 58 },
    { brand: 'Samsung', count: 28 },
    { brand: 'Cisco', count: 15 },
    { brand: 'Logitech', count: 10 },
  ],
};

// ---------------------------------------------------------------------------
// Status options (reusable for filters / dropdowns)
// ---------------------------------------------------------------------------

export const purchaseStatusOptions: { label: string; value: PurchaseStatus }[] = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Ordered', value: 'Ordered' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export const userRoleOptions: { label: string; value: UserRole }[] = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Officer', value: 'Officer' },
  { label: 'Viewer', value: 'Viewer' },
];

export const userStatusOptions: { label: string; value: UserStatus }[] = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Suspended', value: 'Suspended' },
];

export const companyTypeOptions: { label: string; value: CompanyType }[] = [
  { label: 'Vendor', value: 'Vendor' },
  { label: 'Client', value: 'Client' },
  { label: 'Partner', value: 'Partner' },
];


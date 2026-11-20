import api from '@/interceptors/interceptors';
import type {
  CompanyInfoItem,
  CompanyInfoSavePayload,
  CompanyInfoServerSearchRequest,
  ApiListResponse,
  FetchCompanyInfoParams,
  FetchCompanyInfoResult,
  SelectListItem,
} from '../types/company-info.types';

export const RESOURCE_PATH = '/CompanyInfo';
export const API_URL = `${RESOURCE_PATH}/GetAllCompanyInfo`;
export const GET_BY_ID_URL = `${RESOURCE_PATH}/GetCompanyInfoById`;
export const CREATE_URL = `${RESOURCE_PATH}/CreateCompanyInfo`;
export const UPDATE_URL = `${RESOURCE_PATH}/UpdateCompanyInfo`;
export const DELETE_URL = `${RESOURCE_PATH}/DeleteCompanyInfo`;

const STORAGE_KEY = 'company_info';

const DEFAULT_COMPANIES: CompanyInfoItem[] = [
  { id: 'CMP-001', fullName: 'TechSource Pvt. Ltd.', email: 'suresh@techsource.com.np', address: 'Jhamsikhel, Lalitpur', contactNo: '+977-1-4412345', websiteUrl: 'https://techsource.com.np', scmProviderId: 'PRV-101', make: 'Nepal' },
  { id: 'CMP-002', fullName: 'InfoTech Solutions', email: 'meera@infotech.com.np', address: 'Baneshwor, Kathmandu', contactNo: '+977-1-4567890', websiteUrl: 'https://infotech.com.np', scmProviderId: 'PRV-102', make: 'Nepal' },
  { id: 'CMP-003', fullName: 'GovTech Supplies', email: 'hari@govtech.com.np', address: 'Putalisadak, Kathmandu', contactNo: '+977-1-5332211', websiteUrl: 'https://govtech.com.np', scmProviderId: 'PRV-103', make: 'India' },
  { id: 'CMP-004', fullName: 'OfficeMart Nepal', email: 'sita@officemart.com.np', address: 'Asan, Kathmandu', contactNo: '+977-1-4778899', websiteUrl: 'https://officemart.com.np', scmProviderId: 'PRV-104', make: 'Nepal' },
  { id: 'CMP-005', fullName: 'Global Network Systems', email: 'bikash@gns.com.np', address: 'Maharajgunj, Kathmandu', contactNo: '+977-1-5556677', websiteUrl: 'https://gns.com.np', scmProviderId: 'PRV-105', make: 'Japan' },
  { id: 'CMP-006', fullName: 'Ministry of Communication', email: 'ramesh@moc.gov.np', address: 'Singha Durbar, Kathmandu', contactNo: '+977-1-4211000', websiteUrl: 'https://moc.gov.np', scmProviderId: 'PRV-106', make: 'Nepal' },
  { id: 'CMP-007', fullName: 'Nepal Telecom Authority', email: 'sunita@nta.gov.np', address: 'Ramshah Path, Kathmandu', contactNo: '+977-1-4318888', websiteUrl: 'https://nta.gov.np', scmProviderId: 'PRV-107', make: 'Nepal' },
  { id: 'CMP-008', fullName: 'Himalayan Devices Corp', email: 'contact@himalayan.np', address: 'Thamel, Kathmandu', contactNo: '+977-1-4421122', websiteUrl: 'https://himalayan.np', scmProviderId: 'PRV-108', make: 'China' },
  { id: 'CMP-009', fullName: 'Everest IT Logistics', email: 'info@everestit.com', address: 'Tripureshwor, Kathmandu', contactNo: '+977-1-4265544', websiteUrl: 'https://everestit.com', scmProviderId: 'PRV-109', make: 'Nepal' },
  { id: 'CMP-010', fullName: 'Apex Telecommunication Ltd', email: 'support@apextele.com', address: 'Jawalakhel, Lalitpur', contactNo: '+977-1-5543322', websiteUrl: 'https://apextele.com', scmProviderId: 'PRV-110', make: 'Taiwan' },
  { id: 'CMP-011', fullName: 'Smart Hub Distribution', email: 'orders@smarthub.np', address: 'New Road, Kathmandu', contactNo: '+977-1-4228899', websiteUrl: 'https://smarthub.np', scmProviderId: 'PRV-111', make: 'Singapore' },
  { id: 'CMP-012', fullName: 'Lumbini Electronics', email: 'info@lumbini-el.com', address: 'Kupondole, Lalitpur', contactNo: '+977-1-5527788', websiteUrl: 'https://lumbini-el.com', scmProviderId: 'PRV-112', make: 'Nepal' },
  { id: 'CMP-013', fullName: 'Koshi Micro Devices', email: 'sales@koshimicro.com', address: 'Biratnagar, Morang', contactNo: '+977-21-460111', websiteUrl: 'https://koshimicro.com', scmProviderId: 'PRV-113', make: 'Korea' },
  { id: 'CMP-014', fullName: 'Gandaki Tech Works', email: 'admin@gandakitech.com', address: 'Chipledhunga, Pokhara', contactNo: '+977-61-523456', websiteUrl: 'https://gandakitech.com', scmProviderId: 'PRV-114', make: 'Nepal' },
];

function getStoredCompanies(): CompanyInfoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPANIES));
    return DEFAULT_COMPANIES;
  } catch {
    return DEFAULT_COMPANIES;
  }
}

function saveStoredCompanies(items: CompanyInfoItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export async function fetchCompanyInfo(
  params: FetchCompanyInfoParams
): Promise<FetchCompanyInfoResult> {
  const all = getStoredCompanies();
  const search = (params.search ?? '').trim().toLowerCase();
  const filtered = search
    ? all.filter((c) => c.fullName.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.address.toLowerCase().includes(search))
    : all;
  const start = params.start ?? 0;
  const length = params.length ?? 12;
  return {
    items: filtered.slice(start, start + length),
    total: filtered.length,
    filtered: filtered.length,
  };
}

export async function fetchCompanyInfoSelectList(
  _params?: Record<string, unknown>
): Promise<SelectListItem[]> {
  return getStoredCompanies().map((item) => ({ label: item.fullName, value: item.id }));
}

export async function saveCompanyInfo(
  payload: CompanyInfoSavePayload
): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const all = getStoredCompanies();
  const updated = payload.id
    ? all.map((c) => (String(c.id) === String(payload.id) ? payload : c))
    : [{ ...payload, id: `CMP-${Date.now()}` }, ...all];
  saveStoredCompanies(updated);
  return { success: true, message: 'Saved successfully' };
}

export async function deleteCompanyInfo(
  id: number | string
): Promise<{ success: boolean; message?: string }> {
  saveStoredCompanies(getStoredCompanies().filter((c) => String(c.id) !== String(id)));
  return { success: true, message: 'Deleted successfully' };
}

export const companyInfoService = {
  serverSearch: (body: CompanyInfoServerSearchRequest, signal?: AbortSignal) =>
    api.get<ApiListResponse<CompanyInfoItem>>(API_URL, { params: body, signal }),
  save: saveCompanyInfo,
  delete: deleteCompanyInfo,
  getById: (id: number | string) => api.get(`${GET_BY_ID_URL}/${id}`),
  selectList: (params?: Record<string, unknown>) => api.get(API_URL, { params }),
  fetchCompanyInfo,
  fetchCompanyInfoSelectList,
  saveCompanyInfo,
  deleteCompanyInfo,
};

import scmLogo from '@/assets/images/new_scm_logo.png';
import scmCollapsedLogo from '@/assets/images/scm_collapsed.png';

export interface ClientCompanyConfig {
  code: string;
  title: string;
  logo: string;
  collapsedLogo?: string;
  slogan?: string;
}

const imageModules = import.meta.glob<string>('/src/assets/images/*', {
  eager: true,
  import: 'default',
});

function resolveLogoAsset(logoPath: string | undefined, fallback: string): string {
  if (!logoPath) return fallback;
  const trimmed = logoPath.trim();
  if (!trimmed) return fallback;
  if (/^(https?:\/\/|data:|\/)/i.test(trimmed)) return trimmed;

  const normalized = trimmed.replace(/^@\//, '/src/');
  const matchedKey = Object.keys(imageModules).find(
    (key) => key === normalized || key.endsWith(`/${trimmed}`),
  );
  return matchedKey ? imageModules[matchedKey] : fallback;
}

const DEFAULT_COMPANIES: ClientCompanyConfig[] = [
  {
    code: 'SECUGEN',
    title: 'SCM Device Management Admin Portal',
    logo: 'new_scm_logo.png',
    collapsedLogo: 'scm_collapsed.png',
    slogan: 'Biometric Access Control',
  },
];

function parseCompanies(): ClientCompanyConfig[] {
  const raw = import.meta.env.VITE_COMPANIES;
  if (!raw) return DEFAULT_COMPANIES;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to default config if VITE_COMPANIES is malformed
  }
  return DEFAULT_COMPANIES;
}

export function getClientBranding(): ClientCompanyConfig {
  const clientCode = String(import.meta.env.VITE_CLIENT_CODE ?? '').trim().toUpperCase();
  const companies = parseCompanies();
  const matched =
    companies.find((c) => String(c.code ?? '').trim().toUpperCase() === clientCode) ??
    companies[0] ??
    DEFAULT_COMPANIES[0];

  return {
    code: matched.code,
    title: matched.title || 'SCM Device Management Admin Portal',
    logo: resolveLogoAsset(matched.logo, scmLogo),
    collapsedLogo: resolveLogoAsset(matched.collapsedLogo ?? matched.logo, scmCollapsedLogo),
    slogan: matched.slogan ?? 'Biometric Access Control',
  };
}

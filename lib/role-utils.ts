export const ROLE_USER = 'USER';
export const ROLE_SECURITY = 'SECURITY';
export const ROLE_ACCOUNTANT = 'ACCOUNTANT';
export const ROLE_SALES = 'SALES';
export const ROLE_OWNER = 'OWNER';
export const ROLE_ADMIN = 'ADMIN';

export function normalizeRole(role?: string) {
  return (role || ROLE_USER).toUpperCase();
}

export function isOwnerRole(role?: string) {
  const normalized = normalizeRole(role);
  return normalized === ROLE_OWNER || normalized === ROLE_ADMIN;
}

export function isAccountantRole(role?: string) {
  const normalized = normalizeRole(role);
  return normalized === ROLE_ACCOUNTANT || normalized === ROLE_OWNER || normalized === ROLE_ADMIN;
}

export function isSecurityRole(role?: string) {
  const normalized = normalizeRole(role);
  return normalized === ROLE_SECURITY || normalized === ROLE_OWNER || normalized === ROLE_ADMIN;
}

export function isSalesRole(role?: string) {
  const normalized = normalizeRole(role);
  return normalized === ROLE_SALES || normalized === ROLE_OWNER || normalized === ROLE_ADMIN;
}

export function formatRoleLabel(role?: string) {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case ROLE_OWNER:
      return 'Owner';
    case ROLE_ADMIN:
      return 'Admin';
    case ROLE_SECURITY:
      return 'Security';
    case ROLE_ACCOUNTANT:
      return 'Accountant';
    case ROLE_SALES:
      return 'Sales';
    default:
      return 'User';
  }
}

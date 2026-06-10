export type BandStreamUserRole = 'OWNER' | 'ADMIN' | 'CUSTOMER' | 'READER';

export const roleHierarchy: { [key in BandStreamUserRole]: BandStreamUserRole[] } = {
  OWNER: ['OWNER', 'ADMIN', 'CUSTOMER', 'READER'],
  ADMIN: ['ADMIN', 'CUSTOMER', 'READER'],
  CUSTOMER: ['CUSTOMER', 'READER'],
  READER: ['READER']
};

export function hasBandStreamPermission(userRole: BandStreamUserRole | undefined, requiredRole: BandStreamUserRole): boolean {
  if (!userRole) return false;
  return roleHierarchy[userRole]?.includes(requiredRole) ?? false;
} 
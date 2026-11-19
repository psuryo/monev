/**
 * RBAC Helper utilities for checking user roles and permissions
 */

export function getUserRoles(user: any): string[] {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles;
  }
  if (user.role) {
    return [String(user.role).toUpperCase()];
  }
  return ['DOSEN'];
}

export function hasRole(user: any, role: string): boolean {
  const roles = getUserRoles(user);
  return roles.includes(role.toUpperCase());
}

export function isAdmin(user: any): boolean {
  return hasRole(user, 'ADMIN');
}

export function isMonev(user: any): boolean {
  return hasRole(user, 'MONEV') || isAdmin(user);
}

export function isKaprodi(user: any): boolean {
  return hasRole(user, 'KAPRODI') || isAdmin(user);
}

export function isDosen(user: any): boolean {
  return hasRole(user, 'DOSEN') || isAdmin(user);
}

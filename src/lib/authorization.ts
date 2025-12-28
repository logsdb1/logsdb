/**
 * Role-based authorization system
 */

export type Role = "user" | "contributor" | "admin";

export interface Permission {
  canUploadLogs: boolean;
  canContribute: boolean;
  canCreateNewTechnologies: boolean;
  canModerateContent: boolean;
  canAccessAdmin: boolean;
}

const ROLE_PERMISSIONS: Record<Role, Permission> = {
  user: {
    canUploadLogs: true,
    canContribute: false,
    canCreateNewTechnologies: false,
    canModerateContent: false,
    canAccessAdmin: false,
  },
  contributor: {
    canUploadLogs: true,
    canContribute: true,
    canCreateNewTechnologies: true,
    canModerateContent: false,
    canAccessAdmin: false,
  },
  admin: {
    canUploadLogs: true,
    canContribute: true,
    canCreateNewTechnologies: true,
    canModerateContent: true,
    canAccessAdmin: true,
  },
};

// Admin users (store in env or database in production)
const ADMIN_USERS = process.env.ADMIN_GITHUB_USERNAMES?.split(",").map((u) =>
  u.trim().toLowerCase()
) || [];
const CONTRIBUTOR_USERS = process.env.CONTRIBUTOR_GITHUB_USERNAMES?.split(
  ","
).map((u) => u.trim().toLowerCase()) || [];

/**
 * Get user role based on GitHub username
 */
export function getUserRole(username: string | null | undefined): Role {
  if (!username) return "user";
  const lowerUsername = username.toLowerCase();
  if (ADMIN_USERS.includes(lowerUsername)) return "admin";
  if (CONTRIBUTOR_USERS.includes(lowerUsername)) return "contributor";
  return "user";
}

/**
 * Get permissions for a role
 */
export function getPermissions(role: Role): Permission {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: Role,
  permission: keyof Permission
): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

/**
 * Check if username has a specific permission
 */
export function userHasPermission(
  username: string | null | undefined,
  permission: keyof Permission
): boolean {
  const role = getUserRole(username);
  return hasPermission(role, permission);
}

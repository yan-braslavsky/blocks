/**
 * User roles and permissions for Blocks MVP
 * Defines role-based access control constants
 */

/**
 * Available user roles in the system
 */
export enum UserRole {
  /** System administrator with full access */
  ADMIN = 'admin',
  /** Regular user with standard access */
  USER = 'user',
  /** Read-only viewer with limited access */
  VIEWER = 'viewer'
}

/**
 * Available permissions in the system
 */
export enum Permission {
  /** Read access to cost data */
  READ_COSTS = 'read:costs',
  /** Write access to cost data */
  WRITE_COSTS = 'write:costs',
  /** Read access to recommendations */
  READ_RECOMMENDATIONS = 'read:recommendations',
  /** Write access to recommendations */
  WRITE_RECOMMENDATIONS = 'write:recommendations',
  /** Access to export functionality */
  EXPORT_DATA = 'export:data',
  /** Access to user management */
  MANAGE_USERS = 'manage:users',
  /** Access to system configuration */
  MANAGE_SYSTEM = 'manage:system'
}

/**
 * Type representing a user with role information
 */
export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role definition with associated permissions
 */
export interface RoleDefinition {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

/**
 * Predefined role configurations
 */
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    permissions: [
      Permission.READ_COSTS,
      Permission.WRITE_COSTS,
      Permission.READ_RECOMMENDATIONS,
      Permission.WRITE_RECOMMENDATIONS,
      Permission.EXPORT_DATA,
      Permission.MANAGE_USERS,
      Permission.MANAGE_SYSTEM
    ],
    description: 'Full system access with administrative privileges'
  },
  [UserRole.USER]: {
    role: UserRole.USER,
    permissions: [
      Permission.READ_COSTS,
      Permission.WRITE_COSTS,
      Permission.READ_RECOMMENDATIONS,
      Permission.WRITE_RECOMMENDATIONS,
      Permission.EXPORT_DATA
    ],
    description: 'Standard user with cost management access'
  },
  [UserRole.VIEWER]: {
    role: UserRole.VIEWER,
    permissions: [
      Permission.READ_COSTS,
      Permission.READ_RECOMMENDATIONS
    ],
    description: 'Read-only access to cost data and recommendations'
  }
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: UserWithRole, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const roleDefinition = ROLE_DEFINITIONS[role];
  return roleDefinition.permissions.includes(permission);
}

/**
 * Get all permissions for a given role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_DEFINITIONS[role].permissions;
}

/**
 * Check if a role is higher or equal in hierarchy
 */
export function isRoleEqualOrHigher(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy = {
    [UserRole.VIEWER]: 0,
    [UserRole.USER]: 1,
    [UserRole.ADMIN]: 2
  };
  
  return hierarchy[userRole] >= hierarchy[requiredRole];
}
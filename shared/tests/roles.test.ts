/**
 * Unit tests for user roles and permissions
 */
import { describe, it, expect } from 'vitest';
import {
  UserRole,
  Permission,
  ROLE_DEFINITIONS,
  hasPermission,
  roleHasPermission,
  getPermissionsForRole,
  isRoleEqualOrHigher,
  type UserWithRole
} from '../src/roles';

describe('User Roles and Permissions', () => {
  describe('UserRole enum', () => {
    it('should have all expected roles', () => {
      expect(Object.values(UserRole)).toEqual(['admin', 'user', 'viewer']);
    });
  });

  describe('Permission enum', () => {
    it('should have all expected permissions', () => {
      const expectedPermissions = [
        'read:costs',
        'write:costs',
        'read:recommendations',
        'write:recommendations',
        'export:data',
        'manage:users',
        'manage:system'
      ];
      expect(Object.values(Permission)).toEqual(expectedPermissions);
    });
  });

  describe('ROLE_DEFINITIONS', () => {
    it('should define all roles', () => {
      expect(Object.keys(ROLE_DEFINITIONS)).toEqual(Object.values(UserRole));
    });

    it('should give admin all permissions', () => {
      const adminRole = ROLE_DEFINITIONS[UserRole.ADMIN];
      expect(adminRole.permissions).toEqual(Object.values(Permission));
    });

    it('should give user limited permissions', () => {
      const userRole = ROLE_DEFINITIONS[UserRole.USER];
      expect(userRole.permissions).toContain(Permission.READ_COSTS);
      expect(userRole.permissions).toContain(Permission.WRITE_COSTS);
      expect(userRole.permissions).not.toContain(Permission.MANAGE_USERS);
      expect(userRole.permissions).not.toContain(Permission.MANAGE_SYSTEM);
    });

    it('should give viewer only read permissions', () => {
      const viewerRole = ROLE_DEFINITIONS[UserRole.VIEWER];
      expect(viewerRole.permissions).toEqual([
        Permission.READ_COSTS,
        Permission.READ_RECOMMENDATIONS
      ]);
    });
  });

  describe('hasPermission', () => {
    const mockUser: UserWithRole = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.USER,
      permissions: [Permission.READ_COSTS, Permission.WRITE_COSTS],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should return true for permissions user has', () => {
      expect(hasPermission(mockUser, Permission.READ_COSTS)).toBe(true);
      expect(hasPermission(mockUser, Permission.WRITE_COSTS)).toBe(true);
    });

    it('should return false for permissions user does not have', () => {
      expect(hasPermission(mockUser, Permission.MANAGE_USERS)).toBe(false);
      expect(hasPermission(mockUser, Permission.MANAGE_SYSTEM)).toBe(false);
    });
  });

  describe('roleHasPermission', () => {
    it('should return true for valid role-permission combinations', () => {
      expect(roleHasPermission(UserRole.ADMIN, Permission.MANAGE_USERS)).toBe(true);
      expect(roleHasPermission(UserRole.USER, Permission.READ_COSTS)).toBe(true);
      expect(roleHasPermission(UserRole.VIEWER, Permission.READ_COSTS)).toBe(true);
    });

    it('should return false for invalid role-permission combinations', () => {
      expect(roleHasPermission(UserRole.VIEWER, Permission.WRITE_COSTS)).toBe(false);
      expect(roleHasPermission(UserRole.USER, Permission.MANAGE_USERS)).toBe(false);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return correct permissions for each role', () => {
      const adminPermissions = getPermissionsForRole(UserRole.ADMIN);
      expect(adminPermissions).toHaveLength(7);
      expect(adminPermissions).toContain(Permission.MANAGE_SYSTEM);

      const userPermissions = getPermissionsForRole(UserRole.USER);
      expect(userPermissions).toHaveLength(5);
      expect(userPermissions).not.toContain(Permission.MANAGE_USERS);

      const viewerPermissions = getPermissionsForRole(UserRole.VIEWER);
      expect(viewerPermissions).toHaveLength(2);
      expect(viewerPermissions).toEqual([
        Permission.READ_COSTS,
        Permission.READ_RECOMMENDATIONS
      ]);
    });
  });

  describe('isRoleEqualOrHigher', () => {
    it('should return true for same roles', () => {
      expect(isRoleEqualOrHigher(UserRole.ADMIN, UserRole.ADMIN)).toBe(true);
      expect(isRoleEqualOrHigher(UserRole.USER, UserRole.USER)).toBe(true);
      expect(isRoleEqualOrHigher(UserRole.VIEWER, UserRole.VIEWER)).toBe(true);
    });

    it('should return true for higher roles', () => {
      expect(isRoleEqualOrHigher(UserRole.ADMIN, UserRole.USER)).toBe(true);
      expect(isRoleEqualOrHigher(UserRole.ADMIN, UserRole.VIEWER)).toBe(true);
      expect(isRoleEqualOrHigher(UserRole.USER, UserRole.VIEWER)).toBe(true);
    });

    it('should return false for lower roles', () => {
      expect(isRoleEqualOrHigher(UserRole.USER, UserRole.ADMIN)).toBe(false);
      expect(isRoleEqualOrHigher(UserRole.VIEWER, UserRole.ADMIN)).toBe(false);
      expect(isRoleEqualOrHigher(UserRole.VIEWER, UserRole.USER)).toBe(false);
    });
  });

  describe('Type definitions', () => {
    it('should accept valid UserWithRole objects', () => {
      const user: UserWithRole = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        permissions: [Permission.READ_COSTS],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(user.role).toBe(UserRole.USER);
      expect(user.permissions).toContain(Permission.READ_COSTS);
    });
  });
});
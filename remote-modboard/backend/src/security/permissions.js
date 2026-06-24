'use strict';

const PERMISSION_KEY_MAX_LENGTH = 120;
const TARGET_VALUE_MAX_LENGTH = 160;
const SAFE_PERMISSION_KEY = /^[a-z0-9][a-z0-9._:-]*$/i;
const SAFE_TARGET_VALUE = /^[a-z0-9][a-z0-9._:-]*$/i;

function normalizePermissionKey(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.length > PERMISSION_KEY_MAX_LENGTH) return null;
  if (!SAFE_PERMISSION_KEY.test(normalized)) return null;
  return normalized;
}

function normalizeTargetValue(value, fallback) {
  if (typeof value !== 'string' || value.trim() === '') return fallback || null;
  const normalized = value.trim().toLowerCase();
  if (normalized.length > TARGET_VALUE_MAX_LENGTH) return null;
  if (!SAFE_TARGET_VALUE.test(normalized)) return null;
  return normalized;
}

function evaluatePermissionRows({ rolePermissions, modulePermissions, permissionKey, targetType, targetKey }) {
  const normalizedPermission = normalizePermissionKey(permissionKey);
  const normalizedTargetType = normalizeTargetValue(targetType, 'global');
  const normalizedTargetKey = normalizeTargetValue(targetKey, '*');

  const roleRows = Array.isArray(rolePermissions) ? rolePermissions : [];
  const moduleRows = Array.isArray(modulePermissions) ? modulePermissions : [];

  const relevantRoleRows = roleRows.filter((row) => {
    return normalizePermissionKey(row.permission_key) === normalizedPermission;
  });

  const relevantModuleRows = moduleRows.filter((row) => {
    if (normalizePermissionKey(row.permission_key) !== normalizedPermission) return false;
    const rowTargetType = normalizeTargetValue(row.target_type, 'global');
    const rowTargetKey = normalizeTargetValue(row.target_key, '*');

    if (rowTargetType === 'global' && rowTargetKey === '*') return true;
    if (rowTargetType !== normalizedTargetType) return false;
    return rowTargetKey === '*' || rowTargetKey === normalizedTargetKey;
  });

  const relevantRows = [
    ...relevantRoleRows.map((row) => ({ source: 'role_permission', ...row })),
    ...relevantModuleRows.map((row) => ({ source: 'module_permission', ...row }))
  ];

  const deniedRows = relevantRows.filter((row) => normalizeEffect(row.effect) === 'deny');
  const allowedRows = relevantRows.filter((row) => normalizeEffect(row.effect) === 'allow');

  if (deniedRows.length > 0) {
    return {
      allowed: false,
      effect: 'deny',
      reason: 'explicit_deny',
      matchedAllowCount: allowedRows.length,
      matchedDenyCount: deniedRows.length
    };
  }

  if (allowedRows.length > 0) {
    return {
      allowed: true,
      effect: 'allow',
      reason: 'explicit_allow',
      matchedAllowCount: allowedRows.length,
      matchedDenyCount: 0
    };
  }

  return {
    allowed: false,
    effect: 'none',
    reason: 'no_matching_permission',
    matchedAllowCount: 0,
    matchedDenyCount: 0
  };
}

function normalizeEffect(value) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'deny') return 'deny';
  if (normalized === 'allow') return 'allow';
  return 'none';
}

module.exports = {
  PERMISSION_KEY_MAX_LENGTH,
  TARGET_VALUE_MAX_LENGTH,
  normalizePermissionKey,
  normalizeTargetValue,
  evaluatePermissionRows
};

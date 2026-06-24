'use strict';

const REQUIRED_LOCK_DRAFT_FIELDS = Object.freeze([
  'resourceType',
  'resourceKey',
  'actorUserUid',
  'actorLogin',
  'lockScope',
  'reason'
]);

const SUPPORTED_LOCK_OPERATIONS = Object.freeze([
  'acquire',
  'heartbeat',
  'release',
  'force_takeover'
]);

function buildAdminLockWriteDiagnostic() {
  const validDraft = {
    resourceType: 'admin_user',
    resourceKey: 'admin_user:user:<userUid>',
    actorUserUid: 'user_forrestcgn',
    actorLogin: 'ForrestCGN',
    lockScope: 'admin_users',
    reason: 'diagnostic_only_no_write'
  };

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_admin_lock_write_diagnostic',
    moduleBuild: 'RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN',
    statusApiVersion: 'rdap_admin_users9.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    helperPrepared: true,
    helperEnabledForRealWrites: false,
    lockWriteEnabled: false,
    lockAcquireEnabled: false,
    lockHeartbeatEnabled: false,
    lockReleaseEnabled: false,
    lockForceTakeoverEnabled: false,
    requiredFields: REQUIRED_LOCK_DRAFT_FIELDS.slice(),
    supportedOperations: SUPPORTED_LOCK_OPERATIONS.slice(),
    examples: {
      missingLockFields: buildAdminLockOperationDraft({ operation: 'acquire', input: {} }),
      validLockDraftButDisabled: buildAdminLockOperationDraft({ operation: 'acquire', input: validDraft }),
      acquireBlocked: blockAdminLockOperation({ operation: 'acquire', input: validDraft }),
      heartbeatBlocked: blockAdminLockOperation({ operation: 'heartbeat', input: validDraft }),
      releaseBlocked: blockAdminLockOperation({ operation: 'release', input: validDraft }),
      forceTakeoverBlocked: blockAdminLockOperation({ operation: 'force_takeover', input: validDraft })
    },
    safety: {
      helperPrepared: true,
      helperExecutesWrites: false,
      helperCreatesRoutes: false,
      helperTouchesDatabase: false,
      helperBypassesPermissions: false,
      lockAcquireWritesEnabled: false,
      lockHeartbeatWritesEnabled: false,
      lockReleaseWritesEnabled: false,
      lockForceTakeoverWritesEnabled: false,
      productiveWritesRemainDisabled: true
    },
    notes: [
      'Dieser Helper baut und prueft nur Lock-Drafts fuer spaetere Admin-User-Writes.',
      'Dieser Helper erstellt, verlaengert, uebernimmt oder loest keine Locks.',
      'Dieser Helper schreibt nicht in die Datenbank und legt keine Route an.',
      'Produktive Admin-Writes bleiben bis zu einem spaeteren separaten Step blockiert.'
    ]
  };
}

function buildAdminLockOperationDraft({ operation, input } = {}) {
  const normalizedOperation = normalizeOperation(operation);
  const source = normalizeInput(input);
  const missingFields = REQUIRED_LOCK_DRAFT_FIELDS.filter((field) => !hasMeaningfulValue(source[field]));
  const valid = missingFields.length === 0 && SUPPORTED_LOCK_OPERATIONS.includes(normalizedOperation);

  return {
    ok: valid,
    service: 'remote-modboard',
    module: 'remote_admin_lock_write',
    moduleBuild: 'RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN',
    statusApiVersion: 'rdap_admin_users9.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    helperPrepared: true,
    helperEnabledForRealWrites: false,
    operation: normalizedOperation,
    operationSupported: SUPPORTED_LOCK_OPERATIONS.includes(normalizedOperation),
    requiredFields: REQUIRED_LOCK_DRAFT_FIELDS.slice(),
    missingFields,
    draftValid: valid,
    lockDraft: valid ? buildPublicLockDraft(source, normalizedOperation) : null,
    reason: valid ? 'lock_draft_valid_but_writes_disabled' : 'lock_draft_missing_required_fields'
  };
}

function blockAdminLockOperation({ operation, input } = {}) {
  const draft = buildAdminLockOperationDraft({ operation, input });

  return {
    ...draft,
    ok: false,
    status: 423,
    error: buildBlockedError(draft.operation),
    lockWriteEnabled: false,
    lockAcquireEnabled: false,
    lockHeartbeatEnabled: false,
    lockReleaseEnabled: false,
    lockForceTakeoverEnabled: false,
    reason: draft.draftValid
      ? 'lock_operation_blocked_by_step_scope'
      : draft.reason,
    hint: 'RDAP_ADMIN_USERS9 bereitet Locking nur vor. Es werden keine Locks geschrieben, verlaengert, uebernommen oder freigegeben.'
  };
}

function buildPublicLockDraft(source, operation) {
  return {
    operation,
    resourceType: String(source.resourceType).trim(),
    resourceKey: String(source.resourceKey).trim(),
    actorUserUid: String(source.actorUserUid).trim(),
    actorLogin: String(source.actorLogin).trim(),
    lockScope: String(source.lockScope).trim(),
    reason: String(source.reason).trim(),
    ttlSecondsPlanned: 120,
    heartbeatSecondsPlanned: 30,
    statusPlanned: operation === 'release' ? 'released' : 'active',
    createdAtPlanned: '<server_time>',
    expiresAtPlanned: '<server_time_plus_ttl>',
    databaseWriteEnabled: false
  };
}

function normalizeInput(input) {
  if (!input || typeof input !== 'object') {
    return {};
  }

  if (input.body && typeof input.body === 'object') {
    return input.body;
  }

  if (input.query && typeof input.query === 'object') {
    return input.query;
  }

  return input;
}

function normalizeOperation(operation) {
  return String(operation || 'acquire').trim().toLowerCase();
}

function hasMeaningfulValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function buildBlockedError(operation) {
  switch (operation) {
    case 'heartbeat':
      return 'lock_heartbeat_disabled';
    case 'release':
      return 'lock_release_disabled';
    case 'force_takeover':
      return 'lock_force_takeover_disabled';
    case 'acquire':
    default:
      return 'lock_acquire_disabled';
  }
}

module.exports = {
  REQUIRED_LOCK_DRAFT_FIELDS,
  SUPPORTED_LOCK_OPERATIONS,
  buildAdminLockWriteDiagnostic,
  buildAdminLockOperationDraft,
  blockAdminLockOperation
};

'use strict';

const REQUIRED_AUDIT_FIELDS = Object.freeze([
  'actorUserUid',
  'actorLogin',
  'action',
  'resourceType',
  'resourceKey',
  'status',
  'reason'
]);

const BLOCKED_METADATA_KEYS = Object.freeze([
  'oauth_code',
  'access_token',
  'refresh_token',
  'token',
  'cookie',
  'session_id',
  'sessionId',
  'password',
  'secret',
  'client_secret',
  'env',
  'rawBody',
  'rawPayload'
]);

function buildAdminAuditDraft(input = {}) {
  const source = normalizeInput(input);
  const missingFields = REQUIRED_AUDIT_FIELDS.filter((field) => isBlank(source[field]));
  const unsafeMetadataKeys = findUnsafeMetadataKeys(source.safeMetadata || source.safe_metadata || {});
  const validDraft = missingFields.length === 0 && unsafeMetadataKeys.length === 0;

  return {
    ok: validDraft,
    service: 'remote-modboard',
    module: 'remote_admin_audit_write',
    moduleBuild: 'RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN',
    statusApiVersion: 'rdap_admin_users8.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    auditHelperPrepared: true,
    auditWriteEnabled: false,
    auditInsertEnabled: false,
    auditUpdateEnabled: false,
    writesStillBlocked: true,
    draftValid: validDraft,
    missingFields,
    unsafeMetadataKeys,
    requiredFields: REQUIRED_AUDIT_FIELDS.slice(),
    blockedMetadataKeys: BLOCKED_METADATA_KEYS.slice(),
    draft: validDraft ? buildSafeDraft(source) : null,
    reason: validDraft ? 'audit_draft_valid_but_writes_disabled' : 'audit_draft_invalid_or_unsafe',
    safety: {
      helperPrepared: true,
      helperExecutesWrites: false,
      helperCreatesRoutes: false,
      helperTouchesDatabase: false,
      helperLogsSecrets: false,
      helperLogsRawPayloads: false,
      productiveWritesRemainDisabled: true
    }
  };
}

function requireAdminAuditDraft(input = {}) {
  const result = buildAdminAuditDraft(input);

  if (result.draftValid) {
    return {
      ...result,
      ok: true,
      status: 200,
      hint: 'Audit-Draft ist formal gueltig, aber Audit-Writes bleiben in diesem Step deaktiviert.'
    };
  }

  return {
    ...result,
    ok: false,
    status: 400,
    error: 'audit_draft_invalid_or_unsafe',
    hint: 'Produktive Admin-Writes brauchen spaeter einen vollstaendigen, sicheren Audit-Draft. In diesem Step bleiben Writes trotzdem deaktiviert.'
  };
}

function buildAdminAuditWriteDiagnostic() {
  const validExample = {
    actorUserUid: 'user_forrestcgn_example',
    actorLogin: 'ForrestCGN',
    action: 'admin.users.example.disabled',
    resourceType: 'admin_user',
    resourceKey: 'admin_user:user:<userUid>',
    status: 'blocked_by_step_scope',
    reason: 'RDAP8 Beispiel: Audit-Draft pruefen, aber nicht schreiben.',
    safeMetadata: {
      step: 'RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN',
      writeEnabled: false,
      exampleOnly: true
    }
  };

  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_admin_audit_write_diagnostic',
    moduleBuild: 'RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN',
    statusApiVersion: 'rdap_admin_users8.v1',
    readOnly: true,
    writeEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    helperPrepared: true,
    writeEnabledForRealAudit: false,
    auditWriteEnabled: false,
    auditInsertEnabled: false,
    auditUpdateEnabled: false,
    requiredFields: REQUIRED_AUDIT_FIELDS.slice(),
    blockedMetadataKeys: BLOCKED_METADATA_KEYS.slice(),
    examples: {
      missingFields: requireAdminAuditDraft({}),
      unsafeMetadata: requireAdminAuditDraft({
        ...validExample,
        safeMetadata: {
          access_token: 'blocked-example-token',
          exampleOnly: true
        }
      }),
      validDraftButBlocked: requireAdminAuditDraft(validExample)
    },
    notes: [
      'Dieser Helper baut und prueft nur sichere Audit-Drafts.',
      'Dieser Helper fuehrt keine Audit-Inserts oder Updates aus.',
      'Dieser Helper legt keine Route an und schreibt nicht in die Datenbank.',
      'Secrets, Tokens, Cookies, ENV-Werte, Passwoerter und Rohpayloads duerfen nicht geloggt werden.',
      'Produktive Admin-Writes bleiben bis zu einem spaeteren separaten Step blockiert.'
    ]
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

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function findUnsafeMetadataKeys(metadata) {
  const result = [];
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return result;
  }

  const blocked = BLOCKED_METADATA_KEYS.map((key) => String(key).toLowerCase());
  walkObject(metadata, '', (path) => {
    const leaf = path.split('.').pop().toLowerCase();
    if (blocked.includes(leaf)) {
      result.push(path);
    }
  });

  return result;
}

function walkObject(value, prefix, onKey) {
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    onKey(path);
    if (value[key] && typeof value[key] === 'object' && !Array.isArray(value[key])) {
      walkObject(value[key], path, onKey);
    }
  }
}

function buildSafeDraft(source) {
  return {
    actorUserUid: String(source.actorUserUid).trim(),
    actorLogin: String(source.actorLogin).trim(),
    action: String(source.action).trim(),
    resourceType: String(source.resourceType).trim(),
    resourceKey: String(source.resourceKey).trim(),
    status: String(source.status).trim(),
    reason: String(source.reason).trim(),
    safeMetadata: source.safeMetadata || source.safe_metadata || {},
    createdAt: null,
    completedAt: null,
    willWriteToDatabase: false
  };
}

module.exports = {
  REQUIRED_AUDIT_FIELDS,
  BLOCKED_METADATA_KEYS,
  buildAdminAuditDraft,
  requireAdminAuditDraft,
  buildAdminAuditWriteDiagnostic
};

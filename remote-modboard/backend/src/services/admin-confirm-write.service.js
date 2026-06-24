'use strict';

const ACCEPTED_CONFIRM_KEYS = Object.freeze([
  'confirmWrite',
  'confirm_write'
]);

const ACCEPTED_CONFIRM_VALUES = Object.freeze([
  true,
  'true',
  '1',
  1
]);

function evaluateAdminConfirmWrite(input = {}) {
  const source = normalizeInput(input);
  const found = findConfirmValue(source);
  const accepted = isAcceptedConfirmValue(found.value);

  return {
    ok: accepted,
    service: 'remote-modboard',
    module: 'remote_admin_confirm_write',
    moduleBuild: 'RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED',
    statusApiVersion: 'rdap_admin_users7.v1',
    readOnly: true,
    writeEnabled: false,
    databaseWriteEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    confirmWriteRequired: true,
    confirmWriteAccepted: accepted,
    confirmWriteKey: found.key,
    confirmWriteValueType: found.exists ? typeof found.value : null,
    reason: accepted ? 'confirm_write_accepted_but_writes_disabled' : 'confirm_write_required',
    acceptedKeys: ACCEPTED_CONFIRM_KEYS.slice(),
    acceptedValues: ACCEPTED_CONFIRM_VALUES.slice(),
    safety: {
      helperPrepared: true,
      helperExecutesWrites: false,
      helperCreatesRoutes: false,
      helperTouchesDatabase: false,
      helperBypassesPermissions: false,
      productiveWritesRemainDisabled: true
    }
  };
}

function requireAdminConfirmWrite(input = {}) {
  const result = evaluateAdminConfirmWrite(input);

  if (result.confirmWriteAccepted) {
    return result;
  }

  return {
    ...result,
    ok: false,
    status: 400,
    error: 'confirm_write_required',
    hint: 'Produktive Admin-Writes brauchen spaeter confirmWrite=true oder confirm_write=true. In diesem Step bleiben Writes trotzdem deaktiviert.'
  };
}

function buildAdminConfirmWriteDiagnostic() {
  return {
    ok: true,
    service: 'remote-modboard',
    module: 'remote_admin_confirm_write_diagnostic',
    moduleBuild: 'RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED',
    statusApiVersion: 'rdap_admin_users7.v1',
    readOnly: true,
    writeEnabled: false,
    productiveWritesEnabled: false,
    writesStillBlocked: true,
    helperPrepared: true,
    helperEnabledForRealWrites: false,
    acceptedKeys: ACCEPTED_CONFIRM_KEYS.slice(),
    acceptedValues: ACCEPTED_CONFIRM_VALUES.slice(),
    examples: {
      missingConfirm: requireAdminConfirmWrite({}),
      confirmWriteTrue: requireAdminConfirmWrite({ confirmWrite: true }),
      confirmWriteStringTrue: requireAdminConfirmWrite({ confirm_write: 'true' }),
      confirmWriteOne: requireAdminConfirmWrite({ confirmWrite: '1' })
    },
    notes: [
      'Dieser Helper prueft nur Confirm-Write-Eingaben.',
      'Dieser Helper fuehrt keine produktiven Writes aus.',
      'Dieser Helper legt keine Route an und schreibt nicht in die Datenbank.',
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

function findConfirmValue(source) {
  for (const key of ACCEPTED_CONFIRM_KEYS) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return { exists: true, key, value: source[key] };
    }
  }

  return { exists: false, key: null, value: undefined };
}

function isAcceptedConfirmValue(value) {
  return ACCEPTED_CONFIRM_VALUES.some((accepted) => accepted === value);
}

module.exports = {
  ACCEPTED_CONFIRM_KEYS,
  ACCEPTED_CONFIRM_VALUES,
  evaluateAdminConfirmWrite,
  requireAdminConfirmWrite,
  buildAdminConfirmWriteDiagnostic
};

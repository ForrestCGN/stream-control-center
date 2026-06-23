'use strict';

function buildSafetyBlock() {
  return Object.freeze({
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authEnabled: false,
    sessionsEnabled: false,
    agentRuntimeEnabled: false,
    agentActionsEnabled: false,
    obsControlEnabled: false,
    soundControlEnabled: false,
    overlayControlEnabled: false,
    commandControlEnabled: false,
    channelpointsControlEnabled: false,
    mediaWriteEnabled: false,
    textConfigWriteEnabled: false,
    databaseWriteEnabled: false,
    localSqliteAccessEnabled: false,
    freeShellCommandsEnabled: false,
    freeFileCommandsEnabled: false,
    freeProcessCommandsEnabled: false,
    freeUrlExecutionEnabled: false,
    secretsInFrontend: false,
    secretsLogged: false
  });
}

module.exports = { buildSafetyBlock };

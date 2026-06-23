'use strict';

function buildSafetyBlock() {
  return Object.freeze({
    readOnly: true,
    writeEnabled: false,
    migrationEnabled: false,
    authPrepared: true,
    authEnabled: false,
    oauthPrepared: true,
    oauthEnabled: false,
    twitchOAuthPrepared: true,
    twitchOAuthEnabled: false,
    oauthStartRouteEnabled: false,
    oauthCallbackRouteEnabled: false,
    sessionsEnabled: false,
    sessionCreationEnabled: false,
    sessionCookieWriteEnabled: false,
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

# RDAP8B Permission Resolver Live Deploy/Test Docs

Stand: RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS
Datum: 2026-06-24

## Ziel

RDAP8B dokumentiert den Live-Deploy und Live-Test von RDAP8A auf dem Webserver.

RDAP8A stellt den read-only Permission-Resolver fuer das Remote-Modboard bereit. Der Resolver ist nur Diagnose/Vorbereitung fuer spaetere serverseitige Permission-Middleware.

Wichtig: Auch nach RDAP8B bleibt alles produktiv read-only. Es wurde kein Login aktiviert, kein Twitch-OAuth aktiviert, kein Cookie gesetzt, keine Session erzeugt, keine DB-Schreibaktion ausgefuehrt und keine Agent-Action aktiviert.

## Ausgangsstand

Vor RDAP8B war in GitHub/dev vorbereitet:

```text
RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC
```

Wichtige RDAP8A-Dateien:

```text
remote-modboard/backend/package.json
remote-modboard/backend/README.md
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/security/permissions.js
docs/current/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC.md
```

## Deploy

Deploy wurde auf `web.cgn.community` aus GitHub/dev ausgefuehrt.

```text
Deploy-Clone: /opt/stream-control-center/_deploy_tmp/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_20260624_080242
Live-Ziel:    /opt/stream-control-center/remote-modboard/backend
Service:      scc-remote-modboard.service
```

Backup:

```text
/var/backups/stream-control-center/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_remote-modboard-backend_20260624_080242.tar.gz
```

Server-Ordnerregel wurde eingehalten:

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Backups:             /var/backups/stream-control-center/
```

Es wurden keine neuen RDAP-Arbeitsordner oder Backups unter `/root` angelegt.

## Deploy-Befehle / Ablauf

Ausgefuehrt wurde sinngemaess:

```bash
git clone --branch dev --depth 1 https://github.com/ForrestCGN/stream-control-center.git "/opt/stream-control-center/_deploy_tmp/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_20260624_080242"
tar -czf "/var/backups/stream-control-center/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_remote-modboard-backend_20260624_080242.tar.gz" -C "/opt/stream-control-center/remote-modboard" "backend"
rsync -a --delete --exclude ".env" --exclude "node_modules" "/opt/stream-control-center/_deploy_tmp/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_20260624_080242/remote-modboard/backend/" "/opt/stream-control-center/remote-modboard/backend/"
cd "/opt/stream-control-center/remote-modboard/backend"
npm install --omit=dev
npm run check
systemctl restart scc-remote-modboard.service
```

## Syntaxcheck

`npm run check` war erfolgreich.

Geprueft wurden u. a.:

```text
server.js
src/app.js
src/routes/health.routes.js
src/routes/status.routes.js
src/routes/routes.routes.js
src/routes/auth-model.routes.js
src/routes/auth-status.routes.js
src/routes/auth-twitch.routes.js
src/services/config.service.js
src/services/db-health.service.js
src/services/db.service.js
src/services/auth-db-read.service.js
src/services/auth-session-read.service.js
src/services/auth-status.service.js
src/services/auth-permission-read.service.js
src/security/permissions.js
src/security/safety.js
```

## Service-Status

Bestaetigt:

```text
scc-remote-modboard.service: active
Listen intern: 127.0.0.1:3010
```

## Live-Test: Status

Request:

```text
GET http://127.0.0.1:3010/api/remote/status
```

Bestaetigt:

```text
ok=true
statusApiVersion=rdap8a.v1
readOnly=true
writeEnabled=false
auth.enabled=false
auth.loginEnabled=false
auth.twitchOAuth.effectiveEnabled=false
auth.sessions.effectiveEnabled=false
auth.sessions.createSession=false
auth.sessions.setCookie=false
auth.sessions.refreshSession=false
auth.sessions.updateLastSeen=false
auth.sessions.databaseWriteEnabled=false
permissions.readOnlyResolverPrepared=true
permissions.diagnosticCheckRoutePrepared=true
permissions.checkRouteEnabled=true
permissions.productiveAuthorizationEnabled=false
database.writeEnabled=false
agent.actionsEnabled=false
safety.databaseWriteEnabled=false
safety.agentActionsEnabled=false
```

## Live-Test: Routes

Request:

```text
GET http://127.0.0.1:3010/api/remote/routes
```

Bestaetigt:

```text
statusApiVersion=rdap8a.v1
readOnly=true
writeEnabled=false
permissionReadOnlyResolverPrepared=true
```

Neue Route ist vorhanden:

```text
GET /api/remote/auth/permissions/check
```

Route bleibt Diagnose:

```text
RDAP8A read-only Permission-Diagnose. Ohne aktiven Login bleibt allowed=false.
Keine produktive Autorisierung, keine DB-Writes.
```

Disabled bleibt u. a.:

```text
POST/PUT/PATCH/DELETE remote writes
auth/session creation
productive permission enforcement
Redirect to Twitch
OAuth code token exchange
Set-Cookie/session cookie issuance
DB migration
agent action execution
OBS/Sound/Overlay/Command control
shell/file/process operations
```

## Live-Test: Permission-Check ohne Cookie

Request:

```text
GET http://127.0.0.1:3010/api/remote/auth/permissions/check?permission=remote.view
```

Bestaetigt:

```text
ok=true
statusApiVersion=rdap8a.v1
readOnly=true
writeEnabled=false
authEnabled=false
loginEnabled=false
loggedIn=false
allowed=false
permission.requested=remote.view
permission.targetType=global
permission.targetKey=*
session.cookiePresent=false
session.sessionLookupEnabled=false
session.sessionLookupPerformed=false
session.sessionValid=false
session.reason=no_session_cookie
session.createsSession=false
session.setsCookie=false
session.updatesLastSeen=false
database.writeEnabled=false
diagnostics.contextLookupEnabled=false
diagnostics.contextLookupPerformed=false
diagnostics.permissionEvaluationPerformed=false
reason=auth_disabled_or_not_logged_in
```

Damit ist das erwartete RDAP8A-Verhalten bestaetigt: Ohne aktiven Login und ohne Cookie bleibt jede Permission-Diagnose gesperrt und erlaubt keine produktive Aktion.

## Live-Test: OAuth Start bleibt disabled

Request:

```text
GET http://127.0.0.1:3010/api/remote/auth/twitch/start
```

Bestaetigt:

```text
HTTP/1.1 403 Forbidden
error=twitch_oauth_start_disabled
readOnly=true
writeEnabled=false
authEnabled=false
loginEnabled=false
redirectToTwitch=false
tokenExchangeEnabled=false
createSession=false
setCookie=false
databaseWriteEnabled=false
agentActionsEnabled=false
```

Kein Redirect und kein `Set-Cookie`.

## Live-Test: OAuth Callback bleibt disabled

Request:

```text
GET http://127.0.0.1:3010/api/remote/auth/twitch/callback
```

Bestaetigt:

```text
HTTP/1.1 403 Forbidden
error=twitch_oauth_callback_disabled
readOnly=true
writeEnabled=false
authEnabled=false
loginEnabled=false
redirectToTwitch=false
tokenExchangeEnabled=false
createSession=false
setCookie=false
databaseWriteEnabled=false
agentActionsEnabled=false
```

Kein Redirect und kein `Set-Cookie`.

## Hinweis zu jq

`jq` war beim ersten Test nicht installiert. Der Test wurde danach ohne `jq` erfolgreich ausgefuehrt. `jq` wurde anschliessend installiert und kann kuenftig fuer lesbare JSON-Ausgaben verwendet werden.

`jq` ist nur ein Anzeige-/Filtertool fuer JSON und keine Abhaengigkeit des Remote-Modboard-Services.

## Bestaetigter Sicherheitsstatus nach RDAP8B

```text
readOnly=true
writeEnabled=false
authEnabled=false
loginEnabled=false
oauthEnabled=false
twitchOAuthEnabled=false
oauthStartRouteEnabled=false
oauthCallbackRouteEnabled=false
sessionsEnabled=false
sessionCreationEnabled=false
sessionCookieWriteEnabled=false
databaseWriteEnabled=false
agentActionsEnabled=false
productivePermissionEnforcementEnabled=false
obsControlEnabled=false
soundControlEnabled=false
overlayControlEnabled=false
commandControlEnabled=false
secretsInFrontend=false
secretsLogged=false
```

## Nicht geaendert

```text
kein produktiver Login
kein Twitch-OAuth aktiviert
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
kein Cookie gesetzt
keine Session erstellt
keine Session verlaengert
kein last_seen_at Update
keine DB-Writes
keine User-/Rollen-/Gruppen-Schreibroute
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Secrets im Repo/Frontend/Log
kein moduleBuild-Kosmetik-Fix in remote-modboard/backend/server.js
```

## Bekannter kosmetischer Punkt

`moduleBuild` meldet weiterhin:

```text
RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
```

Das ist bekannt und kommt aus `remote-modboard/backend/server.js`. Fuer RDAP8B ist relevant:

```text
statusApiVersion=rdap8a.v1
```

Ein `moduleBuild`-Kosmetik-Fix bleibt ein separater Mini-Scope und wurde in RDAP8B bewusst nicht ausgefuehrt.

## Ergebnis

RDAP8B ist live bestaetigt.

```text
RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS
```

## Naechster sinnvoller Schritt

```text
RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES
```

Ziel: Lock-/Audit-Konzept fuer spaetere produktive Remote-Writes planen. Noch keine Writes bauen.

# CURRENT STATUS

Stand: RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS
Datum: 2026-06-24

## Aktueller bestaetigter Arbeitsstand

RDAP8A ist nach GitHub/dev uebernommen, auf `web.cgn.community` live deployed, der Service wurde neu gestartet und die read-only Permission-Diagnose wurde erfolgreich getestet.

RDAP8B dokumentiert diesen Live-Deploy/Test.

Das Remote-Modboard laeuft weiterhin produktiv read-only. Es gibt weiterhin keinen produktiven Login, keinen Redirect zu Twitch, keinen Token-Tausch, keine Cookies, keine Session-Erstellung, keine Session-Verlaengerung, kein `last_seen_at` Update, keine DB-Writes, keine Remote-Writes und keine Agent-Actions.

## Fertig und bestaetigt

```text
RDAP5I Remote-Modboard Node-Basisdienst read-only live
RDAP5J Remote Node Monitoring/Hardening
RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur
RDAP6D Testdatenbanklauf auf Webserver bestanden
RDAP6E Test-DB-Auswertung dokumentiert
RDAP6F Auth DB Integration Plan dokumentiert
RDAP6G Auth Backend Read-only DB Layer vorbereitet und deployed
RDAP6H Remote read-only Auth-Model Deploy/Test bestanden
RDAP6I Auth DB Production Migration Runbook dokumentiert
RDAP6J Productive Migration Precheck bestanden und Backup erstellt
RDAP6K Produktive Auth-DB Schema-/Seed-Migration auf c3stream_control erfolgreich ausgefuehrt
RDAP6L Auth DB Productive Migration Result Docs erstellt
RDAP7 Login-/Session-Konzept dokumentiert
RDAP7A Auth Read-only User Resolution Plan eingespielt
RDAP7B Auth Read-only Status Endpoints gebaut und nach GitHub/dev gepusht
RDAP7C Remote Auth Status Deploy/Test live bestanden
RDAP7C1 Server Workdir Cleanup live bestanden
RDAP7D Auth Status Deploy Result Docs erstellt
RDAP7E Server Workdir Cleanup Docs erstellt und nach GitHub/dev gepusht
RDAP7F Chat-Handoff und Next-Chat-Prompt erstellt
RDAP7F Twitch OAuth Dry-Run Plan dokumentiert
RDAP7G Twitch OAuth ENV/Server Prep disabled vorbereitet und live deployed
RDAP7H OAuth Callback Skeleton disabled vorbereitet und live deployed/getestet
RDAP7I Session Store Read-only Validation Layer live deployed/getestet
RDAP8 Permission Check Middleware Plan dokumentiert
RDAP8A Read-only Permission Resolver Diagnostic vorbereitet
RDAP8B Permission Resolver Live Deploy/Test dokumentiert
```

## RDAP8A/RDAP8B live bestaetigt

Deploy:

```text
Deploy-Clone: /opt/stream-control-center/_deploy_tmp/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_20260624_080242
Live-Ziel: /opt/stream-control-center/remote-modboard/backend
Service: scc-remote-modboard.service
Backup: /var/backups/stream-control-center/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_remote-modboard-backend_20260624_080242.tar.gz
```

Syntax/Service:

```text
npm install --omit=dev erfolgreich
npm run check erfolgreich
scc-remote-modboard.service active
Listen intern: 127.0.0.1:3010
```

Status:

```text
GET /api/remote/status
ok=true
statusApiVersion=rdap8a.v1
readOnly=true
writeEnabled=false
auth.enabled=false
auth.loginEnabled=false
permissions.readOnlyResolverPrepared=true
permissions.diagnosticCheckRoutePrepared=true
permissions.checkRouteEnabled=true
permissions.productiveAuthorizationEnabled=false
database.writeEnabled=false
agent.actionsEnabled=false
```

Routes:

```text
GET /api/remote/routes
statusApiVersion=rdap8a.v1
permissionReadOnlyResolverPrepared=true
GET /api/remote/auth/permissions/check vorhanden
```

Permission-Check ohne Cookie:

```text
GET /api/remote/auth/permissions/check?permission=remote.view
ok=true
statusApiVersion=rdap8a.v1
allowed=false
reason=auth_disabled_or_not_logged_in
session.reason=no_session_cookie
session.createsSession=false
session.setsCookie=false
session.updatesLastSeen=false
diagnostics.contextLookupPerformed=false
diagnostics.permissionEvaluationPerformed=false
```

OAuth Start/Callback bleiben disabled:

```text
GET /api/remote/auth/twitch/start -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
kein Redirect
kein Set-Cookie
kein Token-Tausch
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
```

## Remote-Modboard read-only live

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
moduleBuild live: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
statusApiVersion live: rdap8a.v1
```

Hinweis: `moduleBuild` ist noch der alte server.js-Buildname. Das ist kosmetisch und soll nur mit eigenem Mini-Scope angepasst werden.

## Bestaetigter Sicherheitsstatus bleibt

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authPrepared: true
authEnabled: false
loginEnabled: false
oauthPrepared: true
oauthEnabled: false
twitchOAuthPrepared: true
twitchOAuthEnabled: false
oauthStartRouteEnabled: false
oauthCallbackRouteEnabled: false
sessionsEnabled: false
sessionCreationEnabled: false
sessionCookieWriteEnabled: false
databaseWriteEnabled: false
agentActionsEnabled: false
productivePermissionEnforcementEnabled: false
secretsInFrontend: false
secretsLogged: false
```

## Webserver-Backups

```text
/var/backups/stream-control-center/RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED_remote-modboard-backend_20260623_213057.tar.gz
/var/backups/stream-control-center/RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED_remote-modboard-backend_20260623_213951.tar.gz
/var/backups/stream-control-center/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_remote-modboard-backend_20260623_222938.tar.gz
/var/backups/stream-control-center/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_remote-modboard-backend_20260623_223314.tar.gz
/var/backups/stream-control-center/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_remote-modboard-backend_20260624_080242.tar.gz
```

## Webserver-DB

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
DB-Typ: MariaDB 11.8.6
```

Passwort wird nicht dokumentiert und darf nicht ins Repo, Frontend oder Chat.

## Server-Ordnerregel ab RDAP7C1

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Runtime-/Temp:       /opt/stream-control-center/_runtime_tmp/
Backups:             /var/backups/stream-control-center/
```

`/root` nicht mehr fuer RDAP-Arbeitsordner, Deploy-Clones, Temp-Ordner oder Backups verwenden.

## Naechster sinnvoller Schritt

```text
RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES
```

Ziel:

```text
Lock-/Audit-Konzept fuer spaetere produktive Remote-Writes planen. Noch keine produktiven Writes bauen.
```

# CURRENT STATUS

Stand: RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC
Datum: 2026-06-24

## Aktueller bestaetigter Arbeitsstand

RDAP8 wurde als reiner Plan-/Doku-Step vorbereitet und nach GitHub/dev uebernommen.

RDAP8A bereitet jetzt einen read-only Permission-Resolver fuer das Remote-Modboard vor. Der Resolver dient nur der Diagnose und als Grundlage fuer spaetere serverseitige Permission-Middleware. Produktive Autorisierung bleibt deaktiviert.

Es gibt weiterhin keinen produktiven Login, keinen Redirect zu Twitch, keinen Token-Tausch, keine Cookies, keine Session-Erstellung, keine Session-Verlaengerung, kein `last_seen_at` Update, keine DB-Writes, keine Remote-Writes und keine Agent-Actions.

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
```

## RDAP8A vorbereitet

Neu/angepasst:

```text
remote-modboard/backend/src/security/permissions.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/package.json
remote-modboard/backend/README.md
docs/current/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC.md
```

Neue Diagnose-Route:

```text
GET /api/remote/auth/permissions/check?permission=remote.view
```

Optionale Target-Parameter:

```text
targetType
targetKey
```

Erwartetes Verhalten ohne Cookie:

```text
ok=true
statusApiVersion=rdap8a.v1
readOnly=true
writeEnabled=false
authEnabled=false
loginEnabled=false
loggedIn=false
allowed=false
reason=auth_disabled_or_not_logged_in
```

Bei diagnostisch gueltiger Session darf der Resolver read-only Rollen/Gruppen/Permissions lesen, bleibt aber produktiv gesperrt:

```text
allowed=false
reason=auth_disabled_readonly_permission_denied
```

## Remote-Modboard read-only live

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
moduleBuild live: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
statusApiVersion live vor RDAP8A-Deploy: rdap7i.v1
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
secretsInFrontend: false
secretsLogged: false
```

## Webserver-Backups

```text
/var/backups/stream-control-center/RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED_remote-modboard-backend_20260623_213057.tar.gz
/var/backups/stream-control-center/RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED_remote-modboard-backend_20260623_213951.tar.gz
/var/backups/stream-control-center/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_remote-modboard-backend_20260623_222938.tar.gz
/var/backups/stream-control-center/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_remote-modboard-backend_20260623_223314.tar.gz
```

Hinweis: `20260623_223314` ist das bestaetigte RDAP7I-Live-Deploy-Backup.

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

## Naechster sinnvoller Schritt nach Einspielen

```text
RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS
```

Ziel:

```text
RDAP8A auf dem Webserver deployen, scc-remote-modboard.service neu starten, Live-Routen testen und Ergebnis dokumentieren.
```

# RDAP8A Read-only Permission Resolver Diagnostic

Stand: RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC
Datum: 2026-06-24

## Zweck

RDAP8A bereitet fuer das Remote-Modboard einen read-only Permission-Resolver vor.

Der Resolver soll spaeter als Grundlage fuer serverseitige Permission-Middleware dienen. In RDAP8A ist er aber bewusst nur diagnostisch aktiv.

Wichtig: RDAP8A aktiviert weiterhin keinen produktiven Login. Es werden keine Cookies gesetzt, keine Sessions erzeugt, keine Sessions verlaengert, keine Datenbank-Schreibaktionen ausgefuehrt und keine produktiven Aktionen erlaubt.

## Ausgangsstand

Bestaetigter vorheriger Stand:

```text
RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN_DOKU
```

RDAP8 hat geplant:

```text
Backend entscheidet Rechte.
Frontend ist nur Anzeige.
Rollen und Gruppen bleiben getrennt.
sound_profi bekommt keine globalen Grundrechte.
Produktive Writes brauchen spaeter Permission + Lock + Audit + Confirm/Safety.
```

## Geaenderte Dateien

```text
remote-modboard/backend/package.json
remote-modboard/backend/README.md
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/security/permissions.js
docs/current/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Neue Dateien

```text
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/security/permissions.js
docs/current/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC.md
```

## Neue Diagnose-Route

```text
GET /api/remote/auth/permissions/check?permission=<permission_key>
```

Optionale Target-Parameter:

```text
targetType=<target_type>
targetKey=<target_key>
```

Beispiel:

```text
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/auth/permissions/check?permission=sound.manage&targetType=module&targetKey=sound
```

## Verhalten ohne Login / ohne Cookie

Erwartet:

```text
ok=true
readOnly=true
writeEnabled=false
authEnabled=false
loginEnabled=false
loggedIn=false
allowed=false
reason=auth_disabled_or_not_logged_in
```

## Verhalten mit gueltiger Session

Auch wenn RDAP7I eine Session read-only als gueltig erkennt, bleibt RDAP8A weiterhin:

```text
allowed=false
reason=auth_disabled_readonly_permission_denied
authEnabled=false
loginEnabled=false
loggedIn=false
```

Der Resolver darf dann diagnostisch den Permission-Kontext per SELECT lesen:

```text
dashboard_users
dashboard_user_roles
dashboard_user_groups
dashboard_groups
dashboard_role_permissions
dashboard_module_permissions
```

Diese Daten werden nur genutzt, um anzuzeigen, ob die spaetere Permission-Logik theoretisch erlauben wuerde.

## Auswertung

RDAP8A unterscheidet:

```text
rolePermissions
modulePermissions
explicit_deny
explicit_allow
no_matching_permission
```

Regel:

```text
deny gewinnt vor allow
allow ohne aktiven Login wird nur als Diagnose gezeigt
allowed bleibt false
```

## Sicherheitsgrenzen

RDAP8A macht nicht:

```text
kein Login aktivieren
kein Twitch-OAuth aktivieren
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
keine Cookies setzen
keine Sessions erstellen
keine Sessions verlaengern
kein last_seen_at Update
keine DB-Writes
keine User-/Rollen-/Gruppen-Schreibrouten
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Secrets ins Repo, Frontend, Logs oder Chat
kein moduleBuild-Kosmetikfix in remote-modboard/backend/server.js
```

## Aktualisierte Statusfelder

`GET /api/remote/status` meldet nach RDAP8A:

```text
statusApiVersion=rdap8a.v1
auth.permissions.middlewarePlanned=true
auth.permissions.readOnlyResolverPrepared=true
auth.permissions.diagnosticCheckRoutePrepared=true
auth.permissions.productiveAuthorizationEnabled=false
permissionsModel.diagnosticReadOnlyResolverPrepared=true
permissionsModel.productivePermissionEnforcementEnabled=false
```

Hinweis: `moduleBuild` in `remote-modboard/backend/server.js` kann weiterhin kosmetisch `RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS` melden, falls kein eigener Mini-Scope fuer diese reine Anzeige freigegeben wurde.

## Testplan lokal

Im Repo:

```powershell
cd D:\Git\stream-control-center\remote-modboard\backend
npm.cmd run check
```

## Testplan Webserver nach Deploy

```bash
curl -sS http://127.0.0.1:3010/api/remote/status
curl -sS http://127.0.0.1:3010/api/remote/routes
curl -sS http://127.0.0.1:3010/api/remote/auth/me
curl -sS http://127.0.0.1:3010/api/remote/auth/session-status
curl -sS "http://127.0.0.1:3010/api/remote/auth/permissions/check?permission=remote.view"
curl -i http://127.0.0.1:3010/api/remote/auth/twitch/start
curl -i http://127.0.0.1:3010/api/remote/auth/twitch/callback
```

Erwartet:

```text
npm run check erfolgreich
statusApiVersion=rdap8a.v1
permissions check: allowed=false
permissions check: reason=auth_disabled_or_not_logged_in ohne Cookie
kein Set-Cookie
kein Redirect
keine DB-Writes
keine Agent-Actions
OAuth Start/Callback bleiben HTTP 403
```

## Node-Neustart

Ja, nach Deploy auf dem Webserver ist ein Neustart von `scc-remote-modboard.service` noetig, weil Remote-Modboard-Backend-Code geaendert wurde.

## Rollback

Rollback auf das bestaetigte RDAP7I-Backup:

```bash
systemctl stop scc-remote-modboard.service
tar -xzf /var/backups/stream-control-center/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_remote-modboard-backend_20260623_223314.tar.gz -C /opt/stream-control-center/remote-modboard
systemctl start scc-remote-modboard.service
systemctl status scc-remote-modboard.service --no-pager -l
```

## Naechster moeglicher Schritt

```text
RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS
```

Erst nach Einspielen, Deploy, Service-Neustart und Live-Test.

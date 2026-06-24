# CURRENT STATUS

Stand: RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN_DOKU
Datum: 2026-06-24

## Aktueller bestaetigter Arbeitsstand

RDAP7I ist abgeschlossen, lokal sauber, nach GitHub/dev gepusht und live auf dem Webserver deployed/getestet.

RDAP8 wurde als reiner Plan-/Doku-Step vorbereitet. RDAP8 beschreibt die spaetere Permission-Check-Middleware fuer Remote-Modboard-Bereiche und haelt fest, wie vorhandenes Rollen-/Gruppen-/Permission-Modell und RDAP7I Auth-/Session-Read-only-Status zusammengefuehrt werden sollen.

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

## Remote-Modboard read-only live

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
moduleBuild live: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
statusApiVersion live: rdap7i.v1
```

Hinweis: `moduleBuild` ist noch der alte server.js-Buildname. Das ist kosmetisch und soll nur mit eigenem Mini-Scope angepasst werden.

## Live verfuegbare Routen nach RDAP7I

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/health?db=1
GET https://mods.forrestcgn.de/api/remote/auth/model
GET https://mods.forrestcgn.de/api/remote/auth/me
GET https://mods.forrestcgn.de/api/remote/auth/session-status
GET https://mods.forrestcgn.de/api/remote/auth/twitch/start
GET https://mods.forrestcgn.de/api/remote/auth/twitch/callback
```

## Bestaetigter Sicherheitsstatus

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

## RDAP7I Live-Test Ergebnis

Deploy:

```text
Deploy-Clone: /opt/stream-control-center/_deploy_tmp/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_20260623_223314
Live-Ziel: /opt/stream-control-center/remote-modboard/backend
Service: scc-remote-modboard.service
Backup: /var/backups/stream-control-center/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_remote-modboard-backend_20260623_223314.tar.gz
```

Syntax/Service:

```text
npm install --omit=dev erfolgreich
npm run check erfolgreich
scc-remote-modboard.service active (running)
Listen intern: 127.0.0.1:3010
```

Status:

```text
status.ok: true
statusApiVersion: rdap7i.v1
readOnly: true
writeEnabled: false
auth.prepared: true
auth.enabled: false
auth.loginEnabled: false
auth.sessions.storePrepared: true
auth.sessions.readOnlyValidationPrepared: true
auth.sessions.readOnlyValidationEnabled: true
auth.sessions.readsDashboardSessions: true
auth.sessions.createSession: false
auth.sessions.setCookie: false
auth.sessions.refreshSession: false
auth.sessions.updateLastSeen: false
auth.sessions.databaseWriteEnabled: false
```

Session-Status ohne Cookie:

```text
ok: true
statusApiVersion: rdap7i.v1
session.cookiePresent: false
session.lookupPerformed: false
session.valid: false
session.reason: no_session_cookie
session.safety.createSession: false
session.safety.setCookie: false
session.safety.updateLastSeen: false
session.safety.databaseWriteEnabled: false
```

`/auth/me` ohne Cookie:

```text
ok: true
statusApiVersion: rdap7i.v1
loggedIn: false
session.sessionValid: false
session.reason: no_session_cookie
session.createsSession: false
session.setsCookie: false
session.updatesLastSeen: false
```

Start-/Callback-Test bleibt:

```text
HTTP/1.1 403 Forbidden
kein Redirect zu Twitch
kein Token-Tausch
kein Set-Cookie
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
```

## RDAP8 Plan-/Doku-Ergebnis

Neu dokumentiert:

```text
docs/current/RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN.md
```

Festgelegt:

```text
Backend entscheidet Rechte.
Frontend ist nur Anzeige.
Rollen und Gruppen bleiben getrennt.
sound_profi bekommt keine globalen Grundrechte.
Produktive Writes brauchen spaeter Permission + Lock + Audit + Confirm/Safety.
RDAP8 aktiviert noch keine produktiven Flows.
```

## Webserver-Backups

```text
/var/backups/stream-control-center/RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED_remote-modboard-backend_20260623_213057.tar.gz
/var/backups/stream-control-center/RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED_remote-modboard-backend_20260623_213951.tar.gz
/var/backups/stream-control-center/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_remote-modboard-backend_20260623_222938.tar.gz
/var/backups/stream-control-center/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_remote-modboard-backend_20260623_223314.tar.gz
```

Hinweis: Das erste RDAP7I-Backup `20260623_222938` entstand beim ersten Deploy-Versuch, der wegen unvollstaendigem GitHub/dev-Stand nicht RDAP7I ausliefern konnte. Der bestaetigte RDAP7I-Live-Deploy nutzt Backup `20260623_223314`.

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
RDAP8A_PERMISSION_CONTEXT_READONLY_DIAGNOSTIC_PLAN
```

Ziel:

```text
Konkreten Code-Scope fuer einen read-only Auth-/Permission-Context vorbereiten. Noch kein produktiver Login, keine Schreibaktionen und keine Agent-Actions.
```

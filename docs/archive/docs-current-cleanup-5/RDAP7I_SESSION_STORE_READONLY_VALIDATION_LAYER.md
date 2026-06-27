# RDAP7I Session Store Read-only Validation Layer

Stand: RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_LIVE_DEPLOY_BESTAETIGT
Datum: 2026-06-23

## Zweck

RDAP7I bereitet den Session-Store-/Validation-Layer fuer das Remote-Modboard read-only vor.

Wichtig: RDAP7I aktiviert weiterhin keinen produktiven Login. Es werden keine Cookies gesetzt, keine Sessions erzeugt, keine Sessions verlaengert und keine Datenbank-Schreibaktionen ausgefuehrt.

## Ausgangsstand

Bestaetigter vorheriger Stand:

```text
RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED
```

RDAP7H hat die spaeteren Twitch-OAuth-Start-/Callback-Pfade als disabled/read-only Skeleton bereitgestellt.

## Geaenderte Dateien

```text
remote-modboard/backend/package.json
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/README.md
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER.md
docs/current/RDAP7I_LIVE_DEPLOY_RESULT_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP8.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Neue Service-Datei

```text
remote-modboard/backend/src/services/auth-session-read.service.js
```

Aufgabe:

```text
Session-Cookie aus Request lesen
nur bekannte/konfigurierte Session-Cookie-Namen erkennen
Cookie-Wert nicht ausgeben
kurzen SHA-256-Fingerprint fuer Diagnose ausgeben
session_uid-Format begrenzt validieren
dashboard_sessions nur per parameterisiertem SELECT lesen
Session-Status/Expiry/Revocation read-only auswerten
keine Session erzeugen
keine Session aktualisieren
keine Session verlaengern
kein last_seen_at update
kein Cookie setzen
```

## Gelesene Tabelle

RDAP7I liest nur validierend aus:

```text
dashboard_sessions
```

Relevante Spalten aus RDAP6C:

```text
session_uid
user_uid
status
created_at
expires_at
revoked_at
last_seen_at
```

## Geaenderte Routen

```text
GET /api/remote/auth/session-status
GET /api/remote/auth/me
GET /api/remote/status
GET /api/remote/routes
```

## Session-Status Verhalten

Ohne Cookie:

```text
valid=false
reason=no_session_cookie
lookupPerformed=false
```

Mit leerem Cookie:

```text
valid=false
reason=empty_session_cookie
lookupPerformed=false
```

Mit ungueltigem Format:

```text
valid=false
reason=invalid_session_cookie_format
lookupPerformed=false
```

Mit unbekanntem Cookie:

```text
valid=false
reason=session_not_found
lookupPerformed=true
```

Mit abgelaufener Session:

```text
valid=false
reason=session_expired
lookupPerformed=true
```

Mit revoked Session:

```text
valid=false
reason=session_revoked
lookupPerformed=true
```

Mit aktiver, nicht abgelaufener, nicht revoked Session:

```text
valid=true
reason=session_valid_readonly
lookupPerformed=true
```

Auch in diesem Fall gilt:

```text
loggedIn=false
authEnabled=false
loginEnabled=false
sessionCreationEnabled=false
```

## Garantierte Nicht-Aktionen

```text
kein Twitch-Login aktiviert
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
keine Cookies
keine Session-Erstellung
keine Session-Verlaengerung
kein last_seen_at Update
keine DB-Writes
keine User-/Rollen-/Gruppen-Schreibroute
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Secrets im Repo oder Frontend
```

## Bestaetigter Live-Status

```text
GET /api/remote/status
```

Bestaetigt nach Deploy/Test:

```text
statusApiVersion: rdap7i.v1
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

## OAuth-Routen bleiben disabled

```text
GET /api/remote/auth/twitch/start
GET /api/remote/auth/twitch/callback
```

Bestaetigt weiterhin:

```text
HTTP 403
kein HTTP 302
kein Location-Header zu Twitch
kein Set-Cookie-Header
kein Token-Tausch
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
```

## Testplan lokal

Im Repo:

```powershell
cd D:\Git\stream-control-center\remote-modboard\backend
npm.cmd run check
```

## Testplan Webserver nach Deploy

```bash
curl -sS http://127.0.0.1:3010/api/remote/status
curl -sS http://127.0.0.1:3010/api/remote/auth/session-status
curl -sS http://127.0.0.1:3010/api/remote/auth/me
curl -sS http://127.0.0.1:3010/api/remote/routes
curl -i http://127.0.0.1:3010/api/remote/auth/twitch/start
curl -i http://127.0.0.1:3010/api/remote/auth/twitch/callback
```

Optionaler Fake-Cookie-Test:

```bash
curl -sS -H 'Cookie: scc_remote_session=fake-session-uid-123456' http://127.0.0.1:3010/api/remote/auth/session-status
```

Erwartet:

```text
Fake-Cookie wird erkannt
Cookie-Wert wird nicht ausgegeben
valid=false
reason=session_not_found oder db/readiness-bezogener Fehler
kein Set-Cookie
keine DB-Writes
```

## Live-Deploy-Ergebnis

Separat dokumentiert in:

```text
docs/current/RDAP7I_LIVE_DEPLOY_RESULT_DOCS.md
```

Bestaetigtes Webserver-Backup:

```text
/var/backups/stream-control-center/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_remote-modboard-backend_20260623_223314.tar.gz
```

## Rollback

Rollback:

```bash
systemctl stop scc-remote-modboard.service
tar -xzf /var/backups/stream-control-center/<BACKUP>.tar.gz -C /opt/stream-control-center/remote-modboard
systemctl start scc-remote-modboard.service
systemctl status scc-remote-modboard.service --no-pager -l
```

## Naechster moeglicher Schritt

```text
RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN
```

Erst nach eigenem Scope und ausdruecklichem go.

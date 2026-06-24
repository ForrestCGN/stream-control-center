# CURRENT STATUS - stream-control-center

Stand: RDAP11C_LOCK_AUDIT_LIVE_TEST_DOCS
Datum: 2026-06-24

## Aktueller bestaetigter Arbeitsstand

RDAP11C dokumentiert den erfolgreichen Live-Deploy/Test von RDAP11.

Remote-Modboard auf Webserver:

```text
https://mods.forrestcgn.de/api/remote/
127.0.0.1:3010
systemd service: scc-remote-modboard.service
```

RDAP11 Live-Routen:

```text
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
```

Bestaetigte Live-Werte:

```text
statusApiVersion=rdap11.v1
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
migrationEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
lockAcquireEnabled=false
lockHeartbeatEnabled=false
lockReleaseEnabled=false
lockForceTakeoverEnabled=false
auditInsertEnabled=false
auditUpdateEnabled=false
productiveAuthorizationEnabled=false
obsControlEnabled=false
soundControlEnabled=false
overlayControlEnabled=false
commandControlEnabled=false
```

OAuth bleibt disabled/read-only:

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

## Backup

```text
/var/backups/stream-control-center/RDAP11B_LOCK_AUDIT_READONLY_SKELETON_LIVE_DEPLOY_TEST_remote-modboard-backend_20260624_083346.tar.gz
```

## Schema-Befund

`dashboard_locks` existiert, aber reale Spalten weichen vom RDAP11-Erwartungsmodell ab.

`dashboard_audit_log` existiert, aber reale Spalten weichen vom RDAP11-Erwartungsmodell ab.

Vor Writes ist RDAP12 Schema-Kompatibilitaetsplanung Pflicht.

## Wichtige Regel aus RDAP11B

Nach Server-Restart immer Readiness-Wait/Retry einbauen.

Kein sofortiges `curl` direkt nach `systemctl restart`.

## Weiterhin verboten

- kein Login
- kein Twitch-OAuth
- keine Cookies
- keine Sessions
- keine Session-Verlaengerung
- kein last_seen_at Update
- keine produktiven DB-Writes
- keine User-/Rollen-/Gruppen-Schreibrouten
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets ins Repo, Frontend, Logs oder Chat

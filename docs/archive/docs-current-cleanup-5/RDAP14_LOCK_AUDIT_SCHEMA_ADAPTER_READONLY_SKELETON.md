# RDAP14 - Lock-/Audit Schema-Adapter Read-only Skeleton

Stand: RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON
Datum: 2026-06-24

## Zweck

RDAP14 baut ein read-only Schema-Adapter-Skeleton fuer das reale Lock-/Audit-Schema.

Wichtig: Es wurde bewusst kein neues separates Route-Modul und kein neues separates Adapter-Service-Modul angelegt.

Stattdessen wurde die vorhandene Lock-/Audit-Diagnose erweitert:

```text
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
```

Damit bleibt die Struktur kompakt und es entsteht kein unnoetiger Modul-Wildwuchs.

## Neue/erweiterte Route

```text
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

Die bestehende Route bleibt erhalten und wurde erweitert:

```text
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
```

## Sicherheitsstatus

RDAP14 bleibt read-only:

```text
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
migrationEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
lockAcquireEnabled=false
auditInsertEnabled=false
compatibleForWrite=false
```

## Keine Aktivierung

RDAP14 aktiviert nicht:

- Login
- Twitch-OAuth
- Cookies
- Sessions
- Session-Verlaengerung
- last_seen_at Update
- DB-Writes
- Migrationen
- Tabellen-Aenderungen
- Lock-Writes
- Audit-Writes
- Remote-Writes
- Agent-Actions
- OBS-/Sound-/Overlay-/Command-Steuerung

## Adapter-Logik

Lock-Adapter in vorhandenem Service:

```text
remote-modboard/backend/src/services/lock-read.service.js
```

Audit-Adapter in vorhandenem Service:

```text
remote-modboard/backend/src/services/audit-read.service.js
```

Routen in vorhandenem Modul:

```text
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
```

## Tests

Lokal:

```text
npm.cmd run check
```

Live spaeter:

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
GET /api/remote/auth/twitch/start -> 403
GET /api/remote/auth/twitch/callback -> 403
```

## Server-Regel

Nach `systemctl restart` immer Readiness-Wait/Retry ausfuehren, bevor API-Tests laufen.

Keine sofortigen curl-Tests direkt nach Restart.

# CURRENT STATUS - stream-control-center

Stand: RDAP16_HANDOFF_VISIBLE_NEXT
Datum: 2026-06-24

## Aktueller bestätigter Arbeitsstand

RDAP15 wurde abgeschlossen.

RDAP16 konsolidiert den Stand und bereitet den nächsten Chat mit sichtbarem UI-Fokus vor.

## Bestätigte Live-Basis

```text
Remote-Modboard public read-only:
https://mods.forrestcgn.de/api/remote/

Interner Service:
127.0.0.1:3010

Systemd:
scc-remote-modboard.service
```

## Bestätigte Diagnose-Routen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/auth/me
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

## OAuth bleibt deaktiviert

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

## Aktuelle Sicherheitslage

Weiterhin:

```text
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
lockAcquireEnabled=false
auditInsertEnabled=false
```

## resourceType Entscheidung

RDAP15 empfiehlt Hybrid:

- kurzfristig typisierte `resource_key`
- mittelfristig `resource_type` per eigener Migration planen
- keine produktiven Lock-Writes ohne eigene Safety-Kette

## Nächster Fokus

```text
RDAP_UI1_REMOTE_MODBOARD_FIRST_VISIBLE_PAGE
```

Eine erste sichtbare read-only UI-Seite bauen.

## Weiterhin verboten

- kein Login
- kein OAuth
- keine Cookies
- keine Sessions
- keine DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine Secrets

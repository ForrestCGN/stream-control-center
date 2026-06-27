# RDAP14C - Lock-/Audit Schema-Adapter Live-Test dokumentiert

Stand: RDAP14C_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_TEST_DOCS
Datum: 2026-06-24

## Zweck

RDAP14C dokumentiert den erfolgreichen Live-Deploy und Live-Test von RDAP14.

RDAP14 erweitert die bestehende Lock-/Audit-Diagnose um read-only Schema-Adapter-Ausgaben.

RDAP14C selbst ist ein reiner Doku-Step.

Es wurden keine Backend-Dateien, keine DB, keine Migration und keine Server-Konfiguration geaendert.

## Bestaetigter Live-Deploy

Webserver:

```text
web.cgn.community
```

Service:

```text
scc-remote-modboard.service
```

Interner Service:

```text
127.0.0.1:3010
```

Public Subdomain:

```text
https://mods.forrestcgn.de
```

## Backup

Bestaetigtes Webserver-Backup:

```text
/var/backups/stream-control-center/RDAP14B_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_DEPLOY_TEST_remote-modboard-backend_20260624_090046.tar.gz
```

## Deploy-/Test-Clone

```text
/opt/stream-control-center/_deploy_tmp/RDAP14B_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_DEPLOY_TEST_20260624_090046
```

## Live-Backend

```text
/opt/stream-control-center/remote-modboard/backend
```

## Bestaetigte Checks

Clone-Backend:

```text
npm run check
```

Live-Backend:

```text
npm run check
```

Beide Checks liefen erfolgreich.

## Readiness-Wait

Nach `systemctl restart scc-remote-modboard.service` wurde nicht sofort getestet, sondern auf Readiness gewartet.

Bestaetigt:

```text
ready_after=2s
```

Diese Regel bleibt verbindlich fuer kuenftige Server-Deploys:

```text
Nach systemctl restart immer Readiness-Wait/Retry vor API-Tests.
```

## Service Status

Bestaetigt:

```text
Active: active (running)
Main PID: node server.js
127.0.0.1:3010 erreichbar
```

Der Log meldet weiterhin kosmetisch:

```text
RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
```

Das ist weiterhin nur `moduleBuild`-Kosmetik und kein Fehler.

## Bestaetigte neue Route

```text
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

`/api/remote/routes` listet die Schema-Adapter-Route.

## Live-Test: Lock-/Audit Status

```text
GET /api/remote/lock-audit/status
```

Bestaetigt:

```text
ok=true
statusApiVersion=rdap14.v1
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
schemaAdapterPrepared=true
lockSchemaAdapterPrepared=true
auditSchemaAdapterPrepared=true
lockAcquireEnabled=false
auditInsertEnabled=false
```

## Live-Test: Lock-/Audit Status mit DB

```text
GET /api/remote/lock-audit/status?db=1
```

Bestaetigt:

```text
ok=true
statusApiVersion=rdap14.v1
readOnly=true
writeEnabled=false
```

Locks:

```text
compatibleForRead=true
compatibleForWrite=false
missingForWrite=["resourceType"]
```

Audit:

```text
compatibleForRead=true
compatibleForWrite=false
missingForWrite=[]
```

## Live-Test: Schema Adapter

```text
GET /api/remote/lock-audit/schema-adapter/status
```

Bestaetigt:

```text
ok=true
statusApiVersion=rdap14.v1
readOnly=true
writeEnabled=false
schemaAdapterPrepared=true
lockSchemaAdapterPrepared=true
auditSchemaAdapterPrepared=true
```

## Live-Test: Schema Adapter mit DB

```text
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

Bestaetigt:

Locks:

```text
compatibleForRead=true
compatibleForWrite=false
writeBlockReason=resource_type_column_missing_typed_resource_key_required_and_writes_disabled
```

Audit:

```text
compatibleForRead=true
compatibleForWrite=false
writeBlockReason=writes_disabled_by_safety_flags
```

## Public Smoke-Test

```text
https://mods.forrestcgn.de/api/remote/lock-audit/schema-adapter/status
```

Bestaetigt:

```text
ok=true
statusApiVersion=rdap14.v1
readOnly=true
writeEnabled=false
schemaAdapterPrepared=true
lockSchemaAdapterPrepared=true
auditSchemaAdapterPrepared=true
```

## OAuth bleibt deaktiviert

Bestaetigt:

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

## Weiterhin deaktiviert

- kein Login
- kein Twitch-OAuth
- kein Redirect zu Twitch
- kein OAuth-Code-gegen-Token-Tausch
- keine Cookies
- keine Sessions
- keine Session-Verlaengerung
- kein last_seen_at Update
- keine DB-Writes
- keine Migration
- keine Tabellen-Aenderung
- keine Lock-Writes
- keine Audit-Writes
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets im Repo, Frontend, Logs oder Chat

## Wichtigster fachlicher Befund

Lock-Schema ist fuer read-only kompatibel:

```text
locks.compatibleForRead=true
```

Lock-Schema ist fuer produktive Writes nicht kompatibel:

```text
locks.compatibleForWrite=false
missingForWrite=["resourceType"]
```

Grund:

```text
resource_type_column_missing_typed_resource_key_required_and_writes_disabled
```

Audit-Schema ist read-only kompatibel:

```text
audit.compatibleForRead=true
```

Audit-Writes bleiben trotzdem deaktiviert:

```text
audit.compatibleForWrite=false
writeBlockReason=writes_disabled_by_safety_flags
```

## Bewertung

RDAP14B/RDAP14C ist erfolgreich.

Die read-only Adapter-Diagnose funktioniert lokal und oeffentlich.

Der Adapter blockiert Writes bewusst weiter.

Vor produktiven Lock-Writes muss entschieden werden:

- `resource_type` als Spalte per Migration ergaenzen
- oder `resource_key` zwingend typisiert nutzen
- oder beides kombinieren

Keine dieser Entscheidungen darf ohne eigenen Scope, Backup/Rollback und ausdrueckliches Go umgesetzt werden.

## Naechster sinnvoller Schritt

```text
RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN
```

Ziel:

- entscheiden, wie `resourceType` fuer Locks spaeter sauber behandelt wird
- keine DB-Aenderung
- keine Migration
- keine Writes
- Optionen vergleichen:
  - Migration mit `resource_type`
  - typisierter `resource_key`
  - Hybrid aus beidem

Alternativ:

```text
RDAP15_SCHEMA_ADAPTER_DOCS_AND_NEXT_PROMPT
```

Falls vor technischen Entscheidungen erst ein sauberer Chat-Handoff erstellt werden soll.

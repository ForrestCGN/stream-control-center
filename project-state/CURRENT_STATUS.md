# CURRENT STATUS - stream-control-center

Stand: RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN
Datum: 2026-06-24

## Aktueller bestaetigter Arbeitsstand

RDAP12 dokumentiert den Schema-Kompatibilitaetsplan fuer `dashboard_locks` und `dashboard_audit_log`.

RDAP12 ist ein reiner Doku-/Planungsstand.

Keine Code-, DB- oder Server-Aenderung.

## Live-Stand aus RDAP11C

Remote-Modboard:

```text
https://mods.forrestcgn.de/api/remote/
127.0.0.1:3010
scc-remote-modboard.service
```

Bestaetigt:

```text
GET /api/remote/lock-audit/status      HTTP 200
GET /api/remote/lock-audit/status?db=1 HTTP 200
```

Safety:

```text
statusApiVersion=rdap11.v1
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
lockAcquireEnabled=false
auditInsertEnabled=false
```

OAuth bleibt:

```text
start=403
callback=403
```

## RDAP12 Schema-Befund

`dashboard_locks` reale Spalten:

```text
id
lock_uid
resource_key
owner_user_uid
status
heartbeat_at
expires_at
created_at
updated_at
version_token
```

`dashboard_audit_log` reale Spalten:

```text
id
audit_uid
created_at
actor_user_uid
actor_display_name
source
action
permission_key
resource_key
status
old_value_summary
new_value_summary
request_id
correlation_id
```

## Entscheidung

Vor produktiver Lock-/Audit-Schreiblogik:

- Schema-Kompatibilitaetslayer planen/bauen
- fehlende Spalten nicht stillschweigend ignorieren
- keine Writes ohne saubere Mapping-/Migrationsentscheidung
- keine Migration ohne eigenen Scope

## Weiterhin verboten

- kein Login
- kein Twitch-OAuth
- keine Cookies
- keine Sessions
- keine DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine Secrets

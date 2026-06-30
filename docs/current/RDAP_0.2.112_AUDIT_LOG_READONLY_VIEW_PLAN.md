# RDAP 0.2.112 - Audit Log Readonly View Plan

## Kurswechsel

Admin-Notizen sind geparkt.

Neues Hauptziel:

```text
Aktivitaets-Log / Audit-Log
```

Forrest braucht:

```text
wer
wann
was gemacht hat
Status/Ergebnis
```

## Bestand

Vorhanden:

```text
dashboard_audit_log
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
/api/remote/lock-audit/status
/api/remote/admin/audit-lock/schema-status
```

Aktuell ist das hauptsaechlich Diagnose, noch keine brauchbare Modboard-Logliste.

## Naechster Runtime-Step

```text
RDAP_0.2.113_AUDIT_LOG_READONLY_API
```

Ziel:

```text
GET /api/remote/admin/audit/log
```

Read-only Liste mit:

```text
created_at
actor_login / actor_display_name
action
resource_type
resource_key
status
error_code
safe_metadata_json gekuerzt/sicher
```

## Grenzen

```text
keine Writes
keine Migration
keine Gates aktivieren
keine Admin-Notizen
keine Agent-Actions
keine UI-Buttons
```

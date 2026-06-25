# CURRENT_STATUS

Stand: RDAP34_ADMIN_AUDIT_SCHEMA_MIGRATION_DECISION_PLAN  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard

## Bestaetigter Stand

```text
RDAP31 live bestaetigt.
RDAP31B dokumentiert.
RDAP32 Audit-/Lock-Write-Foundation geplant.
RDAP33 read-only Audit-/Lock-Schema-/Statusroute gebaut.
RDAP33B RDAP33 live bestaetigt und dokumentiert.
RDAP34 Audit-Schema-Migration-Entscheidung erstellt.
```

## RDAP33 Live-Befund

Audit:

```text
dashboard_audit_log exists: true
rowCount: 0
compatibleForWriteCandidate: false
Blocker: missing resource_type
```

Locks:

```text
dashboard_locks exists: true
rowCount: 0
activeCount: 0
expiredCount: 0
compatibleForRead: true
compatibleForWriteCandidate: true
```

## RDAP34 Entscheidung

```text
Direkt richtig: Option B.
Bestehende dashboard_audit_log sanft erweitern.
Keine neue Parallelstruktur.
Keine Mapping-Abkuerzung als Dauerloesung.
```

Geplante Spalten fuer spaetere Migration:

```text
resource_type
actor_login
error_code
safe_metadata_json
completed_at
```

## Weiterhin blockiert

```text
Admin-Notiz produktiv schreiben/aendern/deaktivieren
admin.users.note.write Permission
UI-Schreibbuttons
Audit-Testinsert
Lock acquire/heartbeat/release/force-takeover
physisches Delete
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

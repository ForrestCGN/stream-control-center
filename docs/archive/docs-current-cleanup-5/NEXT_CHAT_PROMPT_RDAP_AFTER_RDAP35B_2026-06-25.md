# Neuer Chat Prompt — RDAP nach RDAP35B

Wir arbeiten am Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Repository:

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Webserver: mods.forrestcgn.de
Webserver-Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
```

Bitte zuerst diese Dateien aus GitHub/dev lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP35B_ADMIN_AUDIT_SCHEMA_MIGRATION_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Arbeitsweise:

```text
Erst echte Dateien/Repo/Dokus pruefen.
Dann Plan nennen.
Dann auf Forrests ausdrueckliches go warten.
Keine Funktionalitaet entfernen.
Keine Parallelstrukturen bauen.
Keine produktiven Writes ohne Scope, Permission, Confirm, Audit, Lock, Backup, Rollback und Read-Back.
```

Aktueller Stand:

```text
RDAP35 Audit-Schema-Migration live erfolgreich.
dashboard_audit_log wurde sanft erweitert.
RDAP33 Route bestaetigt:
schemaReady true
compatibleForWriteCandidate true
missingWriteCandidateColumns []
rowCount 0
writesStillBlocked true
auditInsertEnabled false
```

Weiterhin nicht aktiv:

```text
Admin-Notiz-Writes
Audit-Testinsert-Route
Lock-Writes
UI-Schreibbuttons
admin.users.note.write Permission
```

Naechster sinnvoller Step:

```text
RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED
```

Ziel:

```text
Kontrollierter Audit-Testinsert in dashboard_audit_log.
Keine Admin-Notiz-Writes.
Keine Lock-Writes.
Keine UI-Schreibbuttons.
```

Pflicht fuer RDAP36:

```text
Backup dashboard_audit_log
Backup-Datei pruefen, nicht 0 Byte
confirmWrite nur im JSON-Body
Read-Back nach Insert
Keine Secrets speichern
Audit-Entry eindeutig als RDAP36-Test kennzeichnen
```

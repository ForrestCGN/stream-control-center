# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS15_ADMIN_NOTE_TABLE_MIGRATION_PLAN  
Datum: 2026-06-25

## Aktuell erledigt

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN
RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC
RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC
RDAP14B Webserver-Deploy live bestätigt
RDAP15 Admin-Notiz-Tabellen-Migration geplant
```

## RDAP15 Ergebnis

RDAP15 hat nur geplant/dokumentiert:

```text
- SQL für dashboard_user_admin_notes
- Backup-Befehl
- Rollback-Befehl
- Read-only Vorprüfung
- Read-Back-Prüfung
- harte Abbruchbedingungen
- keine echte Migration ohne separates Go
- Community-/Modboard-Zukunft: gemeinsame User-/Auth-/Rollen-Basis, aber getrennte Community- und Dashboard-Daten
```

## Nächster empfohlener Fach-Step

```text
RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION
```

Scope nur nach separatem Go:

```text
- echte Server-DB-/Env-Werte prüfen
- Backup erstellen und Backup-Datei prüfen
- CREATE TABLE IF NOT EXISTS dashboard_user_admin_notes ausführen
- Read-Back-Prüfung durchführen
- /api/remote/admin/users/admin-note-diagnostic prüfen
- writesStillBlocked muss true bleiben
- writeEnabled muss false bleiben
- productiveWritesEnabled muss false bleiben
```

## Erst nach bestätigter Tabelle

Ein echter Admin-Notiz-Write darf erst gebaut werden, wenn:

```text
Tabelle existiert
schemaReady true
Backup/Rollback geklärt
Permission admin.users.note.write geklärt
Confirm-Write Pflicht umgesetzt
Audit-Payload umgesetzt
Lock-Scope umgesetzt
Read-Back-Prüfung umgesetzt
separates Go von Forrest
```

## Workflow-Regel bleibt

```text
Erst echte Dateien/Repo/Dokus prüfen.
Dann Plan nennen.
Dann auf ausdrückliches go warten.
Keine Funktionalität entfernen.
Keine Workflow-Tools überschreiben.
Keine Parallelstrukturen bauen.
```

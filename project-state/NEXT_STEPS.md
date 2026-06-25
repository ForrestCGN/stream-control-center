# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION  
Datum: 2026-06-25

## Aktuell erledigt

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN
RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC
RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC
RDAP15 Admin-Notiz-Tabellen-Migration geplant
```

## RDAP16 aktueller Step

RDAP16 stellt eine kontrollierte Migration bereit:

```text
tools/rdap16_admin_note_table_migration.sql
docs/current/RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION.md
```

Wichtig:

```text
installstep/deploy fuehren kein SQL aus.
Die Migration muss manuell auf dem Webserver nach Backup und Vorpruefung ausgefuehrt werden.
```

## Naechste Aktionen fuer Forrest

1. ZIP lokal einspielen.
2. Lokale Checks ausfuehren.
3. `stepdone.cmd` ausfuehren.
4. Webserver-Deploy aus frischem GitHub/dev-Clone.
5. Readiness abwarten.
6. Status-/Diagnose pruefen.
7. DB-Kontext klaeren.
8. Backup erstellen und pruefen.
9. Read-only SQL-Vorpruefung.
10. Migration mit SQL-Datei ausfuehren.
11. Read-Back pruefen.
12. Diagnose pruefen.

## Erst nach erfolgreicher Tabelle

Ein Admin-Notiz-Write darf erst gebaut werden, wenn:

```text
Tabelle existiert
schemaReady true
Backup/Rollback geklaert
Permission admin.users.note.write geklaert
Confirm-Write Pflicht umgesetzt
Audit-Payload umgesetzt
Lock-Scope umgesetzt
Read-Back-Pruefung umgesetzt
separates Go von Forrest
```

## Naechster moeglicher Fach-Step nach RDAP16

```text
RDAP_ADMIN_USERS17_ADMIN_NOTE_WRITE_DISABLED_FOUNDATION
```

RDAP17 darf nicht blind produktive Writes aktivieren.

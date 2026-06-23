# RDAP6L Auth DB Productive Migration Result Docs

Stand: 2026-06-23  
Status: RDAP6K produktive Schema-/Seed-Migration bestanden, Ergebnis dokumentiert

## Zweck

RDAP6L dokumentiert das Ergebnis der produktiven RDAP6K Auth-DB Schema-/Seed-Migration auf der echten Remote-Modboard-/Auth-Ziel-Datenbank `c3stream_control`.

Dieser Step fuehrt keine SQL-Befehle aus und aktiviert keine Authentifizierung, keine Sessions, keine Remote-Writes und keine Agent-Actions.

## Vorheriger Precheck / Backup

RDAP6J Precheck wurde bestanden.

Bestaetigte Zielwerte:

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=c3stream_control
DB_USER=c1stream_control
DB-Verbindung: OK
Vorhandene dashboard/schema Tabellen vor Migration: keine
```

Backup vor Migration:

```text
/root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql
```

Backup-Groesse laut Serverausgabe:

```text
1,4K
```

## RDAP6K Ausfuehrung

Ausgefuehrt auf:

```text
Server: web.cgn.community
Ziel-DB: c3stream_control
DB-User: c1stream_control
Repo-Clone: /root/rdap6k-migration
```

Ausgefuehrte Dateien:

```text
db/rdap6c/sql/001_rdap6c_schema_migration.sql
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
db/rdap6c/checks/rdap6c_validation_queries.sql
```

## Ergebnis

```text
Schema-Migration: OK
Seed-Migration: OK
Validation: OK
```

Angelegte Tabellen:

```text
schema_migrations
dashboard_users
dashboard_identities
dashboard_roles
dashboard_user_roles
dashboard_groups
dashboard_user_groups
dashboard_permissions
dashboard_role_permissions
dashboard_module_permissions
dashboard_sessions
dashboard_locks
dashboard_audit_log
```

API-Pruefung nach Migration:

```text
GET https://mods.forrestcgn.de/api/remote/auth/model
ok: true
database.reachable: true
schema.ready: true
missingTables: []
```

## Bestaetigte Zaehler

```text
schema_migrations: 1
dashboard_users: 0
dashboard_identities: 0
dashboard_roles: 6
dashboard_user_roles: 0
dashboard_groups: 1
dashboard_user_groups: 0
dashboard_permissions: 22
dashboard_role_permissions: 18
dashboard_module_permissions: 0
dashboard_sessions: 0
dashboard_locks: 0
dashboard_audit_log: 0
```

## Validierung

```text
sound_profi_role_count = 0
sound_profi_group_marker_count = 1
sound_profi_role_permission_count = 0
module_permission_table_rows = 0
session_rows = 0
lock_rows = 0
audit_rows = 0
```

Bewertung:

```text
sound_profi ist keine Rolle.
sound_profi ist Gruppe/Marker.
sound_profi vergibt keine globalen Rollenrechte.
Modulmatrix ist vorhanden, aber noch leer.
Sessions, Locks und Audit-Log sind vorhanden, aber noch ohne produktive Eintraege.
```

## Weiterhin nicht aktiv

Trotz produktiver DB-Migration bestaetigt die API weiterhin:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
```

Nicht umgesetzt:

```text
kein Login
keine Cookies
keine Session-Erstellung
keine Lock-Erstellung
keine Audit-Schreibung
keine User-/Rollen-/Gruppen-Schreibaktion ueber API
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine lokale SQLite-Aenderung
```

## Rollback-Hinweis

Fuer einen Notfall-Rollback wurde vor RDAP6K ein Backup erstellt:

```text
/root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql
```

Ein Restore darf nicht blind ausgefuehrt werden. Vor Restore:

```text
1. aktuellen Zustand sichern,
2. Service-Fenster klaeren,
3. Restore-Befehl separat planen,
4. separates Go einholen.
```

## Naechster sinnvoller Schritt

```text
RDAP7_LOGIN_SESSION_CONCEPT
```

Ziel:

```text
Login-/Session-Konzept fuer Remote-Modboard planen, ohne direkt Login, Cookies oder Sessions zu aktivieren.
```

RDAP7 muss mindestens klaeren:

```text
- Login-Quelle / Twitch-OAuth
- User-Identitaeten und Dashboard-User-Zuordnung
- Session-Cookie-Sicherheit
- CSRF-/SameSite-/Secure-/HttpOnly-Regeln
- serverseitige Rollen-/Gruppen-/Permission-Pruefung
- Audit- und Lock-Grundregeln fuer spaetere Writes
- Stop-/Rollback-Punkte
```

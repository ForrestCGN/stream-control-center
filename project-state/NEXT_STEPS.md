# NEXT_STEPS - stream-control-center

Stand: RDAP29B_ADMIN_NOTE_MARIADB_SEED_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Aktuell erledigt

```text
RDAP25 Login/OAuth/Session funktioniert.
RDAP26 Option B DB-Rollen/Permissions funktioniert.
RDAP27 echte read-only Admin-Notiztext-Route ist live.
RDAP28 read-only Admin-Notiz-UI ist live.
RDAP29 Admin-Notiz Test-Seed wurde live gegen MariaDB validiert.
RDAP29B dokumentiert die MariaDB-Korrektur und den Live-Erfolg.
```

## RDAP29 Live-Ergebnis

```text
DB: c3stream_control
Engine: MariaDB 11.8.6
Tabelle: dashboard_user_admin_notes
note_count nach Seed: 1
UI: 1 Admin-Notiz read-only geladen
Schreibbuttons: nicht sichtbar
```

## Sofort noch pruefen

Backup-Datei pruefen:

```bash
sudo ls -lah /opt/stream-control-center/_db_backups
```

Falls kein valides Backup vorhanden ist, Tabelle nachtraeglich sichern:

```bash
sudo mysqldump --defaults-extra-file=/root/rdap29_mysql_client.cnf \
  c3stream_control dashboard_user_admin_notes \
  > /opt/stream-control-center/_db_backups/rdap29_dashboard_user_admin_notes_after_live_seed_$(date +%Y%m%d_%H%M%S).sql
```

## Naechster Fach-Step

```text
RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN
```

Ziel: Write-Scope sauber planen, aber noch nicht bauen.

RDAP30 klaert:

```text
Welche Rollen duerfen Admin-Notizen schreiben?
Permission admin.users.note.write
Confirm-Write Pflicht
Audit-Payload
Lock-Scope
Read-Back nach Write
Fehler-/Abbruchfaelle
UI-Regeln fuer Schreibbuttons
Rollback-/Backup-Regel
```

## Nicht blind bauen

Vor einem echten Write-Step braucht es ein separates Go von Forrest.

Weiterhin nicht automatisch aktivieren:

```text
POST/PUT/PATCH/DELETE fuer Admin-Notizen
UI-Schreibbuttons
admin.users.note.write Vergabe
Audit-Writes
Lock-Writes
User-/Rollen-/Session-Writes
Agent-/OBS-/Sound-/Overlay-Steuerung
```

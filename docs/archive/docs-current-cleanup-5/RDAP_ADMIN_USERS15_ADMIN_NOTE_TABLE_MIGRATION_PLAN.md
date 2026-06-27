# RDAP_ADMIN_USERS15_ADMIN_NOTE_TABLE_MIGRATION_PLAN

Stand: 2026-06-25  
Projekt: `stream-control-center` / RDAP Remote-Modboard  
Typ: reiner Plan-/Doku-Step  
Status: Keine Migration, keine SQL-Ausführung, keine produktiven Writes

## Kurzfazit

RDAP15 plant die sichere spätere Migration für die Tabelle:

```text
dashboard_user_admin_notes
```

Die Tabelle wird für den ersten späteren Mini-Write vorbereitet:

```text
Admin-Notiz zu einem Dashboard-User setzen/aktualisieren
```

RDAP15 führt **keine** Migration aus.  
RDAP15 baut **keine** Write-Route.  
RDAP15 aktiviert **keine** UI-Schreibbuttons.

## Ausgangslage nach RDAP14B

RDAP14B ist live bestätigt.

Statusroute Webserver:

```text
moduleBuild: RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC
statusApiVersion: rdap_admin_users14b.v1
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Routenübersicht:

```text
/api/remote/routes -> adminUserAdminNoteDiagnostic
prepared: true
route: /api/remote/admin/users/admin-note-diagnostic
readOnly: true
writeEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
routeListKeySynced: true
aliasOf: adminUsersAdminNoteDiagnostic
```

Admin-Notiz-Diagnose:

```text
GET /api/remote/admin/users/admin-note-diagnostic
ok: true
routeRemainsReadOnly: true
writeEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
tableExists: false
schemaReady: false
migrationRequired: true
```

Das ist kein Fehler. Die Diagnose funktioniert, aber die Tabelle `dashboard_user_admin_notes` existiert noch nicht.

## Ziel von RDAP15

RDAP15 dokumentiert:

```text
- exaktes SQL für dashboard_user_admin_notes
- Backup-Befehl
- Rollback-Befehl
- Read-only Vorprüfung vor Migration
- Read-Back-Prüfung nach Migration
- harte Abbruchbedingungen
- Entscheidung, dass echte Migration erst mit separatem Go erfolgen darf
- Zukunftshinweis zur gemeinsamen User-/Auth-/Rollen-Basis für forrestcgn.de/.info und Modboard
```

## Geplantes SQL

Empfohlener SQL-Entwurf für MariaDB/MySQL:

```sql
CREATE TABLE IF NOT EXISTS dashboard_user_admin_notes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  note_uid VARCHAR(96) NOT NULL,
  target_user_uid VARCHAR(64) NOT NULL,
  note_text TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_by_user_uid VARCHAR(64) NULL,
  updated_by_user_uid VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_user_admin_notes_uid (note_uid),
  KEY idx_dashboard_user_admin_notes_target_user (target_user_uid),
  KEY idx_dashboard_user_admin_notes_status (status),
  KEY idx_dashboard_user_admin_notes_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Warum `target_user_uid` statt `user_uid`

Die RDAP14-Diagnose erwartet aktuell mindestens diese Spalten:

```text
id
note_uid
target_user_uid
note_text
status
created_by_user_uid
created_at
updated_at
```

Deshalb wird der RDAP15-Plan an diesen Diagnose-Stand angepasst.

## Warum keine harte UNIQUE-Regel pro User

In RDAP13 wurde bereits festgehalten, dass `UNIQUE (user_uid, deleted_at)` nicht blind verwendet werden soll, weil MariaDB/MySQL-NULL-Semantik leicht falsch verstanden werden kann.

Für den ersten echten Write wird empfohlen:

```text
Eine aktive Notiz pro User wird durch Service-Logik erzwungen.
```

Geplantes Verhalten später:

```text
1. SELECT aktive Notiz WHERE target_user_uid=? AND status='active'
2. Wenn vorhanden: UPDATE
3. Wenn nicht vorhanden: INSERT
4. Danach Read-Back prüfen
```

Eine spätere harte technische Eindeutigkeit kann gesondert geplant werden, wenn Archivierung/Löschen sauber entschieden ist.

## Backup-Befehl vor echter Migration

Vor einer echten Migration muss auf dem Webserver ein Backup erstellt werden.

Template:

```bash
STEP_NAME="RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION"
BACKUP_DIR="/opt/stream-control-center/_backups/rdap"
mkdir -p "$BACKUP_DIR"

mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  "$SCC_REMOTE_DB_NAME" \
  > "$BACKUP_DIR/${STEP_NAME}_$(date +%Y%m%d_%H%M%S).sql"
```

Vor Ausführung muss geprüft werden:

```text
- Welche Env-/Config-Variable enthält den echten DB-Namen?
- Läuft wirklich MariaDB/MySQL?
- Hat der DB-User die benötigten Rechte?
- Wurde die Backup-Datei tatsächlich erstellt?
- Ist die Backup-Datei nicht leer?
- Wo liegt die Backup-Datei genau?
```

Keine Zugangsdaten und keine Secrets ins Repo schreiben.

## Rollback-Befehl

Rollback der Tabelle nur erlaubt, wenn bestätigt ist:

```text
- Tabelle wurde in genau diesem Migration-Step erstellt.
- Tabelle enthält noch keine produktiv benötigten Admin-Notizen.
- Forrest hat Rollback ausdrücklich freigegeben.
```

SQL:

```sql
DROP TABLE IF EXISTS dashboard_user_admin_notes;
```

Alternativ Restore aus Backup:

```bash
mysql "$SCC_REMOTE_DB_NAME" < "/opt/stream-control-center/_backups/rdap/DATEINAME.sql"
```

Achtung: Ein vollständiger Restore kann mehr zurückdrehen als nur diese Tabelle. Deshalb Restore nur nach ausdrücklicher Entscheidung.

## Read-only Vorprüfung vor Migration

Vor echter Migration:

```sql
SELECT DATABASE() AS current_database;

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_user_admin_notes';

SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_user_admin_notes'
ORDER BY ORDINAL_POSITION;
```

Erwarteter aktueller Zustand laut bestätigter Live-Diagnose:

```text
tableExists: false
schemaReady: false
migrationRequired: true
```

## Read-Back-Prüfung nach späterer Migration

Nach einer echten Migration:

```sql
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_user_admin_notes';

SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_user_admin_notes'
ORDER BY ORDINAL_POSITION;

SELECT COUNT(*) AS count_value
FROM dashboard_user_admin_notes;
```

Danach muss die bestehende Diagnose melden:

```text
tableExists: true
schemaReady: true
migrationRequired: false
writesStillBlocked: true
writeEnabled: false
productiveWritesEnabled: false
```

Wichtig: Eine vorhandene Tabelle bedeutet noch nicht, dass Admin-Notiz-Writes aktiv sein dürfen.

## Harte Abbruchbedingungen

Eine spätere Migration muss abbrechen, wenn:

```text
- DB-Name nicht eindeutig bekannt ist.
- DB-Verbindung nicht erreichbar ist.
- Backup fehlgeschlagen ist.
- Backup-Datei fehlt oder leer ist.
- DB-Typ nicht MariaDB/MySQL ist und SQL nicht angepasst wurde.
- Tabelle bereits existiert, aber abweichendes Schema hat.
- bestehende Tabelle unerwartete Daten enthält.
- DB-User-Rechte unklar oder unzureichend sind.
- Read-only Vorprüfung widersprüchliche Ergebnisse liefert.
- Service-Status nicht RDAP14B/RDAP15-kompatibel ist.
- writeEnabled/actionEnabled/productiveAgentRuntime unerwartet true ist.
- Forrest kein separates Go für echte Migration gegeben hat.
```

## Weiterhin verboten/nicht aktiv

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration
SQL-Ausführung
CREATE TABLE Ausführung
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
Backup-Ausführung
Rollback-Ausführung
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Admin-Notiz-Write
```

## Zukunft: zentrale DB für Community-Seite und Modboard

Forrest plant später eine Community-Seite auf `forrestcgn.de` / `.info`. Dort sollen eingeloggte Mods später einen Link zum Dashboard/Modboard sehen können.

Dafür ist eine gemeinsame zentrale Benutzer-/Auth-/Rollen-Basis sinnvoll.

Wichtig:

```text
Gemeinsame zentrale User-ID: ja.
Gemeinsame Auth-/Session-/Rollenbasis: ja.
Dashboard-/Security-Daten und Community-Profil-Daten sauber trennen: ja.
Admin-Notizen niemals öffentlich anzeigen: ja.
```

Empfohlene langfristige Struktur:

```text
users / dashboard_users
  zentrale User-ID, Twitch-ID, Login, Displayname, Avatar, Status

user_roles / dashboard_user_roles
  Owner, Admin, Mod, Sound-Profi, Viewer usw.

user_permissions / dashboard_user_permissions
  konkrete Rechte/Freigaben

user_sessions / dashboard_user_sessions
  eingeloggte Sessions

dashboard_audit_log
  wer hat was wann gemacht

dashboard_user_admin_notes
  interne Admin-/Mod-Notizen

community_profiles
  öffentliche oder halböffentliche Community-Profilinfos

community_posts / community_pages / community_visibility
  spätere Community-Inhalte und Sichtbarkeit
```

Die Community-Seite darf später anhand der Rollen/Rechte entscheiden:

```text
Ist User eingeloggt?
Hat User Rolle/Recht für Modboard-Link?
Dann Dashboard-Link anzeigen.
```

Sie darf aber nicht aus Community-Profilfeldern Sicherheitsentscheidungen ableiten.

Nicht so:

```text
community_profile.is_mod = true
```

Sondern:

```text
zentrale User-/Rollen-/Permission-Schicht entscheidet serverseitig
```

Admin-Notizen sind interne Dashboard-Daten und dürfen nicht öffentlich über Community-Seiten sichtbar sein.

## Nächster möglicher Step nach RDAP15

Nur nach separatem Go:

```text
RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION
```

Empfohlen:

```text
1. Read-only Vorprüfung ausführen.
2. Backup erstellen.
3. Backup prüfen.
4. Migration mit exakt freigegebenem SQL ausführen.
5. Read-Back prüfen.
6. Diagnose prüfen.
7. Writes bleiben weiterhin disabled.
```

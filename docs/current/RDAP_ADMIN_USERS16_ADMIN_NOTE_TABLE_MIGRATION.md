# RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION

Stand: 2026-06-25  
Projekt: `stream-control-center` / RDAP Remote-Modboard  
Typ: kontrollierter DB-Migration-Step mit manueller Server-Ausfuehrung  
Status nach Install/Deploy: SQL-Datei und Anleitung vorhanden, aber noch keine automatische DB-Ausfuehrung

## Kurzfazit

RDAP16 bereitet die echte Migration fuer die interne Admin-Notiz-Tabelle vor:

```text
dashboard_user_admin_notes
```

Die Migration soll erst auf dem Webserver nach Backup, Vorpruefung und ausdruecklicher Ausfuehrung der unten dokumentierten Befehle ausgefuehrt werden.

Wichtig:

```text
installstep.cmd fuehrt kein SQL aus.
stepdone.cmd fuehrt kein SQL aus.
remote-modboard-deploy.sh fuehrt kein SQL aus.
Der Service-Restart fuehrt kein SQL aus.
```

## Ausgangslage

RDAP15 hat die Migration geplant und dokumentiert.

Bisher bestaetigt:

```text
moduleBuild: RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC
statusApiVersion: rdap_admin_users14b.v1
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Admin-Notiz-Diagnose vor Migration:

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

Das ist der erwartete Zustand vor RDAP16.

## Betroffene Repo-Dateien

```text
docs/current/RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION.md
tools/rdap16_admin_note_table_migration.sql
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht geaendert

```text
Keine Backend-Code-Dateien.
Keine Routen.
Keine UI.
Keine Workflow-Tools.
Keine Secrets.
Keine DB-Dateien.
Keine automatische SQL-Ausfuehrung.
Keine Admin-Notiz-Writes.
Keine Audit-Inserts.
Keine Lock-Writes.
Keine Agent-Actions.
Keine OBS-/Sound-/Overlay-/Command-Steuerung.
```

## SQL-Datei

Die auszufuehrende SQL-Datei liegt nach Deploy unter:

```text
/opt/stream-control-center/remote-modboard/tools/rdap16_admin_note_table_migration.sql
```

Im Repo liegt sie unter:

```text
tools/rdap16_admin_note_table_migration.sql
```

Inhalt:

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

## Warum dieses Schema

Die RDAP14-Diagnose erwartet mindestens:

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

RDAP16 ergaenzt zusaetzlich:

```text
updated_by_user_uid
```

Das ist fuer spaetere Audit-/Nachvollziehbarkeit sinnvoll und stoert die Diagnose nicht.

## Bewusst keine harte UNIQUE-Regel pro User

Es gibt bewusst keine Regel wie:

```sql
UNIQUE (target_user_uid, status)
```

Grund:

```text
Eine aktive Notiz pro User soll im ersten Write-Step durch Service-Logik erzwungen werden.
Archivierung/Loeschlogik wird spaeter gesondert geplant.
```

Damit vermeiden wir zu fruehe DB-Zwaenge, die spaeter bei Historie/Archivierung stoeren koennen.

## Lokaler Ablauf

Nach ZIP-Download:

```powershell
cd D:\Git\stream-control-center

.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION.zip" "RDAP16 Admin-Notiz-Tabelle Migration vorbereitet"
```

Lokale Checks:

```powershell
git status

Test-Path .\docs\current\RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION.md
Test-Path .\tools\rdap16_admin_note_table_migration.sql

Select-String -Path .\tools\rdap16_admin_note_table_migration.sql -Pattern "CREATE TABLE IF NOT EXISTS dashboard_user_admin_notes"
Select-String -Path .\docs\current\RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION.md -Pattern "Keine automatische SQL-Ausfuehrung"
Select-String -Path .\project-state\TODO.md -Pattern "RDAP16"
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP16 Admin-Notiz-Tabelle Migration vorbereitet; SQL-Datei und Doku, keine automatische SQL-Ausfuehrung"
```

## Webserver-Deploy aus frischem GitHub/dev-Clone

Nach sauberem `stepdone.cmd`:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION
cd RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION
sudo bash tools/remote-modboard-deploy.sh RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION dev
sudo systemctl restart scc-remote-modboard.service
```

Readiness abwarten:

```bash
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

## Vorpruefung auf dem Webserver vor SQL-Ausfuehrung

Status pruefen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '{moduleBuild,statusApiVersion,writeEnabled,actionEnabled,productiveAgentRuntime}'

curl -fsS http://127.0.0.1:3010/api/remote/admin/users/admin-note-diagnostic | jq '{ok,routeRemainsReadOnly,writeEnabled,productiveWritesEnabled,writesStillBlocked,tableExists,schemaReady,migrationRequired,reason}'
```

Erwartung vor Migration:

```text
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
routeRemainsReadOnly: true
writesStillBlocked: true
tableExists: false
schemaReady: false
migrationRequired: true
```

Wenn eines davon unerwartet abweicht: abbrechen.

## DB-Kontext klaeren

Der konkrete DB-Name darf nicht geraten werden.

Moegliche Pruefung:

```bash
sudo systemctl show scc-remote-modboard.service -p Environment --no-pager
sudo systemctl cat scc-remote-modboard.service
```

Danach den echten DB-Namen und die fuer `mysql`/`mysqldump` noetigen Parameter gezielt aus der vorhandenen Server-Konfiguration ableiten.

Keine Secrets ins Repo schreiben.
Keine Secrets in Chat-Ausgaben posten.

## Backup erstellen

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

ls -lh "$BACKUP_DIR" | tail -n 5
```

Wenn `SCC_REMOTE_DB_NAME` auf dem Server nicht als Shell-Variable gesetzt ist, muss der echte DB-Name aus der Server-Konfiguration eingesetzt werden.

Backup-Abbruchbedingungen:

```text
Backup-Datei fehlt.
Backup-Datei ist 0 Byte gross.
mysqldump gibt Fehler aus.
DB-Name ist unklar.
DB-Zugang ist unklar.
```

## Read-only SQL-Vorpruefung

```bash
mysql "$SCC_REMOTE_DB_NAME" -e "SELECT DATABASE() AS current_database;"

mysql "$SCC_REMOTE_DB_NAME" -e "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dashboard_user_admin_notes';"

mysql "$SCC_REMOTE_DB_NAME" -e "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dashboard_user_admin_notes' ORDER BY ORDINAL_POSITION;"
```

Erwartung:

```text
Die Tabelle existiert noch nicht.
Die Column-Abfrage liefert keine Spalten.
```

Wenn die Tabelle schon existiert: abbrechen und Schema manuell pruefen.

## Migration ausfuehren

Nur wenn Backup und Vorpruefung sauber sind:

```bash
cd /opt/stream-control-center/remote-modboard
mysql "$SCC_REMOTE_DB_NAME" < tools/rdap16_admin_note_table_migration.sql
```

## Read-Back nach Migration

```bash
mysql "$SCC_REMOTE_DB_NAME" -e "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dashboard_user_admin_notes';"

mysql "$SCC_REMOTE_DB_NAME" -e "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dashboard_user_admin_notes' ORDER BY ORDINAL_POSITION;"

mysql "$SCC_REMOTE_DB_NAME" -e "SELECT COUNT(*) AS count_value FROM dashboard_user_admin_notes;"
```

Erwartung:

```text
Tabelle existiert.
Required Columns sind vorhanden.
COUNT(*) = 0
```

## Diagnose nach Migration

```bash
curl -fsS http://127.0.0.1:3010/api/remote/admin/users/admin-note-diagnostic | jq '{ok,routeRemainsReadOnly,writeEnabled,productiveWritesEnabled,writesStillBlocked,tableExists,schemaReady,migrationRequired,reason}'
```

Erwartung nach Migration:

```text
ok: true
routeRemainsReadOnly: true
writeEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
tableExists: true
schemaReady: true
migrationRequired: false
```

Wichtig:

```text
Auch nach erfolgreicher Migration bleiben Admin-Notiz-Writes deaktiviert.
```

## Rollback

Rollback der Tabelle nur erlauben, wenn klar ist:

```text
Die Tabelle wurde in genau diesem Step erstellt.
Sie enthaelt noch keine produktiv benoetigten Admin-Notizen.
Forrest gibt Rollback ausdruecklich frei.
```

Tabellen-Rollback:

```bash
mysql "$SCC_REMOTE_DB_NAME" -e "DROP TABLE IF EXISTS dashboard_user_admin_notes;"
```

Vollstaendiger Restore aus Backup nur nach gesonderter Entscheidung:

```bash
mysql "$SCC_REMOTE_DB_NAME" < "/opt/stream-control-center/_backups/rdap/DATEINAME.sql"
```

Achtung: Ein kompletter Restore kann mehr zurueckdrehen als nur diese Tabelle.

## Harte Abbruchbedingungen

Abbrechen, wenn:

```text
DB-Name nicht eindeutig bekannt ist.
DB-Verbindung nicht erreichbar ist.
Backup fehlgeschlagen ist.
Backup-Datei fehlt oder leer ist.
DB-Typ nicht MariaDB/MySQL ist.
Tabelle bereits existiert, aber Schema abweicht.
Bestehende Tabelle unerwartete Daten enthaelt.
DB-User-Rechte unklar oder unzureichend sind.
Read-only Vorpruefung widerspruechliche Ergebnisse liefert.
writeEnabled/actionEnabled/productiveAgentRuntime unerwartet true ist.
Service nicht erreichbar ist.
Diagnose nach Migration nicht schemaReady=true meldet.
Forrest kein klares Go fuer die Server-SQL-Ausfuehrung gibt.
```

## Naechster Step nach erfolgreicher Migration

Erst wenn die Tabelle existiert und die Diagnose `schemaReady: true` meldet:

```text
RDAP_ADMIN_USERS17_ADMIN_NOTE_WRITE_DISABLED_FOUNDATION
```

Auch RDAP17 darf zunaechst nur mit Confirm-Write, Permission, Audit, Lock und weiterhin blockierter UI geplant/gebaut werden.

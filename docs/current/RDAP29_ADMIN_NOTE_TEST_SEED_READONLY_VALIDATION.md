# RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: SQL-/Doku-Step fuer read-only Validierung

---

## 1. Zweck

RDAP29 legt eine kontrollierte Test-Admin-Notiz fuer ForrestCGN per SQL-Seed an, damit die bereits live bestaetigte read-only Admin-Notiz-UI echten Inhalt anzeigen kann.

Zieluser:

```text
tw:127709954 / ForrestCGN / forrestcgn
```

Betroffene Tabelle:

```text
dashboard_user_admin_notes
```

Seed-Datei:

```text
tools/rdap29_admin_note_test_seed_readonly_validation.sql
```

---

## 2. Sicherheitsgrenzen

RDAP29 ist keine Admin-Notiz-Schreibfunktion im Dashboard.

Nicht geaendert und weiterhin nicht aktiv:

```text
Keine UI-Schreibbuttons
Keine Write-Route
Keine Permission admin.users.note.write
Keine User-Freigabe/Sperrung
Keine Rollenvergabe
Keine Gruppen-/Freigaben-Aenderung
Keine Session-Revoke-Funktion
Keine Audit-Inserts ueber das Dashboard
Keine Lock acquire/heartbeat/release/force-takeover-Funktion
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine Community-Seiten-Anbindung fuer Admin-Notizen
Keine Workflow-Tool-Aenderung
```

Der SQL-Seed fuehrt nur einen gezielten Insert/Update fuer genau diese Testnotiz aus:

```text
note_uid: rdap29_test_note_forrestcgn_readonly_validation
target_user_uid: tw:127709954
status: active
created_by_user_uid/updated_by_user_uid: system:rdap29_seed
```

---

## 3. Lokales Einspielen

ZIP im lokalen Repo einspielen:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION.zip" "RDAP29 Admin-Notiz Test-Seed read-only Validierung vorbereitet"
```

Lokale Checks:

```powershell
cd D:\Git\stream-control-center
git status --short
git diff --stat
git diff -- tools/rdap29_admin_note_test_seed_readonly_validation.sql
git diff -- docs/current/RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION.md
git diff -- project-state/CURRENT_STATUS.md project-state/NEXT_STEPS.md project-state/TODO.md project-state/FILES.md project-state/CHANGELOG.md
```

Wenn lokal sauber:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "RDAP29 Admin-Notiz Test-Seed read-only Validierung vorbereitet; keine UI-Writes, keine Write-Permission, keine Backend-Aenderung"
```

---

## 4. Webserver-Hinweis

RDAP29 aendert keine Dateien unter:

```text
remote-modboard/
```

Darum ist fuer diesen ZIP-Step kein normaler Remote-Modboard-Service-Deploy noetig.

Wichtig: Die SQL-Datei liegt im Repo-Root unter `tools/` und wird nicht nach `/opt/stream-control-center/remote-modboard/tools/` deployed.

Wenn der Seed auf dem Webserver ausgefuehrt wird, dann aus einem frischen GitHub/dev-Clone unter `_deploy_tmp`, nicht aus dem Live-Remote-Modboard-Ordner.

---

## 5. Seed auf dem Webserver vorbereiten

Nach erfolgreichem `stepdone.cmd` liegt RDAP29 in GitHub/dev. Dann auf dem Webserver frisch clonen:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION
cd RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION
```

DB-Env-Datei pruefen, ohne Secrets zu posten:

```bash
sudo test -f /etc/stream-control-center/remote-modboard.env && echo "env_exists=yes"
sudo grep -E '^(DB_|MYSQL_|MARIADB_)' /etc/stream-control-center/remote-modboard.env | sed -E 's/(PASSWORD|PASS|SECRET|TOKEN)=.*/\1=***MASKED***/'
```

Backup erstellen. Der konkrete MySQL/MariaDB-Aufruf muss zu den vorhandenen Env-Variablen passen. Keine Secrets im Chat posten.

Backup-Ziel:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap29_before_admin_note_test_seed_YYYYMMDD_HHMMSS.sql
```

---

## 6. Read-only Vorpruefung vor SQL-Ausfuehrung

Vor dem Seed pruefen:

```sql
SELECT DATABASE() AS current_database;

SELECT COUNT(*) AS table_exists
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_user_admin_notes';

SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'dashboard_user_admin_notes'
ORDER BY ORDINAL_POSITION;

SELECT COUNT(*) AS before_count
FROM dashboard_user_admin_notes
WHERE target_user_uid = 'tw:127709954';

SELECT note_uid, target_user_uid, status, created_by_user_uid, updated_by_user_uid, created_at, updated_at
FROM dashboard_user_admin_notes
WHERE note_uid = 'rdap29_test_note_forrestcgn_readonly_validation';
```

Erwartung vor dem ersten Seed:

```text
table_exists: 1
before_count: 0 oder vorhandene echte Notizen
Test-note SELECT: leer, falls noch nicht geseeded
```

---

## 7. SQL-Seed ausfuehren

Erst nach Backup und Vorpruefung:

```bash
# Beispiel, konkreter mysql-Aufruf muss zur vorhandenen Server-Env passen.
mysql ... < tools/rdap29_admin_note_test_seed_readonly_validation.sql
```

---

## 8. Read-Back nach SQL-Ausfuehrung

Nach dem Seed pruefen:

```sql
SELECT note_uid, target_user_uid, status, created_by_user_uid, updated_by_user_uid, created_at, updated_at
FROM dashboard_user_admin_notes
WHERE note_uid = 'rdap29_test_note_forrestcgn_readonly_validation';

SELECT COUNT(*) AS after_count
FROM dashboard_user_admin_notes
WHERE target_user_uid = 'tw:127709954'
  AND status = 'active';
```

Erwartung:

```text
note_uid: rdap29_test_note_forrestcgn_readonly_validation
target_user_uid: tw:127709954
status: active
after_count: mindestens 1
```

---

## 9. API-/Browser-Pruefung

Ohne Browser-Session bleibt die Route weiterhin gesperrt:

```bash
curl -i 'http://127.0.0.1:3010/api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954'
```

Erwartung ohne Session:

```text
HTTP 401
noteTextReturned: false
```

Im Browser mit gueltiger Session:

```text
https://mods.forrestcgn.de/
Admin -> Admin-Notizen
```

Erwartung:

```text
Read true
Write false
Notizen mindestens 1
Tabelle true
Test-Notiz sichtbar
Keine Schreibbuttons sichtbar
Sicherheitsbereich sichtbar
```

---

## 10. Naechster sinnvoller Schritt danach

Nach erfolgreicher RDAP29-Validierung:

```text
RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN
```

Ziel: Write-Scope sauber planen, aber noch nicht direkt bauen.

Der spaetere Write-Step braucht separat:

```text
Permission admin.users.note.write
Confirm-Write Pflicht
Audit-Konzept
Lock-Scope
Backup-/Rollback-Konzept
Read-Back-Pruefung
Fehler-/Abbruchfaelle
separates Go von Forrest
```

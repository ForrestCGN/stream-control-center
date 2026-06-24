# RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN

Stand: 2026-06-24  
Projekt: `stream-control-center` / RDAP Remote-Modboard  
Typ: Plan-/Vorbereitungs-Step  
Status: Kein produktiver Write, keine Migration, keine UI-Schreibbuttons

## Kurzfazit

RDAP13 bereitet den in RDAP12 festgelegten ersten späteren Mini-Write weiter vor:

```text
Admin-Notiz zu einem Dashboard-User setzen/aktualisieren
```

RDAP13 baut **noch keinen echten Write**. Der Step definiert nur den sicheren technischen Scope für den späteren Umsetzungsstep.

## Harte Grenze

Nicht Teil von RDAP13:

```text
Keine produktiven Writes
Keine DB-Migration ausführen
Keine SQL-Ausführung auf Webserver oder lokalem Live-System
Keine UI-Schreibbuttons
Keine User freigeben/sperren
Keine Rollen vergeben/entziehen
Keine Gruppen/Freigaben setzen/entfernen
Keine Sessions widerrufen
Keine Permissions ändern
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine Workflow-Tools ändern
```

## Ergebnis aus RDAP12

Der erste spätere Write bleibt bewusst harmlos:

```text
action: admin.users.note.set
permission: admin.users.note.write
lock: admin:user-note:<target_user_uid>
table: dashboard_user_admin_notes
```

Er darf keine direkte Sicherheitswirkung haben. Die Notiz darf später nicht automatisch Rechte, Freigaben, Gruppen, Sessions oder Permissions beeinflussen.

## Ziel von RDAP13

RDAP13 definiert den späteren sicheren Implementierungsrahmen:

```text
1. neue Tabelle dashboard_user_admin_notes planen
2. disabled/read-only Diagnose-Route planen
3. späteren Write-Endpunkt nur als separaten Folge-Step erlauben
4. Backup-/Rollback-Verfahren konkretisieren
5. Permission-/Confirm-/Lock-/Audit-/Read-Back-Kette finalisieren
6. harte Abbruchbedingungen festlegen
```

## Geplante Tabelle

Nur Plan. Noch keine Migration in RDAP13.

```sql
CREATE TABLE IF NOT EXISTS dashboard_user_admin_notes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  note_uid VARCHAR(96) NOT NULL,
  user_uid VARCHAR(64) NOT NULL,
  note_text TEXT NOT NULL,
  created_by_user_uid VARCHAR(64) NULL,
  updated_by_user_uid VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dashboard_user_admin_notes_uid (note_uid),
  KEY idx_dashboard_user_admin_notes_user (user_uid),
  KEY idx_dashboard_user_admin_notes_updated (updated_at),
  KEY idx_dashboard_user_admin_notes_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Wichtig zur Einzigartigkeit

`UNIQUE (user_uid, deleted_at)` wird **nicht** blind verwendet, weil MariaDB/MySQL-NULL-Semantik dabei leicht falsch verstanden werden kann. Für den ersten echten Write gibt es zwei sichere Varianten:

Variante A, empfohlen für den ersten Write:

```text
Eine aktive Notiz pro User, technisch per Service-Logik erzwingen:
- vor Insert/Update SELECT auf active note WHERE user_uid=? AND deleted_at IS NULL
- wenn vorhanden: UPDATE
- wenn nicht vorhanden: INSERT
```

Variante B, später möglich:

```text
zusätzliche Spalte active_key VARCHAR(96) NULL
UNIQUE(active_key)
active_key = user_uid nur für aktive Notiz
active_key = NULL für gelöschte/archivierte Notizen
```

Für RDAP13 bleibt es bei Planung. Die finale Entscheidung fällt erst im Umsetzungsstep mit echter Schema-Prüfung.

## Disabled/read-only Diagnose-Route

Der nächste technische Folge-Step darf eine read-only/disabled Diagnose vorbereiten, aber noch keinen Write aktivieren.

Geplante Route:

```text
GET /api/remote/admin/users/note-write-plan-diagnostic
```

Mögliche Antwort:

```json
{
  "ok": true,
  "module": "remote-modboard",
  "step": "RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN",
  "adminNoteWritePrepared": true,
  "tablePlanned": "dashboard_user_admin_notes",
  "permissionPlanned": "admin.users.note.write",
  "confirmWriteRequired": true,
  "lockScopeTemplate": "admin:user-note:<target_user_uid>",
  "productiveWritesEnabled": false,
  "writesStillBlocked": true,
  "uiWriteButtonsEnabled": false
}
```

Diese Route darf nur anzeigen, nicht schreiben.

## Späterer Write-Endpunkt

Noch nicht in RDAP13 bauen. Nur Zielbild:

```text
POST /api/remote/admin/users/:userUid/admin-note
```

Pflicht im späteren echten Write-Step:

```text
confirmWrite=true oder JSON confirmWrite: true
actor aus serverseitiger Session lesen
Permission serverseitig prüfen
Target-User serverseitig lesen
Lock holen
alten Notiz-Zustand lesen
Write ausführen
Read-Back ausführen
Audit schreiben
Lock freigeben
```

## Request-Body später

```json
{
  "noteText": "Interne Admin-Notiz",
  "confirmWrite": true
}
```

Grenzen:

```text
noteText max. 2000 Zeichen
trimmen
leer bedeutet nicht automatisch löschen; Löschen wird eigener Scope
keine HTML-Ausführung, Anzeige nur escaped
```

## Permission-Grenze

Geplante Permission:

```text
admin.users.note.write
```

Mindestanforderung:

```text
actor muss serverseitig angemeldet sein
actor muss owner/admin oder explizit berechtigt sein
Permission wird serverseitig geprüft
Frontend darf nur anzeigen, nie entscheiden
```

## Confirm-Write

Ohne Confirm muss der spätere Write blockieren:

```json
{
  "ok": false,
  "error": "confirm_write_required",
  "writesStillBlocked": true
}
```

Confirm reicht allein nicht. Confirm ist nur eine zusätzliche Pflicht neben Permission, Locking und Audit.

## Lock-Scope

```text
admin:user-note:<target_user_uid>
```

Regeln:

```text
Lock vor Write holen
kurzer Timeout
kein Force-Takeover im ersten echten Write
bei fremdem aktivem Lock abbrechen
Lock im finally-Pfad freigeben
```

## Audit-Payload

```json
{
  "source": "remote-modboard",
  "action": "admin.users.note.set",
  "permission_key": "admin.users.note.write",
  "resource_key": "dashboard_user:<target_user_uid>",
  "status": "success|failed|blocked",
  "old_value_summary": "len=<n>;sha256=<hash>;preview=<kurz>",
  "new_value_summary": "len=<n>;sha256=<hash>;preview=<kurz>",
  "actor_user_uid": "<actor_user_uid>",
  "actor_display_name": "<actor_display_name>",
  "request_id": "<request_id>",
  "correlation_id": "<correlation_id>"
}
```

Keine langen Notiztexte vollständig ins Audit duplizieren.

## Read-Back-Prüfung

Nach späterem Write muss geprüft werden:

```text
Notiz für target_user_uid gelesen
note_uid vorhanden
note_text entspricht gespeichertem Wert
updated_by_user_uid entspricht actor
updated_at plausibel
Target-User existiert weiterhin in dashboard_users
```

Wenn Read-Back fehlschlägt:

```text
Write als failed behandeln
Audit status failed schreiben, sofern Audit verfügbar
keine Erfolgsmeldung ans Frontend
```

## Backup vor späterem Umsetzungsstep

Vor echter Migration oder echtem Write muss die reale Server-DB bekannt sein. Nicht raten.

Template:

```bash
mkdir -p /opt/stream-control-center/_backups/rdap

mysqldump --single-transaction --routines --triggers   --default-character-set=utf8mb4   "$SCC_REMOTE_DB_NAME"   > "/opt/stream-control-center/_backups/rdap/${STEP_NAME}_$(date +%Y%m%d_%H%M%S).sql"
```

Vor Ausführung muss geprüft werden:

```text
Welche Env-/Config-Variable enthält Host/User/DB?
Läuft MariaDB/MySQL oder etwas anderes?
Hat der DB-User SELECT/LOCK/CREATE/ALTER/INSERT/UPDATE-Rechte?
Wo liegt das Backup?
Wie wird Restore getestet?
```

## Rollback

### Rollback Tabelle

Nur erlaubt, wenn Tabelle in diesem Scope erstellt wurde und noch keine produktiv benötigten Notizen enthält:

```sql
DROP TABLE IF EXISTS dashboard_user_admin_notes;
```

### Rollback einzelne Notiz

Vor jedem späteren Write muss der alte Zustand gespeichert werden:

```text
old note exists: ja/nein
old note_uid
old note_text hash/preview
old updated_at
```

Rollback bei Update:

```sql
UPDATE dashboard_user_admin_notes
SET note_text = ?, updated_by_user_uid = ?, updated_at = CURRENT_TIMESTAMP
WHERE note_uid = ?;
```

Rollback bei Insert:

```sql
UPDATE dashboard_user_admin_notes
SET deleted_at = CURRENT_TIMESTAMP, updated_by_user_uid = ?
WHERE note_uid = ?;
```

## Fehlerfälle / Abbruchbedingungen

Der spätere echte Write muss abbrechen bei:

```text
actor nicht angemeldet
actor nicht berechtigt
confirmWrite fehlt
target_user_uid fehlt/ungültig
Target-User existiert nicht
noteText fehlt/zu lang
DB nicht erreichbar
Notiz-Tabelle fehlt, wenn Migration nicht bestätigt wurde
Lock nicht erhältlich
Audit-Pflicht aktiv, aber Audit nicht möglich
Read-Back stimmt nicht
writesEnabled false
produktive Writes global disabled
```

## Nächster Schritt nach RDAP13

Erst nach separatem Go:

```text
RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC
```

Empfohlener Inhalt:

```text
- SQL-Migration nur als Datei vorbereiten, nicht ausführen
- read-only Diagnose-Route bauen
- Status meldet weiterhin writes disabled
- keine UI-Schreibbuttons
- keine produktiven Admin-Notizen schreiben
```

# RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN

Stand: 2026-06-24  
Projekt: `stream-control-center` / RDAP Remote-Modboard  
Typ: reiner Plan-/Scope-Step  
Status: Planung, kein produktiver Write

## Kurzfazit

Der erste spätere echte Admin-Write soll **nicht** Freigaben, Rollen, Gruppen, Sessions oder Permissions verändern.

Der kleinste sinnvolle Write ist:

```text
Admin-Notiz zu einem Dashboard-User setzen/aktualisieren
```

Wichtig: Im aktuell bekannten RDAP6C-Auth-Schema hat `dashboard_users` kein Notizfeld. Deshalb darf der echte Write nicht blind in vorhandene Security-Tabellen gequetscht werden. Für den späteren Write wird eine eigene kleine Tabelle geplant:

```text
dashboard_user_admin_notes
```

Damit bleibt der erste Write fachlich nützlich, aber sicherheitlich harmlos.

## Warum nicht Rollen/Freigaben/Sessions als erster Write?

Nicht als erster Write verwenden:

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Permissions direkt ändern
Status eines Users ändern
```

Grund: Diese Aktionen ändern sofort Zugriff, Sicherheit oder laufende Sessions. Das ist für den ersten Schreibtest zu riskant.

## Geplanter erster Mini-Write

### Aktion

```text
admin.users.note.set
```

### Zweck

Ein Owner/Admin kann später zu einem vorhandenen Dashboard-User eine interne Notiz speichern, zum Beispiel:

```text
Mod seit 2026, darf später Sound-Profi-Rechte bekommen.
```

Diese Notiz hat **keine direkte Sicherheitswirkung**.

### Nicht-Zweck

Die Notiz darf nicht benutzt werden für:

```text
Freischalten/Sperren
Rollenvergabe
Gruppenvergabe
Permission-Entscheidungen
Session-Entzug
Automatische Rechteableitung
```

## Geplante Tabelle

Nur als Plan. Noch keine Migration in diesem Step.

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
  UNIQUE KEY uq_dashboard_user_admin_notes_user_active (user_uid, deleted_at),
  KEY idx_dashboard_user_admin_notes_user (user_uid),
  KEY idx_dashboard_user_admin_notes_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Hinweis zur Unique-Regel: Vor echter Umsetzung muss geprüft werden, ob `UNIQUE (user_uid, deleted_at)` im Zielsystem die gewünschte Semantik zuverlässig abbildet. Falls nicht, wird statt Soft-Delete eine `is_active`-Spalte oder eine eindeutige `active_note_key` verwendet. Das wird erst im separaten Migrations-/Implementierungsstep entschieden.

## Betroffener Datenpfad

Späterer Write betrifft nur:

```text
dashboard_user_admin_notes.note_text
dashboard_user_admin_notes.updated_by_user_uid
dashboard_user_admin_notes.updated_at
```

Read-Back zusätzlich gegen:

```text
dashboard_users.user_uid
dashboard_users.display_name
dashboard_users.login_name
```

## Permission-Grenze

Für den späteren Write wird eine neue Permission geplant:

```text
admin.users.note.write
```

Mindestanforderung:

```text
actor muss owner/admin sein
Permission admin.users.note.write muss serverseitig erlaubt sein
Frontend darf diese Entscheidung nur anzeigen, nie erzwingen
```

## Confirm-Write-Anforderung

Jede spätere Write-Route braucht explizit:

```text
confirmWrite: true
```

Ohne Confirm:

```json
{
  "ok": false,
  "error": "confirm_write_required"
}
```

## Lock-Scope

Geplanter Lock-Scope:

```text
admin:user-note:<target_user_uid>
```

Regeln:

```text
Lock vor Write holen
Lock-Timeout kurz halten
bei aktivem fremdem Lock abbrechen
kein Force-Takeover im ersten echten Write
Lock nach Erfolg/Fehler sauber freigeben
```

## Audit-Payload

Geplanter Audit-Eintrag:

```json
{
  "source": "remote-modboard",
  "action": "admin.users.note.set",
  "permission_key": "admin.users.note.write",
  "resource_key": "dashboard_user:<target_user_uid>",
  "status": "success|failed|blocked",
  "old_value_summary": "sha256/length/preview der alten Notiz, keine langen Klartexte",
  "new_value_summary": "sha256/length/preview der neuen Notiz, keine langen Klartexte",
  "actor_user_uid": "<actor_user_uid>",
  "actor_display_name": "<actor_display_name>",
  "request_id": "<request_id>",
  "correlation_id": "<correlation_id>"
}
```

Wichtig: Audit darf keine unnötig langen Notiztexte komplett duplizieren. Kurze Preview plus Länge/Hash reicht.

## Backup-Befehl vor späterer Umsetzung

Vor echtem Migrations-/Write-Step muss auf dem Webserver ein Backup erstellt werden. Der konkrete DB-Name und Zugang werden nicht ins Repo geschrieben. Der spätere Befehl muss aus Server-Env/Config kommen.

Template:

```bash
mkdir -p /opt/stream-control-center/_backups/rdap

mysqldump --single-transaction --routines --triggers   --default-character-set=utf8mb4   "$SCC_REMOTE_DB_NAME"   > "/opt/stream-control-center/_backups/rdap/${STEP_NAME}_$(date +%Y%m%d_%H%M%S).sql"
```

Falls die produktive Remote-DB nicht MariaDB/MySQL ist, muss der Backup-Befehl vor Umsetzung an die echte DB angepasst werden. Nicht raten.

## Rollback-Befehl

Für den geplanten Notiz-Write gibt es zwei Ebenen.

### Rollback nach Migrationstest

Wenn die neue Tabelle separat eingeführt wurde und direkt zurückgenommen werden soll:

```sql
DROP TABLE IF EXISTS dashboard_user_admin_notes;
```

Nur erlaubt, wenn vorher bestätigt wurde, dass die Tabelle ausschließlich aus diesem Step stammt und keine produktiv benötigten Notizen enthält.

### Rollback eines einzelnen Notiz-Writes

Für einen einzelnen Notiz-Write muss vor dem Write der alte Zustand gelesen werden:

```text
old_note_text
old_deleted_at
old_updated_by_user_uid
old_updated_at
```

Rollback-Strategie:

```text
Wenn vorher keine aktive Notiz existierte: neue Notiz soft-deleten oder entfernen.
Wenn vorher aktive Notiz existierte: alten Text und alte Metadaten wiederherstellen.
Danach Read-Back prüfen und Audit-Rollback-Eintrag schreiben.
```

## Read-Back-Prüfung

Nach jedem späteren Write zwingend:

```sql
SELECT user_uid, note_text, updated_by_user_uid, updated_at, deleted_at
FROM dashboard_user_admin_notes
WHERE user_uid = ? AND deleted_at IS NULL;
```

Erfolg nur, wenn:

```text
Zieldatensatz existiert
note_text exakt dem gewünschten Wert entspricht
updated_by_user_uid dem Actor entspricht
kein deleted_at gesetzt ist
```

## Fehlerfälle und harte Abbruchbedingungen

Abbrechen ohne Write bei:

```text
actor nicht eingeloggt
actor nicht owner/admin
Permission admin.users.note.write fehlt
confirmWrite fehlt oder ist false
target_user_uid fehlt
target_user_uid existiert nicht in dashboard_users
note_text leer oder zu lang
note_text enthält ungültige Steuerzeichen
fremder aktiver Lock vorhanden
Backup fehlt im produktiven Step
Audit-Write nicht vorbereitet
Read-Back nicht möglich
DB-Adapter meldet unbekannte/inkompatible Tabelle
```

## UI-Regel für später

Im ersten echten Write-Step keine große Admin-Verwaltung bauen.

Maximal später erlaubt:

```text
Admin -> Benutzerverwaltung -> User-Detail -> Admin-Notiz bearbeiten
```

Noch nicht erlaubt:

```text
Freigeben/Sperren-Buttons
Rollen-Buttons
Gruppen-Buttons
Session-widerrufen-Buttons
Permission-Editor
Bulk-Actions
```

## Was dieser RDAP12-Step nicht macht

```text
Keine Code-Dateien
Keine Backend-Routen
Keine DB-Migration
Keine SQL-Ausführung
Keine UI-Schreibbuttons
Keine Audit-Inserts
Keine Lock-Writes
Keine produktiven Writes
Keine Workflow-Tools
Keine Secrets
```

## Nächster möglicher Step nach RDAP12

Nur nach weiterem ausdrücklichem Go:

```text
RDAP_ADMIN_USERS13_ADMIN_NOTE_TABLE_AND_DISABLED_ROUTE_PLAN
```

Empfohlene Reihenfolge:

```text
1. Tabelle/Schema-Migration separat planen und als disabled vorbereiten.
2. Read-only Diagnose für Notiz-Tabelle bauen.
3. Erst danach echten Write mit Confirm, Permission, Lock, Audit, Backup/Rollback und Read-Back bauen.
```

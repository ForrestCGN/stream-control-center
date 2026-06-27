# RDAP34_ADMIN_AUDIT_SCHEMA_MIGRATION_DECISION_PLAN

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Plan-/Entscheidungsstep, **keine Backend-/UI-/DB-Aenderung**

---

## 1. Zweck

RDAP34 entscheidet den langfristig sauberen Weg fuer Audit-/Lock-Writes.

Nach RDAP33B ist live bestaetigt:

```text
dashboard_audit_log existiert.
dashboard_audit_log ist fuer das geplante generische Audit-Write-Zielbild noch nicht direkt kompatibel.
dashboard_locks existiert und wirkt fuer einen ersten Lock-Write-Kandidaten brauchbar.
writesMayBeBuiltNow: false
Blocker: audit_write_candidate_columns_missing
```

Forrest hat fuer "direkt richtig machen" Option B gewaehlt:

```text
Option B: bestehende dashboard_audit_log sanft erweitern.
```

RDAP34 fuehrt selbst keine Migration aus und baut keine Writes.

---

## 2. Ausgangsstand nach RDAP33B

RDAP33 Route:

```text
GET /api/remote/admin/audit-lock/schema-status
GET /api/remote/lock-audit/schema-status
```

Sicherheitsstatus:

```text
readOnly: true
writeEnabled: false
databaseWriteEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
migrationEnabled: false
auditInsertEnabled: false
lockAcquireEnabled: false
lockHeartbeatEnabled: false
lockReleaseEnabled: false
lockForceTakeoverEnabled: false
uiWriteButtonsEnabled: false
```

---

## 3. Live-Schema-Befund: Audit

Tabelle:

```text
dashboard_audit_log
```

RDAP33 Live-Befund:

```text
tableExists: true
schemaReady: false
rowCount: 0
compatibleForRead: false
compatibleForWriteCandidate: false
auditInsertEnabled: false
```

Erkannte Spalten:

```text
id
audit_uid
created_at
actor_user_uid
actor_display_name
source
action
permission_key
resource_key
status
old_value_summary
new_value_summary
request_id
correlation_id
```

Fehlende erwartete Spalten aus dem generischen Zielbild:

```text
actor_login
resource_type
error_code
safe_metadata_json
completed_at
```

Konkreter Write-Blocker:

```text
missingWriteCandidateColumns:
- resource_type
```

---

## 4. Live-Schema-Befund: Locks

Tabelle:

```text
dashboard_locks
```

RDAP33 Live-Befund:

```text
tableExists: true
schemaReady: false
rowCount: 0
activeCount: 0
expiredCount: 0
compatibleForRead: true
compatibleForWriteCandidate: true
```

Erkannte Spalten:

```text
id
lock_uid
resource_key
owner_user_uid
status
heartbeat_at
expires_at
created_at
updated_at
version_token
```

Bewertung:

```text
Lock-Tabelle wirkt fuer einen ersten kontrollierten Lock-Write-Kandidaten ausreichend.
Lock-Writes bleiben trotzdem deaktiviert, bis Audit-Schema sauber vorbereitet ist.
```

---

## 5. Bewertete Optionen

### Option A: Vorhandenes Audit-Schema nur mappen

Bewertung:

```text
Schneller und ohne Migration.
Aber nicht langfristig sauber genug.
resource_type waere nur implizit in source/action/resource_key versteckt.
Spaetere Filter/Auswertungen waeren schwerer und uneinheitlicher.
```

Status:

```text
Nicht gewaehlt.
```

---

### Option B: Bestehende Audit-Tabelle sanft erweitern

Beschreibung:

```text
dashboard_audit_log bleibt die zentrale Audit-Tabelle.
Es wird keine neue Parallelstruktur gebaut.
Bestehende Daten bleiben erhalten.
Fehlende Spalten werden sanft per ALTER TABLE ergaenzt, nur wenn sie fehlen.
```

Vorgeschlagene Zusatzspalten:

```text
resource_type VARCHAR(128) NULL
actor_login VARCHAR(128) NULL
error_code VARCHAR(128) NULL
safe_metadata_json LONGTEXT NULL
completed_at DATETIME NULL
```

Vorteile:

```text
Langfristig saubereres Audit-Schema.
Klare Trennung von resource_type und resource_key.
Bessere spaetere Filterung im Dashboard.
Bessere Debug-/Admin-/Security-Auswertung.
Kein neues Parallel-Audit-System.
Vorhandene Tabelle und vorhandene Helper bleiben Grundlage.
```

Risiken:

```text
DB-Migration erforderlich.
Backup/Read-only Vorpruefung/Read-Back/Rollback-Hinweis Pflicht.
Keine Migration ohne separaten ausdruecklichen Go.
```

Status:

```text
Gewaehlt.
```

---

### Option C: Neue Parallelstruktur

Bewertung:

```text
Nicht empfohlen.
Wuerde doppelte Audit-Welten erzeugen.
Widerspricht der Regel, vorhandene Systeme zu nutzen.
```

Status:

```text
Verworfen.
```

---

## 6. RDAP34 Entscheidung

Verbindliche Entscheidung fuer die naechsten Steps:

```text
Option B: bestehende dashboard_audit_log sanft erweitern.
```

Wichtig:

```text
RDAP34 ist nur Entscheidung/Doku.
RDAP34 fuehrt keine Migration aus.
RDAP34 baut keine Writes.
RDAP34 vergibt keine Permissions.
RDAP34 aktiviert keine Admin-Notiz-Schreibfunktion.
```

---

## 7. Naechster empfohlener Step

```text
RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED
```

Ziel:

```text
Sanfte Migration der bestehenden dashboard_audit_log vorbereiten.
SQL-Datei mit IF-NOT-EXISTS-Logik bzw. sicherer Spaltenpruefung.
Backup-/Read-only-Vorpruefung dokumentieren.
Keine produktiven Writes.
```

Danach erst:

```text
RDAP36_ADMIN_AUDIT_SCHEMA_MIGRATION_CONFIRMED
```

oder, wenn RDAP35 direkt als kontrollierter Migrationsstep gebaut wird:

```text
RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_CONFIRMED
```

Empfehlung:

```text
RDAP35 darf ein DB-Migrationsstep sein, aber nur mit:
- Backup
- Backup-Dateigroessenpruefung
- INFORMATION_SCHEMA-Vorpruefung
- SQL nur fuer fehlende Spalten
- Read-Back
- RDAP33 Route danach erneut pruefen
- produktive Writes bleiben weiterhin gesperrt
```

---

## 8. Pflicht fuer RDAP35-Migration

Vor SQL-Ausfuehrung:

```text
DB-Env pruefen, ohne Secrets zu posten.
Backup von dashboard_audit_log per mysqldump.
Backup-Datei existiert und ist nicht 0 Byte.
INFORMATION_SCHEMA pruefen.
```

Migration darf nur:

```text
fehlende Spalten ergaenzen
keine bestehende Spalte loeschen
keine bestehende Spalte umbenennen
keine Daten veraendern
keine Tabelle droppen
keine Parallelstruktur anlegen
```

Nach SQL-Ausfuehrung:

```text
SHOW COLUMNS / INFORMATION_SCHEMA Read-Back
RDAP33 Schema-Statusroute erneut pruefen
rowCount darf unveraendert bleiben
writesStillBlocked muss true bleiben
auditInsertEnabled muss false bleiben, bis separater Write-Step kommt
```

---

## 9. Weiterhin nicht erlaubt

```text
Admin-Notiz produktiv schreiben
Admin-Notiz produktiv aendern
Admin-Notiz produktiv deaktivieren
admin.users.note.write Permission vergeben
UI-Schreibbuttons
Audit-Testinsert
Lock acquire/heartbeat/release/force-takeover
physisches Delete
Community-Seiten-Anbindung
User-/Rollen-/Session-Writes
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

---

## 10. Ergebnis von RDAP34

```text
Direkt-richtig-Entscheidung getroffen.
Audit-Tabelle soll sanft erweitert werden.
Naechster Step ist RDAP35 Audit-Schema-Migration vorbereitet/bestaetigt.
Keine Backend-Dateien.
Keine UI-Dateien.
Keine DB-Aenderung.
Kein Webserver-Deploy.
```

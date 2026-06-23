# RDAP6I Auth DB Production Migration Runbook

Stand: 2026-06-23  
Status: Runbook / Ablaufplan, keine Ausfuehrung

## Zweck

RDAP6I dokumentiert den sicheren Ablauf fuer eine spaetere produktive Auth-DB-Migration in der echten Remote-Modboard-Datenbank `c3stream_control`.

Dieser Step ist nur Dokumentation. Er fuehrt keine SQL-Datei aus, aktiviert keine Authentifizierung, erstellt keine Sessions und schaltet keine Schreibfunktionen frei.

## Ausgangslage

Bestaetigt:

```text
RDAP6D Testdatenbanklauf auf scc_rdap6_test bestanden
RDAP6E Test-DB-Ergebnis dokumentiert
RDAP6F Ziel-DB geplant: c3stream_control
RDAP6G Remote-Modboard read-only DB-Layer umgesetzt
RDAP6H /api/remote/auth/model live read-only getestet
```

Aktueller Live-Test RDAP6H:

```text
Service: active
moduleBuild: RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST
/api/remote/routes: OK
/api/remote/auth/model: OK
database.reachable: true
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
schema.ready: false
```

`schema.ready=false` ist korrekt, solange die RDAP6C-Tabellen in `c3stream_control` noch nicht produktiv angelegt wurden.

## Ziel-DB

```text
DB-Typ: MariaDB
DB-Name: c3stream_control
DB-User: c1stream_control
Remote Access: aus
Charset: utf8mb4
```

Passwoerter werden nicht dokumentiert und duerfen nicht ins Repo, Frontend oder Chat.

## Zu verwendende SQL-Dateien

Aus GitHub/dev:

```text
db/rdap6c/sql/001_rdap6c_schema_migration.sql
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
db/rdap6c/checks/rdap6c_validation_queries.sql
```

Wichtig: Diese Dateien duerfen erst nach Backup, Restore-Weg und separatem Go ausgefuehrt werden.

## Nicht-Aenderungen in RDAP6I

```text
keine SQL-Ausfuehrung
keine produktive Migration
keine Auth-Aktivierung
keine Session-Erstellung
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine nginx-/systemd-Aenderung
keine lokale SQLite-Aenderung
keine Secrets im Repo oder Frontend
```

## Harte Stop-Punkte

Sofort stoppen, wenn einer dieser Punkte zutrifft:

```text
Backup konnte nicht erstellt werden
Backup-Datei ist 0 Byte oder fehlt
DB-Verbindung zur Ziel-DB ist unklar
DB_NAME/DB_USER wirken vertauscht
SQL-Datei fehlt oder ist nicht aus GitHub/dev
Import meldet Fehler
Validation liefert sound_profi_role_count != 0
Validation liefert sound_profi_role_permission_count != 0
/api/remote/auth/model crasht oder antwortet nicht
writeEnabled/authEnabled/sessionCreationEnabled ist irgendwo true
```

## Sicherer Ablauf fuer spaetere Ausfuehrung

### Phase 1 - Arbeitsort klaeren

Arbeitsort fuer eine echte Ausfuehrung waere ausschliesslich:

```text
Server-Konsole auf web.cgn.community
```

Nicht parallel lokale PowerShell, GitHub-UI und MariaDB-Konsole mischen.

### Phase 2 - Frischen Repo-Stand holen

Vor einer echten Migration wird ein frischer Arbeitsordner aus `dev` genutzt, z. B.:

```text
/root/rdap6i-migration/stream-control-center
```

Dort muessen die SQL- und Validation-Dateien aus `db/rdap6c` vorhanden sein.

### Phase 3 - Ziel-DB vor Migration pruefen

Vor jeder SQL-Ausfuehrung pruefen:

```text
Ziel-DB ist c3stream_control
DB-User ist c1stream_control
Service /api/remote/auth/model ist read-only erreichbar
schema.ready ist vor Migration erwartbar false
```

### Phase 4 - Backup erstellen

Vor Migration muss ein vollstaendiges MariaDB-Backup der Ziel-DB erstellt werden.

Backup-Anforderungen:

```text
Backup-Datei mit Timestamp
Backup ausserhalb des Repo-Arbeitsordners
Backup-Datei existiert
Backup-Datei ist nicht leer
Backup-Pfad wird dokumentiert
```

Empfohlener Zielordner:

```text
/root/rdap6i_backup/
```

### Phase 5 - Optionaler Restore-Test / Rollback-Weg

Vor Produktivmigration muss klar sein, wie zurueckgerollt wird:

```text
Service stoppen oder unveraendert read-only lassen
Ziel-DB aus Backup wiederherstellen
Service neu starten
/api/remote/auth/model erneut pruefen
```

Ein echter Restore-Test sollte vorzugsweise gegen eine separate Restore-Testdatenbank erfolgen, nicht blind gegen die Ziel-DB.

### Phase 6 - Produktiv-SQL nur mit separatem Go

Erst nach ausdruecklichem Go fuer die echte Migration:

```text
001_rdap6c_schema_migration.sql
002_rdap6c_seed_roles_groups_permissions.sql
rdap6c_validation_queries.sql
```

SQL-Reihenfolge darf nicht getauscht werden.

### Phase 7 - Erwartete Validation nach erfolgreicher Migration

Erwartete Kernwerte:

```text
sound_profi_role_count = 0
sound_profi_group_marker_count = 1
sound_profi_role_permission_count = 0
module_permission_table_rows = 0
session_rows = 0
lock_rows = 0
audit_rows = 0
```

Je nach Validation-Ausgabe koennen Rollen-/Permission-Zeilen vorhanden sein. Kritisch ist:

```text
sound_profi ist keine Rolle
sound_profi ist Gruppe/Marker
sound_profi hat keine globalen Rollenrechte
Sessions/Locks/Audit bleiben leer, solange keine Auth-/Lock-/Write-Funktionen aktiv sind
```

### Phase 8 - Remote-Modboard Nachtest

Nach erfolgreicher Migration muss `/api/remote/auth/model` liefern:

```text
ok: true
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
database.reachable: true
schema.ready: true
```

Dazu sollte die Route Rollen, Gruppen und Permissions lesen koennen.

## Rollback-Plan bei Fehlern

Wenn Migration oder Validation fehlschlaegt:

```text
1. Keine weiteren SQL-Dateien ausfuehren.
2. Fehlerausgabe sichern.
3. Service nicht auf neue Auth-/Write-Funktion erweitern.
4. Backup-Pfad pruefen.
5. Ziel-DB aus Backup wiederherstellen, falls Schema teilweise geschrieben wurde.
6. /api/remote/auth/model erneut testen.
7. Ergebnis dokumentieren.
```

Wichtig: Solange RDAP6G/RDAP6H read-only bleibt, ist ein Schemafehler zwar unschoen, aber es sind noch keine Login-/Session-/Write-Flows aktiv.

## Sicherheitsregeln fuer spaetere Auth-Schritte

Nach Migration darf trotzdem nicht automatisch Auth aktiv werden.

Auth/Login braucht spaeter einen eigenen Step:

```text
RDAP7_LOGIN_SESSION_CONCEPT
```

Dort separat zu planen:

```text
Login-Provider / Twitch-OAuth
Session-Cookies / SameSite / Secure
CSRF-Schutz
Session-Expiry
Logout / Session-Revoke
Permission-Middleware
Audit-Pflicht
Lock-Pflicht bei Schreibvorgaengen
```

## Naechster sinnvoller Schritt

Nach diesem Runbook waere der naechste Schritt:

```text
RDAP6J_AUTH_DB_PRODUCTION_MIGRATION_EXECUTION_PRECHECK
```

RDAP6J darf nur Precheck sein, ausser Forrest gibt ausdruecklich ein separates Go fuer echte SQL-Ausfuehrung.

# CHANGELOG

Stand: RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION  
Datum: 2026-06-25

## RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION

Typ: DB-Migration vorbereitet / SQL-Datei + Anleitung  
DB: SQL-Datei bereitgestellt, aber keine automatische Ausfuehrung  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein  
Workflow-Tools: nein  
Code-Aenderung: nein

### Ergebnis

RDAP16 stellt die SQL-Datei fuer die Tabelle bereit:

```text
tools/rdap16_admin_note_table_migration.sql
```

Die begleitende Anleitung liegt unter:

```text
docs/current/RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION.md
```

Der Install-/Deploy-Workflow fuehrt kein SQL automatisch aus.

### Geplante Tabelle

```text
dashboard_user_admin_notes
```

Zweck:

```text
Interne Admin-/Mod-Notizen zu Dashboard-Usern.
```

### Erwartung nach manueller Server-Migration

```text
tableExists: true
schemaReady: true
migrationRequired: false
writesStillBlocked: true
writeEnabled: false
productiveWritesEnabled: false
```

### Geaendert

```text
docs/current/RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION.md
tools/rdap16_admin_note_table_migration.sql
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

### Nicht geaendert

```text
Keine Backend-Code-Dateien.
Keine DB-Dateien.
Keine automatische SQL-Ausfuehrung.
Keine CREATE TABLE Ausfuehrung durch Install/Deploy.
Keine Admin-Notiz-Writes.
Keine POST/PUT/PATCH/DELETE-Route.
Keine Audit-Inserts.
Keine Lock-Writes.
Keine UI-Schreibbuttons.
Keine Workflow-Tools.
```

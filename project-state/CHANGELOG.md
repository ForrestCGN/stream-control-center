# CHANGELOG

## STEP273A – Command-System Core

- Neues Backend-Modul `backend/modules/commands.js` ergänzt.
- API-Routen `/api/commands/*` ergänzt.
- Sanfte DB-Tabellen `command_definitions` und `command_execution_log` vorbereitet.
- Seed-Commands für `!rip`, `!tode` und `!dcount` ergänzt.
- Trockentest per `/api/commands/test` ergänzt.
- Ausführung per `/api/commands/execute` ergänzt.
- Idempotentes Hook-Tool für `twitch_presence.js` ergänzt.
- Dokumentation für STEP273A ergänzt.

## STEP272J – Sound-Pegel Stable-Doku

- Sound-Pegel-Zwischenstand dokumentiert.
- Backup-/Rollback-Workflow dokumentiert.
- Scan-Excludes dokumentiert.
- Bekannte Restpunkte dokumentiert.
- Unkritische Scan-Fehler dokumentiert.
- Empfohlenen weiteren Ablauf dokumentiert.

## Vorherige relevante Steps

### STEP272I5
- `startedAt is not defined` in `/api/sound/loudness/scan` gefixt.
- Scan läuft wieder vollständig.

### STEP272I4
- Scan-Excludes für `normalized`, `_backup_loudness`, `generated` ergänzt.

### STEP272I3
- Boost-Dashboard von langer Liste auf Dropdown-Auswahl umgestellt.

### STEP272I2
- Verwendungsprüfung für Alert-/SoundAlert-Dateien ergänzt.

### STEP272I1
- Testplay und Originalschutz im Dashboard ergänzt.

### STEP272I
- Boost-Workflow mit Slider/Dropdown vorbereitet.

### STEP272H
- Promote mit Backup/Rollback ergänzt.

### STEP272G/G1
- Boost-Kopien und Referenz-basiertes Boost-Ziel ergänzt.

### STEP272F
- Fehlende Alert-Volumes auf 80 gesetzt.

### STEP272D/D1
- Sound-System-Defaults vollständig auf 80 gesetzt.

### STEP272C
- Sound-Pegel-Config in SQLite ergänzt.

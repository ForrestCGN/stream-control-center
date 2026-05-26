# STEP491_CHANNELPOINTS_DB_SCHEMA_PREP

Stand: 2026-05-26

## Ziel

STEP491 bereitet die Datenbankstruktur fuer das Kanalpunkte-System als sichere Schema-Vorschau vor.

Wichtig: In diesem STEP wird keine Datenbankmigration ausgefuehrt.

## Geaendert

- `backend/modules/channelpoints.js`
  - Version `0.3.0`
  - Modus `backend_schema_prep`
  - neue Route `GET /api/channelpoints/schema-preview`
  - Schema-Preview fuer geplante Tabellen/Felder/Indexes
  - Seed-Preview fuer Default-Kategorien
  - Safety-Regeln im Status sichtbar
- `docs/modules/channelpoints-deep-dive.md`
  - Schema-Preview dokumentiert
  - Media-Regel weiterhin fest: bestehendes Media-System nutzen
- Projektstatus-/TODO-/NEXT_STEPS-Dokus aktualisiert

## Nicht geaendert

- Keine echte DB-Migration
- Keine Tabellenanlage in `app.sqlite`
- Keine Twitch-Schreibaktionen
- Kein Dashboard-Umbau
- Kein neues Upload-System

## Neue Route

```text
GET /api/channelpoints/schema-preview
```

Erwartung:

```text
status = preview_only_no_db_write
dbMigrationEnabled = false
migrationExecutionImplemented = false
sqliteCompatible = true
```

## Naechster Schritt

STEP492 sollte nach ausdruecklichem Go die echte additive Migration vorbereiten/ausfuehren, weiterhin ohne Twitch-Schreibaktionen.

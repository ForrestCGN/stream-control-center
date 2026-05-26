# CURRENT_STATUS

Stand: 2026-05-26 / STEP491_CHANNELPOINTS_DB_SCHEMA_PREP

## Aktueller Arbeitsstand

STEP491 erweitert das Kanalpunkte-Modul um eine sichere DB-Schema-Vorschau. Das Modul zeigt geplante Tabellen, Felder, Indexe und Seed-Kategorien, fuehrt aber noch keine Migration aus.

## Kanalpunkte-System

- `backend/modules/channelpoints.js` steht jetzt auf Version `0.3.0`.
- Modus: `backend_schema_prep`.
- Bestehende Routen bleiben erhalten:
  - `GET /api/channelpoints/status`
  - `GET /api/channelpoints/model`
  - `GET /api/channelpoints/media-plan`
  - `GET /api/channelpoints/bus-test`
- Neue Route:
  - `GET /api/channelpoints/schema-preview`
- Geplante Tabellen:
  - `channelpoints_categories`
  - `channelpoints_rewards`
  - `channelpoints_redemptions`
- Keine DB-Migration in STEP491.
- Keine Twitch-Schreibaktionen in STEP491.
- Media bleibt ueber das bestehende Media-System/Media-Picker geplant.

## Communication Bus

Das Kanalpunkte-Modul bleibt am Communication Bus registriert und meldet Status/Heartbeat. Zusaetzliche Capability: `channelpoints.schema`.

## Naechster sinnvoller Schritt

`STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE`

Ziel: Nach explizitem Go additive Tabellenanlage mit `CREATE TABLE IF NOT EXISTS` und `CREATE INDEX IF NOT EXISTS`, ohne Datenverlust und ohne Twitch-Schreibaktionen.

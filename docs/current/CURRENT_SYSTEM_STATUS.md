# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP491

## Stream-Control-Center

Aktueller Schwerpunkt: Kanalpunkte-System als neues Fachmodul auf Basis des Communication Bus.

## Kanalpunkte-System

STEP491 fuegt eine sichere DB-Schema-Vorschau hinzu:

- `backend/modules/channelpoints.js` Version `0.3.0`
- Modus `backend_schema_prep`
- neue Route `GET /api/channelpoints/schema-preview`
- geplante Tabellen:
  - `channelpoints_categories`
  - `channelpoints_rewards`
  - `channelpoints_redemptions`
- keine DB-Schreiboperation in STEP491
- keine Twitch-Schreibaktion in STEP491

## Media-Regel

Uploads/Medien fuer Kanalpunkte muessen ueber das bestehende Media-System laufen:

- `backend/modules/media.js`
- bestehende Dashboard-Upload-Maske
- `htdocs/dashboard/components/media_picker.js`
- `htdocs/dashboard/components/media_field.js`

Keine zweite Upload- oder Asset-Struktur fuer Kanalpunkte erstellen.

## Communication Bus

Das Kanalpunkte-Modul registriert sich am Bus, sendet Heartbeat/Status und bietet einen Selftest. STEP491 ergaenzt die Capability `channelpoints.schema`.

## Naechster Schritt

`STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE`

Nur nach explizitem Go: additive Tabellenanlage ohne Datenverlust.

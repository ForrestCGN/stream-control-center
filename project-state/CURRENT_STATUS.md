# CURRENT_STATUS

Stand: 2026-05-26 / STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE

## Aktueller Arbeitsstand

STEP492 legt die sichere lokale DB-Grundlage fuer das Kanalpunkte-System an.

## Kanalpunkte-System

- `backend/modules/channelpoints.js` steht auf Version `0.4.0`.
- Modus: `backend_db_migration_safe`.
- Neue Route: `GET /api/channelpoints/db-status`.
- Schema-Version: `channelpoints = 1`.
- Angelegte Tabellen:
  - `channelpoints_categories`
  - `channelpoints_rewards`
  - `channelpoints_redemptions`
- Default-Kategorien werden per `INSERT OR IGNORE` angelegt.

## Sicherheit

- Migration ist additiv.
- Produktive SQLite wird nicht ersetzt.
- Keine Twitch-Schreibaktionen.
- Keine Dashboard-Aenderungen.
- Medien bleiben beim bestehenden `media.js` / Media-Picker-System.

## Nächster sinnvoller Schritt

`STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD_API`

Ziel: lokale Reward-CRUD-/List-API auf den neuen Tabellen, noch ohne Twitch-Schreibaktionen.

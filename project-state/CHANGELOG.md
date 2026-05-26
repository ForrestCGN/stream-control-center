# CHANGELOG

## 2026-05-26 - STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE

- Kanalpunkte-Modul auf Version `0.4.0` erhoeht.
- Sichere lokale DB-Migration ergaenzt.
- Tabellen per `CREATE TABLE IF NOT EXISTS` vorbereitet:
  - `channelpoints_categories`
  - `channelpoints_rewards`
  - `channelpoints_redemptions`
- Indexe per `CREATE INDEX IF NOT EXISTS` vorbereitet.
- Default-Kategorien per `INSERT OR IGNORE` geseedet.
- Schema-Version `channelpoints = 1` ueber bestehende DB-Mechanik gesetzt.
- Neue Route `GET /api/channelpoints/db-status`.
- Communication-Bus-Status um DB-Statusinformationen erweitert.
- Keine Twitch-Schreibaktionen.
- Keine Upload-Parallelstruktur.

## 2026-05-26 - STEP491_CHANNELPOINTS_DB_SCHEMA_PREP

- Kanalpunkte-Schema als Preview vorbereitet.
- Keine DB-Migration ausgefuehrt.

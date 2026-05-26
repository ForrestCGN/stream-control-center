# Channelpoints Deep Dive

Stand: 2026-05-26 / STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD

## Ziel

Das Kanalpunkte-System ist ein neues Fachmodul für Twitch Custom Rewards. STEP493 ergänzt die lokale Reward-CRUD-Grundlage auf der bestehenden SQLite-Datenbank.

## Version

- Modul: `backend/modules/channelpoints.js`
- `moduleVersion`: `0.5.0`
- Modus: `backend_local_reward_crud`

## Aktive Routen

- `GET /api/channelpoints/status`
- `GET /api/channelpoints/model`
- `GET /api/channelpoints/media-plan`
- `GET /api/channelpoints/schema-preview`
- `GET /api/channelpoints/db-status`
- `GET /api/channelpoints/categories`
- `GET /api/channelpoints/rewards`
- `GET /api/channelpoints/rewards/:idOrKey`
- `POST /api/channelpoints/rewards`
- `PUT /api/channelpoints/rewards/:idOrKey`
- `PATCH /api/channelpoints/rewards/:idOrKey`
- `POST /api/channelpoints/rewards/:idOrKey/enable`
- `POST /api/channelpoints/rewards/:idOrKey/disable`
- `GET /api/channelpoints/bus-test`

## DB-Tabellen

- `channelpoints_categories`
- `channelpoints_rewards`
- `channelpoints_redemptions`

Die Migration ist additiv und nutzt ausschließlich `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` und `INSERT OR IGNORE`.

## Lokale CRUD-Regel

STEP493 schreibt nur lokale Reward-Konfigurationen in `channelpoints_rewards`.

Deaktivieren in STEP493 bedeutet nur:

- `system_enabled = 0`
- optional `is_paused = 1`

Es wird noch keine Twitch Custom Reward per API deaktiviert. Die spätere echte Twitch-Deaktivierung muss `is_enabled:false` über Twitch setzen.

## Media-Regel

Kanalpunkte verwenden das vorhandene Media-System:

- Modul: `media.js`
- Upload-Maske: bestehende Dashboard-Media-Upload-Maske
- Picker: `htdocs/dashboard/components/media_picker.js`
- Field-Komponente: `htdocs/dashboard/components/media_field.js`

Kein neues Upload-System, keine zweite Media-Tabelle, keine Upload-Endpunkte in `channelpoints.js`.

## EventBus

Das Modul registriert sich am Communication Bus und veröffentlicht Status-Updates. Capabilities:

- `channelpoints.status`
- `channelpoints.schema`
- `channelpoints.local_crud`
- `channelpoints.test.ping`

## Nicht in STEP493

- keine Twitch-Schreibaktionen
- keine Twitch Reward-Erstellung
- keine Twitch Reward-Synchronisierung
- kein Redemption-Handling
- kein Dashboard-Umbau

# channelpoints-deep-dive

Stand: 2026-05-26 / STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE

## Modul

- Datei: `backend/modules/channelpoints.js`
- Modul: `channelpoints`
- Version: `0.4.0`
- Prefix: `/api/channelpoints`
- Modus: `backend_db_migration_safe`

## Zweck

Das Kanalpunkte-System ist ein neues Fachmodul fuer Twitch Custom Rewards / Kanalpunkte. Es baut auf dem bestehenden Stream-Control-Center, dem Communication Bus, der zentralen SQLite-Schicht und dem vorhandenen Media-System auf.

## STEP492

STEP492 legt erstmals die lokale DB-Grundlage an. Die Migration ist bewusst additiv und sicher:

- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `INSERT OR IGNORE` fuer Default-Kategorien
- Schema-Version ueber `schema_versions` / vorhandene DB-Mechanik
- keine bestehenden Daten loeschen oder ersetzen
- keine Twitch-Schreibaktionen
- keine Dashboard-Aenderungen
- kein neues Upload-System

## Tabellen

### channelpoints_categories

Zweck: Dashboard-Gruppierung, Sortierung und Sichtbarkeit.

Wichtige Felder:

- `category_key`
- `label`
- `description`
- `sort_order`
- `enabled`
- `created_at`
- `updated_at`

Default-Kategorien per Seed:

- Allgemein
- Sounds
- Medien
- Overlays
- Challenges
- Admin/Intern

### channelpoints_rewards

Zweck: lokale Reward-Konfiguration, Twitch-Mapping, Action-/Media-Zuordnung.

Wichtige Felder:

- `reward_key`
- `twitch_reward_id`
- `title`
- `prompt`
- `cost`
- `category_key`
- `system_enabled`
- `twitch_is_enabled`
- `action_type`
- `action_key`
- `action_payload_json`
- `media_asset_id`
- `media_role`
- `queue_mode`
- `cooldown_seconds`
- `auto_fulfill`

Wichtig: `system_enabled` ist nur der lokale Systemschalter. Spaeteres Deaktivieren fuer Zuschauer muss Twitch `is_enabled=false` setzen.

### channelpoints_redemptions

Zweck: spaetere Redemption-Historie, Queue-Status, Fulfill-/Cancel-/Fehlertracking.

Wichtige Felder:

- `twitch_redemption_id`
- `twitch_reward_id`
- `reward_key`
- `user_id`
- `user_login`
- `user_display_name`
- `user_input`
- `status`
- `queue_group`
- `result_json`
- `redeemed_at`

## Media-System

Kanalpunkte duerfen kein eigenes Upload-System bekommen.

Feste Regel:

- Uploads laufen ueber das bestehende `media.js`.
- Dashboard-Auswahl erfolgt ueber vorhandene Komponenten:
  - `htdocs/dashboard/components/media_picker.js`
  - `htdocs/dashboard/components/media_field.js`
- Kanalpunkte speichern nur Referenzen wie `media_asset_id`, `media_role` und strukturierte Payload-Daten.

## Communication Bus

Das Modul registriert sich am Bus und meldet Status/Heartbeat.

Capabilities:

- `channelpoints.status`
- `channelpoints.model`
- `channelpoints.media`
- `channelpoints.schema`
- `channelpoints.db`
- `channelpoints.test.ping`

## Routen

- `GET /api/channelpoints/status`
- `GET /api/channelpoints/model`
- `GET /api/channelpoints/media-plan`
- `GET /api/channelpoints/schema-preview`
- `GET /api/channelpoints/db-status`
- `GET /api/channelpoints/bus-test?message=hello`

## Tests

Nach Deploy + Server-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/db-status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/schema-preview"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
```

Erwartung:

- `moduleVersion = 0.4.0`
- `mode = backend_db_migration_safe`
- `/db-status.status = safe_local_tables_ready`
- `schemaVersion >= 1`
- Tabellen existieren
- Default-Kategorien sind vorhanden
- `bus-test.subscriberDeliveredCount >= 1`

## Nicht in STEP492

- keine Twitch Reward API Reads/Writes
- keine EventSub-Redemption-Verarbeitung
- keine Reward-CRUD-API
- kein Dashboard-Modul
- keine Upload-Logik im Kanalpunkte-Modul

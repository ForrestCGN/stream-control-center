# STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE

Stand: 2026-05-26

## Ziel

Lokale DB-Grundlage fuer das Kanalpunkte-System sicher anlegen.

## Geaendert

- `backend/modules/channelpoints.js` auf Version `0.4.0`
- sichere additive Migration ergaenzt
- neue Route `GET /api/channelpoints/db-status`
- Schema-Version `channelpoints = 1`
- Default-Kategorien per `INSERT OR IGNORE`

## Tabellen

- `channelpoints_categories`
- `channelpoints_rewards`
- `channelpoints_redemptions`

## Sicherheit

- produktive SQLite wird erweitert, nicht ersetzt
- nur `CREATE TABLE IF NOT EXISTS`
- nur `CREATE INDEX IF NOT EXISTS`
- nur `INSERT OR IGNORE`
- keine bestehenden Daten loeschen
- keine Twitch-Schreibaktionen
- kein Dashboard-Umbau
- kein neues Upload-System

## Tests

```bat
node --check backend\modules\channelpoints.js
```

Nach Deploy + Server-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/db-status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/schema-preview"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
```

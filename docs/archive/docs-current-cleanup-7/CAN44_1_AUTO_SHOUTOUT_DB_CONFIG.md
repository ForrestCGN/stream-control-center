# CAN-44.1 Auto-Shoutout DB-Config Backend

Stand: 2026-06-03

## Enthaltene Dateien

- `backend/modules/clip_shoutout.js`
- `config/clip_system.json`
- `docs/current/CAN44_1_AUTO_SHOUTOUT_DB_CONFIG.md`

## Ziel

Auto-Shoutout-Konfiguration wird für das Dashboard DB-fähig gemacht.

Die globale Auto-Shoutout-Konfiguration und die Streamer-Liste sollen nicht dauerhaft aus `config/clip_system.json` gepflegt werden. JSON bleibt nur Seed/Fallback. Führend ist ab diesem Stand die zentrale Projekt-Datenbank über `backend/core/database.js`.

## Wichtige Regeln

- Keine direkte Nutzung von `sqlite_core` im Modul.
- Keine produktive SQLite-DB ersetzen, löschen oder neu bauen.
- Neue Tabellen werden sanft per `CREATE TABLE IF NOT EXISTS` angelegt.
- Booleans werden über `database.normalizeBool()` und `database.boolFromDb()` verarbeitet.
- JSON wird über `database.jsonEncode()` und `database.jsonDecode()` verarbeitet.
- Inserts/Upserts laufen über `database.insert()` und `database.upsert()`.
- DDL nutzt DB-Helper wie `primaryKeyAutoIncrementSql()`, `boolTypeSql()`, `dateTimeTypeSql()` und `jsonTypeSql()`.
- `officialShoutout.liveGateEnabled` bleibt `false`.
- `autoShoutout.onlyWhenLive` bleibt standardmäßig `false`.

## Neue/erweiterte DB-Tabellen

### `clip_shoutout_auto_settings`

Speichert globale Auto-Shoutout-Einstellungen als JSON pro Key.

Wichtiger Key:

- `settings`
- `json_streamers_seeded`

### `clip_shoutout_auto_streamers`

Speichert die Dashboard-fähige Auto-SO-Streamer-Liste.

Wichtige Felder:

- `login`
- `display_name`
- `enabled`
- `official_shoutout`
- `video_shoutout`
- `note`
- `meta_json`
- `created_at`
- `updated_at`

### `clip_shoutout_auto_events`

Speichert Trigger-/Skip-/Error-Ereignisse für Auto-Shoutouts.

## Neue/erweiterte Routen

- `GET /api/clip-shoutout/auto`
- `GET /api/clip-shoutout/auto/settings`
- `POST /api/clip-shoutout/auto/settings`
- `GET /api/clip-shoutout/auto/streamers`
- `POST /api/clip-shoutout/auto/streamers`
- `POST /api/clip-shoutout/auto/streamers/remove`
- `POST /api/clip-shoutout/auto/test-chat`

## Beispiel: Auto-SO global aktivieren

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/clip-shoutout/auto/settings" `
  -ContentType "application/json" `
  -Body '{"enabled":true,"onlyWhenLive":false}' |
  ConvertTo-Json -Depth 8
```

## Beispiel: Streamer hinzufügen/aktualisieren

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/clip-shoutout/auto/streamers" `
  -ContentType "application/json" `
  -Body '{"login":"bynexl","displayName":"Bynexl","enabled":true,"officialShoutout":true,"videoShoutout":true,"note":"Test"}' |
  ConvertTo-Json -Depth 8
```

## Beispiel: Streamer deaktivieren

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/clip-shoutout/auto/streamers/remove?login=bynexl" |
  ConvertTo-Json -Depth 8
```

## Test-Route ohne echten Chat

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/clip-shoutout/auto/test-chat" `
  -ContentType "application/json" `
  -Body '{"login":"bynexl","displayName":"Bynexl","message":"Hallo Chat"}' |
  ConvertTo-Json -Depth 8
```

## Standard-Test

```powershell
node -c backend\modules\clip_shoutout.js
.\stepdone.cmd "CAN-44.1 Auto-Shoutout DB-Config Backend"
```

Danach Node neu starten und prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object ok,module,moduleVersion,enabled
$s.config.autoShoutout | ConvertTo-Json -Depth 8
$s.autoShoutout | ConvertTo-Json -Depth 8
$s.streamStatus | ConvertTo-Json -Depth 8
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/settings" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/streamers" | ConvertTo-Json -Depth 8
```

## Noch nicht enthalten

Die sichtbare Dashboard-UI ist noch nicht enthalten. Die Backend-/DB-API ist vorbereitet, damit CAN-44.2 die Dashboard-Verwaltung darauf aufbauen kann.

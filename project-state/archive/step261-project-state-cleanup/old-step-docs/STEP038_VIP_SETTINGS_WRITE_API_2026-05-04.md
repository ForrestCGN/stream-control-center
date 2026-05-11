# STEP038 - VIP Settings Write API

Stand: 2026-05-04

## Ziel

VIP-Settings sollen nicht nur lesbar, sondern fuer das spaetere Dashboard auch ueber Backend-API schreibbar sein.

## Geaendert

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.4` aktualisiert.
- Neue Schreib-Routen fuer `vip_sound_settings` ergaenzt:
  - `POST /api/vip-sound/settings/upsert`
  - `POST /api/vip-sound/settings/delete`
  - `POST /api/vip-sound/settings/reset-defaults`
- Die Routen nutzen den zentralen `helper_settings.js`.
- Erlaubt sind aktuell bekannte VIP-Setting-Keys aus `DEFAULT_VIP_SETTINGS`.

## Aktuelle VIP-Setting-Keys

- `enabled`
- `soundBaseDir`
- `fileNameMode`
- `fileExtension`
- `dailyUsageRetentionDays`
- `cleanupDailyUsageOnStartup`
- `autoDetectTargetRole`
- `fallbackRolesEnabled`

## Wichtig

- Dashboard-faehige Werte werden primaer in SQLite gespeichert.
- JSON-Config bleibt nur Fallback/Import-Schicht.
- Secrets/Tokens werden nicht ueber diese API geschrieben.
- Keine Sound-, Twitch-, Daily-Usage-, Rollen- oder Textlogik wurde entfernt.

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/settings" | ConvertTo-Json -Depth 20

Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/settings/upsert" `
  -ContentType "application/json" `
  -Body '{"key":"fileExtension","value":".mp3","valueType":"string"}' | ConvertTo-Json -Depth 20

Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/settings/reset-defaults" `
  -ContentType "application/json" `
  -Body '{"key":"fileExtension"}' | ConvertTo-Json -Depth 20
```

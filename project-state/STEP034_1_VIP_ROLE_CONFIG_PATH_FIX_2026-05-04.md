# STEP034.1 - VIP Role Config Pfad-Fix

Stand: 2026-05-04

## Ziel

Der Fallback-/Importpfad fuer `config/vip_sound_roles.json` war im Live-System falsch aufgeloest.

Falsch:

- `D:\Streaming\stramAssets\backend\config\vip_sound_roles.json`

Richtig:

- `D:\Streaming\stramAssets\config\vip_sound_roles.json`

## Änderung

`backend/modules/vip_sound_overlay.js` wurde auf Version `1.8.1` aktualisiert.

Die Rollen-Fallback-Config wird jetzt ueber den vorhandenen `helper_config.js` aufgeloest:

- `configHelper.resolveConfigFile("vip_sound_roles.json")`

Damit wird der zentrale Config-Pfad des Projekts genutzt und nicht mehr `process.cwd()/config`.

## Betroffene Funktionalität

- `GET /api/vip-sound/roles`
- `POST /api/vip-sound/roles/import-config`
- `GET /api/vip-sound/roles/import-config`
- automatischer Erstimport aus `config/vip_sound_roles.json`, wenn `vip_sound_role_overrides` leer ist

## Nicht geändert

- Twitch-Mod-Erkennung bleibt erste Quelle.
- `vip_sound_role_overrides` bleibt primaere DB-Quelle fuer Rollen-Fallbacks.
- `config/vip_sound_roles.json` bleibt nur Fallback-/Importquelle.
- Keine Daily-Usage-, Sound-System-, Event-, Statistik- oder Textlogik geaendert.

## Test

Nach Deploy und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/roles" | ConvertTo-Json -Depth 20
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/roles/import-config" | ConvertTo-Json -Depth 20
```

Erwartung:

- `version = 1.8.1`
- `configFallback.path = D:\Streaming\stramAssets\config\vip_sound_roles.json`
- `configFallback.exists = true`, wenn die Datei live vorhanden ist
- `configFallback.counts.mods >= 1`, wenn `araglor` weiterhin in der Datei steht

# STEP032 - VIP Soundpfad und Dateiregel aus DB-Settings aktiv nutzen

Stand: 2026-05-04

## Ziel

Das VIP-System nutzt die in STEP031 vorbereiteten DB-Settings jetzt aktiv fuer Sounddateien.

## Geaendert

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.8` aktualisiert.
- `soundBaseDir` wird aus `vip_sound_settings` gelesen.
- `fileNameMode` wird aus `vip_sound_settings` gelesen.
- `fileExtension` wird aus `vip_sound_settings` gelesen.
- `enabled` wird aus `vip_sound_settings` gelesen.
- Lesereihenfolge bleibt:
  1. SQLite `vip_sound_settings`
  2. Config-Fallback ueber `helper_config.js` / `config/vip_sound.json`
  3. Code-Default

## Weiterhin unveraendert

- Standard-Soundpfad bleibt `D:/Streaming/stramAssets/htdocs/assets/sounds/vip`.
- Standard-Dateiregel bleibt `displayName + .mp3`.
- Daily-Usage-Logik bleibt unveraendert.
- Twitch-Rollenhelper bleibt unveraendert.
- Rollen-Fallback bleibt unveraendert.
- Keine SQLite-Datei wurde ersetzt.
- Keine Secrets/Tokens wurden committed.

## Neue/aktive Settings

- `enabled`
- `soundBaseDir`
- `fileNameMode`
- `fileExtension`

## Tests

Nach Deploy und Backend-Neustart pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/daily-usage/reset-today" | ConvertTo-Json -Depth 20
```

Dann im Chat:

```text
!vip @araglor
```

Erwartung:

- Version `1.7.8`.
- SettingsRows weiterhin vorhanden.
- Sounddatei wird wie bisher gefunden.
- `!vip @araglor` bleibt Mod-Sound.

## Hinweis fuer Dashboard

Diese Settings sind jetzt fachlich vorbereitet und aktiv. Das Dashboard soll spaeter nicht direkt Dateien oder SQL anfassen, sondern eine noch zu bauende Settings-API nutzen.

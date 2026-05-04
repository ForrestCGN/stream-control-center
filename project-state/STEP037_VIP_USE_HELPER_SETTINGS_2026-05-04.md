# STEP037 - VIP nutzt zentralen helper_settings.js

Stand: 2026-05-04

## Ziel

Das VIP-Modul nutzt fuer DB-/Fallback-/Default-Settings den zentralen Helper:

- `backend/modules/helpers/helper_settings.js`

Damit wird die Settings-Logik vereinheitlicht und fuer den spaeteren Dashboard-Ausbau vorbereitet.

## Geaendert

Datei:

- `backend/modules/vip_sound_overlay.js`

Aenderungen:

- Version auf `1.8.3` erhoeht.
- `helper_settings.js` wird importiert.
- VIP-interne Settings-Hilfsfunktionen wurden auf den zentralen Helper umgestellt.
- Lesereihenfolge bleibt unveraendert:
  1. Datenbank `vip_sound_settings`
  2. JSON-Fallback ueber `helper_config.js` / `vip_sound.json`
  3. Code-Default

## Nicht geaendert

- Keine Aenderung an Sound-System-Queue.
- Keine Aenderung an Twitch-Mod-Erkennung.
- Keine Aenderung an Rollen-Fallbacks.
- Keine Aenderung an Daily-Usage.
- Keine Aenderung an Event-/Statistik-Logik.
- Keine Aenderung an Text-API.

## Erwarteter Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/config" | ConvertTo-Json -Depth 20
```

Erwartung:

- `version = 1.8.3`
- `settingsRows = 8`
- Settings werden weiterhin aus `vip_sound_settings` gelesen.
- `config/vip_sound.json` bleibt nur Fallback.

## Dashboard-Hinweis

Dieser Step ist eine technische Grundlage: Spaeter soll das Dashboard alle wichtigen VIP-Settings ueber Backend-API lesen und schreiben koennen, ohne direkt Dateien oder SQLite zu bearbeiten.

# STEP277A_FIX2 - Clip-Shoutout Clip-Suche Debug/Fallback

## Ziel

Der Video-/Clip-Shoutout lief nach STEP277A_FIX1 korrekt vom Chat-Command bis zum Modul, fand aber bei getesteten Zielkanälen keine Clips. Dieser Fix erweitert die Suche und macht die Gründe sichtbar.

## Geändert

- `backend/modules/clip_shoutout.js`
  - Version auf `3` / `STEP277A_FIX2` gesetzt.
  - Clip-Suche erweitert:
    - 30 Tage
    - 90 Tage
    - 365 Tage
    - ohne Zeitraum / all time
  - Mehrere Helix-Seiten möglich (`clipFetchPages`).
  - Debug-Ausgabe ergänzt:
    - `clipSearch.ranges`
    - `rawCount`
    - `afterMinViewCount`
    - `durationOkCount`
    - `fallbackDurationCount`
    - `selectedRange`
    - `selectedMode`
  - Fallback für längere Clips ergänzt:
    - `allowLongerClipFallback`
    - `fallbackMaxClipDurationSeconds`

## Nicht geändert

- Kein Streamer.bot-Trigger.
- Keine eigene Queue neben dem Sound-System.
- Kein Entfernen bestehender Funktionalität.
- TTS bleibt optional und standardmäßig deaktiviert.
- Das Sound-System bleibt für Clip-Bild/Ton zuständig.

## Test

```cmd
node --check backend\modules\clip_shoutout.js
```

Danach Backend neu starten und testen:

```text
http://127.0.0.1:8080/api/clip-shoutout/status
http://127.0.0.1:8080/api/clip-shoutout/run?target=urlug&userLogin=forrestcgn&displayName=ForrestCGN
```

Erwartet im Status:

```json
"version": 3,
"step": "STEP277A_FIX2"
```

# CAN-44.21.26 – Command Intake Trace

## Ziel
Der echte Chat-Command-Pfad für `!so` / `!vso` wird nachvollziehbar gemacht, damit man nicht mehr per Screenshot und Einzelbefehlen raten muss, warum ein zweiter Shoutout nicht in der Overlay-Queue erscheint.

## Geändert
- `backend/modules/clip_shoutout.js` auf Version `0.2.31`.
- Neuer In-Memory Intake-Trace für direkte Chat-Commands.
- Neuer Endpunkt: `GET/POST /api/clip-shoutout/debug/intake-trace`.
- Neues Tool: `tools/show_clip_shoutout_intake_trace.ps1`.

## Trace erfasst
- roher Chat-Text
- erkannter Trigger (`so`, `vso`, Alias)
- erkanntes Target
- Permission-Ergebnis
- Eintritt in `handleRun`
- Target-Parsing in `handleRun`
- StreamDay-/Duplicate-/Force-Gate
- Display-Queue-Aufnahme
- Chat-Feedback vorbereitet/gesendet/unterdrückt
- Worker/Processing geplant oder unterdrückt
- finales Ergebnis

## Nicht geändert
- Kein Player-/Overlay-Code.
- Kein IFrame.
- Kein Twitch-Embed.
- Keine Queue-Logik entfernt.
- Keine Cooldowns entfernt.
- Keine produktiven DB-Daten geändert.

## Test
```powershell
node -c backend\modules\clip_shoutout.js
```

Nach Installation und Node-Neustart:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\show_clip_shoutout_intake_trace.ps1
```

Zum Leeren der Trace-Liste:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\show_clip_shoutout_intake_trace.ps1 -Clear
```

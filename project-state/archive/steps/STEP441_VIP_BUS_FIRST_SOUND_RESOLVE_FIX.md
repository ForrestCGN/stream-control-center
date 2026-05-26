# STEP441 – VIP Bus-First Sound Resolve Fix

## Status
Vorbereitet als vollständiger Datei-STEP.

## Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.24`
- `backend/modules/sound_system.js`: `0.1.18`
- Feature: `vip_bus_first_sound_resolve_fix`

## Ausgangslage
STEP440 hat den expliziten VIP Bus-First-Testpfad erreicht, aber der Sound-System-Play-Test konnte `vip/adoredpenny.mp3` nicht finden.

Ursache: Der Play-Test-Consumer normalisierte den Command-Payload mit gesetztem `soundId`. `normalizePlayRequest` interpretiert einen vorhandenen `soundId` zuerst als Preset-ID. Da `vip/adoredpenny.mp3` kein Preset ist, wurde vor der freien Datei-Auflösung mit `Sound wurde nicht gefunden` abgebrochen.

## Änderung
In `backend/modules/sound_system.js` wurde der Sound-Bus-Command-Consumer erweitert:

- erkennt direkte Datei-Referenzen:
  - `file`
  - `soundFile`
  - `sound_path`
  - `relativeFile`
  - `relativePath`
- akzeptiert in Dry-Run und Play-Test entweder `soundId`/`sound` oder eine direkte Datei.
- ruft `normalizePlayRequest` bei direkter Datei ohne Preset-`soundId`/`sound`/`id` auf.
- schreibt Diagnose-Metadaten:
  - `meta.soundBusCommandDirectFile`
  - `meta.soundBusCommandOriginalSoundId`
  - `meta.soundBusCommandResolvedFile`

In `backend/modules/vip_sound_overlay.js` wurde nur die Versions-/Feature-/STEP-Diagnose auf STEP441 aktualisiert.

## Nicht geändert
- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Kein DailyUsage-Schreiben im Admin-Test mit `consumeDaily=false`.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Änderung an der bestehenden Legacy `/api/sound/play`-Produktivroute.

## Tests

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/vip-sound/test" `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","consumeDaily":false,"forceAccess":true,"useExistingSound":true,"vipBusMode":"bus_enabled","busFirstTest":true}' |
ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/status" | ConvertTo-Json -Depth 10
```

## Erwartung
- VIP-Modul zeigt `version: 1.8.24`.
- Sound-System zeigt `version: 0.1.18`.
- `busFirstTest: true`.
- `busFirstTestApplied: true`.
- `legacyQueueSkippedForBusFirstTest: true`.
- Play-Test findet die Datei und meldet `accepted: true`.
- `soundBusCommand.ok: true`.
- Keine DailyUsage.
- Kein produktiver Bus-Default.

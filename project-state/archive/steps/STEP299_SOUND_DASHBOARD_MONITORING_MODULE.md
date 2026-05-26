# STEP299 – Sound Dashboard Monitoring Modul

## Kurzfassung

Das vorhandene Dashboard-Modul `Sound-System` wurde um einen neuen rein lesenden Tab `Bus-Monitor` erweitert.

## Dateien

- `htdocs/dashboard/modules/sound.js`
- `htdocs/dashboard/modules/sound.css`
- `docs/dashboard/SOUND_DASHBOARD_MONITORING_STEP299.md`

## Änderung

Der Tab zeigt SoundBus-/Queue-/Bundle-/Fehlerstatus aus `/api/sound/status` an und verlinkt die bestehende SoundBus Debug View.

## Nicht geändert

- keine Backend-Logik
- keine Sound-Queue
- keine Bundle-Lock-Logik
- keine SoundBus-Event-Logik
- keine Alert-/Discord-/TTS-/VIP-Module
- keine DB-Migration

## Test

- `node --check htdocs/dashboard/modules/sound.js` erfolgreich gegen die erzeugte Datei ausgeführt.
- Live-Test im Browser steht noch aus.

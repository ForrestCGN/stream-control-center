# STEP276C_ALERT_SOUND_MEDIAID_PLAYBACK

## Status

Vorbereitet als ZIP-Patch.

## Ziel

Alert-Sound-Playback bevorzugt Media-Registry-IDs, sobald eine Regel `sound_media_id` enthaelt.

## Umsetzung

- Neue Helper-Funktion `alertRuleSoundMediaId(rule)` liest `sound_media_id` / `soundMediaId` sicher aus.
- `buildAlertMainBundleItem()` baut Bundle-Main-Items mit `mediaId`, wenn vorhanden.
- Ohne `mediaId` bleibt der bisherige `sound_url` -> `file` Legacy-Weg unveraendert.
- `playLiveAlertSound()` kann ebenfalls `mediaId` an `/api/sound/play` uebergeben.

## Sicherheitsgrenzen

- Keine Entfernung bestehender Legacy-Felder.
- Keine Aenderung an Alert-Asset-Uploads.
- Keine Dashboard-Aenderung.
- Keine Loeschung oder Migration vorhandener Dateien.

## Tests

- `node --check backend/modules/alert_system.js`
- Funktionszaehlung: Keine bestehende Funktion entfernt.

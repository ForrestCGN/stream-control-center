# STEP201.7 – Clip Diagnose-Endpunkte

Stand: 2026-05-08

## Ziel

Clip-System auf den STEP201-Diagnose-Standard bringen, ohne bestehende Clip-Funktionalitaet zu veraendern.

## Betroffene Datei

- `backend/modules/clips.js`

## Ergaenzt

- `GET /api/clip/config`
- `GET /api/clip/settings`
- `GET /api/clip/routes`
- `GET /api/clip/integration-check`
- `POST /api/clip/reload`

## Bewusst nicht ergaenzt

- `/api/clips`

Grund: Produktiver Prefix ist `/api/clip`; Dashboard und Backend nutzen diesen Prefix bereits.

## Nicht geaendert

- `/api/clip/create`
- `/api/clip/register`
- `/api/clip/title`
- `/api/clip/history`
- Twitch-Create-Logik
- OBS-Replay-Logik
- Discord-Post-Logik
- Dashboard-Dateien
- Config-Dateien
- Message-Dateien
- SQLite-Schema ausser bestehender `ensureClipSchema()`-Nutzung

## Reload-Verhalten

`POST /api/clip/reload` ist nicht-destruktiv:

- erstellt keinen Twitch-Clip
- triggert kein OBS-Replay
- loescht keine History
- laedt Config/Settings/Messages neu
- bereitet bestehende Seeds/Schema wie bisher sanft vor

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .	ools\STEP201_7_CLIP_ENDPOINT_TEST_LOG.ps1
```

Erwartung:

- `/api/clip` = 6/6
- `/api/clips/status` = erwartetes 404, weil Alias bewusst nicht registriert ist

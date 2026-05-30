# STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN

Stand: 2026-05-26

## Ziel

STEP490 erweitert das sichere Kanalpunkte-Skeleton aus STEP489 um einen lesbaren Datenmodell- und Media-Integrationsplan.

## Geändert

- `backend/modules/channelpoints.js`
  - Version `0.2.0`
  - Statusmodus `backend_model_plan`
  - neue Route `GET /api/channelpoints/model`
  - neue Route `GET /api/channelpoints/media-plan`
  - Status enthält Modell-/Media-Kurzinfos
  - Bus-Capabilities erweitert um:
    - `channelpoints.model`
    - `channelpoints.media`

- `docs/modules/channelpoints-deep-dive.md`
  - neue Modul-Doku für Kanalpunkte-System
  - Datenmodell-Plan
  - Media-System-Regel
  - spätere Dashboard-/Twitch-Schritte

## Bewusst nicht geändert

- Keine DB-Migration.
- Keine Twitch-Schreibaktionen.
- Keine Reward-Synchronisierung.
- Keine produktive Redemption-Verarbeitung.
- Kein Dashboard-Umbau.
- Kein neues Upload-System.

## Verbindliche Media-Regel

Uploads und Medienauswahl für Kanalpunkte laufen über das bestehende Medien-System:

- `backend/modules/media.js`
- `htdocs/dashboard/components/media_picker.js`
- `htdocs/dashboard/components/media_field.js`

Keine zweite Upload-Maske und keine separate Asset-Verwaltung im Kanalpunkte-Modul.

## Tests

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints.js
```

Nach `stepdone.cmd`, Deploy und Server-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/model"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/media-plan"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
```

## Erwartung

- `moduleVersion` ist `0.2.0`.
- `/model` liefert `planning_only_no_db_migration`.
- `/media-plan` liefert `planning_only_uses_existing_media_system`.
- Bus-Test liefert weiter `subscriberDeliveredCount >= 1`.

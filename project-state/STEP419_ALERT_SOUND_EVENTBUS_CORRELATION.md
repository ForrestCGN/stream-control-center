# STEP419 – Alert/Sound EventBus Correlation Diagnostics

## Ziel
Alert-EventBus und Sound-EventBus read-only korrelierbar machen, ohne Alert-Queue, Sound-System, Bundle/TTS oder Overlay-Flow zu verändern.

## Änderung
- `backend/modules/alert_system.js`
- Modulversion: `3.1.2`
- Neue read-only Routen:
  - `GET /api/alerts/eventbus/correlation/status`
  - `GET /api/alerts/eventbus/correlation/check`

## Verhalten
Die neuen Routen lesen:
- Alert EventBus Status
- Alert/Sound-Bundle-Korrelation aus dem Alert-System
- Sound EventBus Status über die konfigurierte Sound-System-URL
- Sound-Bus-Korrelation (`alertEventUid`, `bundleId`, Rollen, Aktionen)

## Sicherheitsgrenzen
- Keine Queue-Veränderung
- Kein Soundstart
- Kein Overlay-Start
- Keine Bundle/TTS-Änderung
- Keine DB-Migration
- Keine Legacy-Flow-Änderung

## Test
```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/check" | ConvertTo-Json -Depth 12
```

## Erwartung
- `version: 3.1.2`
- `feature: alert_sound_eventbus_correlation`
- `readOnly: true`
- `flowTouched: false`
- `queueTouched: false`
- `soundSystemTouched: false`
- `overlayTouched: false`
- nach einem echten Alert: `comparison.matched > 0` oder klare Warnung, falls noch keine Sound-Korrelation sichtbar ist

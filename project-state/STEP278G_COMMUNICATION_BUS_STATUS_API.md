# STEP278G — Communication Bus Status API

## Status

Implemented as small API module for the prepared Communication Bus.

## Neue Dateien

- `backend/modules/communication_bus.js`
- `project-state/STEP278G_COMMUNICATION_BUS_STATUS_API.md`

## Aktualisierte Dateien

- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Routen

```text
GET /api/communication/status
GET /api/communication/test?channel=test&action=ping&message=Hallo
GET /api/communication/ack?eventId=...&clientId=test_client&status=received
GET /api/communication/issue?key=test&message=Demo
GET /api/communication/reset?confirm=1
```

## Bewusst nicht geändert

- keine Alert-/Sound-/TTS-/VIP-Migration
- kein Ersatz von `broadcastWS`
- keine Dashboard-Seite
- keine Datenbankmigration
- keine OBS-Änderung
- keine bestehende Funktionalität entfernt

## Tests

- `node --check backend/modules/communication_bus.js`
- Smoke-Test: Routenregistrierung

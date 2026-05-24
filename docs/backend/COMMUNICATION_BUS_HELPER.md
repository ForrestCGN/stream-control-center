# STEP278G — Communication Bus Status API

Status: API module prepared  
Production migration: none  
Database migration: none

## Ziel

`backend/modules/communication_bus.js` macht den vorbereiteten Communication Bus über kleine Test-/Status-Routen sichtbar.

## Routen

```text
GET /api/communication/status
GET /api/communication/test?channel=test&action=ping&message=Hallo
GET /api/communication/ack?eventId=...&clientId=test_client&status=received
GET /api/communication/issue?key=test&message=Demo
GET /api/communication/reset?confirm=1
```

## Wichtig

- Keine Migration von Alert/Sound/TTS/VIP.
- Kein Ersatz von `broadcastWS`.
- Keine OBS-Änderung.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Bus-Testevents sind Preview/Test und kein produktives Routing.

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test?message=Hallo"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/recent"
```

Hinweis: `/api/communication/recent` existiert nicht. Events werden über `/api/communication/status` im Feld `status.events` geprüft.

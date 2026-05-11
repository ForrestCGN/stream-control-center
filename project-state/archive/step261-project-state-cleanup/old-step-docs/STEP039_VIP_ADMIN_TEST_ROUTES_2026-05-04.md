# STEP039 - VIP Admin-/Test-Routen

Stand: 2026-05-04

## Ziel

Dashboard-Vorbereitung fuer VIP-Sounds, ohne Chat-Simulationen oder direkte SQLite-Zugriffe im Frontend.

## Geaendert

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.5` aktualisiert.
- Neue Admin-/Test-Routen ergaenzt.

## Neue Routen

- `GET /api/vip-sound/admin/summary`
- `POST /api/vip-sound/admin/reset-daily`
- `GET /api/vip-sound/admin/reset-daily`
- `POST /api/vip-sound/test`
- `POST /api/vip-sound/admin/test`

Alle Routen existieren aus Kompatibilitaetsgruenden auch unter `/api/vip-sound-overlay/*`.

## Verhalten

### Admin Summary

`/admin/summary` liefert gebuendelt:

- Status
- DB-Status
- Settings
- Rollen-Fallbacks
- Daily-Usage fuer Datum
- Events fuer Datum
- Stats fuer Datum
- Gesamt-Stats

### Admin Reset Daily

`/admin/reset-daily` loescht Daily-Usage fuer ein Datum. Ohne Datum wird der aktuelle Berlin-Tag genutzt.

### Admin Test

`/test` und `/admin/test` loesen einen VIP-Sound ueber den normalen VIP-Command-Pfad aus.

Parameter:

- `login` oder `targetLogin`
- optional `displayName` oder `targetDisplayName`
- optional `consumeDaily=true`

Standard:

- `consumeDaily=false`
- simuliert einen Admin-/Broadcaster-Target-Test
- schreibt deshalb keine Daily-Usage

Mit `consumeDaily=true`:

- simuliert Self-Trigger des Zielusers
- schreibt Daily-Usage, wenn der Sound akzeptiert wird

## Nicht geaendert

- Sound-System-Logik
- Twitch-Rollen-Erkennung
- Daily-Usage-Tageslimit
- Text-API
- Rollen-API
- Settings-API

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/admin/summary" | ConvertTo-Json -Depth 20
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/admin/reset-daily" | ConvertTo-Json -Depth 20
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/test" -ContentType "application/json" -Body '{"login":"araglor"}' | ConvertTo-Json -Depth 20
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/test" -ContentType "application/json" -Body '{"login":"araglor","consumeDaily":true}' | ConvertTo-Json -Depth 20
```

## Erwartung

- `version = 1.8.5`
- `/admin/summary` liefert gebuendelte Dashboard-Daten.
- `/admin/reset-daily` loescht Daily-Usage fuer heute.
- `/test` kann Admin-/Dashboard-Test ohne Chat-Simulation ausloesen.
- `consumeDaily=true` kann Self-Trigger fuer Daily-Usage-Test simulieren.

## Hinweise

- Diese Routen sind Dashboard-Vorbereitung. Spaeter muessen sie mit Rechte-/Rollenpruefung und Audit-Logging abgesichert werden.
- Keine SQLite-/Secret-/Backup-Dateien committen.

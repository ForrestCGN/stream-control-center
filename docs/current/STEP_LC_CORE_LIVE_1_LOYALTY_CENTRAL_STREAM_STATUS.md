# STEP LC-CORE-LIVE-1 – Loyalty an zentralen Stream-Status anbinden

Stand: 2026-06-15
Projekt: ForrestCGN/stream-control-center

## Ziel

Loyalty-Core nutzt den bestehenden zentralen Stream-Status, statt dauerhaft durch den alten lokalen Loyalty-Manual-State blockiert zu werden.

## Geändert

Datei:

- `backend/modules/loyalty.js`

Änderungen:

- Loyalty konsumiert jetzt zusätzlich `twitch.stream.online` und `twitch.stream.offline` über den bestehenden Communication-Bus.
- Loyalty synchronisiert den aktuellen Status über `/api/stream-status/status?forceApi=1`.
- Der alte lokale `loyalty_stream_state` bleibt erhalten, wird aber bei zentralem Status als lokaler Spiegel aktualisiert.
- Alte Loyalty-Manual-Overrides werden bei zentralem Stream-Status automatisch deaktiviert, damit sie den zentralen Twitch/Event-Status nicht mehr blockieren.
- AutoRunner reagiert auf zentrale Online-/Offline-Events über die vorhandenen Runner-Settings.
- Neue Diagnose-/Sync-Routen:
  - `GET /api/loyalty/stream-status-binding/status`
  - `GET /api/loyalty/stream-status-binding/sync`
  - `POST /api/loyalty/stream-status-binding/sync`

## Nicht geändert

- Kein Wechsel von `shadow` auf `live`.
- Keine Punkte-Migration.
- Keine DB ersetzen/neu bauen.
- Keine Commands geändert.
- Keine StreamElements-Ablösung.
- Keine Twitch-Events-/Stream-Status-Module geändert.
- Keine neue Moduldatei.
- Keine Funktionalität entfernt.

## Test

Nach dem Einspielen und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-status-binding/status" |
ConvertTo-Json -Depth 8
```

Manueller Sync-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-status-binding/sync?controlRunner=true&sourceKind=stream_state" |
ConvertTo-Json -Depth 8
```

Danach prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state" |
ConvertTo-Json -Depth 8

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" |
ConvertTo-Json -Depth 8
```

Erwartung bei zentralem Online-Status:

- `streamState.effective.live = true`
- alter Loyalty-Manual-Override blockiert nicht mehr
- AutoRunner startet oder ist startbereit je nach Config

Erwartung bei zentralem Offline-Status:

- `streamState.effective.live = false`
- AutoRunner stoppt, wenn `autoRunner.stopOnStreamStateStop = true`

## StepDone

```cmd
.\stepdone.cmd "STEP LC-CORE-LIVE-1 Loyalty an zentralen Stream-Status anbinden"
```

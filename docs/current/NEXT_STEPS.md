# NEXT_STEPS – stream-control-center

Stand: 2026-06-15

## Aktueller Stand nach LC-CORE-CLEANUP-1

```text
Loyalty hat keine alte direkte Twitch-Live-Abfrage mehr.
Loyalty-local Start/Stop/Clear/Refresh-Routen wurden entfernt.
Dashboard setzt den Loyalty-StreamState nicht mehr lokal.
```

## Direkt nach Einspielen

```powershell
.\stepdone.cmd "LC-CORE-CLEANUP-1 Loyalty alte lokale StreamState- und Twitch-Direktlogik entfernt"
```

Danach testen, kein zweites StepDone nach erfolgreichem Test.

## Tests

```powershell
node -c "D:\Streaming\stramAssets\backend\modules\loyalty.js"
node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\loyalty.js"
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/routes" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-status-binding/sync?controlRunner=true&sourceKind=stream_state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 8
```

## Erwartung

```text
/api/loyalty/routes listet keine alten stream-state/start|stop|clear-override|refresh-auto Routen mehr.
/api/loyalty/stream-status-binding/sync nutzt /api/twitch/events/stream-state.
Runner reagiert weiterhin auf zentralen Stream-State.
Dashboard zeigt keine lokalen Stream-State-Start/Stop-Buttons mehr.
```

## Nächster sinnvoller Arbeitsblock nach Test

```text
LC-DASH-LIVEVIEW-1 – Loyalty Dashboard Live-Gate Anzeige weiter vereinfachen und zentralen Stream-State deutlicher anzeigen.
```

Danach schrittweise weitere Module an den zentralen Stream-State anbinden:

```text
Giveaways / Loyalty Games
Tagebuch
Clips
Alerts
VIP30 / Channelpoints
Event-System
```

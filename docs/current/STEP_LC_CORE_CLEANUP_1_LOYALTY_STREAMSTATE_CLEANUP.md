# STEP LC-CORE-CLEANUP-1 – Loyalty StreamState Cleanup

Stand: 2026-06-15

## Ziel

Alte lokale Loyalty-StreamState- und Twitch-Direktlogik wurde entfernt, nachdem LC-CORE-LIVE-1.1 bestätigt hat, dass Loyalty den effektiven Live-Status aus `twitch_events` liest.

## Geänderte Dateien

```text
backend/modules/loyalty.js
htdocs/dashboard/modules/loyalty.js
```

## Backend-Änderungen

```text
- Modulversion von 0.1.13 auf 0.1.14 erhöht.
- Alte direkte Twitch-Live-Abfrage `refreshAutoStreamStateFromTwitch()` entfernt.
- Alter Parser `parseExternalLivePayload()` entfernt.
- Fallback in `runPresenceOnce()` auf `/api/twitch/stream?login=...` entfernt.
- Legacy-Routen entfernt:
  - GET/POST /api/loyalty/stream-state/start
  - GET/POST /api/loyalty/stream-state/stop
  - GET/POST /api/loyalty/stream-state/clear-override
  - GET/POST /api/loyalty/stream-state/refresh-auto
- Routenliste `/api/loyalty/routes` bereinigt.
- `MODULE_META.bus.consumes` auf twitch.stream.online/offline bereinigt.
```

## Dashboard-Änderungen

```text
- Alte Loyalty-local Start/Stop-Buttons entfernt.
- Alte API-Einträge `streamStart` und `streamStop` entfernt.
- Alte Action-Bindings `stream-start` und `stream-stop` entfernt.
- Control-Ansicht zeigt Live-Gate jetzt read-only.
- Hinweistext korrigiert: Loyalty setzt den Stream-State nicht mehr lokal; effektive Wahrheit kommt aus twitch_events.
```

## Bewusst nicht geändert

```text
- Keine produktive SQLite ersetzt, gelöscht oder neu gebaut.
- Keine Punkte-/Watch-/EventBonus-/Command-Logik geändert.
- Kein Shadow/Live-Wechsel.
- `loyalty_stream_state` bleibt als lokaler Runner-/Dashboard-Spiegel erhalten.
- `/api/loyalty/stream-state` bleibt read-only erhalten.
- `/api/loyalty/stream-status-binding/sync` bleibt zentrale Sync-Route.
- Runner Start/Stop/RunOnce bleibt unverändert.
```

## Tests nach Einspielen

```powershell
node -c "D:\Streaming\stramAssets\backend\modules\loyalty.js"
node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\loyalty.js"
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/routes" | ConvertTo-Json -Depth 6
```

Erwartung: Keine Einträge mehr für `stream-state/start`, `stream-state/stop`, `stream-state/clear-override` und `stream-state/refresh-auto`.

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-status-binding/sync?controlRunner=true&sourceKind=stream_state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 8
```

Optionaler Negativtest:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/refresh-auto"
```

Erwartung: Route existiert nicht mehr.

## StepDone

Nach Einspielen/Deploy ausführen:

```powershell
.\stepdone.cmd "LC-CORE-CLEANUP-1 Loyalty alte lokale StreamState- und Twitch-Direktlogik entfernt"
```

Danach testen. Nach erfolgreichem Test kein zweites StepDone.

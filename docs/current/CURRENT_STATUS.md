# CURRENT_STATUS – stream-control-center

Stand: 2026-06-15

## Aktueller bestätigter Stand

```text
LC-CORE-CLEANUP-1 – Loyalty alte lokale StreamState- und Twitch-Direktlogik entfernt
```

## Kurzfazit

Loyalty nutzt weiterhin `/api/twitch/events/stream-state` als effektive Live-Wahrheit. Die alten lokalen Loyalty-Start/Stop-/Clear-/Refresh-Routen und die direkte Twitch-Live-Abfrage wurden aus `backend/modules/loyalty.js` entfernt.

## Fachliche Wahrheit

```text
twitch_events ist zentrale Twitch-/Stream-State-Schicht.
/api/twitch/events/stream-state ist die effektive Live-Wahrheit für Module.
stream_status bleibt source-only.
loyalty_stream_state bleibt vorerst nur lokaler Runner-/Dashboard-Spiegel.
```

## Geändert in LC-CORE-CLEANUP-1

```text
backend/modules/loyalty.js
htdocs/dashboard/modules/loyalty.js
docs/current/STEP_LC_CORE_CLEANUP_1_LOYALTY_STREAMSTATE_CLEANUP.md
```

## Ergebnis

```text
- refreshAutoStreamStateFromTwitch() entfernt.
- parseExternalLivePayload() entfernt.
- Fallback auf alte Twitch-Direktabfrage in runPresenceOnce() entfernt.
- /api/loyalty/stream-state/start entfernt.
- /api/loyalty/stream-state/stop entfernt.
- /api/loyalty/stream-state/clear-override entfernt.
- /api/loyalty/stream-state/refresh-auto entfernt.
- Dashboard-Buttons für lokalen Loyalty-Start/Stop entfernt.
- Routenliste bereinigt.
```

## Nicht geändert

```text
Keine Punkte-/Watch-/EventBonus-/Command-Logik geändert.
Keine produktive SQLite ersetzt oder neu gebaut.
Kein Shadow/Live-Wechsel.
Runner-Routen bleiben erhalten.
/api/loyalty/stream-state bleibt read-only erhalten.
/api/loyalty/stream-status-binding/sync bleibt erhalten.
```

## Tests nach Einspielen

```powershell
node -c "D:\Streaming\stramAssets\backend\modules\loyalty.js"
node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\loyalty.js"
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/routes" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-status-binding/sync?controlRunner=true&sourceKind=stream_state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 8
```

## StepDone-Regel

```text
1. Dateien/ZIP einspielen/deployen
2. stepdone.cmd ausführen
3. danach testen
4. nach erfolgreichem Test kein zweites StepDone
```

# STEP LC-CORE-LIVE-1.1 – Loyalty nutzt twitch_events Stream-State

Stand: 2026-06-15
Projekt: ForrestCGN/stream-control-center

## Ziel

Loyalty nutzt fuer seine Live-/Offline-Entscheidung dieselbe effektive Stream-State-Quelle wie der Live-Status-Monitor im Dashboard.

## Problem aus LC-CORE-LIVE-1

LC-CORE-LIVE-1 hat Loyalty an `/api/stream-status/status?forceApi=1` angebunden.
Diese Route liest die Twitch-API direkt und ignoriert den manuellen Override aus `twitch_events`.
Dadurch konnte der Live-Status-Monitor `ONLINE (Override)` anzeigen, waehrend Loyalty weiterhin `offline` gelesen hat.

## Aenderung

Geaendert wurde:

```text
backend/modules/loyalty.js
```

Die interne zentrale Live-Abfrage wurde umgestellt von:

```text
/api/stream-status/status?forceApi=1
```

auf:

```text
/api/twitch/events/stream-state
```

Die Parser-Logik beruecksichtigt jetzt:

```text
streamState.live
streamState.status / sessionStatus
streamState.provider / source
streamState.manualOverride.active
streamState.streamSession
streamState.streamSessionId
streamState.streamDayId
```

## Erwartetes Verhalten

Wenn im Live-Status-Monitor `ONLINE (Override)` aktiv ist, soll Loyalty nach einem Sync ebenfalls `effective.live = true` setzen und den Runner gemaess Konfiguration starten.

Wenn der Override geloescht oder der zentrale Stream-State offline ist, soll Loyalty `effective.live = false` setzen und den Runner stoppen.

## Nicht geaendert

```text
Kein Shadow/Live-Wechsel
Keine Punkte-Migration
Keine DB geloescht oder ersetzt
Keine Commands geaendert
Keine Dashboard-Dateien geaendert
Keine alte Logik entfernt – Cleanup folgt erst nach erfolgreichem Test
```

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-status-binding/sync?controlRunner=true&sourceKind=stream_state" |
ConvertTo-Json -Depth 8

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state" |
ConvertTo-Json -Depth 8

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" |
ConvertTo-Json -Depth 8
```

## StepDone

```cmd
.\stepdone.cmd "STEP LC-CORE-LIVE-1.1 Loyalty nutzt twitch_events Stream-State"
```

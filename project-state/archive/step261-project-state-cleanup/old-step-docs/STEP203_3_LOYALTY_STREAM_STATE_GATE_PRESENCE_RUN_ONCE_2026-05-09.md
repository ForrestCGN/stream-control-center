# STEP203.3 - Loyalty Stream-State Gate + Presence Run-Once

Stand: 2026-05-09

## Ziel

Dieser STEP verbindet den bestehenden Loyalty Watch Heartbeat kontrolliert mit Twitch Presence, aber noch ohne automatischen Timer.

Wichtig:

```text
Shadow Mode bleibt aktiv.
StreamElements bleibt aktiv.
Keine öffentlichen Punkte-Commands.
Kein automatischer Dauerläufer.
```

## Geänderte Datei

```text
backend/modules/loyalty.js
```

## Version

```text
loyalty 0.1.2
schema version 3
```

## Neue DB-Tabelle

```text
loyalty_stream_state
```

Zweck:

- manueller Stream-Start/Stop-Fallback
- Twitch-Auto-Live-Status speichern
- effectiveLive berechnen
- offline keine Watch-Punkte vergeben

## Neue Settings

```text
streamState.broadcasterLogin
streamState.broadcasterId
streamState.autoProvider
streamState.manualOverrideMaxHours

presence.activeMinutes
presence.includeJoinedOnly
presence.maxUsersPerRun
```

## Neue Routen

```text
GET  /api/loyalty/stream-state
POST /api/loyalty/stream-state/start
GET  /api/loyalty/stream-state/start
POST /api/loyalty/stream-state/stop
GET  /api/loyalty/stream-state/stop
POST /api/loyalty/stream-state/clear-override
GET  /api/loyalty/stream-state/clear-override
POST /api/loyalty/stream-state/refresh-auto
GET  /api/loyalty/stream-state/refresh-auto

GET  /api/loyalty/presence/status
POST /api/loyalty/presence/run-once
GET  /api/loyalty/presence/run-once
```

## Live-Gate

Punkte werden nur vergeben, wenn:

```text
effectiveLive = true
```

`effectiveLive` wird berechnet aus:

```text
manueller Override aktiv und nicht abgelaufen
ODER
Twitch API meldet live
```

Wenn Stream offline ist:

```text
run-once skipped = true
reason = stream_offline
keine Punkte
```

## Manueller Fallback für Streamer.bot

Stream Start:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot"
```

Stream Stop:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=streamerbot"
```

Override löschen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/clear-override?source=manual"
```

## Presence Run-Once

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30
```

Ablauf:

1. Twitch Live-Status aktualisieren.
2. effectiveLive prüfen.
3. Wenn offline: abbrechen.
4. Wenn live: aktive/presente User aus Twitch Presence holen.
5. Pro User `processWatchHeartbeat` ausführen.
6. Intervall-Schutz bleibt in `loyalty_watch_state`.

## Noch nicht enthalten

- kein automatischer Timer
- keine Dashboard-UI
- keine StreamElements-Abschaltung
- kein Punkteimport
- keine Rewards/Giveaways/Games

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/status" | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot_test" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=streamerbot_test" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30
```

## Erwartung

Offline:

```text
skipped true
reason stream_offline
```

Nach manuellem Start:

```text
active Presence User werden verarbeitet
Intervall-Schutz verhindert doppelte Punkte
```

Nach Stop:

```text
wieder skipped stream_offline
```

## Nächster Schritt

STEP203.4:

```text
automatischer Shadow Runner mit konfigurierbarem Timer
```

Erst nach erfolgreichem STEP203.3-Test.

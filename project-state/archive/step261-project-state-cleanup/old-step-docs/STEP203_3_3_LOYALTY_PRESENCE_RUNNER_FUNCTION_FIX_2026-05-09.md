# STEP203.3.3 - Loyalty Presence Runner Function Fix

Stand: 2026-05-09

## Problem

`/api/loyalty/presence/run-once` hat aktive Twitch-Presence-User gefunden und das Stream-State-Gate korrekt beachtet, konnte aber keine Punkte vergeben.

Fehler:

```text
processWatchHeartbeat is not defined
```

## Ursache

Im Presence Runner wurde eine nicht existierende Funktion aufgerufen:

```text
processWatchHeartbeat(...)
```

Die vorhandene und bereits getestete Watch-Heartbeat-Funktion heißt:

```text
recordWatchHeartbeat(...)
```

## Fix

Der Presence Runner nutzt jetzt die vorhandene Funktion:

```text
recordWatchHeartbeat(...)
```

## Betroffene Datei

```text
backend/modules/loyalty.js
```

## Keine Änderung an

```text
Datenbank
Schema
Settings
Twitch Presence
Punkteständen
Transaktionen
Dashboard
```

## Tests

```powershell
node -c backend\modules\loyalty.js

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot_test" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/run-once" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=streamerbot_test" | ConvertTo-Json -Depth 30
```

## Erwartung

Nach Start:

```text
presenceviewer wird verarbeitet
awarded true oder watch_interval_not_due
keine undefined-function errors
```

Direkt danach:

```text
Intervall-Schutz verhindert doppelte Punkte
```

Nach Stop:

```text
stream_offline
```

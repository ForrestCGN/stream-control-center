# STEP240 – Message-Rotator Backend Scheduler

Stand: 2026-05-20

## Ziel

Der Message-Rotator bekommt einen eigenen Backend-Scheduler, damit Streamer.bot nicht mehr als Timer/Sender arbeiten muss.

Streamer.bot bleibt weiterhin für Events zuständig:

- Stream startet -> `/api/message-rotator/start`
- Stream endet -> `/api/message-rotator/stop`
- Chat Message -> `/api/message-rotator/tick?user=%userName%`

Der Scheduler prüft nur automatisch, ob eine Rotator-Nachricht fällig ist.

## Neue Datei

- `backend/modules/message_rotator_scheduler.js`

## Neue API-Routen

- `GET /api/message-rotator/scheduler/status`
- `GET/POST /api/message-rotator/scheduler/reload`
- `GET/POST /api/message-rotator/scheduler/start`
- `GET/POST /api/message-rotator/scheduler/stop`
- `GET/POST /api/message-rotator/scheduler/run`
- `GET /api/message-rotator/scheduler/settings`
- `POST /api/message-rotator/scheduler/settings`
- `GET /api/message-rotator/scheduler/routes`

Legacy-Aliase unter `/message-rotator/scheduler/*` bleiben ebenfalls verfügbar.

## Konfiguration

Die JSON-Fallback-Datei wird bei Bedarf automatisch angelegt:

- `config/message_rotator_scheduler.json`

DB-Settings werden in diese Tabelle gespiegelt:

- `message_rotator_scheduler_settings`

Default:

```json
{
  "enabled": true,
  "intervalSeconds": 30,
  "commit": true,
  "onlyWhenActive": true,
  "startOnBackendStart": true,
  "requestUrl": "http://127.0.0.1:8080/api/message-rotator/next",
  "statusUrl": "http://127.0.0.1:8080/api/message-rotator/status",
  "timeoutMs": 10000,
  "logBlocked": false
}
```

## Verhalten

Alle 30 Sekunden:

1. Scheduler prüft `/api/message-rotator/status`.
2. Wenn `active=false`, wird nichts gesendet.
3. Wenn `active=true`, ruft er `/api/message-rotator/next?commit=1&source=message_rotator_scheduler` auf.
4. Die vorhandenen Rotator-Regeln bleiben maßgeblich:
   - `firstMessageDelayMinutes`
   - `globalCooldownMinutes`
   - `minChatMessagesBetweenRotations`
   - Item-Cooldowns
   - Live-Status, falls aktiv
5. Gesendet wird weiterhin vom Message-Rotator selbst über `deliveryMode=backend`.

## Bewusst nicht geändert

- `backend/modules/message_rotator.js`
- `app.sqlite`
- bestehende Rotator-Settings
- bestehende Rotator-Texte
- bestehende Start-/Stop-Actions in Streamer.bot
- bestehende Chat-Tick-Route
- bestehende manuelle Befehle

## Streamer.bot-Zielzustand

Behalten:

- `STREAM - Start` mit `/api/message-rotator/start`
- `STREAM - Ende` mit `/api/message-rotator/stop`
- `AUTOPOST - Chat zählen` mit `/api/message-rotator/tick?user=%userName%`

Deaktivieren nach erfolgreichem Scheduler-Test:

- `AUTOPOST - Automatisch senden`

Manuelle Befehle später prüfen:

- `AUTOPOST - Kategorie senden`
- `BEFEHL - Discord`
- `BEFEHL - Follow`
- `BEFEHL - Youtube`

Diese dürfen bei Backend-Delivery nicht zusätzlich noch selbst eine Twitch Message senden.

## Tests

Nach Deploy und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/scheduler/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/scheduler/routes" | ConvertTo-Json -Depth 80
```

Chat-Zähler testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/start" | ConvertTo-Json -Depth 40

1..8 | ForEach-Object {
  Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/tick?user=testuser$_" | Out-Null
}

Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/status" | ConvertTo-Json -Depth 80
```

Manuellen Scheduler-Lauf testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/scheduler/run" | ConvertTo-Json -Depth 100
```

Wenn wegen Delay/Cooldown blockiert wird, ist das korrekt. Der Scheduler soll vorhandene Regeln respektieren.

# TODO

Stand: RDAP92C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT  
Datum: 2026-06-26

## Erledigt

```text
RDAP92 Backend-Code:
- minimaler /agent-ws Transport-Accept.
- Zwei-Stufen-Gate.
- keine Actions.
- kein produktiver Heartbeat.
- keine DB.
- keine neue Permission.
- keine Secrets.

RDAP92_FIX1:
- config.service.js Exports wiederhergestellt.
- /api/remote/status wieder HTTP 200.

RDAP92B:
- Correct Bearer reject ohne Runtime-Aktivierung bestaetigt.
- Runtime bewusst aktiviert.
- HTTP 101 WebSocket Transport-Accept bestaetigt.
- Connected/Close Status bestaetigt.
- Actions false bestaetigt.
- Heartbeat false bestaetigt.
- Runtime final wieder deaktiviert.
```

## Naechster Schritt

```text
RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN
```

## RDAP93 Aufgaben

```text
- Heartbeat read-only planen.
- In-Memory lastHeartbeatAt/heartbeatAgeMs/stale/offline Modell definieren.
- Payload minimal und sicher definieren.
- Kein Action-System.
- Kein OBS/Sound/Overlay/Command.
- Keine freie Shell/Datei/Prozess/URL.
- Keine DB-Migration im ersten Heartbeat-Plan.
- Secret-Safety fortsetzen.
```

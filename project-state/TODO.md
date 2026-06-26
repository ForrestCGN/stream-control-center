# TODO

Stand: RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN  
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

RDAP93:
- Heartbeat read-only Modell geplant.
- Doku-only.
```

## Naechster Schritt

```text
RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE
```

## RDAP94 Aufgaben

```text
- Bestehende Runtime-/Status-Services erweitern.
- Keine parallele /agent-ws Struktur.
- Heartbeat Textframes/JSON minimal lesen.
- type=heartbeat pruefen.
- protocolVersion=rdap-agent-heartbeat.v1 pruefen.
- agentId=stream-pc-main pruefen.
- lastHeartbeatAt setzen.
- heartbeatAgeMs berechnen.
- stale/offline ableiten.
- Payload-Groessenlimit.
- Forbidden Fields ablehnen/ignorieren.
- Keine Actions.
- Keine DB.
- Keine Secrets.
```

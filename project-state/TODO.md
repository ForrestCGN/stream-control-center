# TODO

Stand: RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS  
Datum: 2026-06-26

## Jetzt vorbereitet

```text
RDAP92 Backend-Code:
- minimaler /agent-ws Transport-Accept.
- Zwei-Stufen-Gate.
- keine Actions.
- kein produktiver Heartbeat.
- keine DB.
- keine neue Permission.
- keine Secrets.
```

## Naechster Schritt

```text
RDAP92B_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_LIVE_CONFIRM
```

## RDAP92B Aufgaben

```text
- Lokale Checks bestaetigen.
- stepdone pruefen.
- Webserver-Deploy aus frischem GitHub/dev-Clone.
- Readiness-Loop.
- Status ohne AGENT_RUNTIME_ENABLED=true.
- Correct Bearer reject ohne Runtime-Env.
- AGENT_RUNTIME_ENABLED=true bewusst setzen.
- Correct Bearer WebSocket Accept.
- Connected/Close Status.
- Secret-Safety.
- Keine Actions.
```

# TODO

Stand: RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN  
Datum: 2026-06-26

## Erledigt/vorbereitet

```text
RDAP94:
- Heartbeat read-only in-memory Code vorbereitet.
- Bestehende Services erweitert.
- Keine neue Route.
- Keine DB.
- Keine Actions.
- Keine Secrets.

RDAP94_FIX1:
- server.js Build-Kontext auf RDAP94 korrigiert.

RDAP94C:
- Live Default nach Deploy bestaetigt.
- Echter Service-Name dokumentiert: scc-remote-modboard.service.
- RDAP94 Build-Kontext live bestaetigt.
- Runtime/Heartbeat/Actions im Default false bestaetigt.

RDAP94B:
- Runtime temporaer aktiviert.
- WebSocket 101 bestaetigt.
- Gueltiger Heartbeat live sichtbar bestaetigt.
- Forbidden Heartbeat sicher abgelehnt.
- Actions/Productive Runtime false bestaetigt.
- Runtime final wieder deaktiviert.

RDAP94D:
- Live-Confirm dokumentiert.
- Next Chat Prompt aktualisiert.
- project-state aktualisiert.

RDAP95:
- Minimaler Stream-PC Agent Client geplant.
- Zunaechst nur Verbindung + Heartbeat.
- Geplanter Ort remote-modboard/stream-pc-agent/ dokumentiert.
- Secret-/Logging-/Reconnect-Grenzen dokumentiert.
```

## Naechster Schritt

```text
RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE
```

## Danach

```text
Nach RDAP96: lokalen Agent Client syntaktisch pruefen und nur bei separatem Plan live/gegen Webserver testen.
Keine Actions ohne separaten Sicherheitsplan.
```

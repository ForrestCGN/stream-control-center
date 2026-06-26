# TODO

Stand: RDAP99_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_PLAN  
Datum: 2026-06-26

## Erledigt/vorbereitet

```text
RDAP96:
- Heartbeat-only Stream-PC Agent Client vorbereitet.

RDAP96B:
- Lokale Agent-Checks dokumentiert.

RDAP97:
- Manueller Agent-Testplan dokumentiert.

RDAP98/RDAP98B:
- Agent lokal gestartet.
- Safe Logging bestaetigt.
- Public WSS /agent-ws 404 erkannt.
- Runtime final disabled bestaetigt.

RDAP99:
- ISPConfig/Nginx Befund dokumentiert.
- location / nach 127.0.0.1:3010 existiert.
- Eigener /agent-ws WebSocket Location-Block fehlt.
- Upgrade-/Connection-Header fuer WebSocket fehlen.
```

## Naechster Schritt

```text
RDAP100_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_CONFIG
```

## Danach

```text
Nach RDAP100: erneuter Agent-Heartbeat-Live-Test ueber public WSS.
Runtime dabei nur temporaer aktivieren und final wieder deaktivieren.
```

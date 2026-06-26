# CHANGELOG

## 2026-06-26 - RDAP100B_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_LIVE_CONFIRMED_DOCS

```text
- RDAP100 Nginx/ISPConfig /agent-ws WebSocket Proxy live bestaetigt.
- Bestaetigt: separater location /agent-ws Block wurde in ISPConfig/Nginx gesetzt.
- Bestaetigt: normaler HTTP-GET /agent-ws erreicht Node HTTP-Router und liefert erwartbar not_found.
- Bestaetigt: public WebSocket-Upgrade erreicht Backend-Upgrade-Handler.
- Bestaetigt: Test ohne Secret wurde erwartbar mit missing_connection_proof abgelehnt.
- Bestaetigt: X-SCC-Agent-Runtime transport-guarded.
- Bestaetigt: X-SCC-Agent-Actions disabled.
- Bestaetigt: Runtime final disabled.
- Bestaetigt: Keine Secrets verwendet und keine Actions.
- Naechster Step: RDAP101_STREAM_PC_CONNECTION_AGENT_CLIENT_PUBLIC_WSS_HEARTBEAT_LIVE.
- Doku-only; kein Backend-Code, kein Agent-Code und kein Repo-Webserver-Deploy noetig.
```

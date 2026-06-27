# TODO

Stand: RDAP119_STREAMING_PC_CONNECTION_CLIENT_MVP  
Datum: 2026-06-27

```text
- Lokal testen: node --check backend/modules/remote_agent.js.
- Lokalen Server neu starten.
- http://127.0.0.1:8080/api/streaming-pc-connection/status prüfen.
- Optional mit Env aktivieren:
  STREAMING_PC_CONNECTION_ENABLED=true
  STREAMING_PC_REMOTE_WS_URL=wss://mods.forrestcgn.de/agent-ws
  STREAMING_PC_CONNECTION_ID=stream-pc-main
  STREAMING_PC_CONNECTION_NAME=Forrest Stream-PC
  STREAMING_PC_CONNECTION_KEY=<nicht posten>
- Webserver prüfen:
  curl -fsS http://127.0.0.1:3010/api/remote/agent/status | jq '.agent.connected,.agent.lastHeartbeatAt,.agent.heartbeatSeq,.agent.actionsEnabled'
- Keine Admin-Notizen weiterbauen, außer Forrest verlangt es ausdrücklich.
```

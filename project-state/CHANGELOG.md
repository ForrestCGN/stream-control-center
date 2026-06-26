# CHANGELOG

## 2026-06-26 - RDAP98B_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PARTIAL_DOCS

```text
- RDAP98 Teiltest dokumentiert.
- Bestaetigt: Vorab disabled Status OK.
- Bestaetigt: Runtime wurde temporaer aktiviert.
- Bestaetigt: Agent lokal auf Stream-PC gestartet.
- Bestaetigt: PowerShell npm.ps1 Execution Policy erkannt; npm.cmd als lokale Alternative verwendet.
- Bestaetigt: Agent loggte sichere Events ohne Secret-Ausgabe.
- Bestaetigt: keine Authorization-/Bearer-/Token-Laengen-/Token-Hash-Ausgabe im geposteten Log.
- Festgestellt: wss://mods.forrestcgn.de/agent-ws antwortet mit 404 Not Found.
- Nicht bestanden: Heartbeat live ueber public WSS noch nicht bestaetigt.
- Bestaetigt: Runtime final wieder deaktiviert.
- Bestaetigt: Actions false und productiveAgentRuntime false.
- Naechster Step: RDAP99_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_PLAN.
- Doku-only; kein Code, keine Nginx-Aenderung, keine Runtime-Aenderung, kein Webserver-Deploy noetig.
```

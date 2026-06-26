# CHANGELOG

## 2026-06-26 - RDAP96B_STREAM_PC_CONNECTION_AGENT_CLIENT_LOCAL_CHECK_DOCS

```text
- Lokalen Check-/Dokumentationsstep nach RDAP96 dokumentiert.
- Bestaetigungsziel fuer node --check der Agent-Dateien festgehalten:
  remote-modboard/stream-pc-agent/src/agent-client.js
  remote-modboard/stream-pc-agent/src/config.js
  remote-modboard/stream-pc-agent/src/logger.js
- Bestaetigungsziel fuer npm --prefix remote-modboard/stream-pc-agent run check festgehalten.
- Dokumentiert: kein Agent-Code, kein Backend-Code, keine Runtime-Aenderung, kein Live-Test.
- Dokumentiert: kein Webserver-Deploy noetig.
- NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP96B angelegt.
- Naechster Step: RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN.
```

## 2026-06-26 - RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE

```text
- Heartbeat-only Stream-PC Agent Client vorbereitet.
- Neue Agent-Komponente remote-modboard/stream-pc-agent/ erstellt.
- package.json fuer eigenes Agent-Paket angelegt.
- src/config.js fuer sichere Env-Konfiguration angelegt.
- src/logger.js fuer sicheres Logging ohne Secrets/Header/Token/Rohpayloads angelegt.
- src/agent-client.js fuer WebSocket-Handshake und minimalen Heartbeat angelegt.
- README.md fuer manuellen Start und Secret-Regeln angelegt.
- Node built-ins only: net/tls/crypto.
- Keine externe ws-Abhaengigkeit.
- Agent kann ws:// und wss://.
- Agent setzt guarded Header fuer /agent-ws.
- Agent sendet minimalen Heartbeat.
- Agent reconnectet mit Backoff.
- Keine Agent-Actions.
- Kein Backend-Code geaendert.
- Keine Runtime dauerhaft aktiviert.
```

## 2026-06-26 - RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN

```text
- Naechsten sicheren Schritt fuer minimalen Stream-PC Agent Client geplant.
- Ziel festgelegt: zunaechst nur Verbindung + Heartbeat.
- Geplanter spaeterer Repo-Ort dokumentiert: remote-modboard/stream-pc-agent/.
- Manueller Start zuerst dokumentiert; kein Autostart/Service in erster Stufe.
- Config-Modell ohne Secrets im Git dokumentiert.
- Heartbeat-Intervall 30000ms dokumentiert.
- Reconnect mit Backoff dokumentiert.
- Logging-Regeln ohne Secrets/Header/Token/Rohpayloads dokumentiert.
- Forbidden Fields fuer Agent-Heartbeat erneut festgehalten.
- Strikte Grenzen dokumentiert: keine Agent-Actions, kein OBS, kein Sound, kein Overlay, keine Commands/Channelpoints, keine Shell/Datei/Prozess/URL-Ausfuehrung.
- NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP95 angelegt.
- Naechster Step: RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE.
- Doku-only; kein Backend-Code, kein Frontend-Code, kein Agent-Code, keine DB, keine Runtime-Aenderung, kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP94D_STREAM_PC_CONNECTION_HEARTBEAT_LIVE_CONFIRM_DOCS

```text
- RDAP94B Live-Confirm dokumentiert.
- Bestaetigt: /agent-ws liefert temporaer aktiviert HTTP/1.1 101 Switching Protocols.
- Bestaetigt: X-SCC-Agent-Actions: disabled.
- Bestaetigt: X-SCC-Agent-Heartbeat: readonly-in-memory.
- Bestaetigt: gueltiger Heartbeat ist waehrend offener Verbindung sichtbar.
- Bestaetigt: Forbidden Heartbeat wird mit heartbeat_forbidden_fields abgelehnt.
- Bestaetigt: Runtime final wieder deaktiviert.
- Dokumentiert: keine Secret-Ausgabe, keine Rohpayload-Ausgabe, keine DB-Migration, keine neue Permission, keine Agent-Actions.
```

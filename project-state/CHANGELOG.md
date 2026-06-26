# CHANGELOG

## 2026-06-26 - RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE

```text
- Neue Agent-Komponente erstellt: remote-modboard/stream-pc-agent/.
- package.json fuer scc-stream-pc-agent erstellt.
- src/config.js erstellt: liest SCC_AGENT_* Umgebungsvariablen, keine .env-Autoloads, keine Secret-Ausgabe.
- src/logger.js erstellt: sichere JSON-Logs, filtert sensible Key-Namen.
- src/agent-client.js erstellt: ws/wss Verbindung per Node built-ins net/tls/crypto, guarded Header, Heartbeat-only, Reconnect-Backoff, sauberer Shutdown.
- README.md fuer manuellen Start und Secret-Regeln erstellt.
- Keine externe ws-Abhaengigkeit eingebaut.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell/Datei/Prozess/URL-Ausfuehrung.
- Keine Prozessliste, Dateiliste, Env-Dumps oder Pfad-Dumps.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Keine Rohpayload-Ausgabe.
- Kein Backend-Code geaendert.
- Keine Runtime dauerhaft aktiviert.
- NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP96 angelegt.
- Naechster Step: RDAP96B_STREAM_PC_CONNECTION_AGENT_CLIENT_LOCAL_CHECK_DOCS.
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
- NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP94D angelegt.
- Naechster Step: RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN.
- Doku-only; kein Code, keine DB, keine Runtime-Aenderung, kein Webserver-Deploy noetig.
```

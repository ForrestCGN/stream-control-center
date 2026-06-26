# CHANGELOG

## 2026-06-26 - RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN

```text
- Separaten manuellen Testplan fuer RDAP96-Agent-Client dokumentiert.
- Geplant: Vorab disabled Status pruefen.
- Geplant: Runtime nur temporaer aktivieren.
- Geplant: Agent nur manuell starten.
- Geplant: Lokales Secret nur lokal setzen, niemals in Chat/Git/Doku.
- Geplant: /api/remote/agent/status pruefen.
- Geplant: gueltigen Heartbeat bestaetigen.
- Geplant: Agent stoppen.
- Geplant: Runtime final wieder deaktivieren.
- Geplant: finalen disabled Status pruefen.
- Festgehalten: keine Secret-Ausgabe, keine Rohpayload-Ausgabe, keine Env-/Config-Dumps.
- Festgehalten: keine Agent-Actions, kein OBS, kein Sound, kein Overlay, keine Commands/Channelpoints, keine Shell/Datei/Prozess/URL-Ausfuehrung.
- NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP97 angelegt.
- Naechster Step: RDAP98_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_LIVE.
- Doku-only; kein Code, keine DB, keine Runtime-Aenderung, kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP96B_STREAM_PC_CONNECTION_AGENT_CLIENT_LOCAL_CHECK_DOCS

```text
- Lokale Checks fuer RDAP96-Agent-Dateien dokumentiert.
- node --check fuer agent-client.js/config.js/logger.js dokumentiert.
- npm --prefix remote-modboard/stream-pc-agent run check dokumentiert.
- Kein Webserver-Deploy noetig.
- Kein Webserver-Live-Test in RDAP96B.
- Naechster Step: RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN.
```

## 2026-06-26 - RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE

```text
- Heartbeat-only Stream-PC Agent Client unter remote-modboard/stream-pc-agent/ vorbereitet.
- Node built-ins only: net/tls/crypto.
- Keine externe ws-Abhaengigkeit.
- Agent kann ws:// und wss://.
- Agent setzt guarded Header fuer /agent-ws.
- Agent sendet minimalen Heartbeat.
- Agent reconnectet mit Backoff.
- Agent loggt nur sichere Events.
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
```

# NEXT CHAT PROMPT - RDAP after RDAP96B

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Verbindliche Arbeitsweise

- Immer zuerst die genannten Startdateien wirklich aus GitHub/dev lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites `go` warten.
- Keine Code-/ZIP-Erstellung vor `go`.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine neuen parallelen Strukturen, wenn Erweiterung bestehender Dateien passt.
- Neue Dateien nur, wenn Verantwortung fachlich wirklich getrennt ist.
- Keine `apply_patch`-/Regex-/`Set-Content`-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach lokale Checks und `git status`.
- Nur wenn sauber: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in `remote-modboard/backend/` und erst nach `stepdone.cmd`.
- Doku-only Steps brauchen keinen Webserver-Deploy.
- Keine Funktionalitaet entfernen.
- Keine echten Secrets in Chat, Doku, ZIP oder Git.
- Keine Secret-Werte, Bearer-Token, Token-Laengen oder Token-Hashes ausgeben/loggen/dokumentieren.
- Bei Tests mit env: nicht `. /etc/stream-control-center/remote-modboard.env` sourcen, weil Werte mit Leerzeichen unquoted sein koennen; gezielt einzelne Werte sicher lesen/setzen.
- Sichtbar/Doku/Nutzerfokus: “Stream-PC Verbindung”, “Verbindungen”, “Webserver <-> Stream-PC”.
- Intern/Code/Route erlaubt: `agent`, `agent-status`, `/api/remote/agent/status`, `stream-pc-agent`, `/agent-ws`.

## Zuerst wirklich lesen

Lies aus GitHub/dev:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE.md
docs/current/RDAP94_FIX1_MODULE_BUILD_CONTEXT.md
docs/current/RDAP94C_LIVE_DEFAULT_CONFIRMED_AND_NEXT_PROMPT.md
docs/current/RDAP94D_STREAM_PC_CONNECTION_HEARTBEAT_LIVE_CONFIRM_DOCS.md
docs/current/RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN.md
docs/current/RDAP96_STREAM_PC_CONNECTION_AGENT_CLIENT_HEARTBEAT_ONLY_CODE.md
docs/current/RDAP96B_STREAM_PC_CONNECTION_AGENT_CLIENT_LOCAL_CHECK_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP96B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/stream-pc-agent/package.json
remote-modboard/stream-pc-agent/src/agent-client.js
remote-modboard/stream-pc-agent/src/config.js
remote-modboard/stream-pc-agent/src/logger.js
remote-modboard/stream-pc-agent/README.md
```

## Aktueller Stand

RDAP94/RDAP94B/RDAP94D sind abgeschlossen:

```text
- Bestehender guarded /agent-ws Transport wurde um minimalen Heartbeat-Receiver erweitert.
- Heartbeat ist read-only und in-memory.
- WebSocket 101 wurde live bestaetigt.
- Gueltiger Heartbeat war waehrend offener Verbindung sichtbar.
- Forbidden Heartbeat wurde sicher abgelehnt.
- Keine Actions.
- Keine produktive Agent Runtime.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Keine Rohpayload-Ausgabe.
- Runtime wurde final wieder deaktiviert.
```

Final bestaetigter Zustand:

```text
AGENT_RUNTIME_ENABLED=false
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

RDAP95 ist dokumentiert:

```text
- Minimaler Stream-PC Agent Client wurde geplant.
- Zunaechst nur Verbindung + Heartbeat.
- Geplanter Repo-Ort: remote-modboard/stream-pc-agent/.
- Manueller Start zuerst, kein Autostart/Service.
- Config ohne Secrets im Git.
- Logging ohne Secrets/Header/Token/Rohpayloads.
- Reconnect mit Backoff.
- Keine Actions.
```

RDAP96 ist gebaut:

```text
- Neue Agent-Komponente remote-modboard/stream-pc-agent/ erstellt.
- Agent nutzt Node built-ins net/tls/crypto.
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

RDAP96B ist dokumentiert:

```text
- Lokale Checks fuer RDAP96-Agent-Dateien dokumentiert.
- node --check fuer agent-client.js/config.js/logger.js vorgesehen.
- npm --prefix remote-modboard/stream-pc-agent run check vorgesehen.
- Kein Webserver-Deploy noetig.
- Kein Webserver-Live-Test in RDAP96B.
```

## Strikt nicht machen

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine Prozessliste.
Keine Dateiliste.
Keine Env-Dumps.
Keine Pfad-Dumps.
Keine produktiven Writes.
Keine DB-Migration.
Keine neue Permission.
Keine produktive Agent-Action-Queue.
Keine Secret-Ausgabe.
Keine Rohpayload-Ausgabe.
Keine Runtime dauerhaft aktivieren.
```

## Naechster sinnvoller Step

```text
RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN
```

Ziel:

```text
- Separaten manuellen Testplan fuer den RDAP96-Agent-Client erstellen.
- Runtime nur temporaer aktivieren.
- Agent nur manuell starten.
- Lokales Secret nur lokal setzen, niemals in Chat/Git/Doku.
- /api/remote/agent/status pruefen.
- Runtime final wieder deaktivieren.
- Keine Actions.
- Kein Backend-Code, falls nicht noetig.
```

## Bitte jetzt

1. Erst die oben genannten Dateien wirklich aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP97 nennen.
3. Auf mein explizites `go` warten.
4. Keine Code-/ZIP-Erstellung vor `go`.

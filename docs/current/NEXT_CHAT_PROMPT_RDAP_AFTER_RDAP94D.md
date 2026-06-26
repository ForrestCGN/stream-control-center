# NEXT CHAT PROMPT - RDAP after RDAP94D

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
- Webserver-Deploy nur nach Codeaenderungen in `remote-modboard/` und erst nach `stepdone.cmd`.
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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP94D.md
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
```

## Aktueller Stand

RDAP94 ist gebaut:

- Bestehender guarded `/agent-ws` Transport wurde um minimalen Heartbeat-Receiver erweitert.
- Heartbeat ist read-only und in-memory.
- Keine neue Route.
- Keine parallele `/agent-ws` Struktur.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine Secret-Ausgabe.
- Status API: `rdap_agent94.v1`.
- Build: `RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE`.
- Heartbeat-Protokoll: `rdap-agent-heartbeat.v1`.

RDAP94_FIX1 ist gebaut:

- `remote-modboard/backend/server.js` wurde korrigiert.
- `MODULE_BUILD` wurde von `RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS` auf `RDAP94_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_IN_MEMORY_CODE` gesetzt.
- Keine Heartbeat-Logik geaendert.
- Keine Runtime-Logik geaendert.
- Keine Actions.
- Keine DB.
- Keine Permission.
- Keine neue Route.
- Keine Secret-Ausgabe.

RDAP94C ist dokumentiert:

- RDAP94/RDAP94_FIX1 live Default bestaetigt.
- Build-Kontext ist live korrekt.
- Runtime ist im Default aus.
- HeartbeatReceiver ist im Default aus.
- Actions bleiben false.
- Productive Agent Runtime bleibt false.

RDAP94B ist live bestaetigt und RDAP94D dokumentiert:

- Runtime wurde temporaer bewusst aktiviert.
- `/agent-ws` WebSocket Upgrade lieferte `101 Switching Protocols`.
- Response bestaetigte `X-SCC-Agent-Actions: disabled`.
- Response bestaetigte `X-SCC-Agent-Heartbeat: readonly-in-memory`.
- Gueltiger Heartbeat war waehrend offener Verbindung sichtbar.
- Forbidden Heartbeat mit verbotenem Feld wurde abgelehnt.
- Keine Actions.
- Keine produktive Agent Runtime.
- Keine DB-Migration.
- Keine Secret-Ausgabe.
- Keine Rohpayload-Ausgabe.
- Runtime wurde final wieder deaktiviert.

## Final bestaetigter Zustand nach RDAP94B

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Bestaetigter Heartbeat Live-Confirm

Waehrend offener Verbindung nach gueltigem Heartbeat:

```text
connected=true
connectionState=connected
lastHeartbeatAt gesetzt
heartbeatAgeMs klein
heartbeatSeq=11
heartbeatProtocolVersion=rdap-agent-heartbeat.v1
stale=false
lastHeartbeatPayloadStored=false
actionEnabled=false
productiveAgentRuntime=false
heartbeatExecutesActions=false
heartbeatAcceptsCommands=false
heartbeatAcceptsCapabilities=false
```

Nach Forbidden Heartbeat:

```text
heartbeatRejectCount stieg an
lastHeartbeatRejectReason=heartbeat_forbidden_fields
letzter gueltiger Heartbeat blieb unveraendert
lastHeartbeatPayloadStored=false
actionEnabled=false
productiveAgentRuntime=false
heartbeatExecutesActions=false
heartbeatAcceptsCommands=false
heartbeatAcceptsCapabilities=false
```

## Architektur

Intern:

```text
Node lokal: ws://127.0.0.1:3010/agent-ws
```

Oeffentlich spaeter:

```text
Stream-PC Agent -> wss://mods.forrestcgn.de/agent-ws
Nginx/TLS -> Node intern 127.0.0.1:3010/agent-ws
```

Der Stream-PC braucht keine Portfreigabe. Er verbindet aktiv zum Webserver.

## Secret-Safety

Nicht ausgeben, nicht dokumentieren, nicht loggen:

```text
AGENT_ACCESS_KEY
Authorization Header
Bearer Token
Token-Laenge
Token-Hash
Cookies
Query-Werte
rohe IP-Adresse
roher Heartbeat-Payload
rohe Header
```

## Bedienhinweis fuer Live-Konsole

Bei Live-Tests keine riesigen kombinierten Paste-Bloecke verwenden. Die Web-/SSH-Konsole kann Heredocs oder lange `jq`-Bloecke kaputt einfuegen.

Bevorzugt:

```text
- kurze Einzelbefehle
- groessere Node-Tests als Datei unter /tmp schreiben
- Datei separat ausfuehren
- danach /tmp-Datei loeschen
- nach temporaerer Runtime-Aktivierung immer finalen Disable-Check ausfuehren
```

## Naechster sinnvoller Step

```text
RDAP95_STREAM_PC_CONNECTION_AGENT_CLIENT_PLAN
```

Ziel:

- Naechsten sicheren Step fuer einen minimalen Stream-PC Agent Client planen.
- Agent Client darf zunaechst nur Verbindung + Heartbeat koennen.
- Keine Agent-Actions.
- Keine OBS-Steuerung.
- Keine Sound-Ausloesung.
- Keine Overlay-Schaltung.
- Keine Command-/Channelpoints-Steuerung.
- Keine freie Shell.
- Keine freie Datei-/Prozess-/URL-Ausfuehrung.
- Keine produktiven Writes.
- Keine DB-Migration.
- Keine neue Permission ohne separaten Plan.

## Bitte jetzt

1. Erst die oben genannten Dateien wirklich aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP95 nennen.
3. Auf mein explizites `go` warten.
4. Keine Code-/ZIP-Erstellung vor `go`.

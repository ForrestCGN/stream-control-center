# NEXT CHAT PROMPT - RDAP after RDAP99

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
docs/current/RDAP97_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PLAN.md
docs/current/RDAP98B_STREAM_PC_CONNECTION_AGENT_CLIENT_MANUAL_TEST_PARTIAL_DOCS.md
docs/current/RDAP99_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP99.md
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

RDAP98B dokumentierte den RDAP98 Teiltest:

```text
- Vorab disabled Status: OK
- Runtime temporaer aktiviert: OK
- Agent lokal gestartet: OK
- Agent loggte sichere Events ohne Secret-Ausgabe.
- Public WSS /agent-ws lieferte 404 Not Found.
- Heartbeat live ueber public WSS noch nicht bestaetigt.
- Runtime final wieder disabled.
- Actions false.
- productiveAgentRuntime false.
```

RDAP99 dokumentierte den Nginx/ISPConfig Befund:

```text
- ISPConfig hat fuer mods.forrestcgn.de bereits location / mit proxy_pass http://127.0.0.1:3010/.
- Fuer WebSocket /agent-ws fehlt ein eigener Location-Block.
- Upgrade-/Connection-Header fehlen fuer /agent-ws.
- Naechster Step soll gezielt einen /agent-ws WebSocket Proxy planen/setzen.
```

Final bestaetigter Zustand bleibt:

```text
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
runtime.heartbeatReceiverEnabled=false
agent.connected=false
actionEnabled=false
productiveAgentRuntime=false
```

## Naechster sinnvoller Step

```text
RDAP100_STREAM_PC_CONNECTION_NGINX_AGENT_WS_PROXY_CONFIG
```

Ziel:

```text
- In ISPConfig/Nginx einen separaten location /agent-ws Block ergaenzen.
- Bestehenden location / Block unveraendert lassen.
- WebSocket Upgrade korrekt weiterreichen.
- nginx -t ausfuehren.
- Nginx reloaden.
- Public /agent-ws erneut testen.
- Runtime fuer echten Heartbeat-Test nur temporaer aktivieren.
- Agent danach stoppen.
- Runtime final wieder deaktivieren.
```

Geplanter Nginx Block:

```nginx
location /agent-ws {
    proxy_pass http://127.0.0.1:3010/agent-ws;
    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;

    proxy_read_timeout 75s;
    proxy_connect_timeout 5s;
    proxy_send_timeout 75s;
}
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
Keine Nginx-Aenderung ohne Plan und explizites go.
```

## Bitte jetzt

1. Erst die oben genannten Dateien wirklich aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP100 nennen.
3. Auf mein explizites `go` warten.
4. Keine Nginx-Aenderung und keine Testbefehle vor `go`.

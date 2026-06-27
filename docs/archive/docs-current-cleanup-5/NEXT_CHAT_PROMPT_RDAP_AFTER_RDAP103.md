# NEXT CHAT PROMPT - RDAP after RDAP103

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
docs/current/RDAP101B_STREAM_PC_CONNECTION_AGENT_PUBLIC_WSS_HEARTBEAT_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP102_STREAM_PC_CONNECTION_DASHBOARD_STATUS_VISIBLE_PLAN.md
docs/current/RDAP103_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP103.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/assets/rdap80-agent-status.js
```

## Aktueller Stand

RDAP103 bereitete die Read-only UI-Kachel fuer Stream-PC Verbindung vor:

```text
- Bestehende UI-Datei remote-modboard/backend/public/assets/rdap80-agent-status.js erweitert.
- Kein neues Modul und keine neue parallele Seite.
- Veralteten RDAP80B-Hinweistext aktualisiert.
- Status-Semantik fuer verbunden/veraltet/offline ergaenzt.
- Heartbeat-Anzeige mit Zeit, Alter, Seq und Protokoll ergaenzt.
- Actions bleiben deaktiviert.
- Keine Start/Stop Buttons.
- Keine Agent-Actions.
- Keine Secrets.
```

Final bestaetigter Zustand vor RDAP103 bleibt:

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
RDAP103B_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD_LIVE_CONFIRM
```

Ziel:

```text
- RDAP103 nach GitHub/dev deployen.
- Readiness pruefen.
- /api/remote/agent/status read-only pruefen.
- UI-Seite Admin / Verbindungen visuell pruefen.
- Final disabled Status pruefen.
- Keine Runtime-Aktivierung.
- Keine Agent-Actions.
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
Keine Runtime-Aktivierung im RDAP103B UI-Live-Confirm.
```

## Bitte jetzt

1. Erst die oben genannten Dateien wirklich aus GitHub/dev lesen.
2. Danach kurzen Plan fuer RDAP103B nennen.
3. Auf mein explizites `go` warten.
4. Kein Live-Test, keine Runtime-Aktivierung und keine Deploy-Befehle vor `go`.

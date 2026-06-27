# NEXT CHAT PROMPT - RDAP after RDAP92C

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Verbindliche Arbeitsweise

```text
- Immer zuerst die genannten Startdateien wirklich lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine neuen parallelen Strukturen, wenn Erweiterung bestehender Dateien passt.
- Neue Dateien nur, wenn Verantwortung fachlich wirklich getrennt ist.
- Keine apply_patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: installstep.cmd aus D:\Git\stream-control-center.
- Danach lokale Checks und git status.
- Nur wenn sauber: stepdone.cmd.
- stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ und erst nach stepdone.cmd.
- Doku-only braucht keinen Webserver-Deploy.
- Keine echten Secrets in Chat, Doku, ZIP oder Git.
```

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN.md
docs/current/RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN.md
docs/current/RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN.md
docs/current/RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS.md
docs/current/RDAP92_FIX1_CONFIG_EXPORT_RESTORE.md
docs/current/RDAP92C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP92C.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP92C

```text
RDAP92:
- Erster Backend-Code-Step fuer minimalen /agent-ws Transport-Accept live.
- Neue Datei agent-runtime.service.js.
- server.js registriert genau einen Runtime-Registrar.
- Keine zweite parallele /agent-ws Registrierung.
- Zwei-Stufen-Gate:
  - AGENT_RUNTIME_ENABLED=true
  - acceptBuildEnabled=true im RDAP92-Build
- Correct Bearer allein reicht nicht.
- Mit beiden Gates ist HTTP 101 Switching Protocols bestaetigt.
- connected true waehrend Verbindung bestaetigt.
- close/offline bestaetigt.
- Actions false bestaetigt.
- Heartbeat false bestaetigt.
- productiveAgentRuntime false bestaetigt.
- AGENT_RUNTIME_ENABLED final wieder false.
```

## Wichtige Live-Bestaetigungen

```text
Finaler Sicherheitszustand:
AGENT_RUNTIME_ENABLED=false
runtime.requestedEnabled=false
runtime.effectiveEnabled=false
runtime.acceptsAgentConnections=false
agent.connected=false
actionsEnabled=false
productiveAgentRuntime=false
heartbeatReceiverEnabled=false
```

## Harte Grenzen weiterhin

```text
Keine Agent-Actions ohne separaten Plan.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
Keine Admin-Notes-Politur.
Kein sichtbares Hauptmodul Agent.
Keine Secret-Ausgabe.
Kein AGENT_ACCESS_KEY im Repo.
Kein AGENT_ACCESS_KEY im Chat.
Kein Bearer-Token in Status/UI/Logs.
Keine Token-Laenge und kein Token-Hash in Status/UI/Logs.
```

## Naechster empfohlener Step

```text
RDAP93_STREAM_PC_CONNECTION_HEARTBEAT_READ_ONLY_PLAN
```

Ziel:

```text
- Erst Plan, kein Code vor go.
- Heartbeat-Modell read-only planen.
- Noch keine Actions.
- Kein OBS/Sound/Overlay/Command.
- Keine freie Shell/Datei/Prozess/URL.
- Keine DB-Migration im ersten Heartbeat-Plan.
- In-Memory Heartbeat/Stale/Offline definieren.
- Payload minimal und sicher definieren.
- Secret-Safety fortsetzen.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst GitHub/dev und die Startdateien inklusive RDAP92C und Runtime-Dateien. Danach nenne ich nur den Plan fuer RDAP93 Heartbeat read-only. Kein Code/ZIP vor deinem go.
```

# NEXT CHAT PROMPT - RDAP after RDAP92

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten. Erst Startdateien lesen, dann Plan nennen, dann auf `go` warten.

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP88_STREAM_PC_CONNECTION_CORRECT_BEARER_REJECT_ONLY_TEST_CONFIRMED.md
docs/current/RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN.md
docs/current/RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN.md
docs/current/RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN.md
docs/current/RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP92.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP92

```text
RDAP92:
- Erster Backend-Code-Step fuer minimalen Transport-Accept vorbereitet.
- Neue Datei agent-runtime.service.js.
- server.js registriert genau einen Runtime-Registrar.
- Keine zweite parallele /agent-ws Registrierung.
- Zwei-Stufen-Gate:
  - AGENT_RUNTIME_ENABLED=true.
  - acceptBuildEnabled=true im RDAP92-Build.
- Ohne AGENT_RUNTIME_ENABLED=true bleibt Correct Bearer reject-only mit runtime_not_effectively_enabled.
- Mit beiden Gates kann WebSocket-Transport akzeptiert werden.
- Keine Actions.
- Kein produktiver Heartbeat.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## Naechster empfohlener Step

```text
RDAP92B_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_LIVE_CONFIRM
```

Ziel:

```text
- Lokale Checks bestaetigen.
- Webserver-Deploy nach stepdone durchfuehren.
- Status vor Aktivierung pruefen.
- Correct Bearer ohne AGENT_RUNTIME_ENABLED=true pruefen.
- AGENT_RUNTIME_ENABLED=true bewusst auf Webserver setzen.
- Correct Bearer WebSocket Accept pruefen.
- Connected/Close Status pruefen.
- Secret-Safety pruefen.
- Keine Actions bestaetigen.
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

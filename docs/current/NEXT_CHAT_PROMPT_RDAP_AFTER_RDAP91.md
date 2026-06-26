# NEXT CHAT PROMPT - RDAP after RDAP91

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
docs/current/RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_ACCESS_KEY_PLAN.md
docs/current/RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON.md
docs/current/RDAP82B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC.md
docs/current/RDAP83B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN.md
docs/current/RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED.md
docs/current/RDAP85B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED.md
docs/current/RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS.md
docs/current/RDAP87B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP88_STREAM_PC_CONNECTION_CORRECT_BEARER_REJECT_ONLY_TEST_CONFIRMED.md
docs/current/RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN.md
docs/current/RDAP90_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_DISABLED_BUILD_PLAN.md
docs/current/RDAP91_STREAM_PC_CONNECTION_RUNTIME_ACCEPT_TRANSPORT_DISABLED_CODE_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP91.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP91

```text
RDAP90:
- Runtime-Accept disabled Build-Plan dokumentiert.
- Spaeterer Accept-Code-Step darf maximal Transport akzeptieren.
- Actions bleiben false.
- productiveAgentRuntime bleibt false.
- Zweiter Code-/Build-Schalter ist Pflicht.
- AGENT_RUNTIME_ENABLED=true allein bleibt wirkungslos.
- Keine zweite parallele /agent-ws Registrierung.

RDAP91:
- Runtime-Accept Transport-disabled Code-Plan dokumentiert.
- Doku-only.
- Keine Code-Aenderung.
- Keine Runtime aktiviert.
- Keine Stream-PC Verbindung akzeptiert.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Kein Agent online.
- Keine Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## RDAP91 Kernaussagen

```text
- RDAP92 soll erster Backend-Code-Step fuer minimalen Transport-Accept werden.
- Maximal WebSocket-Transport akzeptieren.
- Keine Actions.
- Kein OBS/Sound/Overlay/Command.
- Kein Heartbeat, falls nicht separat explizit geplant.
- Kein zweiter paralleler /agent-ws Handler.
- Ab echtem Accept ist eine fachlich getrennte Datei agent-runtime.service.js sinnvoll.
- server.js darf trotzdem nur genau einen Runtime-Registrar nutzen.
```

## Harte Grenzen weiterhin

```text
Keine akzeptierte Stream-PC Verbindung ohne separaten Code-Step und explizites go.
Keine Agent-Actions ohne separaten Plan.
AGENT_RUNTIME_ENABLED=true allein darf keine Verbindung akzeptieren.
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

## Sprachregel

Sichtbar / Doku / Nutzerfokus:

```text
Stream-PC Verbindung
Verbindungen
Webserver <-> Stream-PC
```

Intern / Code / Route weiterhin okay:

```text
agent
agent-status
/api/remote/agent/status
stream-pc-agent
/agent-ws
```

Nicht als sichtbares Hauptmodul verwenden:

```text
Agent -> Agent-Status
```

## Naechster empfohlener Step

```text
RDAP92_STREAM_PC_CONNECTION_TRANSPORT_ACCEPT_GUARDED_NO_ACTIONS
```

Ziel:

```text
- Erster Backend-Code-Step fuer minimalen Transport-Accept.
- Vorher echte Dateien erneut lesen.
- Keine parallele /agent-ws Registrierung.
- Maximal WebSocket-Transport akzeptieren.
- Keine Actions.
- Kein Heartbeat, falls nicht separat explizit geplant.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission ohne separaten Plan.
- Keine Secret-Ausgabe.
```

## Vor RDAP92 pruefen

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/services/agent-runtime-disabled.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
docs/current/*
project-state/*
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die aktuellen Startdateien aus GitHub/dev und pruefe RDAP81 bis RDAP91 sowie die relevanten Runtime-Dateien. Danach nenne ich nur den Plan fuer RDAP92 Stream-PC-Verbindung Transport-Accept guarded no actions. Kein Code/ZIP vor deinem go.
```

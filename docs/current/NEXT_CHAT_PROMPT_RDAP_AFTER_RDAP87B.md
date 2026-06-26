# NEXT CHAT PROMPT - RDAP after RDAP87B

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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP87B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP87B

```text
RDAP86:
- Access-Key-Compare im bestehenden disabled /agent-ws Guard live bestaetigt.
- Verbindungen werden weiterhin immer mit 503 abgelehnt.
- Keine akzeptierte Stream-PC Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Keine Agent-Actions.
- Keine DB.
- Keine Secret-Ausgabe.

RDAP87:
- Sicheres Setzen von AGENT_ACCESS_KEY in /etc/stream-control-center/remote-modboard.env dokumentiert.
- Kein Key im Repo.
- Kein Key im Chat.
- Kein Key in Doku.
- Kein Key in Logs/Status/UI.
- Doku-only.

RDAP87B:
- AGENT_ACCESS_KEY ist auf dem Webserver gesetzt.
- accessKeyConfigured true live bestaetigt.
- Falscher Bearer nach gesetztem Key liefert HTTP 503 / reason=invalid_connection_proof.
- rejectCount 1 nach falschem Bearer bestaetigt.
- lastRejectAccessKeyConfigured true bestaetigt.
- lastRejectConnectionProofCompared true bestaetigt.
- acceptsAgentConnections false bestaetigt.
- actionEnabled false bestaetigt.
- productiveAgentRuntime false bestaetigt.
- secretsExposed false bestaetigt.
- bearerTokenLogged false bestaetigt.
- tokenLengthLogged false bestaetigt.
- tokenHashLogged false bestaetigt.
- Doku-only.
```

## Harte Grenzen weiterhin

```text
Keine akzeptierte Stream-PC Verbindung ohne separaten Plan und explizites go.
Keine Runtime-Aktivierung ohne separaten Plan.
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
RDAP88_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN
```

Ziel:

```text
- Noch keine Runtime aktivieren.
- Noch keine Verbindung akzeptieren.
- Zuerst Plan fuer Runtime-Freigabe erstellen.
- Bedingungen fuer spaeteren Accept definieren.
- Zwei-Stufen-Freigabe erhalten.
- AGENT_RUNTIME_ENABLED=true allein darf weiterhin nicht reichen.
- Kein Agent online.
- Kein Heartbeat-Receiver.
- Keine produktiven Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## Vor RDAP88 pruefen

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
Ich lese zuerst die aktuellen Startdateien aus GitHub/dev und pruefe RDAP81/RDAP82/RDAP82B/RDAP83/RDAP83B/RDAP84/RDAP85/RDAP85B/RDAP86/RDAP86B/RDAP87/RDAP87B sowie die relevanten Runtime-Dateien. Danach nenne ich nur den Plan fuer RDAP88 Stream-PC-Verbindung Runtime-Enable-Plan. Kein Code/ZIP vor deinem go.
```

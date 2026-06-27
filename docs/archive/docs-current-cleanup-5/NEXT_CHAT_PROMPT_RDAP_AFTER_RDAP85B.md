# NEXT CHAT PROMPT - RDAP after RDAP85B

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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP85B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP85B

```text
RDAP85:
- Handshake-Precheck im bestehenden disabled /agent-ws Guard vorbereitet.
- Verbindungen werden weiterhin immer mit 503 abgelehnt.
- Keine akzeptierte Agent-Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Kein Agent wird online gesetzt.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- statusApiVersion rdap_agent85.v1 live bestaetigt.

RDAP85B:
- RDAP85 live serverseitig bestaetigt.
- /api/remote/agent/status bestaetigt.
- /api/remote/status .agent bestaetigt.
- /api/remote/routes .agentStatusFoundation bestaetigt.
- Reject-Test ohne Agent-ID bestaetigt: HTTP 503 / reason=missing_agent_id.
- Reject-Test mit falscher Agent-ID bestaetigt: HTTP 503 / reason=unknown_agent_id.
- Reject-Test mit richtiger Agent-ID + Protokoll, aber ohne Auth bestaetigt: HTTP 503 / reason=missing_connection_proof.
- rejectCount steigt nach den drei Tests auf 3.
- lastRejectReason missing_connection_proof bestaetigt.
- lastRejectAgentIdHint stream-pc-main bestaetigt.
- lastRejectProtocolHint rdap-agent-handshake.v1 bestaetigt.
- acceptsAgentConnections false bestaetigt.
- actionEnabled false bestaetigt.
- productiveAgentRuntime false bestaetigt.
- secretsExposed false bestaetigt.
- headersLogged false bestaetigt.
- rawIpLogged false bestaetigt.
- Doku-only.
```

## Harte Grenzen weiterhin

```text
Keine akzeptierte Agent-Verbindung ohne separaten Plan und explizites go.
Keine Runtime-Aktivierung ohne separaten Plan.
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
RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED
```

Ziel:

```text
- Access-Key-Vergleich gegen AGENT_ACCESS_KEY vorbereiten.
- Verbindungen weiterhin ablehnen.
- invalid_connection_proof fuer falschen Bearer-Wert sicher diagnostizieren.
- Optional runtime_not_effectively_enabled fuer syntaktisch korrekten und passenden Proof, solange Runtime disabled bleibt.
- Keine Runtime-Aktivierung.
- Keine akzeptierte Verbindung.
- Keine produktiven Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## Vor RDAP86 pruefen

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
Ich lese zuerst die aktuellen Startdateien aus GitHub/dev und pruefe RDAP81/RDAP82/RDAP82B/RDAP83/RDAP83B/RDAP84/RDAP85/RDAP85B sowie die relevanten Runtime-Dateien. Danach nenne ich nur den Plan fuer RDAP86 Stream-PC-Verbindung Access-Key-Compare-Disabled. Kein Code/ZIP vor deinem go.
```

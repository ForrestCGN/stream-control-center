# NEXT CHAT PROMPT - RDAP after RDAP86B

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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP86B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP86B

```text
RDAP86:
- Access-Key-Compare im bestehenden disabled /agent-ws Guard vorbereitet.
- AGENT_ACCESS_KEY wird nur serverseitig aus process.env gelesen.
- Authorization Bearer wird nur intern verglichen.
- Verbindungen werden weiterhin immer mit 503 abgelehnt.
- Keine akzeptierte Stream-PC Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Kein Agent wird online gesetzt.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- statusApiVersion rdap_agent86.v1 live bestaetigt.

RDAP86B:
- RDAP86 live serverseitig bestaetigt.
- /api/remote/agent/status bestaetigt.
- /api/remote/status .agent bestaetigt.
- /api/remote/routes .agentStatusFoundation bestaetigt.
- Reject-Test falsches Auth-Schema bestaetigt: HTTP 503 / reason=invalid_connection_proof.
- Reject-Test Bearer bei nicht gesetztem AGENT_ACCESS_KEY bestaetigt: HTTP 503 / reason=access_key_not_configured.
- rejectCount steigt nach den zwei Tests auf 2.
- lastRejectReason access_key_not_configured bestaetigt.
- lastRejectAccessKeyConfigured false bestaetigt.
- lastRejectConnectionProofCompared false bestaetigt.
- acceptsAgentConnections false bestaetigt.
- actionEnabled false bestaetigt.
- productiveAgentRuntime false bestaetigt.
- secretsExposed false bestaetigt.
- headersLogged false bestaetigt.
- rawIpLogged false bestaetigt.
- bearerTokenLogged false bestaetigt.
- tokenLengthLogged false bestaetigt.
- tokenHashLogged false bestaetigt.
- Doku-only.
```

## Harte Grenzen weiterhin

```text
Keine akzeptierte Stream-PC Verbindung ohne separaten Plan und explizites go.
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
Kein AGENT_ACCESS_KEY im Repo.
Kein AGENT_ACCESS_KEY im Chat.
Kein Bearer-Token in Status/UI/Logs.
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
RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS
```

Ziel:

```text
- Sicheres Setzen von AGENT_ACCESS_KEY auf dem Webserver planen/dokumentieren.
- Doku-only bevorzugt.
- Kein Key im Repo.
- Kein Key im Chat.
- Kein Key in Logs.
- Kein Key in Status/UI.
- Nur sichere Pruefung, ob accessKeyConfigured true wird.
- Noch keine akzeptierte Verbindung.
- Noch keine Runtime-Aktivierung.
- Keine produktiven Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
```

## Vor RDAP87 pruefen

```text
/etc/stream-control-center/remote-modboard.env nur lokal auf dem Webserver, aber niemals Secret-Wert in Chat/Doku kopieren.
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/services/agent-runtime-disabled.service.js
docs/current/*
project-state/*
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die aktuellen Startdateien aus GitHub/dev und pruefe RDAP81/RDAP82/RDAP82B/RDAP83/RDAP83B/RDAP84/RDAP85/RDAP85B/RDAP86/RDAP86B sowie die relevanten Runtime-Dateien. Danach nenne ich nur den Plan fuer RDAP87 Stream-PC-Verbindung Access-Key-Env-Setup-Docs. Kein Code/ZIP vor deinem go.
```

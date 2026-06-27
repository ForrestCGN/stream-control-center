# NEXT CHAT PROMPT - RDAP after RDAP84

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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP84.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP84

```text
RDAP83:
- /agent-ws Reject-Diagnose vorbereitet und live bestaetigt.
- Diagnose ist in-memory only.
- Keine DB-Persistenz.
- Keine akzeptierte Agent-Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Kein Agent wird online gesetzt.
- Keine Agent-Actions.
- Keine Secret-/Header-/Cookie-/Query-Wert-/IP-Ausgabe.

RDAP83B:
- RDAP83 live serverseitig bestaetigt.
- /agent-ws Reject-Test bestaetigt: HTTP 503 / reason=agent_runtime_disabled.
- rejectCount steigt nach Test von 0 auf 1.
- acceptsAgentConnections false bestaetigt.
- actionEnabled false bestaetigt.
- productiveAgentRuntime false bestaetigt.
- Doku-only.

RDAP84:
- Access-Key-Handshake-Plan dokumentiert.
- Geplanter Header-Vertrag dokumentiert:
  Authorization: Bearer <secret>
  X-SCC-Agent-Id: stream-pc-main
  X-SCC-Agent-Version: <version>
  X-SCC-Agent-Protocol: rdap-agent-handshake.v1
- Zwei-Stufen-Freigabe festgelegt:
  AGENT_RUNTIME_ENABLED=true allein darf keine Verbindung akzeptieren.
- Geplante sichere Ablehnungsgruende dokumentiert.
- Sichtbare Diagnosegrenzen dokumentiert.
- Keine Runtime-Aktivierung.
- Keine akzeptierte Verbindung.
- Keine DB.
- Keine neue Permission.
- Keine Secret-Ausgabe.
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
RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED
```

Ziel:

```text
- Header-/Handshake-Precheck in bestehendem disabled Guard vorbereiten.
- Verbindungen weiterhin ablehnen.
- missing/invalid/unknown Gruende sicher diagnostizieren.
- Keine akzeptierte Agent-Verbindung.
- Keine Runtime-Aktivierung.
- Keine produktiven Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## Vor RDAP85 pruefen

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
Ich lese zuerst die aktuellen Startdateien aus GitHub/dev und pruefe RDAP81/RDAP82/RDAP82B/RDAP83/RDAP83B/RDAP84 sowie die relevanten Runtime-Dateien. Danach nenne ich nur den Plan fuer RDAP85 Stream-PC-Verbindung Handshake-Precheck-Disabled. Kein Code/ZIP vor deinem go.
```

# NEXT CHAT PROMPT - RDAP after RDAP80

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
docs/current/RDAP79_DOCS_CURRENT_STATE_AND_NEXT_STREAMPC_CONNECTION_PROMPT.md
docs/current/RDAP80_AGENT_CONNECTION_ARCHITECTURE_AND_STATUS_FOUNDATION.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP80.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP80

```text
- Admin-Notes bleiben eingefroren.
- Remote-Modboard hat eine Agent-Page: Agent -> Agent-Status.
- Backend Route existiert: GET /api/remote/agent/status.
- /api/remote/status enthaelt den strukturierten Agent-Summary.
- /api/remote/routes listet die Agent-Statusroute.
- Agent-Status ist read-only und aktuell disabled/offline.
- Heartbeat-Modell ist vorbereitet, aber kein Runtime/Receiver aktiv.
- Kein produktiver Agent, kein WSS-Runtime, keine Actions.
```

## Harte Grenzen weiterhin

```text
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
```

## Naechster empfohlener Step

```text
RDAP81_AGENT_HANDSHAKE_AND_TOKEN_PLAN
```

Ziel:

```text
- Agent-Handshake konkret planen.
- Agent-ID und Agent-Secret-Konzept planen.
- WSS-Pfad /agent-ws und Auth-Grenzen planen.
- Heartbeat-Empfang planen.
- In-Memory vs. DB-Persistenz entscheiden.
- Keine produktiven Actions bauen.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die aktuellen Startdateien aus GitHub/dev und pruefe RDAP80. Danach nenne ich nur den Plan fuer RDAP81. Kein Code/ZIP vor deinem go.
```

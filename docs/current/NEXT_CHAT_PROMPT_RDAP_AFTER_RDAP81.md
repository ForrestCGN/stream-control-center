# NEXT CHAT PROMPT - RDAP after RDAP81

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
docs/current/RDAP80B_AGENT_MENU_TO_ADMIN_CONNECTIONS.md
docs/current/RDAP80C_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_ACCESS_KEY_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP81.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP81

```text
RDAP80:
- GET /api/remote/agent/status existiert.
- /api/remote/status enthaelt Agent-/Stream-PC-Summary.
- /api/remote/routes listet die Statusroute.
- Status ist offline/disabled.
- Kein produktiver Runtime.

RDAP80B:
- Sichtbare UI ist Admin -> Verbindungen / Stream-PC Verbindung.
- Kein eigenes Hauptmodul Agent mehr sichtbar.

RDAP80C:
- Live-Abschluss dokumentiert.

RDAP81:
- Stream-PC-Verbindungs-Handshake geplant.
- Interne Agent-ID bleibt stream-pc-main.
- Agent-Name bleibt Forrest Stream-PC.
- Zugangsschluessel-Konzept geplant.
- WSS-Pfad /agent-ws geplant.
- Heartbeat-Empfang geplant.
- Erste Runtime-Stufe soll In-Memory bleiben.
- Keine DB-Persistenz in RDAP81.
- Keine produktiven Actions.
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

Nicht mehr als sichtbares Hauptmodul verwenden:

```text
Agent -> Agent-Status
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
Keine Admin-Notes-Politur.
```

## Naechster empfohlener Step

```text
RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON
```

Ziel:

```text
- Vorhandene remote-modboard Serverstruktur pruefen.
- Klaeren, ob und wie ein WSS-/Receiver-Skeleton sauber andockt.
- Runtime default disabled lassen.
- Zugangsschluessel nur aus Umgebung planen/lesen, keinen Wert ins Repo.
- Statusroute weiterhin read-only halten.
- Keine Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
```

## Vor RDAP82 zu pruefen

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/routes/agent-status.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/assets/rdap80-agent-status.js
backend/modules/remote_agent.js
tools/*
docs/current/*
project-state/*
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die aktuellen Startdateien aus GitHub/dev und pruefe RDAP80/RDAP80B/RDAP80C/RDAP81. Danach nenne ich nur den Plan fuer RDAP82 Stream-PC-Verbindung Runtime-disabled Skeleton. Kein Code/ZIP vor deinem go.
```

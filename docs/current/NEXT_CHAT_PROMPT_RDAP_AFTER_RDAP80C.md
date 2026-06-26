# NEXT CHAT PROMPT - RDAP after RDAP80C

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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP80C.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP80C

```text
RDAP77B:
- Frontend-Registry / Admin-Unterseiten funktionieren.
- Admin ist Obermodul.
- Admin-Notizen und User-Detail sind getrennte Admin-Pages.
- Header, Navigation und sichtbares Panel sind synchron.

RDAP78C:
- Admin-Notes Zieluser-Kontext funktioniert.
- ForrestCGN zeigt eigene Notizen.
- EngelCGN zeigt keine falschen Forrest-Notizen mehr.
- Stale Count im Notice-Humanizer ist korrigiert.

RDAP79:
- Admin-Notes-/Registry-Block dokumentarisch abgeschlossen.
- Fokus auf Webserver <-> Stream-PC Verbindung gelegt.

RDAP80:
- Read-only Statusroute GET /api/remote/agent/status gebaut.
- /api/remote/status enthaelt strukturierten Agent-/Stream-PC-Summary.
- /api/remote/routes listet die Statusroute.
- Status ist offline/disabled.
- Keine produktiven Actions.

RDAP80B:
- Sichtbare UI-Einordnung korrigiert.
- Nicht mehr Agent -> Agent-Status.
- Jetzt Admin -> Verbindungen / Stream-PC Verbindung.
- Backend unveraendert.

RDAP80C:
- RDAP80 und RDAP80B live serverseitig bestaetigt.
- Naechsten Step sprachlich auf Stream-PC Verbindung ausgerichtet.
```

## Sprachregel ab jetzt

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
```

Nicht mehr als sichtbares Hauptmodul verwenden:

```text
Agent -> Agent-Status
```

## Aktueller technischer Stand

```text
GET /api/remote/agent/status existiert.
Route ist read-only.
Status ist offline/disabled.
Heartbeat-Modell ist vorbereitet, aber Receiver/Runtime sind disabled.
WSS-Pfad /agent-ws ist nur geplant.
Stream-PC braucht keine Portfreigabe.
Stream-PC soll spaeter aktiv zum Webserver verbinden.
Keine Remote-/Agent-Actions aktiv.
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
RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_TOKEN_PLAN
```

Ziel:

```text
- Stream-PC-Verbindungs-Handshake konkret planen.
- Agent-ID intern sauber definieren.
- Agent-Secret-/Token-Konzept planen.
- WSS-Pfad /agent-ws und Auth-Grenzen planen.
- Heartbeat-Empfang planen.
- In-Memory vs. DB-Persistenz entscheiden.
- Keine produktiven Actions bauen.
```

## Vor RDAP81 zu pruefen

```text
remote-modboard/backend/src/services/agent-status.service.js
remote-modboard/backend/src/routes/agent-status.routes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/public/assets/rdap80-agent-status.js
backend/modules/remote_agent.js
tools/*
docs/current/*
project-state/*
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die aktuellen Startdateien aus GitHub/dev und pruefe RDAP80/RDAP80B/RDAP80C. Danach nenne ich nur den Plan fuer RDAP81 Stream-PC-Verbindung/Handshake/Token. Kein Code/ZIP vor deinem go.
```


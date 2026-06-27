# NEXT_STEPS

Stand: RDAP105_DOCS_INVENTORY_AND_CLEANUP_PLAN  
Datum: 2026-06-27

## Naechster Step

```text
RDAP106_DOCS_CURRENT_STATE_REBUILD
```

## Ziel

```text
- zentrale aktuelle Doku-Dateien neu aufbauen
- docs/current auf echte aktuelle Wahrheit/Startpunkte fokussieren
- historische RDAP/CAN/DASHUI-Dateien als Archiv behandeln
- project-state knapp und eindeutig halten
- neuen Next-Chat-Prompt aus der bereinigten Struktur ableiten
```

## Vorgeschlagene Ziel-Dateien fuer RDAP106

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP106.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Danach geparkter Feature-Step

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

## Neuer Standardbefehl fuer kuenftige Webserver-Deploys

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Strikt nicht machen

```text
Keine Feature-Implementierung in RDAP106.
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine DB-Migration.
Keine produktiven Writes.
Keine Runtime-Aktivierung.
Keine Secrets.
Keine Rohpayloads.
Keine Massenloeschung historischer Dateien.
```

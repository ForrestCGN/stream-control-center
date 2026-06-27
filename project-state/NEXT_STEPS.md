# NEXT_STEPS

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
Datum: 2026-06-27

## Naechster Step

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

## Ziel

```text
- weitere Stream-PC-Verbindungsdetails nur read-only planen
- bestehende Agent-/Status-/UI-Struktur aus GitHub/dev lesen
- bestehende Admin-/Verbindungen-Seite bevorzugen
- pruefen, welche Statusfelder sicher angezeigt werden koennen
- keine Runtime-Aktivierung
- keine Agent-Actions
- keine produktiven Writes
```

## Vorher lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/FILES.md
```

## Neuer Standardbefehl fuer kuenftige Webserver-Deploys

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Strikt nicht machen

```text
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
Keine parallele neue UI, wenn Erweiterung der bestehenden Seite passt.
```

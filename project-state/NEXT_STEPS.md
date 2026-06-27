# NEXT_STEPS

Stand: RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN  
Datum: 2026-06-27

## Naechster Step

```text
RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI
```

## Ziel

```text
- bestehende Admin-/Verbindungen-Seite erweitern
- zusaetzliche sichere Read-only-Felder anzeigen
- keine neue Parallelseite
- vorhandene GET /api/remote/agent/status Daten nutzen
- moeglichst nur Frontend-Datei erweitern:
  remote-modboard/backend/public/assets/rdap80-agent-status.js
- Backend nur anfassen, wenn vorhandene Felder nicht reichen
- keine Runtime-Aktivierung
- keine Agent-Actions
- keine produktiven Writes
```

## Vorher lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP107.md
remote-modboard/backend/public/assets/rdap80-agent-status.js
remote-modboard/backend/src/routes/agent-status.routes.js
remote-modboard/backend/src/services/agent-status.service.js
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
Keine Access-Key-/Token-/Header-/Cookie-Anzeige.
Keine Env-/Pfad-/Datei-/Prozesslisten.
```

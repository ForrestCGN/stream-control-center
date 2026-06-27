# START_HERE_FOR_NEW_CHAT

Stand: RDAP119_STREAMING_PC_CONNECTION_CLIENT_MVP  
Datum: 2026-06-27

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP119.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand kurz

```text
RDAP118: Admin-/System-Navigation sichtbar poliert.
RDAP119: Fokus zur Streaming-PC-Anbindung zurückgeführt.
Lokaler Streaming-PC-Client ist in backend/modules/remote_agent.js integriert.
Der lokale Server kann ausgehend zum Webserver /agent-ws verbinden und Heartbeats senden.
Status lokal: /api/streaming-pc-connection/status oder /api/remote-agent/status.
Webserver-Seite RDAP94 nimmt Verbindung/Heartbeat read-only/in-memory an.
Keine OBS-/Sound-/Overlay-/Command-Aktionen.
Keine Shell-/Datei-/Prozessaktionen.
Keine DB-Migration.
Keine produktiven Writes.
Admin-Notizen werden nicht weiter ausgebaut, außer Forrest verlangt das ausdrücklich.
```

## Webserver-Deploy

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

Hinweis: RDAP119 aendert den lokalen Streaming-PC-Code unter `backend/modules/`, nicht `remote-modboard/`. Webserver-Deploy ist fuer RDAP119 selbst nicht noetig, solange keine remote-modboard-Datei geaendert wird.

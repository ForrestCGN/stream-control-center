# START_HERE_FOR_NEW_CHAT

Stand: RDAP115C_ADMIN_DOCS_DETAILS_AREA  
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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP115C.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand kurz

```text
RDAP115C: Technische Routen/Details sind aus System raus und unter Admin -> Doku / Details gebuendelt.
System -> Diagnose bleibt Systemstatus fuer Mods/Streamer.
Admin -> Sicherheit wird nicht mehr als Kopie derselben Diagnose-Seite angezeigt.
Rollenverwaltung kommt spaeter im User-Detail als eigenes Fenster/Modal.
Keine Backend-Aenderung, keine DB-Migration, keine neuen Writes.
```

## Webserver-Deploy

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

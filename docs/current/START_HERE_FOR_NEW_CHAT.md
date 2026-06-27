# START_HERE_FOR_NEW_CHAT

Stand: RDAP117C_ADMIN_MODULE_NAV_CONTRACT_FIX  
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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP117C.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand kurz

```text
RDAP117C: Admin-Modul-/Navigation-Vertrag korrigiert.
Admin-Fachmodule registrieren ihre Page und bauen/polieren ihren Inhalt.
Admin-Fachmodule erzeugen keine eigenen Admin-Navi-Buttons mehr.
Admin-Navigation wird zentral in users.js sortiert/dedupliziert.
Keine Backend-Aenderung, keine DB-Migration, keine neuen Writes.
```

## Webserver-Deploy

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

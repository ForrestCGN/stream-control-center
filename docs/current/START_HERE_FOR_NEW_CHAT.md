# START_HERE_FOR_NEW_CHAT

Stand: RDAP114_ADMIN_NAV_CLEANUP  
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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP114.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand kurz

```text
RDAP114: Admin-Navigation bereinigt.
User-Detail ist kein normaler Menuepunkt mehr.
Benutzerverwaltung bleibt unter Admin.
Admin-Reihenfolge ist sauber.
```

## Arbeitsregel

```text
Kurz im Chat bleiben.
Keine langen Techniklisten im Chat.
Plan kurz nennen, bei echten Entscheidungen fragen.
ZIP mit echten Zielpfaden.
Nach lokalem Test: stepdone, dann Webserver-Deploy.
```

## Webserver-Deploy

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

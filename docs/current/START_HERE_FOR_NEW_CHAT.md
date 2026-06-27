# START_HERE_FOR_NEW_CHAT

Stand: RDAP113C_ADMIN_USERS_BACK_TO_ADMIN_NAV  
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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP113C.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand kurz

```text
RDAP109/RDAP109B: UI enttechnisiert; Projekterklaerungen aus der normalen Ansicht entfernt.
RDAP110: Uebersicht als eigenes Frontend-Modul ausgelagert.
RDAP111/RDAP111B: Diagnose als eigenes Frontend-Modul; Info als kleines Icon, Details im Dialog.
RDAP112/RDAP112B: Routen aus normalem System-Menue entfernt.
RDAP113: Benutzerverwaltung strukturell ausgelagert.
RDAP113B: Details-Navigation entfernt.
RDAP113C: Benutzerverwaltung wieder korrekt unter Admin eingeordnet; eigener User-Account bleibt oben rechts.
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

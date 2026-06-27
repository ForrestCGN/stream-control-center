# DOCS_CURRENT_FINAL_INDEX

Stand: 2026-06-27

Diese Datei beschreibt den bereinigten und aktuellen Sollbestand von `docs/current/`.

## Zweck von docs/current

`docs/current/` soll nur aktuelle Arbeits-, Start-, Status-, Architektur- und Weiterarbeits-Dokumente enthalten. Historische Handoffs, alte Cleanup-Audits, alte Next-Chat-Prompts und abgeloeste Step-Dokumente gehoeren in `docs/archive/`.

## Erwarteter aktueller Bestand

```text
docs/current/ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
docs/current/EVENT_BUS_DASHBOARD_AND_CONFIG.md
docs/current/EVENT_BUS_OVERLAY_CLIENTS_STATUS.md
docs/current/LOCAL_DASHBOARD_MODULE_SHELL_PLAN_CURRENT.md
docs/current/LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/PROJECT_WORKING_RULES.md
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/DOCS_CLEANUP_10_DOCS_CURRENT_VERIFY_AND_CLOSE.md
docs/current/DOCS_CURRENT_FINAL_INDEX.md
docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md
```

## Arbeitsregel

Neue Chats starten weiterhin mit den Pflichtdateien aus `docs/current/`, insbesondere:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
docs/current/LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md
docs/current/LOCAL_DASHBOARD_MODULE_SHELL_PLAN_CURRENT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Wenn neue Doku entsteht, soll sie entweder bewusst Current-Doku sein oder direkt in einen passenden Archiv-/Feature-Kontext eingeordnet werden. `_handoff`-Reports duerfen nicht dauerhaft untracked liegen bleiben.

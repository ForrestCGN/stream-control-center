# DOCS_CURRENT_FINAL_INDEX

Stand: 2026-06-27

Diese Datei beschreibt den aktuellen Sollbestand von `docs/current/` nach RDAP123 und dem Handoff-/Modulregistrierungs-Doku-Step.

## Zweck von docs/current

`docs/current/` soll nur aktuelle Arbeits-, Start-, Status-, Architektur- und Weiterarbeits-Dokumente enthalten. Historische Handoffs, alte Cleanup-Audits, alte Next-Chat-Prompts und abgeloeste Step-Dokumente gehoeren in `docs/archive/`.

## Aktueller Orientierungssatz

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md
docs/current/DOCS_CURRENT_FINAL_INDEX.md
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
```

Weitere aktuelle Architektur-/Arbeitsdokus bleiben in `docs/current/`, wenn sie nicht historisch abgeloest sind.

## Live-Stand, der in neuen Chats als aktueller Fokus gilt

```text
Version: 0.2.4
Buildname: Routes-Status angeglichen
Step: RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP
Runtime: online
Local-Dashboard-Profil: vorbereitet
Modulregistrierungsregeln: docs/current/MODULE_REGISTRATION_RULES_CURRENT.md
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
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Wenn neue Doku entsteht, soll sie entweder bewusst Current-Doku sein oder direkt in einen passenden Archiv-/Feature-Kontext eingeordnet werden. `_handoff`-Reports duerfen nicht dauerhaft untracked liegen bleiben.

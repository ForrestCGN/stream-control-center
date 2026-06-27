# NEXT CHAT PROMPT - RDAP Docs Cleanup 3

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Arbeitsbasis

```text
GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokal: D:\Git\stream-control-center
```

GitHub/dev und lokales Repo sind Wahrheit. Nicht main verwenden.

## Vorheriger Step

`RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE` hat vorbereitet:

```text
docs/current/DOCS_CLEANUP_2_SAFE_DELETE_MANIFEST.md
docs/current/STATS_REPORTS_CLEANUP_SUMMARY_CURRENT.md
tools/cleanup/rdap-docs-cleanup-2-safe-delete.ps1
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Der Cleanup-Script entfernt nur exakt gelistete Backup-/Root-Altdateien und hat Dry-Run als Standard.

## Naechster Step

Name:

```text
RDAP_DOCS_CLEANUP_3_DOCS_CURRENT_CONSOLIDATION
```

Ziel:

- `docs/current` gegen GitHub/dev und Modul-Inventar pruefen
- alte RDAP-/CAN-/EVS-/Handoff-Dateien thematisch zusammenfuehren
- wirklich aktuelle Startdateien behalten
- veraltete Doku loeschen oder in ein klares Legacy-Archiv verschieben
- keine Feature-Codeaenderung
- keine DB
- kein Webserver-Deploy fuer Doku-only

## Pflichtdateien zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/MODULE_INVENTORY_CURRENT.md
docs/current/ROUTE_SERVICE_INVENTORY_CURRENT.md
docs/current/DOCS_AND_STATS_CLEANUP_AUDIT.md
docs/current/DOCS_CLEANUP_2_SAFE_DELETE_MANIFEST.md
docs/current/STATS_REPORTS_CLEANUP_SUMMARY_CURRENT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Erst lesen, dann Plan, dann auf Forrests `go` warten.

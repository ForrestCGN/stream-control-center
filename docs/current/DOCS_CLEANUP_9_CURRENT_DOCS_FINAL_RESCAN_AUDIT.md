# DOCS_CLEANUP_9_CURRENT_DOCS_FINAL_RESCAN_AUDIT

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_9_CURRENT_DOCS_FINAL_RESCAN`  
Branch/Truth: GitHub/dev nach bestaetigtem Cleanup 8.

## Zweck

Cleanup 9 ist der Final-Rescan fuer `docs/current/` nach den grossen Archivierungs-Steps 5 bis 8. Ziel ist, die verbliebene Current-Doku von abgeschlossenen Cleanup-/Prompt-Dateien zu entlasten, ohne aktuelle Start-, Master-, Status- oder Architektur-Doku zu verlieren.

## Ausgangslage nach Cleanup 8

Aus den vorherigen Steps ergibt sich fuer `docs/current/` nach Execute von Cleanup 8 folgender erwarteter Bestand:

| Gruppe | Anzahl | Status |
| --- | ---: | --- |
| Current-/Pflicht-/Architektur-Doku | 17 | bleibt |
| abgeschlossene Cleanup-/Audit-/Prompt-Dateien | 13 | wird archiviert |
| neue Cleanup-9-Doku | 3 | wird mit diesem Step bereitgestellt |

Erwarteter Bestand nach Cleanup 9 Execute: **20 Dateien** in `docs/current/`.

## Entscheidung

| Entscheidung | Anzahl | Aktion |
| --- | ---: | --- |
| KEEP_CURRENT | 20 | bleibt bzw. wird in `docs/current/` bereitgestellt |
| ARCHIVE | 13 | per Script nach `docs/archive/docs-current-cleanup-9/` verschieben |
| DELETE_OR_REGENERATE | 0 | keine Deletes |
| MERGE_INTO_CURRENT | 0 | keine automatischen Merges |

## Warum diese 13 Dateien archiviert werden

Die 13 Dateien sind abgeschlossene Cleanup-5/6/7/8-Audits, Candidate-Summaries und alte Next-Chat-Prompts. Sie sind als Historie wichtig, aber nach bestaetigtem Abschluss nicht mehr der aktuelle Einstiegspunkt in `docs/current/`. Der Inhalt bleibt im Archiv erhalten.

## Exaktes Move-Manifest

```text
docs/current/DOCS_CLEANUP_5_CANDIDATE_SUMMARY.md -> docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_5_CANDIDATE_SUMMARY.md
docs/current/DOCS_CLEANUP_5_CURRENT_ARCHIVE_MANIFEST.md -> docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_5_CURRENT_ARCHIVE_MANIFEST.md
docs/current/DOCS_CLEANUP_6_CANDIDATE_SUMMARY.md -> docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_6_CANDIDATE_SUMMARY.md
docs/current/DOCS_CLEANUP_6_SECOND_PASS_AUDIT.md -> docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_6_SECOND_PASS_AUDIT.md
docs/current/DOCS_CLEANUP_7_ARCHIVE_OR_MERGE_MANIFEST.md -> docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_7_ARCHIVE_OR_MERGE_MANIFEST.md
docs/current/DOCS_CLEANUP_7_CANDIDATE_SUMMARY.md -> docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_7_CANDIDATE_SUMMARY.md
docs/current/DOCS_CLEANUP_8_CANDIDATE_SUMMARY.md -> docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_8_CANDIDATE_SUMMARY.md
docs/current/DOCS_CLEANUP_8_REVIEW_MANUALLY_AUDIT.md -> docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_8_REVIEW_MANUALLY_AUDIT.md
docs/current/DOCS_CURRENT_CONSOLIDATION_AUDIT.md -> docs/archive/docs-current-cleanup-9/DOCS_CURRENT_CONSOLIDATION_AUDIT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_6.md -> docs/archive/docs-current-cleanup-9/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_6.md
docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_7.md -> docs/archive/docs-current-cleanup-9/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_7.md
docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_8.md -> docs/archive/docs-current-cleanup-9/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_8.md
docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_9.md -> docs/archive/docs-current-cleanup-9/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_9.md
```

## Bewusst verbleibende Current-Dateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
docs/current/EVENT_BUS_DASHBOARD_AND_CONFIG.md
docs/current/EVENT_BUS_OVERLAY_CLIENTS_STATUS.md
docs/current/PROJECT_WORKING_RULES.md
docs/current/DOCS_CLEANUP_9_CURRENT_DOCS_FINAL_RESCAN_AUDIT.md
docs/current/DOCS_CLEANUP_9_CANDIDATE_SUMMARY.md
docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_10.md
```

## Sicherheitsgrenzen

- Doku-only.
- Keine Codeaenderung.
- Keine DB-Aenderung.
- Keine Remote-Modboard-Writes.
- Kein Webserver-Deploy.
- Keine Deletes.
- Keine automatischen Merges.
- Script laeuft standardmaessig als Dry-Run.
- `-Execute` verschiebt nur die 13 exakt gelisteten Dateien.
- Bei fehlenden Quellen oder vorhandenen Zielpfaden bricht Execute ab.

## Naechster sinnvoller Step

`RDAP_DOCS_CLEANUP_10_DOCS_CURRENT_VERIFY_AND_CLOSE`

Ziel:

- `docs/current/` nach Cleanup 9 final zaehlen,
- pruefen, ob erwartete 20 Dateien vorhanden sind,
- Cleanup-9-Doku als Abschlussstand bestaetigen,
- danach wieder fachliche RDAP-/Remote-Modboard-Arbeit planen.

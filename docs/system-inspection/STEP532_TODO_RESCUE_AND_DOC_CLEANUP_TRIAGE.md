# STEP532 – TODO-Rettung und Doku-Cleanup-Triage

Stand: 2026-05-29  
Basis: STEP531 Scan vom 2026-05-29 09:27:40

## Kernergebnis

Der Doku-Scan bestätigt massiven Aufräumbedarf:

| Kennzahl | Wert |
|---|---:|
| Gescannte Doku-Dateien | 1237 |
| Cleanup-Kandidaten | 1076 |
| TODO-/FIXME-/OFFEN-Treffer | 1914 |

Wichtig: Die Zahlen sind bewusst überbreit. Viele Treffer sind False-Positives, z. B. `todo.js`, Funktionsnamen wie `openRulePreviewPopout`, generierte Routenlisten oder archivierte STEP-Dateien.

## Reason-Verteilung

| Reason | Anzahl |
|---|---:|
| STEP_FRAGMENT | 1006 |
| TEST_DEBUG_LEGACY_NAME | 461 |
| CONTENT_CLEANUP_MARKER | 171 |
| APPEND_FRAGMENT | 143 |
| OLD_HANDOFF | 31 |
| README_STEP_FRAGMENT | 25 |

## Grobe Doku-Buckets

| Bucket | Dateien | TODO-Hits | Bytes |
|---|---:|---:|---:|
| `archive_already` | 905 | 1293 | 3814622 |
| `generated` | 5 | 25 | 235034 |
| `current_append_step` | 33 | 27 | 58305 |
| `backend_dashboard_step` | 14 | 0 | 13932 |
| `readme_step_root` | 11 | 2 | 11581 |
| `module_docs_marked` | 33 | 83 | 104082 |
| `active_current_maps` | 15 | 124 | 106551 |

## Interpretation

### 1. `project-state/archive` und `docs/archive`

Diese Dateien sind bereits Archiv. Sie erzeugen sehr viele Treffer, sollten aber **nicht als erstes gelöscht** werden.  
Besser: aus normalen Such-/Doku-Scans ausschließen oder später als eigenes Archivpaket behandeln.

### 2. `docs/_generated`

Generierte Dateien liefern viele False-Positives durch Funktionsnamen, Routen und Tabellen.  
Nicht manuell pflegen. Wenn sie stören, dann Generator/Regenerationsstrategie definieren.

### 3. `docs/current/*STEP*` und `CURRENT_SYSTEM_STATUS_STEP*_APPEND`

Das ist der erste echte Doku-Verjüngungsbereich.  
Diese Dateien sind nicht dauerhaft ideal, weil sie den aktuellen Zustand fragmentieren.

### 4. `docs/backend/*STEP*`, `docs/dashboard/*STEP*`, `docs/vip/STEP*`, `docs/overlays/STEP*`

Das ist Batch-2-Material.  
Viele davon sind erledigte Übergabe-/Statusnotizen und können nach Inhaltsprüfung in Archiv/Quarantine.

### 5. `docs/modules/*`

Hier nicht blind aufräumen. Viele Modul-Dokus sind aktiv oder dienen als Deep-Dive.  
`CONTENT_CLEANUP_MARKER` bedeutet hier oft nur, dass ein Abschnitt „Offene Punkte“ enthält.

## Top-Dateien nach TODO-Hits

| TODO-Hits | Datei | Cleanup-Reasons |
|---:|---|---|
| 90 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP176_TAGEBUCH_TODO_DB_DASHBOARD_AUDIT_2026-05-05.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 61 | `project-state/PROJECT_STATE_ARCHIVE_MOVE_LIST_2026-05-26.csv` | CONTENT_CLEANUP_MARKER |
| 49 | `docs/current/PROJECT_BACKEND_MODULE_STATUS_2026-05-26.md` | CONTENT_CLEANUP_MARKER |
| 45 | `project-state/GENERAL_PROJECT_PROMPT.md` | CONTENT_CLEANUP_MARKER |
| 41 | `docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt` |  |
| 39 | `docs/modules/todo-deep-dive.md` |  |
| 36 | `docs/archive/2026-05-11/STEP233_ARCHIVE_MANIFEST_2026-05-11.txt` | STEP_FRAGMENT |
| 33 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 30 | `docs/backend/Backend_Systemuebersicht_2026-05-03.txt` | CONTENT_CLEANUP_MARKER |
| 27 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP178_TAGEBUCH_TODO_DASHBOARD_INTEGRATION_2026-05-05.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 24 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP201_INTERMEDIATE_MATRIX_UPDATE_2026-05-08.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 22 | `docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md` | CONTENT_CLEANUP_MARKER |
| 21 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP201_3C_TODO_ROUTES_INTEGRATION_CHECK_2026-05-08.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 20 | `docs/modules/tagebuch-todo.md` | CONTENT_CLEANUP_MARKER |
| 17 | `docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt` | CONTENT_CLEANUP_MARKER |
| 17 | `project-state/archive/step261-project-state-cleanup/old-test-logs/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME, CONTENT_CLEANUP_MARKER |
| 16 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP201_3C_FIX_TODO_INTEGRATION_CHECK_500_2026-05-08.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 15 | `docs/_generated/FUNCTIONS.md` | CONTENT_CLEANUP_MARKER |
| 15 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP206_LOYALTY_LIVETEST_CHECKLIST_2026-05-10.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 15 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP215_TODO_DB_CORE_PORTABILITY_2026-05-10.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 14 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP179_TEXT_VARIANTS_EDITOR_2026-05-05.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 12 | `docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-26.md` | CONTENT_CLEANUP_MARKER |
| 12 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP190_4_SOUNDALERTS_OPEN_ENTRIES_OVERVIEW_2026-05-06.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 11 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP180_TEXT_VARIANTS_STATUS_UX_CLEANUP_2026-05-05.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME, CONTENT_CLEANUP_MARKER |
| 11 | `project-state/archive/steps/NEW_CHAT_PROMPT_STEP284_ALERT_BUS_BRIDGE.txt` | STEP_FRAGMENT |
| 11 | `project-state/archive/steps/STEP473_TODO_RULE_IN_GENERAL_PROMPT.md` | STEP_FRAGMENT |
| 10 | `docs/current/PROJECT_WORKING_RULES.md` |  |
| 10 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME, CONTENT_CLEANUP_MARKER |
| 10 | `project-state/archive/steps/STEP266B_ALERT_IMMEDIATE_BUNDLE_PREQUEUE_FIX_2026-05-21.md` | STEP_FRAGMENT |
| 9 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 9 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP181_HUG_REHUG_TEXT_PAIRS_BACKEND_2026-05-05.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 9 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP202_2_LOYALTY_SHADOW_MODE_AND_BONUS_RULES_2026-05-09.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 9 | `project-state/archive/steps/STEP474_DOCS_TODO_MODULE_CLEANUP.md` | STEP_FRAGMENT, CONTENT_CLEANUP_MARKER |
| 8 | `docs/_generated/ROUTES.md` | CONTENT_CLEANUP_MARKER |
| 8 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP193_4_SOUNDALERTS_DIRECT_ENTRY_ACTIONS_2026-05-06.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 8 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP201_3C_FIX2_TODO_INTEGRATION_CHECK_TEXT_COLUMNS_2026-05-08.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |
| 8 | `project-state/archive/steps/STEP269E_SOUND_DISCORD_DASHBOARD_CONFIG_TODO_2026-05-21.md` | STEP_FRAGMENT |
| 7 | `docs/archive/2026-05-11-step233/current/STEP201_3C_STATUS_NOTE_2026-05-08.md` | STEP_FRAGMENT |
| 7 | `project-state/archive/2026-05-11-step233/NEXT_STEPS_STEP201_3B_APPEND_2026-05-08.md` | APPEND_FRAGMENT, STEP_FRAGMENT |
| 7 | `project-state/archive/step261-project-state-cleanup/old-step-docs/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md` | STEP_FRAGMENT, TEST_DEBUG_LEGACY_NAME |

## Empfehlung für Batch 2

Batch 2 sollte **nicht** die 1076 Kandidaten anfassen.  
Stattdessen:

1. `docs/current/CURRENT_SYSTEM_STATUS_STEP*_APPEND.md` konsolidieren.
2. Wichtige offene Punkte daraus in `docs/current/CURRENT_SYSTEM_STATUS.md`, `project-state/TODO.md` oder `project-state/NEXT_STEPS.md` übernehmen.
3. Danach die Append-Fragmente in Quarantine verschieben.
4. Keine `docs/modules/*deep-dive.md` löschen.
5. Keine `docs/archive/*` löschen, sondern künftig aus normalen Scans ausschließen.

## Konkreter nächster STEP

`STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1`

Scope:

```text
docs/current/CURRENT_SYSTEM_STATUS_STEP363_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP364_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP365_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP366_KNOWN_ISSUE_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP367_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP368_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP369_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP370_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP371_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP392_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP393_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP393A_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP394_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP395_APPEND.md
docs/current/CURRENT_SYSTEM_STATUS_STEP396_APPEND.md
```

Vorgehen:

- erst Inhalte lesen
- offene Punkte retten
- Hauptstatus aktualisieren
- Append-Dateien nach Quarantine verschieben
- `git diff --stat` prüfen

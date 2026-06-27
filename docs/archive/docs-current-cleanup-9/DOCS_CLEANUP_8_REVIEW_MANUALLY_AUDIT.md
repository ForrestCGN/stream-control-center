# DOCS_CLEANUP_8_REVIEW_MANUALLY_AUDIT

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_8_REVIEW_MANUALLY_PASS`  
Branch/Truth: GitHub/dev + Cleanup-6/7-Audit + lokaler Snapshot aus `D:\Git\stream-control-center`.

## Zweck

Cleanup 8 liest die 40 in Cleanup 6 als `REVIEW_MANUALLY` markierten Dateien fachlich und trifft eine Einzelentscheidung pro Datei. Es gibt keine Massenaktion ohne begruendete Einzelentscheidung.

## Ergebnis

| Entscheidung | Anzahl | Aktion |
| --- | ---: | --- |
| KEEP_CURRENT | 9 | bleibt in `docs/current/` |
| ARCHIVE | 31 | per Script nach `docs/archive/docs-current-cleanup-8/` verschieben |
| MERGE_INTO_CURRENT | 0 | kein automatischer Merge in diesem Step |
| DELETE_OR_REGENERATE | 0 | keine Deletes |

## Sicherheitsgrenzen

- Doku-only.
- Keine Codeaenderung.
- Keine DB-Aenderung.
- Keine Remote-Modboard-Writes.
- Kein Webserver-Deploy.
- Keine harten Deletes.
- Keine automatischen Merges in grosse Current-Dokus.
- Script laeuft standardmaessig als Dry-Run.
- `-Execute` verschiebt nur die 31 exakt gelisteten Archiv-Kandidaten.

## Einzelentscheidungen

| Datei | Titel/Signal | Entscheidung | Begruendung |
| --- | --- | --- | --- |
| `docs/current/ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT.md` | # ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT<br>Datum: 2026-06-26 | KEEP_CURRENT | Aktueller Architektur-/Designvertrag fuer Modul-/Page-Registry; noch nicht vollstaendig in eine zentrale Current-Doku ueberfuehrt. |
| `docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS42_1_NEXT.md` | # Neuer Chat Prompt – Event-System EVS42.1 | ARCHIVE | Alter Event-System-Next-Chat-Prompt; historisch, kein aktueller Startfokus. |
| `docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS43_NEXT.md` | # Neuer Chat Prompt – Event-System nach EVS43<br>Status: active | ARCHIVE | Alter Event-System-Next-Chat-Prompt; historisch, kein aktueller Startfokus. |
| `docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS44_NEXT.md` | # Neuer Chat Prompt – Event-System ab EVS44 | ARCHIVE | Alter Event-System-Next-Chat-Prompt; historisch, kein aktueller Startfokus. |
| `docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS49_12_NEXT.md` | Wir machen im Projekt `stream-control-center` von ForrestCGN weiter, Bereich `stream_events` / Event-System / EventSound Runtime / Winner-Finale-Overlay.<br>Status: | ARCHIVE | Alter EventSound/Winner-Finale-Next-Prompt; historisch. |
| `docs/current/CURRENT_DASHBOARD_STATE.md` | # CURRENT_DASHBOARD_STATE<br>Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD | KEEP_CURRENT | Aktueller Abgrenzungsstand lokales Dashboard vs. Remote-Modboard; sicherheitsrelevant fuer weitere Planung. |
| `docs/current/CURRENT_REMOTE_MODBOARD_STATE.md` | # Aktueller Remote-Modboard-Stand | KEEP_CURRENT | Kurzer aktueller Remote-Modboard-Status 0.1.3; passt als kompakter Current-Stand. |
| `docs/current/CURRENT_STATUS.md` | # Current Status – stream-control-center / Loyalty-Giveaways / CGN-Glücksrad<br>Stand: 2026-06-19 | ARCHIVE | Alter docs/current-Status zu Loyalty/Giveaways; project-state/CURRENT_STATUS.md ist aktuelle Statusquelle. |
| `docs/current/CURRENT_STATUS_EVENT_SOUND_RUNTIME_2026-06-16.md` | # Current Status – EventSound Runtime / Sound-System<br>Stand: 2026-06-17 | ARCHIVE | Alter EventSound-Runtime-Status; historischer Modulstand. |
| `docs/current/CURRENT_STATUS_EVS52_21_WINNER_FINALE_STABLE.md` | # CURRENT STATUS – EVS52.21 Winner Finale Stable<br>Stand: 2026-06-18 | ARCHIVE | Alter EVS Winner-Finale-Status; historischer Modulstand. |
| `docs/current/CURRENT_STATUS_VIP30_STEP8_19_23.md` | # VIP30 / 30 Tage VIP – CURRENT STATUS STEP8.19.23<br>Stand: 2026-06-07 10:40 | ARCHIVE | Alter VIP30-Status; historischer Modulstand. |
| `docs/current/CURRENT_STEP_HISTORY_CONSOLIDATED.md` | # Konsolidierte aktuelle STEP-Dokumente<br>Stand: 2026-05-29 | ARCHIVE | Historische Step-History; nicht aktueller Einstieg. |
| `docs/current/CURRENT_STREAM_PC_AGENT_STATE.md` | # CURRENT_STREAM_PC_AGENT_STATE<br>Stand: RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI | KEEP_CURRENT | Aktueller Stream-PC-Agent-/WSS-/Runtime-Stand mit Read-only-Grenzen; sicherheitsrelevant. |
| `docs/current/CURRENT_SYSTEM_STATUS.md` | # CURRENT SYSTEM STATUS – STEP278 Vorbereitung<br>Stand: 2026-05-31 08:14 UTC | ARCHIVE | Alter STEP278-Systemstatus; project-state/CURRENT_STATUS.md ist aktuelle Statusquelle. |
| `docs/current/DASHBOARD_NAVIGATION_STICKY_MAIN_AND_MODULE_CAN44_21_0_5.md` | # CAN-44.21.0.5 – Dashboard Navigation: feste Hauptnavigation + Kategorie-Navigation<br>Stand: 2026-06-04 | ARCHIVE | Alter CAN44-Dashboard-Navigationsstep; historisch. |
| `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md` | # DASHBOARD ROLES PERMISSIONS MATRIX<br>Stand: 2026-06-22 | KEEP_CURRENT | Rechte-/Rollenmatrix ist fachlich weiter relevant und darf nicht im Massenarchiv verschwinden. |
| `docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md` | # Dashboard v2 Build und lokale Auslieferung<br>Stand: 2026-06-23 | ARCHIVE | Alter Dashboard-v2-Auslieferungsstand; historisch. |
| `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md` | # Dashboard v2 Design- und Frontend-Plan<br>Stand: 2026-06-23 | ARCHIVE | Alter Dashboard-v2-Frontendplan; als Historie erhalten, nicht current. |
| `docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md` | # Dashboard v2 Design-Referenz v13<br>Stand: 2026-06-23 | ARCHIVE | Alte Designreferenz; aktuelle UI-Doku liegt in Current-Design-/Structure-Dokus. |
| `docs/current/DASHBOARD_V2_FRONTEND_TECH_DECISION.md` | # Dashboard v2 Frontend-Tech-Entscheidung<br>Stand: 2026-06-23 | ARCHIVE | Alte Tech-Entscheidung; historisch bis zu spaeterer Konsolidierung. |
| `docs/current/DASHBOARD_V2_PARALLEL_MIGRATION_PLAN.md` | # Dashboard v2 Parallelbetrieb und Modul-Migrationsplan<br>Stand: 2026-06-23 | ARCHIVE | Alter Migrationsplan; historisch. |
| `docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md` | # Dashboard v2 React-Prototyp auf V13-Designbasis<br>Stand: 2026-06-23 | ARCHIVE | Alter React/V13-Abgleich; historisch. |
| `docs/current/DASHBOARD_V2_REACT_VITE_PROTOTYPE.md` | # Dashboard v2 React-Vite-Prototyp<br>Stand: 2026-06-23 | ARCHIVE | Alter Prototyp-Stand; historisch. |
| `docs/current/DASHBOARD_V2_STATIC_ROUTE.md` | # Dashboard v2 Static Route<br>Stand: 2026-06-23 | ARCHIVE | Alter Static-Route-Stand; historisch. |
| `docs/current/DOCS_AND_STATS_CLEANUP_AUDIT.md` | # Docs and Stats Cleanup Audit<br>Stand: 2026-06-27 | ARCHIVE | Altes Cleanup-Audit; durch Cleanup-5/6/7/8-Dokus abgeloest. |
| `docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md` | # DOCS_STRUCTURE_AND_ARCHIVE_RULES<br>Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD | KEEP_CURRENT | Dokumentationsstruktur- und Archivregeln sind fuer weitere Cleanup-Steps unmittelbar relevant. |
| `docs/current/EVENT_BUS_DASHBOARD_AND_CONFIG.md` | # Event-Bus Dashboard und DB-basierte Config<br>Stand: 2026-05-30 | KEEP_CURRENT | EventBus-/Dashboard-Konfigurationszusammenhang ist als Architekturreferenz noch relevant. |
| `docs/current/EVENT_BUS_OVERLAY_CLIENTS_STATUS.md` | # Event-Bus Overlay-Clients – aktueller Status<br>Stand: 2026-05-30 | KEEP_CURRENT | EventBus-Overlay-Client-Status ist als kompakte aktuelle Referenz noch relevant. |
| `docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md` | # MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26<br>Stand: 2026-05-26 | ARCHIVE | Alter Modul-Doku-Deep-Dive-Status; historisch. |
| `docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-27.md` | # MODULE DOCS DEEP DIVE STATUS – 2026-05-27 | ARCHIVE | Alter Modul-Doku-Deep-Dive-Status; historisch. |
| `docs/current/MODULE_DOCS_VERSION_EVENTBUS_RULES_2026-05-26.md` | # Modul-Doku-, Versions- und EventBus-Regeln<br>Stand: 2026-05-26 | ARCHIVE | Alte Modul-/EventBus-Regeln; bis spaeterer Konsolidierung archivieren. |
| `docs/current/MODULE_INVENTORY_CURRENT.md` | # Module Inventory Current<br>Stand: 2026-06-27 | ARCHIVE | Altes Modul-Inventar; durch MODULE_DOCS_CONSOLIDATED_CURRENT.md / Cleanup-Dokus abgeloest. |
| `docs/current/MODULE_STATUS.md` | # Aktueller Modulstatus<br>Stand: 2026-06-01 | ARCHIVE | Alter Modulstatus; durch konsolidierte Current-Doku und project-state abgeloest. |
| `docs/current/NEXT_CHAT_HANDOFF_SHOUTOUT_SYSTEM_CAN44.md` | # NEXT CHAT HANDOFF – Shoutout-System / AutoShoutout CAN-44<br>Stand: 2026-06-04 | ARCHIVE | Alter Shoutout/CAN44-Handoff; historisch. |
| `docs/current/NEXT_STEPS.md` | # Next Steps – Loyalty-Giveaways / CGN-Glücksrad<br>Stand: 2026-06-19 | ARCHIVE | Alter docs/current-Next-Steps; project-state/NEXT_STEPS.md ist aktuelle Quelle. |
| `docs/current/NEXT_STEPS_EVENT_SOUND_RUNTIME.md` | # Next Steps – EventSound Runtime / Sound-System<br>Stand: 2026-06-17 | ARCHIVE | Alter EventSound-Next-Steps-Stand; historisch. |
| `docs/current/NEXT_STEPS_SATZ_SYSTEM_EVS49_38.md` | # NEXT_STEPS – Neuer Chat / Satz-System<br>Stand: 2026-06-18 | ARCHIVE | Alter Satz-System-Next-Steps-Stand; historisch. |
| `docs/current/NEXT_TODO_STEP279.md` | # NEXT TODO – STEP279 Heartbeat Standard | ARCHIVE | Alter STEP279-TODO; historisch. |
| `docs/current/PROJECT_WORKING_RULES.md` | # PROJECT_WORKING_RULES<br>step: 407 | KEEP_CURRENT | Projektarbeitsregeln sind teilweise durch Master-Prompt abgedeckt, bleiben aber als explizite Projektregel-Referenz bis zur spaeteren Konsolidierung erhalten. |
| `docs/current/ROUTE_SERVICE_INVENTORY_CURRENT.md` | # Route Service Inventory Current<br>Stand: 2026-06-27 | ARCHIVE | Altes Route-/Service-Inventar; durch ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md / Cleanup-Dokus abgeloest. |

## Archive-Move-Manifest

<details>
<summary>Exakte Move-Liste (31)</summary>

```text
docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS42_1_NEXT.md -> docs/archive/docs-current-cleanup-8/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS42_1_NEXT.md
docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS43_NEXT.md -> docs/archive/docs-current-cleanup-8/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS43_NEXT.md
docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS44_NEXT.md -> docs/archive/docs-current-cleanup-8/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS44_NEXT.md
docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS49_12_NEXT.md -> docs/archive/docs-current-cleanup-8/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS49_12_NEXT.md
docs/current/CURRENT_STATUS.md -> docs/archive/docs-current-cleanup-8/CURRENT_STATUS.md
docs/current/CURRENT_STATUS_EVENT_SOUND_RUNTIME_2026-06-16.md -> docs/archive/docs-current-cleanup-8/CURRENT_STATUS_EVENT_SOUND_RUNTIME_2026-06-16.md
docs/current/CURRENT_STATUS_EVS52_21_WINNER_FINALE_STABLE.md -> docs/archive/docs-current-cleanup-8/CURRENT_STATUS_EVS52_21_WINNER_FINALE_STABLE.md
docs/current/CURRENT_STATUS_VIP30_STEP8_19_23.md -> docs/archive/docs-current-cleanup-8/CURRENT_STATUS_VIP30_STEP8_19_23.md
docs/current/CURRENT_STEP_HISTORY_CONSOLIDATED.md -> docs/archive/docs-current-cleanup-8/CURRENT_STEP_HISTORY_CONSOLIDATED.md
docs/current/CURRENT_SYSTEM_STATUS.md -> docs/archive/docs-current-cleanup-8/CURRENT_SYSTEM_STATUS.md
docs/current/DASHBOARD_NAVIGATION_STICKY_MAIN_AND_MODULE_CAN44_21_0_5.md -> docs/archive/docs-current-cleanup-8/DASHBOARD_NAVIGATION_STICKY_MAIN_AND_MODULE_CAN44_21_0_5.md
docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md -> docs/archive/docs-current-cleanup-8/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md
docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md -> docs/archive/docs-current-cleanup-8/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md -> docs/archive/docs-current-cleanup-8/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_FRONTEND_TECH_DECISION.md -> docs/archive/docs-current-cleanup-8/DASHBOARD_V2_FRONTEND_TECH_DECISION.md
docs/current/DASHBOARD_V2_PARALLEL_MIGRATION_PLAN.md -> docs/archive/docs-current-cleanup-8/DASHBOARD_V2_PARALLEL_MIGRATION_PLAN.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md -> docs/archive/docs-current-cleanup-8/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
docs/current/DASHBOARD_V2_REACT_VITE_PROTOTYPE.md -> docs/archive/docs-current-cleanup-8/DASHBOARD_V2_REACT_VITE_PROTOTYPE.md
docs/current/DASHBOARD_V2_STATIC_ROUTE.md -> docs/archive/docs-current-cleanup-8/DASHBOARD_V2_STATIC_ROUTE.md
docs/current/DOCS_AND_STATS_CLEANUP_AUDIT.md -> docs/archive/docs-current-cleanup-8/DOCS_AND_STATS_CLEANUP_AUDIT.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md -> docs/archive/docs-current-cleanup-8/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-27.md -> docs/archive/docs-current-cleanup-8/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-27.md
docs/current/MODULE_DOCS_VERSION_EVENTBUS_RULES_2026-05-26.md -> docs/archive/docs-current-cleanup-8/MODULE_DOCS_VERSION_EVENTBUS_RULES_2026-05-26.md
docs/current/MODULE_INVENTORY_CURRENT.md -> docs/archive/docs-current-cleanup-8/MODULE_INVENTORY_CURRENT.md
docs/current/MODULE_STATUS.md -> docs/archive/docs-current-cleanup-8/MODULE_STATUS.md
docs/current/NEXT_CHAT_HANDOFF_SHOUTOUT_SYSTEM_CAN44.md -> docs/archive/docs-current-cleanup-8/NEXT_CHAT_HANDOFF_SHOUTOUT_SYSTEM_CAN44.md
docs/current/NEXT_STEPS.md -> docs/archive/docs-current-cleanup-8/NEXT_STEPS.md
docs/current/NEXT_STEPS_EVENT_SOUND_RUNTIME.md -> docs/archive/docs-current-cleanup-8/NEXT_STEPS_EVENT_SOUND_RUNTIME.md
docs/current/NEXT_STEPS_SATZ_SYSTEM_EVS49_38.md -> docs/archive/docs-current-cleanup-8/NEXT_STEPS_SATZ_SYSTEM_EVS49_38.md
docs/current/NEXT_TODO_STEP279.md -> docs/archive/docs-current-cleanup-8/NEXT_TODO_STEP279.md
docs/current/ROUTE_SERVICE_INVENTORY_CURRENT.md -> docs/archive/docs-current-cleanup-8/ROUTE_SERVICE_INVENTORY_CURRENT.md
```

</details>

## Dateien, die bewusst in docs/current bleiben

```text
docs/current/ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT.md
docs/current/CURRENT_DASHBOARD_STATE.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/CURRENT_STREAM_PC_AGENT_STATE.md
docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md
docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md
docs/current/EVENT_BUS_DASHBOARD_AND_CONFIG.md
docs/current/EVENT_BUS_OVERLAY_CLIENTS_STATUS.md
docs/current/PROJECT_WORKING_RULES.md
```

## Naechster sinnvoller Step

`RDAP_DOCS_CLEANUP_9_CURRENT_DOCS_FINAL_RESCAN`

Ziel:

- nach Cleanup 8 `docs/current/` erneut zaehlen,
- pruefen, ob die verbliebenen Current-Dateien wirklich aktuell sind,
- alte Cleanup-6/7-Prompts ggf. nach Abschluss archivieren,
- zentrale Current-Dokus nur gezielt konsolidieren, keine Massenaktion.

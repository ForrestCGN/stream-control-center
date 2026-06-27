# RDAP Docs Cleanup 2 - Safe Delete and Merge Manifest

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE`

## Ziel

Dieser Step raeumt die sichtbarsten Altlasten auf, ohne produktive Funktionen zu aendern:

- sichere Backup-/Step-Dateien aus aktiven Runtime-Ordnern entfernen
- falsche `htdocs/htdocs/...`-Doppelverschachtelung entfernen
- `project-state/` Root auf die fuenf Kern-Dateien reduzieren
- alte Root-Handoff-/Status-/Step-Dateien nicht mehr als aktuelle Projektwahrheit fuehren
- Stats-/Reports-/Generated-Flut fuer den naechsten grossen Docs-Cleanup klassifizieren

## Wichtige Grenze

Dieser Step aendert keine produktive Funktion:

- keine JS-/CSS-/HTML-Codeaenderung an aktiven Dateien
- keine DB-Aenderung
- keine Remote-Modboard-Writes
- kein Webserver-Deploy erforderlich

Die eigentliche Loeschung erfolgt lokal ueber die mitgelieferte exakte Cleanup-Datei:

```text
tools/cleanup/rdap-docs-cleanup-2-safe-delete.ps1
```

Der Script ist absichtlich konservativ:

- keine Wildcards
- nur exakt gelistete Pfade
- Dry-Run als Standard
- echte Loeschung nur mit `-Execute`
- erzeugt ein Ergebnisprotokoll unter `_handoff/RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE/`

## Exakte Delete-Liste

Gesamt: 256 Dateien

### Runtime-/Backup-/Struktur-Kandidaten

Anzahl: 12

- `backend/modules/clip_shoutout.js.CAN-44.21.14.bak`
- `backend/modules/commands.js.step214_backup_20260611_180942`
- `backend/modules/loyalty_games.js.step220_lwg6_1_backup`
- `backend/modules/loyalty_games.js.step222_lwg6_3_backup`
- `backend/modules/loyalty_games/gamble.js.step222_lwg6_3_backup`
- `backend/modules/twitch.js.vip30_step8_7_backup_2026-06-05T20-08-56-203Z`
- `htdocs/dashboard/components/media_picker.js.step274z.bak`
- `htdocs/dashboard/components/media_picker.js.step274z_fix1.bak`
- `htdocs/dashboard/components/media_picker.js.step275b_fix1.bak`
- `htdocs/dashboard/modules/birthday.css.bak-step274v`
- `htdocs/dashboard/modules/birthday.js.bak-step274v`
- `htdocs/htdocs/overlays/stream_events/event_winner_overlay.html`

### `project-state/` Root-Cleanup

Anzahl: 244

Diese Dateien liegen direkt im `project-state/` Root, sind aber nicht die fuenf aktuellen Kern-Dateien.  
Sie werden durch zentrale aktuelle Doku ersetzt und sollen nicht mehr direkt neben `CURRENT_STATUS.md`, `NEXT_STEPS.md`, `TODO.md`, `FILES.md` und `CHANGELOG.md` liegen.

- `project-state/CAN44_21_36_PROJECT_STATE.md`
- `project-state/CAN44_21_42_PROJECT_STATE.md`
- `project-state/CAN44_31_AUTOSHOUTOUT_BUS_DASHBOARD_STATUS.md`
- `project-state/CAN44_32_AUTOSHOUTOUT_STREAMDAY_RELIABILITY_STATUS.md`
- `project-state/CAN44_33_AUTOSHOUTOUT_SETTINGS_TRUTH_FIX_STATUS.md`
- `project-state/CAN44_34_TWITCH_STREAM_BUS_EVENTS_STATUS.md`
- `project-state/CAN44_35_TWITCH_EVENTS_STREAM_STATE_PROVIDER_STATUS.md`
- `project-state/CAN44_36_AUTOSHOUTOUT_STREAM_BUS_CONSUMER_STATUS.md`
- `project-state/CAN44_37_STREAM_SESSION_AUTHORITY_STATUS.md`
- `project-state/CAN44_38_STREAM_SESSION_CLEANUP_STATUS.md`
- `project-state/CAN44_39_PENDING_EVENT_GUARD_STATUS.md`
- `project-state/CAN44_40_DASHBOARD_STREAM_STATE_OVERRIDE_CONTROLS_STATUS.md`
- `project-state/CAN44_41_MANUAL_OVERRIDE_LOCK_FIX_STATUS.md`
- `project-state/CAN44_42_DASHBOARD_EFFECTIVE_STREAM_STATE_DISPLAY_STATUS.md`
- `project-state/CAN44_42_SHOUTOUT_AUTOSO_LIVE_STABLE_STATUS.md`
- `project-state/CHANGELOG_DASHUI2_FRONTEND_TECH_DECISION_2026-06-23.md`
- `project-state/CHANGELOG_DASHUI3_PARALLEL_MIGRATION_PLAN_2026-06-23.md`
- `project-state/CHANGELOG_DASHUI4B_SAFE_FILE_NAMES_2026-06-23.md`
- `project-state/CHANGELOG_DASHUI4_REACT_VITE_PROTOTYPE_2026-06-23.md`
- `project-state/CHANGELOG_DASHUI5_REACT_V13_ALIGNMENT_2026-06-23.md`
- `project-state/CHANGELOG_DASHUI6B_BUILD_CMD_CALL_FIX_2026-06-23.md`
- `project-state/CHANGELOG_DASHUI6C_DASHBOARD_V2_STATIC_ROUTE_2026-06-23.md`
- `project-state/CHANGELOG_DASHUI6C_HANDOFF_NEW_CHAT_2026-06-23.md`
- `project-state/CHANGELOG_DASHUI6_BUILD_LOCAL_DELIVERY_2026-06-23.md`
- `project-state/CHANGELOG_EVENT_SYSTEM_EVS42_1.md`
- `project-state/CHANGELOG_EVENT_SYSTEM_EVS43.md`
- `project-state/CHANGELOG_EVENT_SYSTEM_EVS44.md`
- `project-state/CHANGELOG_EVENT_SYSTEM_EVS49_12.md`
- `project-state/CHANGELOG_LC_CORE_ALERT_SHADOW_2026-06-15.md`
- `project-state/CHANGELOG_LC_CORE_POINTS_3A_DONE.md`
- `project-state/CHANGELOG_RDAP2_WEB1_2026-06-23.md`
- `project-state/CHANGELOG_RDAP3_MINIMAL_AGENT_PLAN_2026-06-23.md`
- `project-state/CHANGELOG_RDAP4_PERMISSION_LOCK_MODEL_2026-06-23.md`
- `project-state/CHANGELOG_STEP617C_618B_SNIPPET.md`
- `project-state/CHANGELOG_WF1_FRONTEND_GIT_WORKFLOW_2026-06-23.md`
- `project-state/CHANNELPOINTS_CURRENT_STATE.md`
- `project-state/COMMANDS_CURRENT_STATE.md`
- `project-state/CURRENT_CHAT_HANDOFF_EVS49_38_TO_SATZ_SYSTEM.md`
- `project-state/CURRENT_STATUS_CAN42_33.md`
- `project-state/CURRENT_STATUS_CAN42_34.md`
- `project-state/CURRENT_STATUS_EVENTSYS_27A.md`
- `project-state/CURRENT_STATUS_EVENTSYS_27D.md`
- `project-state/CURRENT_STATUS_EVENT_SYSTEM_EVS42_1.md`
- `project-state/CURRENT_STATUS_EVENT_SYSTEM_EVS43.md`
- `project-state/CURRENT_STATUS_EVENT_SYSTEM_EVS44.md`
- `project-state/CURRENT_STATUS_EVENT_SYSTEM_EVS49_12.md`
- `project-state/CURRENT_STATUS_LC_CORE_ALERT_SHADOW_2026-06-15.md`
- `project-state/CURRENT_STATUS_LC_CORE_LIVE_CLEANUP_2.md`
- `project-state/CURRENT_STATUS_LC_CORE_LIVE_CLEANUP_3.md`
- `project-state/CURRENT_STATUS_LC_CORE_POINTS_2ABC_CONFIRMED.md`
- `project-state/CURRENT_STATUS_LC_CORE_POINTS_3A_DONE.md`
- `project-state/CURRENT_STATUS_LC_CORE_POINTS_3A_HANDOFF.md`
- `project-state/CURRENT_STATUS_LC_MINIGAMES_2B_DOCUMENTED.md`
- `project-state/CURRENT_STATUS_LC_MINIGAMES_2C3.md`
- `project-state/CURRENT_STATUS_LWG_4L_11.md`
- `project-state/CURRENT_STATUS_LWG_4L_12.md`
- `project-state/CURRENT_STATUS_LWG_4L_14.md`
- `project-state/CURRENT_STATUS_LWG_4L_2.md`
- `project-state/CURRENT_STATUS_LWG_4L_3.md`
- `project-state/CURRENT_STATUS_LWG_4L_4.md`
- `project-state/CURRENT_STATUS_LWG_4L_5.md`
- `project-state/CURRENT_STATUS_LWG_4L_6.md`
- `project-state/CURRENT_STATUS_LWG_4L_7.md`
- `project-state/CURRENT_STATUS_LWG_4L_8.md`
- `project-state/CURRENT_STATUS_LWG_4M_1.md`
- `project-state/CURRENT_STATUS_LWG_4M_2.md`
- `project-state/CURRENT_STATUS_LWG_4M_3.md`
- `project-state/CURRENT_STATUS_LWG_4M_4.md`
- `project-state/CURRENT_STATUS_LWG_4M_4_DOCUMENTED.md`
- `project-state/CURRENT_STATUS_LWG_4M_5.md`
- `project-state/CURRENT_STATUS_LWG_4M_8.md`
- `project-state/CURRENT_STATUS_LWG_4M_9.md`
- `project-state/CURRENT_STATUS_LWG_4N_0.md`
- `project-state/CURRENT_STATUS_LWG_4N_1B.md`
- `project-state/CURRENT_STATUS_LWG_4N_1C.md`
- `project-state/CURRENT_STATUS_LWG_4N_2.md`
- `project-state/CURRENT_STATUS_LWG_4N_3.md`
- `project-state/CURRENT_STATUS_LWG_4N_3B.md`
- `project-state/CURRENT_STATUS_LWG_4N_3C.md`
- `project-state/CURRENT_STATUS_LWG_4N_4.md`
- `project-state/CURRENT_STATUS_LWG_4N_5.md`
- `project-state/CURRENT_STATUS_LWG_4N_5B.md`
- `project-state/CURRENT_STATUS_LWG_4N_6.md`
- `project-state/CURRENT_STATUS_LWG_4N_6B.md`
- `project-state/CURRENT_STATUS_LWG_4N_6C.md`
- `project-state/CURRENT_STATUS_LWG_4N_6D.md`
- `project-state/CURRENT_STATUS_LWG_4N_6E.md`
- `project-state/CURRENT_STATUS_LWG_4N_6F.md`
- `project-state/CURRENT_STATUS_LWG_4N_7.md`
- `project-state/CURRENT_STATUS_LWG_4Q12N_FINAL_GAMBLE_GIVEAWAYS_CLEANUP.md`
- `project-state/CURRENT_STATUS_LWG_4Q12_FINAL_GIVEAWAYS_UI_CLEANUP.md`
- `project-state/CURRENT_STATUS_LWG_4Q_11.md`
- `project-state/CURRENT_STATUS_LWG_BOUND_WHEEL_FIELD_COUNT_1.md`
- `project-state/CURRENT_STATUS_LWG_CHAT_COMMANDS_1_CONFIRMED.md`
- `project-state/CURRENT_STATUS_LWG_CHAT_OUTPUT_1.md`
- `project-state/CURRENT_STATUS_LWG_CHAT_OUTPUT_1B.md`
- `project-state/CURRENT_STATUS_LWG_GIVEAWAY_EXCLUSIONS_1.md`
- `project-state/CURRENT_STATUS_LWG_GIVEAWAY_EXCLUSIONS_1B.md`
- `project-state/CURRENT_STATUS_LWG_WHEEL_OVERLAY_RUNTIME_1.md`
- `project-state/CURRENT_STATUS_LWG_WHEEL_TEXT_RADIAL_5.md`
- `project-state/CURRENT_STATUS_OVERLAY_MONITORING_STEP628D.md`
- `project-state/CURRENT_STATUS_STEP235S_FINAL_GAMBLE_CONFIG_CLEANUP.md`
- `project-state/CURRENT_STATUS_STEP235_FINAL_LOYALTY_DASHBOARD_CLEANUP.md`
- `project-state/FILES_EVENT_SYSTEM_EVS42_1.md`
- `project-state/FILES_EVENT_SYSTEM_EVS43.md`
- `project-state/FILES_EVENT_SYSTEM_EVS44.md`
- `project-state/FILES_EVENT_SYSTEM_EVS49_12.md`
- `project-state/FILES_LC_CORE_ALERT_SHADOW_2026-06-15.md`
- `project-state/FILES_LC_CORE_POINTS_3A_DONE.md`
- `project-state/FILES_STEP617C_618B_SNIPPET.md`
- `project-state/GENERAL_PROJECT_PROMPT.md`
- `project-state/LC_CORE_POINTS_3D_STATUS_SUMMARY.md`
- `project-state/LC_CORE_POINTS_3E_STATUS_SUMMARY.md`
- `project-state/NEXT_CHAT_PROMPT_EVENTSYS_27D_SOUND_SAFE.txt`
- `project-state/NEXT_CHAT_PROMPT_LWG_4Q12N.md`
- `project-state/NEXT_CHAT_PROMPT_LWG_WHEEL_OVERLAY_RUNTIME_1.txt`
- `project-state/NEXT_CHAT_PROMPT_LWG_WHEEL_TEXT_RADIAL_5.txt`
- `project-state/NEXT_CHAT_START_STEP278_COMMUNICATION_QUEUE_RESILIENCE.md`
- `project-state/NEXT_STEPS_CAN42_22.md`
- `project-state/NEXT_STEPS_CAN42_23.md`
- `project-state/NEXT_STEPS_CAN42_24.md`
- `project-state/NEXT_STEPS_CAN42_25.md`
- `project-state/NEXT_STEPS_CAN42_26.md`
- `project-state/NEXT_STEPS_CAN42_27.md`
- `project-state/NEXT_STEPS_CAN42_28.md`
- `project-state/NEXT_STEPS_CAN42_28b.md`
- `project-state/NEXT_STEPS_CAN42_29.md`
- `project-state/NEXT_STEPS_CAN42_30.md`
- `project-state/NEXT_STEPS_CAN42_31.md`
- `project-state/NEXT_STEPS_CAN42_33.md`
- `project-state/NEXT_STEPS_CAN42_34.md`
- `project-state/NEXT_STEPS_CAN43_1.md`
- `project-state/NEXT_STEPS_EVENT_SYSTEM_EVS42_1.md`
- `project-state/NEXT_STEPS_EVENT_SYSTEM_EVS43.md`
- `project-state/NEXT_STEPS_EVENT_SYSTEM_EVS44.md`
- `project-state/NEXT_STEPS_EVENT_SYSTEM_EVS49_12.md`
- `project-state/NEXT_STEPS_LC_CORE_ALERT_SHADOW_2026-06-15.md`
- `project-state/NEXT_STEPS_LC_CORE_POINTS_3A_DONE.md`
- `project-state/NEXT_STEPS_LWG_4O_0A.md`
- `project-state/NEXT_STEPS_LWG_4O_0B.md`
- `project-state/NEXT_STEPS_LWG_4O_1.md`
- `project-state/NEXT_STEPS_LWG_4O_1B.md`
- `project-state/NEXT_STEPS_LWG_4O_2.md`
- `project-state/NEXT_STEPS_LWG_4O_3.md`
- `project-state/NEXT_STEPS_LWG_4O_3B.md`
- `project-state/NEXT_STEPS_LWG_4O_3C.md`
- `project-state/NEXT_STEPS_LWG_4O_4.md`
- `project-state/NEXT_STEPS_LWG_4O_5.md`
- `project-state/NEXT_STEPS_LWG_4O_5B.md`
- `project-state/NEXT_STEPS_LWG_4O_5C.md`
- `project-state/NEXT_STEPS_LWG_4O_5D.md`
- `project-state/NEXT_STEPS_LWG_4O_5E.md`
- `project-state/NEXT_STEPS_LWG_4O_5E_TO_NEXT_CHAT.md`
- `project-state/NEXT_STEPS_OVERLAY_MONITORING.md`
- `project-state/NEXT_STEPS_SHOUTOUT_HANDOFF.md`
- `project-state/NEXT_STEPS_STEP617C_EVENT_BUS.md`
- `project-state/OVERLAY_SOURCE_INVENTORY_FROM_UPLOAD.md`
- `project-state/PROJECT_STATE_ARCHIVE_MOVE_LIST_2026-05-26.csv`
- `project-state/README_APPLY_SO_SYNC_DOCS_2026-06-21.md`
- `project-state/README_CAN44_19_4.txt`
- `project-state/README_STEP278_COMMUNICATION_QUEUE_STATUS.md`
- `project-state/STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY.md`
- `project-state/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md`
- `project-state/STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION.md`
- `project-state/STEP590_CENTRAL_STATUS_DOCS_UPDATE.md`
- `project-state/STEP591_ROUTES_MODULE_DOCS_VERIFICATION_SCAN.md`
- `project-state/STEP592_ROUTES_SCAN_RESULTS_TRIAGE.md`
- `project-state/STEP593_ROUTES_DOCUMENTATION_CONSOLIDATION_PLAN.md`
- `project-state/STEP594_CENTRAL_ROUTES_INVENTORY_DRAFT.md`
- `project-state/STEP595_ROUTES_INVENTORY_REVIEW_PLAN.md`
- `project-state/STEP596_MISSING_ROUTES_DOCUMENTATION_BATCH.md`
- `project-state/STEP597_ROUTE_INVENTORY_FALSE_POSITIVE_REVIEW.md`
- `project-state/STEP598_MODULE_ROUTE_DOCS_BATCH_PLAN.md`
- `project-state/STEP599_MODULE_ROUTE_DOCS_BATCH_A.md`
- `project-state/STEP600_MODULE_ROUTE_DOCS_BATCH_A_VERIFICATION.md`
- `project-state/STEP601_MODULE_ROUTE_DOCS_BATCH_B_CURRENT_STATUS.md`
- `project-state/STEP602_CURRENT_STATUS_CROSSMODULE_BATCH_VERIFICATION.md`
- `project-state/STEP603A_CHANNELPOINTS_MODULE_DOCS_BATCH.md`
- `project-state/STEP603B_SOUND_SYSTEM_ROUTING_DOCS_BATCH.md`
- `project-state/STEP604_CHANNELPOINTS_SOUND_ROUTING_BATCH_VERIFICATION.md`
- `project-state/STEP605_DASHBOARD_COMMANDS_MODULE_DOCS_BATCH.md`
- `project-state/STEP606_DASHBOARD_COMMANDS_BATCH_VERIFICATION.md`
- `project-state/STEP607_COMMUNICATION_BUS_CONTRACT_MODULE_DOCS_BATCH.md`
- `project-state/STEP608_COMMUNICATION_BUS_BATCH_VERIFICATION.md`
- `project-state/STEP609_SHOUTOUT_CLIP_FEATURES_MODULE_DOCS_BATCH.md`
- `project-state/STEP610_SHOUTOUT_CLIP_FEATURES_BATCH_VERIFICATION.md`
- `project-state/STEP611A_COMPLETION_VERIFICATION_TRIAGE_FIX_MAP.md`
- `project-state/STEP611B_FIXED_FINAL_COMPLETION_VERIFICATION.md`
- `project-state/STEP611C_MISSING_MARKER_GROUP_TRIAGE.md`
- `project-state/STEP611D_FIXED_FINAL_COMPLETION_VERIFICATION_V2.md`
- `project-state/STEP611_FINAL_MODULE_ROUTE_DOCS_COMPLETION_VERIFICATION.md`
- `project-state/STEP612_CENTRAL_STATUS_FILES_UPDATE.md`
- `project-state/STEP613_POST_STATUS_UPDATE_VERIFICATION.md`
- `project-state/STEP614_FRESH_SYSTEMSCAN_PREP.md`
- `project-state/STEP614_HANDOFF_AND_FRESH_SYSTEMSCAN_PREP.md`
- `project-state/STEP614_ROUTE_DOCS_COMPLETION_HANDOFF.md`
- `project-state/STEP615_CLEANUP_FREEZE_RETURN_TO_PRODUCTIVE_WORK.md`
- `project-state/STEP615_CLEANUP_FREEZE_RETURN_TO_PRODUCTIVE_WORK_README.md`
- `project-state/STEP616_COMMAND_SYSTEM_CHANNEL_GUARD.md`
- `project-state/STEP616_OVERLAY_CLIENT_DASHBOARD_VIEW.md`
- `project-state/STEP617B_EVENT_BUS_CONFIG_TAB_HOTFIX.md`
- `project-state/STEP617C_EVENT_BUS_SETTINGS_FINAL_STATUS.md`
- `project-state/STEP617C_EVENT_BUS_SETTINGS_IN_COMMUNICATION_BUS.md`
- `project-state/STEP617_EVENT_BUS_DASHBOARD_AND_DB_CONFIG.md`
- `project-state/STEP618B_EVENT_BUS_OVERLAY_CLIENTS_FINAL_STATUS.md`
- `project-state/STEP618B_EVENT_BUS_OVERLAY_CLIENT_CLASSIFICATION_FIX.md`
- `project-state/STEP618_EVENT_BUS_OVERLAY_CLIENTS_VISIBILITY.md`
- `project-state/STEP619B_OVERLAY_SOURCE_MONITORING_SOLL_LIST.md`
- `project-state/STEP619_CONTROL_OVERLAYS_READONLY.md`
- `project-state/STEP620B_OVERLAY_MONITOR_LOG_AND_UI_CLEANUP.md`
- `project-state/STEP620_OBS_BROWSER_SOURCES_READONLY.md`
- `project-state/STEP621B_OVERLAY_MONITOR_HTTP200_HOTFIX.md`
- `project-state/STEP621C_HELLO_HEARTBEAT_SPLIT.md`
- `project-state/STEP621D_OVERLAY_HEARTBEATS_AND_SIMPLE_STATUS.md`
- `project-state/STEP621_OVERLAY_SOURCE_STATUS_OBS_BUS.md`
- `project-state/STEP622_EVENTBUS_TEST_OVERLAY.md`
- `project-state/STEP623_PRODUCTIVE_OVERLAY_EVENTBUS_STANDARD.md`
- `project-state/STEP624B_NESTED_OBS_SCENES.md`
- `project-state/STEP624C_EXTERNAL_BROWSER_SOURCES.md`
- `project-state/STEP624_OVERLAY_MONITOR_CURRENT_SCENE.md`
- `project-state/STEP625A_COMPACT_OVERLAY_SOURCE_VIEW.md`
- `project-state/STEP625B_MONITORING_ISSUE_LOG.md`
- `project-state/STEP626A_OVERLAY_DETAILS_TAB.md`
- `project-state/STEP626B_MORE_OVERLAY_EVENTBUS_CLIENTS.md`
- `project-state/STEP626D_RAHMEN_FRAME_OVERLAY_MAPPING.md`
- `project-state/STEP626E_OBS_INVENTORY_TREE.md`
- `project-state/STEP626F_INVENTORY_STATUS_LOGIC.md`
- `project-state/STEP626G_INVENTORY_WARNING_STATUS_FINAL.md`
- `project-state/STEP627B_RAHMEN_DEATHCOUNTER_STYLE_FIX.md`
- `project-state/STEP627C_RAHMEN_UNIFORM_BORDER.md`
- `project-state/STEP627_RAHMEN_NEON_GALAXY_REDESIGN.md`
- `project-state/STEP628A_OBS_OVERLAY_REPAIR_ACTIONS.md`
- `project-state/STEP628B_NESTED_OBS_REPAIR_ACTIONS.md`
- `project-state/STEP628C_ICON_REPAIR_BUTTONS.md`
- `project-state/STEP628D_DYNAMIC_VISIBILITY_BUTTON.md`
- `project-state/TODO_EVENT_SYSTEM_EVS42_1.md`
- `project-state/TODO_EVENT_SYSTEM_EVS43.md`
- `project-state/TODO_EVENT_SYSTEM_EVS44.md`
- `project-state/TODO_EVENT_SYSTEM_EVS49_12.md`
- `project-state/TODO_LC_CORE_ALERT_SHADOW_2026-06-15.md`
- `project-state/TODO_LC_CORE_POINTS_3A_DONE.md`
- `project-state/TODO_LWG_4O_5E_TO_NEXT_CHAT.md`
- `project-state/VIP30_FILES_STEP8_19_23.md`
- `project-state/VIP30_STEP8_19_21_NEXT_CHAT_SUMMARY.md`

## Danach erwarteter Root-Zustand

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht in diesem Step geloescht

Diese Bereiche bleiben fuer den naechsten Docs-Cleanup bewusst unangetastet, weil sie groesser sind und nach Themen zusammengefuehrt werden muessen:

```text
docs/archive/**
docs/current/RDAP*.md
docs/current/CAN*.md
docs/system-inspection/**
docs/_generated/**
```

Grund: Dort liegen viele alte Status-/Report-/Planungsdateien. Die werden im naechsten Step thematisch zusammengefuehrt und dann paketweise geloescht oder archiviert.

# Docs and Stats Cleanup Audit

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_1_DEV_MODULE_STATS_INVENTORY`  
Scope: Doku-/Inventar-/Cleanup-Audit. Keine produktive Löschung in diesem Step.

## Ziel

Die vorhandene Doku-, Stats-, Report- und Archivflut wird in klare Kategorien getrennt.  
Step 1 erstellt nur die Entscheidungsgrundlage. Step 2 darf danach löschen, zusammenführen oder neue bereinigte Dateien hochladen.

## Klassifikationsregeln

| Klasse | Bedeutung | Aktion in Step 1 | Aktion in Step 2 |
|---|---|---|---|
| `KEEP_CURRENT` | Aktuelle Wahrheit / Startdateien | behalten | gegenprüfen |
| `MERGE_THEN_DELETE` | Inhalt in zentrale Doku übernehmen | markieren | nach Merge löschen |
| `ARCHIVE_ONLY` | historische Referenz | markieren | aus aktivem Root entfernen |
| `DELETE_CANDIDATE_SAFE` | Backup/alte generierte Datei ohne Runtime-Wert | markieren | nach lokalem Check löschen |
| `REVIEW_MANUALLY` | unklar | markieren | manuell entscheiden |

## Sichere Runtime-Backup-Kandidaten

Diese Dateien sehen nach alten Backup-/Step-Dateien in aktiven Runtime-Ordnern aus.  
Sie werden in diesem Step nicht gelöscht, sind aber gute Kandidaten für Step 2.

| Pfad | Grund | Empfohlene Klasse |
| --- | --- | --- |
| backend/modules/clip_shoutout.js.CAN-44.21.14.bak | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| backend/modules/commands.js.step214_backup_20260611_180942 | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| backend/modules/loyalty_games.js.step220_lwg6_1_backup | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| backend/modules/loyalty_games.js.step222_lwg6_3_backup | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| backend/modules/loyalty_games/gamble.js.step222_lwg6_3_backup | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| backend/modules/twitch.js.vip30_step8_7_backup_2026-06-05T20-08-56-203Z | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| htdocs/dashboard/components/media_picker.js.step274z.bak | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| htdocs/dashboard/components/media_picker.js.step274z_fix1.bak | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| htdocs/dashboard/components/media_picker.js.step275b_fix1.bak | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| htdocs/dashboard/modules/birthday.css.bak-step274v | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |
| htdocs/dashboard/modules/birthday.js.bak-step274v | Runtime-Backup/Step-Datei | DELETE_CANDIDATE_SAFE nach lokalem dev-Vergleich |

## Falsche Verschachtelung / Strukturfehler

| Pfad | Grund | Empfohlene Klasse |
| --- | --- | --- |
| htdocs/htdocs/overlays/stream_events/event_winner_overlay.html | falsche Doppel-Verschachtelung möglich | REVIEW_THEN_DELETE_OR_MOVE |

## Doppelte Inhalte

| Pfade | Befund | Empfohlene Klasse |
| --- | --- | --- |
| htdocs/index.htm / htdocs/overlays/audioblobs.js | identischer SHA256-Inhalt | REVIEW: Kompatibilitätspfad möglich |
| htdocs/overlays/ws-client.js / htdocs/ws-client.js | identischer SHA256-Inhalt | REVIEW: Kompatibilitätspfad möglich |

## Stats-/Reports-/Generated-Kandidaten

Gesamt gefundene Kandidaten im Snapshot: 482

| Klasse | Anzahl |
| --- | --- |
| REVIEW | 278 |
| ARCHIVE_OR_DELETE_REVIEW | 179 |
| PROJECT_STATE_ROOT_CLEANUP | 20 |
| REGENERATE_OR_MERGE | 5 |

### PROJECT_STATE_ROOT_CLEANUP

Anzahl im Snapshot: 20

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
- `project-state/CHANGELOG_WF1_FRONTEND_GIT_WORKFLOW_2026-06-23.md`
- `project-state/PROJECT_STATE_ARCHIVE_MOVE_LIST_2026-05-26.csv`

### REGENERATE_OR_MERGE

Anzahl im Snapshot: 5

- `docs/_generated/CONFIGS_AND_DATA.md`
- `docs/_generated/DASHBOARD_MODULES.md`
- `docs/_generated/FUNCTIONS.md`
- `docs/_generated/PROJECT_NAVIGATION.md`
- `docs/_generated/ROUTES.md`

### ARCHIVE_OR_DELETE_REVIEW

Anzahl im Snapshot: 179

- `docs/auth/STEP_AUTH_2_TWITCH_OAUTH_LOGIN.md`
- `docs/current/CURRENT_CHAT_HANDOFF_STEP233_PROJECT_AUDIT.md`
- `docs/steps/CHANGELOG_VIP30_STEP8_19_19_TO_19_23.md`
- `docs/steps/CHANGELOG_VIP30_STEP8_19_21.md`
- `docs/steps/LWG-4O.3b_twitch_login_alias_fix.md`
- `docs/system-inspection/EVENTBUS_CAN9_4_RECOVERY_PREFLIGHT_ROUTE_CONTEXT_NEXTSTEP_FIX.md`
- `docs/system-inspection/STEP530_BACKUP_AND_SAFE_CLEANUP_BATCH1.md`
- `docs/system-inspection/STEP531_DOCS_TODO_AND_CLEANUP_SCAN.md`
- `docs/system-inspection/STEP532_DOC_CLEANUP_BUCKETS.md`
- `docs/system-inspection/STEP532_TODO_RESCUE_AND_DOC_CLEANUP_TRIAGE.md`
- `docs/system-inspection/STEP532_TODO_RESCUE_REPORT.md`
- `docs/system-inspection/STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1.md`
- `docs/system-inspection/STEP534_CURRENT_STEP_DOCS_CONSOLIDATION_BATCH2.md`
- `docs/system-inspection/STEP535_TECH_STEP_DOCS_CLEANUP_SCAN.md`
- `docs/system-inspection/STEP536A_ALERT_TECH_DOCS_CONSOLIDATION.md`
- `docs/system-inspection/STEP536B_SOUND_MEDIA_TECH_DOCS_CONSOLIDATION.md`
- `docs/system-inspection/STEP536C_VIP_TECH_DOCS_CONSOLIDATION.md`
- `docs/system-inspection/STEP536D_README_CLIP_MISC_TECH_DOCS_CONSOLIDATION.md`
- `docs/system-inspection/STEP536_TECH_STEP_DOCS_CANDIDATE_MANIFEST.md`
- `docs/system-inspection/STEP536_TECH_STEP_DOCS_TRIAGE_AND_BATCH_PLAN.md`
- `docs/system-inspection/STEP537_POST_CLEANUP_DOCS_VERIFICATION_SCAN.md`
- `docs/system-inspection/STEP538_COMMUNICATION_AUDIT_CONSOLIDATION.md`
- `docs/system-inspection/STEP539_TECH_STEP_DOCS_CLEANUP_COMPLETION.md`
- `docs/system-inspection/STEP540_TODO_MARKER_TRIAGE_SCAN.md`
- `docs/system-inspection/STEP541_TODO_MARKER_TRIAGE_FINDINGS.md`
- `docs/system-inspection/STEP542_PROJECT_STATE_TRIAGE_SCAN.md`
- `docs/system-inspection/STEP543_PROJECT_STATE_ARCHIVE_BATCH_PLAN.md`
- `docs/system-inspection/STEP544_PROJECT_STATE_BATCH_A_RESCUE_DRYRUN.md`
- `docs/system-inspection/STEP545_PROJECT_STATE_BATCH_A_QUARANTINE_MOVE.md`
- `docs/system-inspection/STEP546_CHANNELPOINTS_COMMANDS_STATE_CONSOLIDATION_PLAN.md`
- `docs/system-inspection/STEP547_CHANNELPOINTS_STATE_CONSOLIDATION_DRAFT.md`
- `docs/system-inspection/STEP548_COMMANDS_STATE_CONSOLIDATION_DRAFT.md`
- `docs/system-inspection/STEP549_FEATURE_STATE_ARCHIVE_PLAN.md`
- `docs/system-inspection/STEP550_FEATURE_STATE_ARCHIVE_DRYRUN.md`
- `docs/system-inspection/STEP551_FEATURE_STATE_ARCHIVE_APPLY.md`
- `docs/system-inspection/STEP552_PROJECT_STATE_ROOT_VERIFICATION_SCAN.md`
- `docs/system-inspection/STEP553_REMAINING_PROJECT_STATE_ROOT_CLEANUP_PLAN.md`
- `docs/system-inspection/STEP554_CLEANUP_RUN_NOTES_RESCUE_AND_DRYRUN_PLAN.md`
- `docs/system-inspection/STEP555_CLEANUP_RUN_NOTES_ARCHIVE_DRYRUN.md`
- `docs/system-inspection/STEP556_CLEANUP_RUN_NOTES_ARCHIVE_APPLY.md`
- `docs/system-inspection/STEP557_POST_CLEANUP_PROJECT_STATE_VERIFICATION_SCAN.md`
- `docs/system-inspection/STEP558_MODULE_META_RULES_CONSOLIDATION_PLAN.md`
- `docs/system-inspection/STEP559_BATCH_B_CONTENT_RESCUE_DRAFT.md`
- `docs/system-inspection/STEP560_BATCH_B_MODULE_META_RULES_ARCHIVE_DRYRUN.md`
- `docs/system-inspection/STEP561_BATCH_B_MODULE_META_RULES_ARCHIVE_APPLY.md`
- `docs/system-inspection/STEP562_POST_BATCH_B_VERIFICATION_SCAN.md`
- `docs/system-inspection/STEP563_COMMUNICATION_BUS_STATE_CONSOLIDATION_PLAN.md`
- `docs/system-inspection/STEP564_COMMUNICATION_BUS_CONTENT_RESCUE_DRAFT.md`
- `docs/system-inspection/STEP565_COMMUNICATION_BUS_ARCHIVE_DRYRUN.md`
- `docs/system-inspection/STEP566_COMMUNICATION_BUS_ARCHIVE_APPLY.md`
- `docs/system-inspection/STEP567_POST_COMMUNICATION_BUS_VERIFICATION_SCAN.md`
- `docs/system-inspection/STEP568_SHOUTOUT_STATE_CONSOLIDATION_PLAN.md`
- `docs/system-inspection/STEP569_SHOUTOUT_CONTENT_RESCUE_DRAFT.md`
- `docs/system-inspection/STEP570_SHOUTOUT_ARCHIVE_DRYRUN.md`
- `docs/system-inspection/STEP571_SHOUTOUT_ARCHIVE_APPLY.md`
- `docs/system-inspection/STEP572_POST_SHOUTOUT_VERIFICATION_SCAN.md`
- `docs/system-inspection/STEP573_CHANNELPOINTS_BUILD_STATE_CONSOLIDATION_PLAN.md`
- `docs/system-inspection/STEP574_CHANNELPOINTS_BUILD_CONTENT_RESCUE_DRAFT.md`
- `docs/system-inspection/STEP575_CHANNELPOINTS_BUILD_ARCHIVE_DRYRUN.md`
- `docs/system-inspection/STEP576_CHANNELPOINTS_BUILD_ARCHIVE_APPLY.md`
- `docs/system-inspection/STEP577_POST_CHANNELPOINTS_BUILD_VERIFICATION_SCAN.md`
- `docs/system-inspection/STEP578_DASHBOARD_COMMANDS_STATE_CONSOLIDATION_PLAN.md`
- `docs/system-inspection/STEP579_DASHBOARD_COMMANDS_CONTENT_RESCUE_DRAFT.md`
- `docs/system-inspection/STEP580_DASHBOARD_COMMANDS_ARCHIVE_DRYRUN.md`
- `docs/system-inspection/STEP581_DASHBOARD_COMMANDS_ARCHIVE_APPLY.md`
- `docs/system-inspection/STEP582_POST_DASHBOARD_COMMANDS_VERIFICATION_SCAN.md`
- `docs/system-inspection/STEP583_CURRENT_RUN_DOCS_CLEANUP_PLAN.md`
- `docs/system-inspection/STEP584_CURRENT_RUN_DOCS_RESCUE_HISTORY_APPEND.md`
- `docs/system-inspection/STEP585_CURRENT_RUN_DOCS_ARCHIVE_DRYRUN.md`
- `docs/system-inspection/STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY.md`
- `docs/system-inspection/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md`
- `docs/system-inspection/STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION.md`
- `project-state/archive/2026-05-11-step233/CHANGELOG_STEP198_APPEND_2026-05-08.md`
- `project-state/archive/2026-05-11-step233/CHANGELOG_STEP200_2_APPEND_2026-05-08.md`
- `project-state/archive/2026-05-11-step233/CHANGELOG_STEP200_3_APPEND_2026-05-08.md`
- `project-state/archive/2026-05-11-step233/CHANGELOG_STEP200_4_FIXED_APPEND_2026-05-08.md`
- `project-state/archive/2026-05-11-step233/CHANGELOG_STEP200_5_APPEND_2026-05-08.md`
- `project-state/archive/2026-05-11-step233/CHANGELOG_STEP200_6_APPEND_2026-05-08.md`
- `project-state/archive/2026-05-11-step233/CHANGELOG_STEP200_7_APPEND_2026-05-08.md`
- `project-state/archive/2026-05-11-step233/CHANGELOG_STEP200_8_APPEND_2026-05-08.md`
- ... weitere Kandidaten im selben Muster

### REVIEW

Anzahl im Snapshot: 278

- `backend/core/logger.js`
- `backend/modules/audit_log.js`
- `backend/modules/helpers/helper_audit_log.js`
- `backend/modules/helpers/helper_dashboard_audit.js`
- `remote-modboard/backend/src/routes/auth-login.routes.js`
- `remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js`
- `remote-modboard/backend/src/services/admin-audit-lock-schema-status-readonly.service.js`
- `remote-modboard/backend/src/services/admin-audit-test-insert.service.js`
- `remote-modboard/backend/src/services/admin-audit-write.service.js`
- `remote-modboard/backend/src/services/audit-read.service.js`
- `remote-modboard/backend/src/services/auth-login-entry.service.js`
- `remote-modboard/stream-pc-agent/src/logger.js`
- `docs/backend/AUDIT_LOG_HELPER.md`
- `docs/backend/COMMUNICATION_SECURITY_LOGGING.md`
- `docs/current/CAN44_12_2_LIVE_STATUS_MONITOR_LOGS_FIX.md`
- `docs/current/CAN44_21_34_STABLE_TEST_REPORT.md`
- `docs/current/CHANGELOG.md`
- `docs/current/CHANGELOG_EVENT_SOUND_RUNTIME_2026-06-16.md`
- `docs/current/CURRENT_CHAT_HANDOFF_BIRTHDAY_READONLY_SHOW_STATE_AUDIT.md`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS52_15_REPORT_DIAG_CLEANUP.md`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_12_TEXT_RUNTIME_DASHBOARD_REPORT.md`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_13B_USER_STATS_MODAL_AUTOREFRESH.md`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_16_SOUND_RUNTIME_DASHBOARD_REPORT.md`
- `docs/current/CURRENT_CHAT_HANDOFF_LWG_4Q12L_GAMBLE_SIMPLE_WIN_LOSS_LOGIC.md`
- `docs/current/CURRENT_CHAT_HANDOFF_SOUND_LOG_1.md`
- `docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP_DESIGN2_LOGIN_TEXT_POLISH.md`
- `docs/current/OVERLAY_MONITORING_CHANGELOG.md`
- `docs/current/RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY.md`
- `docs/current/RDAP11C_LOCK_AUDIT_LIVE_TEST_DOCS.md`
- `docs/current/RDAP11_LOCK_AUDIT_READONLY_SKELETON_PREP.md`
- `docs/current/RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN.md`
- `docs/current/RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN.md`
- `docs/current/RDAP14C_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_TEST_DOCS.md`
- `docs/current/RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON.md`
- `docs/current/RDAP32_ADMIN_AUDIT_LOCK_WRITE_FOUNDATION_PLAN.md`
- `docs/current/RDAP33B_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY_LIVE_CONFIRMED_DOCS.md`
- `docs/current/RDAP33_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY.md`
- `docs/current/RDAP34_ADMIN_AUDIT_SCHEMA_MIGRATION_DECISION_PLAN.md`
- `docs/current/RDAP35B_ADMIN_AUDIT_SCHEMA_MIGRATION_LIVE_CONFIRMED_DOCS.md`
- `docs/current/RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED.md`
- `docs/current/RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_SERVER_COMMANDS.md`
- `docs/current/RDAP36B_ADMIN_AUDIT_TEST_INSERT_LIVE_CONFIRMED_DOCS.md`
- `docs/current/RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED.md`
- `docs/current/RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN.md`
- `docs/current/RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED.md`
- `docs/current/RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS.md`
- `docs/current/RDAP7_LOGIN_SESSION_CONCEPT.md`
- `docs/current/RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES.md`
- `docs/current/RDAP_ADMIN_USERS23_AUTH_SESSION_LOGIN_ACTIVATION_SCOPE.md`
- `docs/current/RDAP_ADMIN_USERS25_AUTH_SESSION_LOGIN_SMOKE_TEST.md`
- `docs/current/RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION.md`
- `docs/current/RDAP_ADMIN_USERS8_AUDIT_HELPER_DISABLED_PLAN.md`
- `docs/current/RDAP_AUTH1_TWITCH_LOGIN_GATED.md`
- `docs/current/RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED.md`
- `docs/current/RDAP_AUTH2_CENTRAL_LOGIN_READY.md`
- `docs/current/RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED.md`
- `docs/current/RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN.md`
- `docs/current/RDAP_LOGIN1_CENTER_LAYOUT_FIX.md`
- `docs/current/RDAP_TOPBAR1_REMOVE_DUPLICATE_LOGOUT.md`
- `docs/current/SERVER_LOG_MODULE_LOADING_RULES_2026-05-26.md`
- `docs/current/TEST_REPORT_EVS52_14_TESTED_STABLE.md`
- `docs/current/TEST_REPORT_EVS52_21_WINNER_FINALE.md`
- `docs/current/TEST_REPORT_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW.md`
- `docs/current/TEST_REPORT_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY.md`
- `docs/modules/audit-log-deep-dive.md`
- `docs/modules/core-security-audit.md`
- `docs/reference/dashboard-v2-design-test-v13/login.html`
- `docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt`
- `docs/system-inspection/BIRTHDAY_DASHBOARD_USERPARTY_PLAY.md`
- `docs/system-inspection/BIRTHDAY_PARTY_IMAGE_HIDE_TEXT_CARD.md`
- `docs/system-inspection/BIRTHDAY_PARTY_IMAGE_LAYOUT_COMPACT_FIX.md`
- `docs/system-inspection/BIRTHDAY_PARTY_IMAGE_MEDIA_FIELD.md`
- `docs/system-inspection/BIRTHDAY_PARTY_IMAGE_VISIBLE_FIX.md`
- `docs/system-inspection/BIRTHDAY_PARTY_SONG_MEDIAID_FIX.md`
- `docs/system-inspection/BIRTHDAY_READONLY_SHOW_STATE_AUDIT.md`
- `docs/system-inspection/BIRTHDAY_SHOW_PROFILE_CONCEPT.md`
- `docs/system-inspection/CAN24_0_SOUND_MIGRATION_CANDIDATE_PREP_READONLY.md`
- `docs/system-inspection/CAN24_10_TEST_RESULT_AND_SOUND_ID_DIAGNOSIS.md`
- `docs/system-inspection/CAN24_11_SOUND_BUS_MEDIAID_DRYRUN_COMPAT.md`
- `docs/system-inspection/CAN24_12_MEDIAID_DRYRUN_SUCCESS.md`
- ... weitere Kandidaten im selben Muster

## Empfohlene Zielstruktur

Im aktiven Root von `project-state/` sollten langfristig nur diese Dateien bleiben:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Historische Step-Dateien gehören nach:

```text
project-state/archive/
docs/archive/
```

Generierte Übersichten gehören entweder nach:

```text
docs/_generated/
```

oder werden vollständig neu generiert und nicht dauerhaft als Wahrheit gepflegt.

## Cleanup Step 2 Vorschlag

Name:

```text
RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE
```

Scope:

- sichere Backup-Dateien aus aktiven Runtime-Ordnern entfernen
- falsche `htdocs/htdocs/...`-Verschachtelung prüfen und entfernen
- `project-state/` Root bereinigen
- alte Stats-/Reports in zentrale Doku übernehmen oder löschen
- keine Feature-Codeänderung
- keine DB
- kein Webserver-Deploy, sofern nur Doku/Repo-Aufräumung

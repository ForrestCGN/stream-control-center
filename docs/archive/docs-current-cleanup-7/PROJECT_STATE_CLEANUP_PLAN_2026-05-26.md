# Project-State Cleanup Plan

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Ziel: `project-state/` als Arbeitswurzel wieder lesbar machen, ohne Historie zu löschen.

## Grundsatz

- Nicht löschen.
- Alte Arbeits-/STEP-/APPEND-Dateien nur ins Archiv verschieben.
- Zentrale Arbeitsdateien bleiben im Root.
- Physisches Verschieben erfolgt über das mitgelieferte Script `tools/project_state_archive_step475.ps1`.

## Dateien, die im Root bleiben sollen

- `project-state/CHANGELOG.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/FILES.md`
- `project-state/GENERAL_PROJECT_PROMPT.md`
- `project-state/NEXT_STEPS.md`
- `project-state/README.md`
- `project-state/TODO.md`

## Zielstruktur

```text
project-state/
├─ CURRENT_STATUS.md
├─ CHANGELOG.md
├─ FILES.md
├─ NEXT_STEPS.md
├─ TODO.md
├─ GENERAL_PROJECT_PROMPT.md
└─ archive/
   ├─ steps/
   ├─ append/
   ├─ old-status/
   ├─ generated-snapshots/
   └─ misc/
```

## Erkannte Verschiebe-Kandidaten im aktuellen Upload

### archive/steps

- Anzahl: 838

- `project-state/CHANGELOG_STEP198_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP200_2_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP200_3_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP200_4_FIXED_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP200_5_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP200_6_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP200_7_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP200_8_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_10B_OBS_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_10C_SCENE_CONTROL_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_11B_DISCORD_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_12B_1_TWITCH_PRESENCE_FIX_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_12B_TWITCH_PRESENCE_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_12D_OVERLAY_CHAT_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_1_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_2A_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_2B_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_3A_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_3B_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_3C_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_3C_FIX2_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_3C_FIX_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_3D_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_3D_FIX_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_3E_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_3E_FIX_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_5_VIP_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_6_1_CHALLENGE_OVERLAY_PATH_FIX_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_6_CHALLENGE_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_7_CLIP_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_8_1_DEATHCOUNTER_STATUS_FIX_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_8_DEATHCOUNTER_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_9_HUG_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_INTERMEDIATE_MATRIX_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP201_SAVED_2026-05-08.md`
- `project-state/CHANGELOG_STEP202_2_LOYALTY_SHADOW_MODE_APPEND_2026-05-09.md`
- `project-state/CHANGELOG_STEP202_3_ALERTS_URGENT_APPEND_2026-05-08.md`
- `project-state/CHANGELOG_STEP202_LOYALTY_CAPTURE_PREP_APPEND_2026-05-09.md`
- `project-state/CHANGELOG_STEP209_ENTRY_2026-05-09.md`
- `project-state/CHANGELOG_STEP274K_FINAL.md`
- `project-state/CURRENT_STATUS_APPEND_STEP229.md`
- `project-state/CURRENT_STATUS_APPEND_STEP230A.md`
- `project-state/CURRENT_STATUS_APPEND_STEP230B.md`
- `project-state/CURRENT_STATUS_APPEND_STEP231.md`
- `project-state/CURRENT_STATUS_STEP198_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP200_2_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP200_5_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP200_6_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP200_7_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP200_8_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_10B_OBS_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_10C_SCENE_CONTROL_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_11B_DISCORD_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_12B_1_TWITCH_PRESENCE_FIX_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_12B_TWITCH_PRESENCE_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_12D_OVERLAY_CHAT_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_1_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_2A_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_2B_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_3A_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_3B_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_3C_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_3C_FIX2_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_3C_FIX_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_3D_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_3D_FIX_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_3E_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_3E_FIX_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_5_VIP_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_6_1_CHALLENGE_OVERLAY_PATH_FIX_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_6_CHALLENGE_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_7_CLIP_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_8_1_DEATHCOUNTER_STATUS_FIX_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_8_DEATHCOUNTER_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_9_HUG_DIAGNOSTICS_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_INTERMEDIATE_MATRIX_APPEND_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP201_SAVED_2026-05-08.md`
- `project-state/CURRENT_STATUS_STEP202_2_LOYALTY_SHADOW_MODE_APPEND_2026-05-09.md`
- ... plus 758 weitere Dateien

### archive/append

- Anzahl: 0


### archive/old-status

- Anzahl: 3

- `project-state/CURRENT_STATUS_BIRTHDAY.md`
- `project-state/PROJECT_STATUS_2026-05-03_SYSTEM_CLEANUP_OBS_DASHBOARD.md`
- `project-state/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt`

### archive/generated-snapshots

- Anzahl: 0


### archive/misc

- Anzahl: 14

- `project-state/COMMAND_MEDIA_HANDOFF_NEXT_CHAT.md`
- `project-state/DB_PHASE2_CLEANUP_SUMMARY_2026-05-10.md`
- `project-state/HUG_BEFORE_HUG_ALL_TEXTS_2026-05-11.json`
- `project-state/HUG_BEFORE_RESPONSE_TEXTS_2026-05-11.json`
- `project-state/HUG_BEFORE_TEXT_PAIRS_2026-05-11.json`
- `project-state/HUG_BEFORE_TOP_TITLE_TEXTS_2026-05-11.json`
- `project-state/HUG_LIVE_API_TEST_LOG_2026-05-11.jsonl`
- `project-state/HUG_LIVE_API_TEST_SUMMARY_2026-05-11.txt`
- `project-state/NEXT_CHAT_PROMPT_BIRTHDAY.md`
- `project-state/SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD_2026-05-21.md`
- `project-state/UPLOAD_REVIEW_2026-05-01_BACKEND_CONFIG.md`
- `project-state/UPLOAD_REVIEW_2026-05-01_HTDOCS_DASHBOARD.md`
- `project-state/_backup_alert_rules_before_sub_fix.json`
- `project-state/_backup_alert_rules_before_twitch_tts.json`

## Wichtig

Das ZIP selbst kann vorhandene Root-Dateien nicht entfernen. Deshalb liegt ein separates Move-Script bei. Das Script verschiebt nur Dateien aus `project-state/`, die nicht zur Keep-Liste gehören und in eine der obigen Kategorien fallen.

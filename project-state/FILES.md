# FILES – relevante Dateien

Stand: 2026-05-30

## Zentrale Einstiegspunkte

```text
project-state/GENERAL_PROJECT_PROMPT.md
docs/current/PROJECT_WORKING_RULES.md
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/modules/README.md
```

## Aktive System-Inspection-/Konsolidierungsdateien

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

## Aktuelle Project-State-Kontroll-/Abschlussdateien

```text
project-state/STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY.md
project-state/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md
project-state/STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION.md
project-state/STEP589_GENERAL_PROJECT_PROMPT_UPDATE.md
project-state/STEP590_CENTRAL_STATUS_DOCS_UPDATE.md
```

## Aktuelle Archivbereiche

```text
project-state/archive/2026-05-29-step558-module-meta-rules/
project-state/archive/2026-05-30-step563-communication-bus-contract/
project-state/archive/2026-05-30-step568-shoutout-state/
project-state/archive/2026-05-30-step573-channelpoints-build-state/
project-state/archive/2026-05-30-step578-dashboard-commands-state/
project-state/archive/2026-05-30-step583-current-run-docs/
```

## Channelpoints

```text
backend/modules/channelpoints.js
backend/modules/channelpoints_eventsub_bus_bridge.js
backend/modules/channelpoints_twitch_readonly_sync.js
htdocs/dashboard/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.css
docs/modules/channelpoints.md
docs/modules/channelpoints_steps_517_to_527_summary.md
docs/modules/sound_system_channelpoints_routing.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
```

## Sound / Media

```text
backend/modules/sound_system.js
backend/modules/sound_media_bridge.js
backend/modules/sound_output_config.js
backend/modules/media.js
htdocs/dashboard/components/media_picker.js
config/sound_system.json
docs/modules/sound_system_channelpoints_routing.md
docs/modules/media_asset_utf8_filename_cleanup.md
```

## EventBus / Communication Bus

```text
backend/modules/communication_bus.js
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
```

## Dashboard / Commands

```text
htdocs/dashboard/
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/app.css
htdocs/dashboard/modules/
htdocs/dashboard/components/
backend/modules/dashboard_*.js
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
```

## Shoutout / Clip-Shoutout

```text
backend/modules/clip_shoutout.js
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
```

## Backend / Core häufig relevant

```text
backend/server.js
backend/core/database.js
backend/modules/
backend/modules/helpers/
config/
```

## Overlays

```text
htdocs/overlays/
htdocs/ws-client.js
htdocs/data/
htdocs/assets/
```

## Gültige letzte Feature-ZIPs / Stände

```text
STEP523_SOUND_SYSTEM_AUTO_OUTPUT_DEFAULTS_FIX_v0.1.12.zip
STEP524_MEDIA_ASSET_UTF8_FILENAME_CLEANUP_REAL_v0.1.0.zip
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13.zip
PROJECT_DOCS_UPDATE_CHANNELPOINTS_STEP527_2026-05-27.zip
STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION_v0.1.0.zip
STEP589_GENERAL_PROJECT_PROMPT_UPDATE_v0.1.0.zip
STEP590_CENTRAL_STATUS_DOCS_UPDATE_v0.1.0.zip
```

## Nicht verwenden

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0.zip
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11.zip
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11.zip
```

## Nächster Prüfbereich

```text
STEP591 – Routes and Module Docs Verification Scan
```

Voraussichtlich relevante Dateien zuerst prüfen:

```text
backend/server.js
backend/modules/*.js
backend/modules/helpers/helper_routes.js
docs/modules/*.md
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/FILES.md
```

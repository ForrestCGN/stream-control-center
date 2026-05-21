# FILES - stream-control-center

Stand: 2026-05-21

## STEP266B - Alert Immediate Bundle Prequeue Self-Block Fix

Geaendert:

```text
backend/modules/alert_system.js
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP266B_ALERT_IMMEDIATE_BUNDLE_PREQUEUE_FIX_2026-05-21.md
```

Nicht geaendert:

```text
app.sqlite
config
backend/modules/sound_system.js
backend/modules/helpers
Streamer.bot-Flows
Overlay-HTML
```

## STEP238

Geaendert:

```text
backend/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP238_MESSAGE_ROTATOR_OUTPUT_MODE_2026-05-20.md
```

Nicht geaendert:

```text
backend/modules/chat_output.js
backend/modules/twitch.js
backend/core/database.js
backend/modules/helpers
config
data
app.sqlite
andere Dashboard-Module
```

# Files – stream-control-center

## Loyalty relevante Dateien

- `backend/modules/loyalty.js`
  - Loyalty-/Kekskruemel-Core.
  - STEP207: AutoRunner Boot Recovery bei gespeichertem Live-Stream-State nach Backend-Neustart.
  - STEP208: Subscribe/Resub-Dedupe mit Ausgleichstransaktion.

## DeathCounter V2 relevante Dateien

- `backend/modules/deathcounter_v2.js`
  - Produktiver DeathCounter V2 Backend-Code.
  - DB-only Storage mit manuellem JSON Backup/Export.

- `htdocs/overlays/_overlay-deathcounter-v2.html`
  - DeathCounter Overlay.
  - STEP262: Alert-Frame-Optik und Slide-In/Out.
  - STEP263: leicht langsamere Slide-/Fade-Transition.

## Doku

- `project-state/STEP266B_ALERT_IMMEDIATE_BUNDLE_PREQUEUE_FIX_2026-05-21.md`
- `project-state/STEP208_LOYALTY_SUB_RESUB_DEDUPE_2026-05-18.md`
- `project-state/STEP207_LOYALTY_AUTORUNNER_BOOT_RECOVERY_2026-05-18.md`
- `project-state/STEP263_DEATHCOUNTER_OVERLAY_SLIDE_TIMING_2026-05-11.md`
- `README_STEP208_LOYALTY_SUB_RESUB_DEDUPE.md`
- `README_STEP207_LOYALTY_AUTORUNNER_BOOT_RECOVERY.md`
- `README_STEP263_DEATHCOUNTER_OVERLAY_SLIDE_TIMING.md`

## STEP239 - Message-Rotator Backend Direct Output

Geaendert:

```text
backend/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP239_MESSAGE_ROTATOR_BACKEND_DIRECT_OUTPUT_2026-05-20.md
```

Nicht geaendert:

```text
app.sqlite
config
backend/core/database.js
backend/modules/twitch.js
htdocs/dashboard/modules/message_rotator.css
```

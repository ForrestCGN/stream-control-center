# FILES – stream-control-center

Stand: 2026-06-10

## BUS-TWITCH.8

### Code-Dateien

```text
backend/modules/commands.js
backend/modules/twitch_presence.js
```

### Doku-Dateien

```text
docs/current/CURRENT_STATUS.md
docs/current/NEXT_STEPS.md
docs/current/TODO.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_BUS_TWITCH_8.md
docs/modules/commands.md
docs/modules/twitch_events.md
docs/modules/README.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
README_STEP_BUS_TWITCH_8.md
ARTIFACT_CHECK.json
```


---

## BUS-TWITCH.8b – Command Direct Route Fix

Ergaenzung: Die in BUS-TWITCH.8 dokumentierten twitch_presence Routen fuer `command-direct/status`, `command-direct/enable` und `command-direct/disable` werden nun tatsaechlich registriert. Keine Funktionalitaet entfernt.

Betroffene Datei: `backend/modules/twitch_presence.js`.

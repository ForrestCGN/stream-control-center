# Current Status – HT3.4

HypeTrain Dashboard wurde aufgeräumt: Event-Actions sind wieder direkt im normalen HypeTrain-Dashboard-Modul integriert.

Backend unverändert: HypeTrain bleibt bei `0.2.3 / STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`.

Dashboard aktiv:

```text
htdocs/dashboard/modules/hypetrain.js
htdocs/dashboard/modules/hypetrain.css
```

Nicht mehr aktiv eingebunden:

```text
htdocs/dashboard/modules/hypetrain_event_actions.js
htdocs/dashboard/modules/hypetrain_event_actions.css
```

Kein Node-Neustart nötig.

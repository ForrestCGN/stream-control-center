# MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26

Stand: 2026-05-26

## Aktualisierte Modul-Dokumentation

Für den Kanalpunkte-Bereich wurden nach STEP516 aktualisiert/ergänzt:

```text
docs/modules/channelpoints.md
docs/modules/channelpoints-deep-dive.md
docs/modules/channelpoints_eventbus_redemption_bridge.md
docs/modules/channelpoints_redemption_store_update_bind_fix.md
docs/modules/channelpoints_twitch_delete_and_create_params.md
docs/modules/channelpoints_twitch_advanced_fields_ui.md
docs/modules/channelpoints_redemption_completion_policy.md
docs/modules/channelpoints_color_picker_presets.md
```

## Modulstand

```text
channelpoints.js: 0.9.4 · redemption-completion-policy
channelpoints_eventsub_bus_bridge.js: EventSub → EventBus Bridge
Dashboard channelpoints.js: UI v1.0.3 · color-picker-presets-ui
```

## Wichtige EventBus-Anbindung

Channel / Action:

```text
channelpoints.redemption / received
```

Quelle:

```text
backend/modules/channelpoints_eventsub_bus_bridge.js
```

Empfänger:

```text
backend/modules/channelpoints.js
```

Zweck:

```text
Echte Twitch EventSub Redemptions ohne interne HTTP-Brücke an das Kanalpunkte-System übergeben.
```

## Tests

Erfolgreich:

```text
Twitch Reward Gewürzgurke
User EngelCGN
status executed
queue_group eventsub_redemption
execution.executed true
execution.failed false
```

## Offene Doku-Punkte

- Nach Completion-Policy-Livetest ggf. Details zu `FULFILLED`/`CANCELED` ergänzen.
- Weitere Reward-Typen später jeweils ergänzen.

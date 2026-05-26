# NEXT_CHAT_HANDOFF

Stand: 2026-05-26

## Kurzfassung

Wir arbeiten am Projekt `stream-control-center`, Bereich Kanalpunkte/Twitch Rewards. Der aktuelle stabile Arbeitsstand ist STEP516.

Aktueller Stand:

```text
Backend channelpoints.js: 0.9.4 · redemption-completion-policy
Dashboard channelpoints.js: UI v1.0.3 · color-picker-presets-ui
EventBus Bridge: channelpoints_eventsub_bus_bridge.js
```

## Wichtigste Entscheidung

Keine Shadow-/Live-/Allowlist-Bedienlogik mehr. Normale Regel:

```text
Reward inaktiv → nicht ausführen
Reward aktiv + Aktion vollständig → ausführen
Reward ohne Aktion → nicht aktivierbar / nicht ausführbar
```

## Erfolgreicher End-to-End-Test

```text
Reward: Gewürzgurke
reward_key: gewurzgurke
Twitch reward_id: 0e129f37-20bf-456e-ab87-06fa0d6e08fd
User: EngelCGN / engelcgn
status: executed
queue_group: eventsub_redemption
execution.executed: true
execution.failed: false
```

## Produktiver Flow

```text
Twitch Reward eingelöst
→ Twitch EventSub WebSocket
→ twitch.js
→ channelpoints_eventsub_bus_bridge.js
→ EventBus channelpoints.redemption / received
→ channelpoints.js
→ Redemptions-Tabelle
→ Sound-System
```

## Letzte umgesetzte Features

- Twitch Create/Update/Enable/Disable/Delete.
- Stale-ID Create-Fallback.
- EventBus-Redemption-Bridge.
- Redemption Store Update Bind Fix.
- Completion Policy:
  - Sofort bei Twitch abschließen
  - Nach erfolgreicher Ausführung abschließen
  - Bei Fehler Punkte zurückgeben
  - Twitch pausieren
- Dashboard-Farbauswahl mit Presets.

## Nächste sinnvolle Richtung

Nicht direkt neu bauen. Erst Completion Policy gegen Twitch live verifizieren:

```text
UNFULFILLED → erfolgreiche Aktion → FULFILLED
UNFULFILLED → Fehler/Blockierung → CANCELED
```

Danach weitere Reward-Typen anbinden.

## Wichtige Dateien

```text
backend/modules/channelpoints.js
backend/modules/channelpoints_eventsub_bus_bridge.js
htdocs/dashboard/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.css
docs/modules/channelpoints.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

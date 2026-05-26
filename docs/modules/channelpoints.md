# channelpoints.md

Stand: 2026-05-26

## Zweck

Das Kanalpunkte-Modul verwaltet lokale Rewards, synchronisiert/erstellt/aktualisiert/löscht Twitch Custom Rewards und verarbeitet echte Twitch-Redemptions über EventSub und EventBus.

## Dateien

```text
backend/modules/channelpoints.js
backend/modules/channelpoints_eventsub_bus_bridge.js
backend/modules/channelpoints_twitch_readonly_sync.js
htdocs/dashboard/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.css
```

## Aktuelle Versionen

```text
channelpoints.js: 0.9.4 · redemption-completion-policy
Dashboard: UI v1.0.3 · color-picker-presets-ui
```

## Zentrale Regel

```text
Reward inaktiv → nicht ausführen
Reward aktiv + Aktion vollständig → ausführen
Reward ohne Aktion → nicht aktivierbar / nicht ausführbar
```

## Twitch Reward Management

Routen:

```text
GET  /api/channelpoints/twitch/manage/status
POST /api/channelpoints/twitch/rewards/:idOrKey/push
POST /api/channelpoints/twitch/rewards/:idOrKey/enable
POST /api/channelpoints/twitch/rewards/:idOrKey/disable
POST /api/channelpoints/twitch/rewards/:idOrKey/delete
DELETE /api/channelpoints/twitch/rewards/:idOrKey
```

Twitch Delete braucht:

```json
{"confirm":"delete_from_twitch"}
```

`localAction`:

```text
disable
keep
delete
```

## Unterstützte Twitch Create/Update-Parameter

```text
title
cost
prompt
is_enabled
background_color
is_user_input_required
is_max_per_stream_enabled
max_per_stream
is_max_per_user_per_stream_enabled
max_per_user_per_stream
is_global_cooldown_enabled
global_cooldown_seconds
should_redemptions_skip_request_queue
is_paused
```

Dashboard-Felder:

```text
Twitch-Farbe
Sofort bei Twitch abschließen
Nach erfolgreicher Ausführung abschließen
Bei Fehler Punkte zurückgeben
Twitch pausieren
```

## Farbauswahl

Dashboard bietet:

```text
Farbauswahlfeld
Hex-Feld
Live-Vorschau
Preset-Buttons
Standard-Button zum Leeren
```

Gespeichert wird ein Hex-Code im Format `#RRGGBB`.

## EventSub / EventBus

Produktiver Flow:

```text
Twitch EventSub
→ twitch.js EventSub Cache/Audit
→ channelpoints_eventsub_bus_bridge.js
→ EventBus channelpoints.redemption / received
→ channelpoints.js Subscriber
→ Redemption speichern
→ Aktion ausführen
```

Statusroute:

```text
GET /api/channelpoints/eventsub/redemption/status
```

Wichtige Statusfelder:

```text
received
receivedFromBus
acceptedFromBus
stored
duplicates
unmapped
executed
failed
lastError
lastRewardKey
lastRedemptionId
lastBusRedemptionEventAt
```

## Erfolgreicher Referenztest

```text
Reward: Gewürzgurke
reward_key: gewurzgurke
Twitch reward_id: 0e129f37-20bf-456e-ab87-06fa0d6e08fd
User: EngelCGN / engelcgn
Status: executed
queue_group: eventsub_redemption
```

## Datenbank

Produktive Datenbank bleibt:

```text
D:\Streaming\stramAssets\data\sqlitepp.sqlite
```

Keine DB ersetzen. Keine neue DB für Kanalpunkte. Bestehende Tabellen additiv nutzen.

## Offene Punkte

- Completion Policy `FULFILLED`/`CANCELED` live gegen Twitch weiter prüfen.
- UI-Hilfetexte final glätten.
- Weitere Reward-Typen anbinden.

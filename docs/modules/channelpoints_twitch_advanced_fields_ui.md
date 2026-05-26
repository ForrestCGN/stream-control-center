# Channelpoints Twitch Advanced Fields UI

STEP514 / Dashboard UI v1.0.1 / Build `twitch-advanced-fields-ui`

## Ziel

Der Reward-Editor zeigt die Twitch-spezifischen Felder, die im Backend seit STEP513 bereits an Twitch Create/Update gemappt werden, direkt im Dashboard an.

## Geänderte Dateien

- `htdocs/dashboard/modules/channelpoints.js`
- `htdocs/dashboard/modules/channelpoints.css`

Backend-Dateien aus STEP513 bleiben enthalten, damit das ZIP vollständig auf dem aktuellen Stand aufsetzt:

- `backend/modules/channelpoints.js`
- `backend/modules/channelpoints_eventsub_bus_bridge.js`

## Neue Editor-Felder

Im Reward-Modal gibt es jetzt den Abschnitt **Twitch-Optionen**:

- `Twitch-Farbe`
  - schreibt nach `action_payload_json.twitch.background_color`
  - Beispiel: `#9147FF`
- `Twitch automatisch erfüllen`
  - schreibt `auto_fulfill`
  - zusätzlich in `action_payload_json.twitch.should_redemptions_skip_request_queue`
- `Twitch pausieren`
  - nutzt das vorhandene Feld `is_paused`

## Verhalten

- Keine neue Tabelle.
- Keine neue Route.
- Keine neue Bedienlogik wie Shadow/Live/Allowlist.
- Aktiv/Inaktiv bleibt weiterhin die normale Ausführungs-/Sichtbarkeitsfreigabe.
- Die Twitch-Felder werden beim Speichern in den bestehenden Reward-Daten abgelegt und beim Twitch-Push/Create/Update durch das Backend genutzt.

## Technische Details

Das Dashboard erhält folgende Helper:

- `normalizeTwitchColor`
- `twitchOptionsFromPayload`
- `applyTwitchOptionsFromForm`
- `renderTwitchOptionsSection`

Bei Sound-, Video-, Text-, Manual- und Custom-Aktionen bleiben vorhandene Twitch-Optionen im `action_payload_json.twitch` erhalten.

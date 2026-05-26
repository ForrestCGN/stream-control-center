# Kanalpunkte-System — Deep Dive

Aktueller Stand: v0.7.2 / `redemption-execution-flow`

## Zweck

Das Kanalpunkte-System verwaltet lokale Twitch-Kanalpunkte-Rewards analog zum Commands-System.

## Aktueller Funktionsumfang

- lokale Kategorien
- lokale Rewards
- Modal-Editor im Dashboard
- Sound-/Video-/Text-/Manual-Aktionen
- bestehendes Media-System für Sound/Video-Auswahl
- Media-Ausführung über `/api/sound/play`
- lokale Einlösungen/Testeinlösungen
- Verlauf in `channelpoints_redemptions`

## Wichtige Routen

- `GET /api/channelpoints/status`
- `GET /api/channelpoints/rewards`
- `POST /api/channelpoints/rewards`
- `PUT /api/channelpoints/rewards/:idOrKey`
- `POST /api/channelpoints/rewards/:idOrKey/delete`
- `POST /api/channelpoints/rewards/:idOrKey/execute`
- `GET /api/channelpoints/media-execution-check?reward=<key>`
- `GET /api/channelpoints/redemptions`
- `POST /api/channelpoints/redemptions/test`

## Noch nicht enthalten

- echter Twitch Reward Sync
- echte EventSub Redemption-Verarbeitung
- Twitch Reward aktiv/deaktivieren per API
- zentrale Textverwaltung für Textgruppen/Varianten

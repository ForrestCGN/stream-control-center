# Channelpoints Deep Dive

Aktueller Stand: **v0.7.3** / Build `text-reward-redemption-polish`.

## Ziele dieses Stands

- Kanalpunkte-Editor analog zum Commands-Editor.
- Rewards lokal erstellen, bearbeiten, kopieren, deaktivieren und löschen.
- Sound-/Video-Rewards über bestehende Medienauswahl konfigurieren.
- Testeinlösungen lokal ausführen und in `channelpoints_redemptions` speichern.
- Text-Rewards lokal ausführbar machen: Einzeltext wird als Ergebnis der Einlösung gespeichert; Textgruppen sind vorbereitet.
- Keine Twitch-Schreibzugriffe in diesem Stand.

## Wichtige Routen

- `GET /api/channelpoints/status`
- `GET /api/channelpoints/rewards`
- `POST /api/channelpoints/rewards`
- `PUT /api/channelpoints/rewards/:idOrKey`
- `POST /api/channelpoints/rewards/:idOrKey/delete`
- `POST /api/channelpoints/rewards/:idOrKey/execute`
- `GET /api/channelpoints/media-execution-check?reward=<key>`
- `GET /api/channelpoints/text-execution-check?reward=<key>`
- `GET /api/channelpoints/redemptions?limit=25`
- `POST /api/channelpoints/redemptions/test`

## Ausführung

### Sound / Video

Sound- und Video-Rewards werden weiterhin über die vorhandene Sound-System-Brücke ausgeführt:

```text
mediaId -> /api/sound/play
```

### Text

Text-Rewards werden lokal als Test-/Einlösungs-Ergebnis gespeichert:

```text
Reward -> action_type chat_message -> result_json.type=text
```

Einzeltext funktioniert bereits als gespeicherte Konfiguration. Text-Key/Textgruppen sind vorbereitet und werden später an die zentrale Textverwaltung angebunden.

## Datenbank

Produktive DB bleibt unverändert: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.

Genutzte Tabellen:

- `channelpoints_categories`
- `channelpoints_rewards`
- `channelpoints_redemptions`

Keine Tabelle wird ersetzt oder gelöscht.

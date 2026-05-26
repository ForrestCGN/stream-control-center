# Kanalpunkte-System Deep Dive

Aktueller Stand: Backend `channelpoints` v0.6.0 mit Media Execution Bridge, Dashboard `channelpoints` v0.6.1 (`friendly-media-action-editor`).

## Ziel

Das Kanalpunkte-System soll dieselbe Bedienlogik wie das Command-System verwenden, aber für Twitch Custom Rewards. Die technische Speicherung bleibt sauber in SQLite, die normale Bedienung soll aber nicht über rohe JSON-/ID-Felder laufen.

## Dashboard v0.6.1

Die Reward-Bearbeitung wurde benutzerfreundlicher gemacht:

- Aktion wird über **Was soll passieren?** gewählt.
- Normale Auswahl: `Keine Aktion / nur verwalten`, `Sound abspielen`, `Video anzeigen`, `Erweitert / technische Aktion`.
- Technische Felder wie `action_type`, `action_key`, `queue_mode`, `priority` und `action_payload_json` liegen nur noch im Bereich **Erweitert**.
- Bei `Sound abspielen` und `Video anzeigen` werden intern automatisch gesetzt:
  - `action_type = media`
  - `action_key = play_audio_media` oder `play_video_media`
  - `media_role = sound` oder `video`
  - `action_payload_json` mit `mediaType`, `volume`, `target`, `outputTarget`, `queueIfBusy`, `playBehavior`
- Medienausführung nutzt dasselbe Pattern wie Commands: `mediaId -> /api/sound/play`.
- Buttons für **Ausführung prüfen** und **Reward testen** nutzen die Backend-Routen aus v0.6.0.

## Backend v0.6.0

Die Backend Media Execution Bridge ist vorbereitet und getestet über:

- `GET /api/channelpoints/rewards/:idOrKey/execution-check`
- `GET /api/channelpoints/media-execution-check?reward=<keyOderId>`
- `POST /api/channelpoints/rewards/:idOrKey/execute`
- `GET /api/channelpoints/execute?reward=<keyOderId>`
- `POST /api/channelpoints/execute`

## Wichtige Regel

Commands und Kanalpunkte dürfen Medien nicht direkt über alte Sonderrouten ausführen. Gemeinsames Ziel ist:

```text
mediaId -> /api/sound/play Payload
```

## Noch offen

- Twitch Custom Reward Sync/API-Schreibzugriffe.
- EventSub-Redemption-Handling.
- Redemption-Queue und History im Dashboard.
- Rechte-/Rollenprüfung für produktive Reward-Ausführung.

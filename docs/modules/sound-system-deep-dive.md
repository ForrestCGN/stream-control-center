# Sound-System Deep Dive

> Stand: 2026-05-26 / STEP477. Quelle: aktueller Upload `backend.zip`. Vor Codeänderungen weiterhin die echte Datei aus GitHub/dev oder Live vollständig prüfen.

## Zweck

`backend/modules/sound_system.js` ist die zentrale Audio-/Medien-Schicht. Es verwaltet Sound-Queue, aktuelle Wiedergabe, Bundles, Prioritäten, Client-Acknowledgements, EventBus-Kommandos, DB-Settings und die Schnittstelle für Alerts, TTS, VIP-Sounds und weitere Module.

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/sound/settings` |
| `POST` | `/api/sound/settings` |
| `GET` | `/api/sound/generated/beep.wav` |
| `GET` | `/api/sound/routes` |
| `GET` | `/api/sound/integration-check` |
| `GET` | `/api/sound/status` |
| `GET` | `/api/sound/eventbus/status` |
| `GET` | `/api/sound/eventbus/reset` |
| `GET` | `/api/sound/eventbus/test` |
| `POST` | `/api/sound/eventbus/test` |
| `GET` | `/api/sound/eventbus/command/status` |
| `GET` | `/api/sound/eventbus/command/reset` |
| `GET` | `/api/sound/eventbus/command/test` |
| `POST` | `/api/sound/eventbus/command/test` |
| `GET` | `/api/sound/eventbus/command/dry-run` |
| `POST` | `/api/sound/eventbus/command/dry-run` |
| `GET` | `/api/sound/eventbus/command/play-test` |
| `POST` | `/api/sound/eventbus/command/play-test` |
| `GET` | `/api/sound/current` |
| `GET` | `/api/sound/queue` |
| `GET` | `/api/sound/list` |
| `GET` | `/api/sound/config` |
| `POST` | `/api/sound/reload` |
| `GET` | `/api/sound/play` |
| `POST` | `/api/sound/play` |
| `POST` | `/api/sound/bundle` |
| `POST` | `/api/sound/stop` |
| `POST` | `/api/sound/skip` |
| `POST` | `/api/sound/clear` |
| `POST` | `/api/sound/pause` |
| `POST` | `/api/sound/resume` |
| `POST` | `/api/sound/reset` |
| `POST` | `/api/sound/client/ready` |
| `POST` | `/api/sound/client/audio-started` |
| `POST` | `/api/sound/client/audio-ended` |
| `POST` | `/api/sound/client/error` |

## Hauptfunktionen / interne Bereiche

- Settings: `ensureSoundSettingsSchema`, `getSoundSettings`, `saveSoundSettings`, `deepMergeRuntimeSettings`, `pickEffectiveSettings`.
- Status/Routen: `publicState`, `publicSoundRoutes`, `publicSoundIntegrationCheck`.
- Queue/Wiedergabe: Play, Bundle, Stop, Skip, Clear, Pause, Resume, Reset.
- Media/Assets: Sound-Liste, Pfadauflösung, generated beep, Media-Asset-Auflösung.
- EventBus: `sound.*` Events, command dry-run/play-test/status/reset.
- Client-Ack: `client/ready`, `client/audio-started`, `client/audio-ended`, `client/error`.

## Runtime-Status / Variablen

- `state.current`: aktuell laufendes Sound-Item.
- `state.queue`: wartende Sounds.
- `state.paused`: Queue-Verarbeitung pausiert.
- EventBus-Diagnose: Zähler, letzte Events, Command-Dry-Run/Play-Test.

## Datenbanktabellen

| Tabelle | Zweck | Wichtige Spalten |
|---|---|---|
| `sound_settings` | DB-Settings für Dashboard/Runtime | `key`, `value_json`, `updated_at`, `updated_by` |

## Abhängigkeiten

- `communication_bus`
- `helper_media`
- `helper_settings`
- Consumer: Alerts, TTS, VIP-Sound-Overlay, mögliche SoundAlerts/Challenges

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/routes"
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/integration-check"
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/queue"
```

## Offene Punkte

- Keine Queue-/Bundle-/Priority-Logik ohne expliziten STEP ändern.
- Dashboard-Konfig für Outputs, Prioritäten, Kategorien und Overrides weiter ausbauen.

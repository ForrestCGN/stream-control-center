# Sound System

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Zentrale Audio-/Medien-Schicht für Alerts, Modul-Sounds, VIP-Sounds, SoundAlerts, TTS und Discord-/Stream-Ausgaben.

## Betroffene Backend-Dateien

- `backend\modules\sound_system.js`
- `backend\modules\vip_sound_overlay.js`

## Erkannte technische Merkmale

### `sound_system.js`

- Version: 0.1.18, 1.0.0, 1.0.0
- Größe: 144648 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./communication_bus`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_media`
  - `child_process`
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `GET ${prefix}/generated/beep.wav`
  - `GET ${prefix}/routes`
  - `GET ${prefix}/integration-check`
  - `GET ${prefix}/status`
  - `GET ${prefix}/eventbus/status`
  - `GET ${prefix}/eventbus/reset`
  - `GET ${prefix}/eventbus/test`
  - `POST ${prefix}/eventbus/test`
  - `GET ${prefix}/eventbus/command/status`
  - `GET ${prefix}/eventbus/command/reset`
  - `GET ${prefix}/eventbus/command/test`
  - `POST ${prefix}/eventbus/command/test`
  - `GET ${prefix}/eventbus/command/dry-run`
  - `POST ${prefix}/eventbus/command/dry-run`
  - `GET ${prefix}/eventbus/command/play-test`
  - `POST ${prefix}/eventbus/command/play-test`
  - `GET ${prefix}/current`
  - `GET ${prefix}/queue`
  - `GET ${prefix}/list`
  - `GET ${prefix}/config`
  - `POST ${prefix}/reload`
  - `POST ${prefix}/play`
  - `GET ${prefix}/play`
  - `POST ${prefix}/bundle`
  - `POST ${prefix}/stop`
  - `POST ${prefix}/skip`
  - `POST ${prefix}/clear`
  - `POST ${prefix}/pause`
  - `POST ${prefix}/resume`
  - `POST ${prefix}/reset`
  - ... plus 5 weitere erkannte Routenzeilen

### `vip_sound_overlay.js`

- Version: 1.8.15
- Größe: 209864 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./communication_bus`
  - `./helpers/helper_chat_output`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_media`
  - `./helpers/helper_messages`
  - `./helpers/helper_settings`
  - `./helpers/helper_twitch_roles`
  - `fs`
  - `http`
  - `https`

- erkannte Routen/Hinweise:
  - `GET ${prefix}/routes`
  - `GET ${prefix}/integration-check`
  - `GET ${prefix}/eventbus/status`
  - `GET ${prefix}/eventbus/test`
  - `POST ${prefix}/eventbus/test`
  - `POST ${prefix}/eventbus/reset`
  - `GET ${prefix}/eventbus/reset`
  - `GET ${prefix}/eventbus/sound-command/status`
  - `GET ${prefix}/eventbus/sound-command/test`
  - `POST ${prefix}/eventbus/sound-command/test`
  - `GET ${prefix}/eventbus/sound-command/dry-run`
  - `POST ${prefix}/eventbus/sound-command/dry-run`
  - `GET ${prefix}/eventbus/sound-command/play-test`
  - `POST ${prefix}/eventbus/sound-command/play-test`
  - `GET ${prefix}/eventbus/sound-command/mode`
  - `POST ${prefix}/eventbus/sound-command/mode`
  - `POST ${prefix}/eventbus/sound-command/reset`
  - `GET ${prefix}/eventbus/sound-command/reset`
  - `POST ${prefix}/reload`
  - `GET ${prefix}/state`
  - `GET ${prefix}/status`
  - `GET ${prefix}/db/status`
  - `GET ${prefix}/settings`
  - `POST ${prefix}/settings/upsert`
  - `POST ${prefix}/settings/delete`
  - `POST ${prefix}/settings/reset-defaults`
  - `GET ${prefix}/config`
  - `GET ${prefix}/texts`
  - `GET ${prefix}/texts/event-keys`
  - `POST ${prefix}/texts/upsert`
  - ... plus 39 weitere erkannte Routenzeilen

## Aktueller Doku-Status

- Erste strukturierte Moduldoku vorhanden.
- Vor Funktionsänderungen muss die echte Datei erneut vollständig aus GitHub/dev oder aus dem aktuellen Live-/ZIP-Stand geprüft werden.
- Keine Funktionalität wurde in diesem STEP geändert.

## Offene Punkte / spätere Prüfung

- Routen und Dashboard-Anbindung bei nächster echter Moduländerung erneut prüfen.
- Config-/DB-/Message-Nutzung genauer dokumentieren, sobald das Modul fachlich angefasst wird.
- Falls Versionskennung fehlt, später bewusst und ohne Funktionsänderung ergänzen.

## Tests bei späteren Änderungen

- `node --check` für jede geänderte JS-Datei.
- relevante `/api/.../status`- oder Modulrouten gezielt prüfen.
- Dashboard-/Overlay-Flows nur testen, wenn das Modul wirklich betroffen ist.

# Message Rotator

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Automatische und manuelle Chat-/Hinweis-Ausgaben mit Live-Gating, Cooldowns und Message-/Textsystem.

## Betroffene Backend-Dateien

- `backend\modules\message_rotator.js`
- `backend\modules\messages.js`
- `backend\modules\chat_output.js`

## Erkannte technische Merkmale

### `message_rotator.js`

- Version: keine klare Versionskennung erkannt
- Größe: 68333 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_routes`
  - `./helpers/helper_security`
  - `./helpers/helper_settings`
  - `./helpers/helper_texts`
  - `./twitch`
  - `fs`
  - `http`
  - `https`
  - `path`
  - `url`

- erkannte Routen/Hinweise:
  - `? /api/message-rotator/status`
  - `? /api/message-rotator/config`
  - `? /api/message-rotator/settings`
  - `? /api/message-rotator/admin/settings`
  - `? /api/message-rotator/admin/texts`
  - `? /api/message-rotator/routes`
  - `? /api/message-rotator/integration-check`
  - `? /api/message-rotator/reload`
  - `? /api/message-rotator/start`
  - `? /api/message-rotator/stop`
  - `? /api/message-rotator/tick`
  - `? /api/message-rotator/next`
  - `? /api/message-rotator/manual`
  - `? /api/message-rotator/live-status`
  - `? /api/message-rotator`

### `messages.js`

- Version: keine klare Versionskennung erkannt
- Größe: 23204 Bytes
- Merkmale: Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_core`
  - `./helpers/helper_messages`
  - `./helpers/helper_routes`
  - `./helpers/helper_security`
  - `./helpers/helper_texts`
  - `fs`

- erkannte Routen/Hinweise:
  - `? /api/messages/status`
  - `? /api/messages/config`
  - `? /api/messages/settings`
  - `? /api/messages/routes`
  - `? /api/messages/integration-check`
  - `? /api/messages/reload`
  - `? /api/messages/random`
  - `? /api/messages/render`
  - `? /api/messages/send`
  - `? /api/messages/scheduler/start`
  - `? /api/messages/scheduler/stop`
  - `? /api/messages/scheduler/status`
  - `? /api/messages`

### `chat_output.js`

- Version: keine klare Versionskennung erkannt
- Größe: 1505 Bytes
- Merkmale: Config-Bezug erkannt, Message/Text-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_chat_output`
  - `./helpers/helper_messages`
  - `./helpers/helper_routes`

- erkannte Routen/Hinweise:
  - `? /api/chat-output/status`
  - `? /api/chat-output/send`
  - `? /api/chat-output/reload`

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

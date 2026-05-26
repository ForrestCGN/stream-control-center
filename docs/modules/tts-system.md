# Tts System

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

TTS-System und zugehörige Events. Änderungen müssen Sound-System, Queueing, Rechte und Ausgabeziele beachten.

## Betroffene Backend-Dateien

- `backend\modules\tts_system.js`

## Erkannte technische Merkmale

### `tts_system.js`

- Version: keine klare Versionskennung erkannt
- Größe: 91039 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_media`
  - `./helpers/helper_settings`
  - `./helpers/helper_texts`
  - `child_process`
  - `crypto`
  - `fs`
  - `http`
  - `https`
  - `path`

- erkannte Routen/Hinweise:
  - `ALL /api/tts/run`
  - `ALL /api/tts/say`
  - `ALL /api/tts/done`
  - `GET /api/tts/status`
  - `GET /api/tts/overlay-state`
  - `ALL /api/tts/on`
  - `ALL /api/tts/off`
  - `ALL /api/tts/stop`
  - `ALL /api/tts/clear`
  - `ALL /api/tts/reload`
  - `ALL /api/tts/command`
  - `GET /api/tts/settings`
  - `POST /api/tts/settings/upsert`
  - `GET /api/tts/config`
  - `GET /api/tts/voices`
  - `GET /api/tts/routes`
  - `GET /api/tts/integration-check`
  - `GET /api/tts/admin/settings`
  - `POST /api/tts/admin/settings`
  - `GET /api/tts/admin/texts`
  - `POST /api/tts/admin/texts`
  - `GET /api/tts/events`
  - `GET /api/tts/stats`
  - `GET /api/tts/stats/users`
  - `ALL /api/tts/prepare-alert`
  - `ALL /api/tts/synthesize`
  - `? /api/tts/run`
  - `? /api/tts/say`
  - `? /api/tts/done`
  - `? /api/tts/status`
  - ... plus 20 weitere erkannte Routenzeilen

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

# Tagebuch Todo

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Tagebuch- und ToDo-Systeme mit Discord-/DB-/Textvarianten-Bezug.

## Betroffene Backend-Dateien

- `backend\modules\tagebuch.js`
- `backend\modules\todo.js`

## Erkannte technische Merkmale

### `tagebuch.js`

- Version: keine klare Versionskennung erkannt
- Größe: 57775 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_routes`
  - `./helpers/helper_security`
  - `./helpers/helper_settings`
  - `./helpers/helper_texts`
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `? /api/tagebuch/status`
  - `? /api/tagebuch/config`
  - `? /api/tagebuch/settings`
  - `? /api/tagebuch/routes`
  - `? /api/tagebuch/integration-check`
  - `? /api/tagebuch/reload`
  - `? /api/tagebuch/stream/start`
  - `? /api/tagebuch/stream/end`
  - `? /api/tagebuch/entry`
  - `? /api/tagebuch/reset`
  - `? /api/tagebuch/stats`
  - `? /api/tagebuch/stats/top`
  - `? /api/tagebuch/stats/today`
  - `? /api/tagebuch/stats/user`
  - `? /api/tagebuch/admin/settings`
  - `? /api/tagebuch/admin/texts`
  - `? /api/tagebuch`

### `todo.js`

- Version: keine klare Versionskennung erkannt
- Größe: 42382 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_core`
  - `./helpers/helper_routes`
  - `./helpers/helper_security`
  - `./helpers/helper_settings`
  - `./helpers/helper_texts`
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `? /api/todo/status`
  - `? /api/todo/config`
  - `? /api/todo/settings`
  - `? /api/todo/routes`
  - `? /api/todo/integration-check`
  - `? /api/todo/reload`
  - `? /api/todo/add`
  - `? /api/todo/stats`
  - `? /api/todo/stats/top`
  - `? /api/todo/stats/today`
  - `? /api/todo/admin/settings`
  - `? /api/todo/admin/texts`
  - `? /api/todo`

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

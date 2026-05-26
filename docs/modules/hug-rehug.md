# Hug Rehug

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Hug-/Rehug-System als Community-Funktion mit Backend-/DB-/Textlogik.

## Betroffene Backend-Dateien

- `backend\modules\hug.js`

## Erkannte technische Merkmale

### `hug.js`

- Version: keine klare Versionskennung erkannt
- Größe: 69651 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_chat_output`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_routes`
  - `./twitch`
  - `fs`

- erkannte Routen/Hinweise:
  - `? /api/hug/status`
  - `? /api/hug/config`
  - `? /api/hug/settings`
  - `? /api/hug/routes`
  - `? /api/hug/integration-check`
  - `? /api/hug/reload`
  - `? /api/hug/action`
  - `? /api/hug/stats`
  - `? /api/hug/cmd`
  - `? /api/hug/statscmd`
  - `? /api/hug/top`
  - `? /api/hug/command`
  - `? /api/hug/db/status`
  - `? /api/dashboard/community/hug/status`
  - `? /api/hug/text-store/status`
  - `? /api/hug/text-store/reload`
  - `? /api/hug/db/output-mode`
  - `? /api/hug/types`
  - `? /api/hug/texts`
  - `? /api/hug/admin/text-pairs`
  - `? /api/dashboard/community/hug/text-pairs`
  - `? /api/hug/admin/hug-all-texts`
  - `? /api/dashboard/community/hug/hug-all-texts`
  - `? /api/hug/admin/response-texts`
  - `? /api/dashboard/community/hug/response-texts`
  - `? /api/hug/admin/top-title-texts`
  - `? /api/dashboard/community/hug/top-title-texts`
  - `? /api/hug`
  - `? /api/rehug`
  - `? /api/hug-system`
  - ... plus 2 weitere erkannte Routenzeilen

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

# Core Overview

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Zentrale Backend-Grundlagen: Datenbank, Kommunikation/EventBus, Security, Diagnose und Audit. Diese Systeme dürfen nicht nebenbei umgebaut werden.

## Betroffene Backend-Dateien

- `backend\modules\communication_bus.js`
- `backend\modules\sqlite_core.js`
- `backend\modules\database_core.js`
- `backend\modules\security.js`
- `backend\modules\diagnostics.js`
- `backend\modules\audit_log.js`

## Erkannte technische Merkmale

### `communication_bus.js`

- Version: 0.8.1
- Größe: 29514 Bytes
- Merkmale: Config-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_communication`
  - `./helpers/helper_config`
  - `./helpers/helper_security_context`

- erkannte Routen/Hinweise:
  - `GET /api/communication/status`
  - `GET /api/communication/test`
  - `GET /api/communication/test-alert`
  - `GET /api/communication/mirror-alert`
  - `GET /api/communication/ack`
  - `GET /api/communication/replay`
  - `GET /api/communication/watchdog`
  - `GET /api/communication/issue`
  - `GET /api/communication/client/forget`
  - `GET /api/communication/test-vip-overlay-preview`
  - `GET /api/communication/test-vip-overlay`
  - `GET /api/communication/reset`
  - `? /api/communication/status`
  - `? /api/communication/test`
  - `? /api/communication/test-alert`
  - `? /api/communication/mirror-alert`
  - `? /api/communication/ack`
  - `? /api/communication/replay`
  - `? /api/communication/watchdog`
  - `? /api/communication/issue`
  - `? /api/communication/client/forget`
  - `? /api/communication/test-vip-overlay-preview`
  - `? /api/communication/test-vip-overlay`
  - `? /api/communication/reset`

### `sqlite_core.js`

- Version: keine klare Versionskennung erkannt
- Größe: 3914 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `path`

### `database_core.js`

- Version: keine klare Versionskennung erkannt
- Größe: 521 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_routes`

- erkannte Routen/Hinweise:
  - `? /api/database/status`
  - `? /api/system/database/status`

### `security.js`

- Version: keine klare Versionskennung erkannt
- Größe: 2100 Bytes
- Merkmale: Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_routes`
  - `./helpers/helper_security`

- erkannte Routen/Hinweise:
  - `? /api/security/status`

### `diagnostics.js`

- Version: keine klare Versionskennung erkannt
- Größe: 872 Bytes
- Merkmale: Event/WebSocket/Broadcast-Bezug erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_core`
  - `./helpers/helper_routes`

- erkannte Routen/Hinweise:
  - `? /api/diag/ping`
  - `? /api/diag/env`
  - `? /api/diag/ws`

### `audit_log.js`

- Version: 0.2.0
- Größe: 7068 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_audit_log`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_security_context`

- erkannte Routen/Hinweise:
  - `GET /api/audit/status`
  - `GET /api/audit/recent`
  - `GET /api/audit/test`
  - `POST /api/audit/clear-memory`
  - `GET /api/audit/clear-memory`
  - `? /api/audit/status`
  - `? /api/audit/recent`
  - `? /api/audit/test`
  - `? /api/audit/clear-memory`

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

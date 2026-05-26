# Dashboard Backend

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Backend-Routen und Security-/Auth-Grundlagen für das Dashboard/Control-Center.

## Betroffene Backend-Dateien

- `backend\modules\dashboard_auth.js`
- `backend\modules\dashboard_controlcenter.js`

## Erkannte technische Merkmale

### `dashboard_auth.js`

- Version: keine klare Versionskennung erkannt
- Größe: 30692 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `crypto`

- erkannte Routen/Hinweise:
  - `GET /api/auth/status`
  - `GET /api/auth/session`
  - `POST /api/auth/bootstrap-owner-local`
  - `POST /api/auth/logout`
  - `GET /api/auth/twitch/login`
  - `GET /api/auth/twitch/callback`
  - `GET /api/auth/roles`
  - `GET /api/auth/audit`
  - `? /api/auth/status`
  - `? /api/auth/session`
  - `? /api/auth/bootstrap-owner-local`
  - `? /api/auth/logout`
  - `? /api/auth/twitch/login`
  - `? /api/auth/twitch/callback`
  - `? /api/auth/roles`
  - `? /api/auth/audit`
  - `? /api/auth/twitch`

### `dashboard_controlcenter.js`

- Version: keine klare Versionskennung erkannt
- Größe: 4993 Bytes
- Merkmale: Config-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `GET /api/dashboard/controlcenter/status`
  - `GET /api/dashboard/controlcenter/navigation`
  - `GET /api/dashboard/controlcenter/roles`
  - `GET /api/dashboard/controlcenter/permissions`
  - `GET /api/dashboard/controlcenter/access`
  - `GET /api/dashboard/controlcenter/streamdesk`
  - `GET /api/dashboard/controlcenter/twitch-auth`
  - `GET /api/dashboard/controlcenter/logging`
  - `GET /api/dashboard/controlcenter/admin-configs`
  - `GET /api/dashboard/controlcenter/config/:id`
  - `POST /api/dashboard/controlcenter/config/:id`
  - `? /api/dashboard/controlcenter/status`
  - `? /api/dashboard/controlcenter/navigation`
  - `? /api/dashboard/controlcenter/roles`
  - `? /api/dashboard/controlcenter/permissions`
  - `? /api/dashboard/controlcenter/access`
  - `? /api/dashboard/controlcenter/streamdesk`
  - `? /api/dashboard/controlcenter/twitch-auth`
  - `? /api/dashboard/controlcenter/logging`
  - `? /api/dashboard/controlcenter/admin-configs`
  - `? /api/dashboard/controlcenter/config/:id`

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

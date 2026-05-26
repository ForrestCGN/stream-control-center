# Clips

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Clip-System für Twitch-Clip-Erstellung, lokale Replay-Buffer-Anbindung, Titelbildung und Discord-/DB-Integration.

## Betroffene Backend-Dateien

- `backend\modules\clips.js`

## Erkannte technische Merkmale

### `clips.js`

- Version: keine klare Versionskennung erkannt
- Größe: 89534 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_messages`
  - `./helpers/helper_settings`
  - `./helpers/helper_texts`
  - `./obs_shared`
  - `./twitch`
  - `./twitch_presence`
  - `crypto`
  - `fs`
  - `http`
  - `https`
  - `path`

- erkannte Routen/Hinweise:
  - `GET /api/clip/status`
  - `GET /api/clip/config`
  - `GET /api/clip/settings`
  - `GET /api/clip/routes`
  - `GET /api/clip/integration-check`
  - `POST /api/clip/reload`
  - `GET /api/clip/title`
  - `GET /api/clip/register`
  - `POST /api/clip/register`
  - `GET /api/clip/history`
  - `GET /api/clip/create`
  - `POST /api/clip/create`
  - `GET /api/clip/job/:jobId`
  - `? /api/clip/status`
  - `? /api/clip`
  - `? /api/dashboard/clips/settings`
  - `? /api/dashboard/clips/texts`
  - `? /api/clips`
  - `? /api/clip/config`
  - `? /api/clip/settings`
  - `? /api/clip/routes`
  - `? /api/clip/integration-check`
  - `? /api/clip/reload`
  - `? /api/clip/title`
  - `? /api/clip/register`
  - `? /api/clip/history`
  - `? /api/clip/create`
  - `? /api/clip/job/:jobId`
  - `? /api/clip/admin/settings`
  - `? /api/clip/admin/texts`

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

# Clip Shoutout Vso

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Shoutout-/VSO-System mit Queue, Timeline, Statistik, Streamtag-Limit und offizieller Twitch-Shoutout-Anbindung.

## Betroffene Backend-Dateien

- `backend\modules\clip_shoutout.js`

## Erkannte technische Merkmale

### `clip_shoutout.js`

- Version: 0.2.10
- Größe: 126574 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./commands`
  - `./communication_bus`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./stream_status`
  - `./twitch`
  - `./twitch_presence`
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `GET ${API_PREFIX}/status`
  - `GET ${API_PREFIX}/clips`
  - `GET ${API_PREFIX}/run`
  - `POST ${API_PREFIX}/run`
  - `GET /api/clip/shoutout`
  - `POST /api/clip/shoutout`
  - `GET ${API_PREFIX}/settings`
  - `POST ${API_PREFIX}/settings`
  - `GET ${API_PREFIX}/queue`
  - `GET ${API_PREFIX}/timeline`
  - `GET ${API_PREFIX}/stats`
  - `GET ${API_PREFIX}/stats/user`
  - `POST ${API_PREFIX}/display-queue/remove`
  - `POST ${API_PREFIX}/display-queue/retry`
  - `POST ${API_PREFIX}/queue/remove`
  - `POST ${API_PREFIX}/queue/retry`
  - `GET ${API_PREFIX}/official/auth-status`
  - `? /api/clip-shoutout`
  - `? /api/clip/shoutout`
  - `? /api/stream-status/status`

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

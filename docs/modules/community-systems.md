# Community Systems

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Weitere Community- und Stream-Funktionen wie Challenges, Deathcounter, Credits, Fireworks, Ko-fi, Loyalty und Commands.

## Betroffene Backend-Dateien

- `backend\modules\challenge.js`
- `backend\modules\deathcounter_v2.js`
- `backend\modules\credits.js`
- `backend\modules\fireworks_api.js`
- `backend\modules\kofi.js`
- `backend\modules\loyalty.js`
- `backend\modules\commands.js`

## Erkannte technische Merkmale

### `challenge.js`

- Version: keine klare Versionskennung erkannt
- Größe: 46835 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_messages`
  - `./helpers/helper_routes`
  - `./twitch_presence`
  - `fs`
  - `http`
  - `https`
  - `path`

- erkannte Routen/Hinweise:
  - `? /api/challenge`
  - `? /api/challenge/start`
  - `? /api/challenge/status`
  - `? /api/challenge/remove-next`
  - `? /api/challenge/remove`
  - `? /api/challenge/reset`
  - `? /api/challenge/reload`
  - `? /api/challenge/config`
  - `? /api/challenge/settings`
  - `? /api/challenge/routes`
  - `? /api/challenge/integration-check`
  - `? /api/challenge/stats`
  - `? /api/challenge/stats/top`
  - `? /api/challenge/stats/user`

### `deathcounter_v2.js`

- Version: keine klare Versionskennung erkannt
- Größe: 157058 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_chat_output`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_settings`
  - `./helpers/helper_texts`
  - `fs`
  - `http`
  - `https`
  - `path`
  - `url`

- erkannte Routen/Hinweise:
  - `USE /api/deathcounter/v2`
  - `GET ${API_PREFIX}/status`
  - `GET ${API_PREFIX}/config`
  - `GET ${API_PREFIX}/settings`
  - `GET ${API_PREFIX}/admin/settings`
  - `POST ${API_PREFIX}/admin/settings`
  - `GET ${API_PREFIX}/admin/texts`
  - `POST ${API_PREFIX}/admin/texts`
  - `GET ${API_PREFIX}/routes`
  - `GET ${API_PREFIX}/integration-check`
  - `GET ${API_PREFIX}/storage/preview`
  - `GET ${API_PREFIX}/storage/validate`
  - `POST ${API_PREFIX}/storage/import`
  - `GET ${API_PREFIX}/storage/consistency`
  - `GET ${API_PREFIX}/storage/read-test`
  - `GET ${API_PREFIX}/storage/export`
  - `POST ${API_PREFIX}/storage/export`
  - `GET ${API_PREFIX}/storage/backup`
  - `POST ${API_PREFIX}/storage/backup`
  - `POST ${API_PREFIX}/reload`
  - `GET /api/deathcounter/v2/command`
  - `POST /api/deathcounter/v2/command`
  - `GET /api/deathcounter/v2/state`
  - `GET /api/deathcounter/v2/players`
  - `GET /api/deathcounter/v2/overlay`
  - `GET /api/deathcounter/v2/show`
  - `POST /api/deathcounter/v2/show`
  - `GET /api/deathcounter/v2/hide`
  - `POST /api/deathcounter/v2/hide`
  - `GET /api/deathcounter/v2/overlay/show`
  - ... plus 48 weitere erkannte Routenzeilen

### `credits.js`

- Version: keine klare Versionskennung erkannt
- Größe: 1141 Bytes
- Merkmale: keine besonderen Marker automatisch erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_core`
  - `./helpers/helper_routes`

- erkannte Routen/Hinweise:
  - `? /api/credits`

### `fireworks_api.js`

- Version: keine klare Versionskennung erkannt
- Größe: 1416 Bytes
- Merkmale: Event/WebSocket/Broadcast-Bezug erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_core`

- erkannte Routen/Hinweise:
  - `GET /api/fireworks`
  - `GET /api/fireworks/stop`
  - `GET /api/fireworks/clear`
  - `? /api/fireworks`
  - `? /api/fireworks/stop`
  - `? /api/fireworks/clear`

### `kofi.js`

- Version: keine klare Versionskennung erkannt
- Größe: 26238 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_routes`
  - `http`
  - `url`

- erkannte Routen/Hinweise:
  - `? /api/alerts/kofi/status`
  - `? /api/alerts/kofi/reload`
  - `? /api/alerts/kofi/config`
  - `? /api/alerts/kofi/test`
  - `? /api/alerts/kofi/webhook`

### `loyalty.js`

- Version: 0.1.11
- Größe: 115726 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_settings`
  - `./helpers/helper_texts`
  - `crypto`

- erkannte Routen/Hinweise:
  - `GET /api/loyalty/status`
  - `GET /api/loyalty/config`
  - `GET /api/loyalty/settings`
  - `POST /api/loyalty/settings`
  - `GET /api/loyalty/users`
  - `GET /api/loyalty/users/:login`
  - `GET /api/loyalty/balance/:login`
  - `GET /api/loyalty/transactions`
  - `POST /api/loyalty/transactions/adjust`
  - `GET /api/loyalty/test/watch`
  - `GET /api/loyalty/watch/heartbeat`
  - `POST /api/loyalty/watch/heartbeat`
  - `GET /api/loyalty/watch/states`
  - `GET /api/loyalty/stream-state`
  - `GET /api/loyalty/stream-state/start`
  - `POST /api/loyalty/stream-state/start`
  - `GET /api/loyalty/stream-state/stop`
  - `POST /api/loyalty/stream-state/stop`
  - `GET /api/loyalty/stream-state/clear-override`
  - `POST /api/loyalty/stream-state/clear-override`
  - `GET /api/loyalty/stream-state/refresh-auto`
  - `POST /api/loyalty/stream-state/refresh-auto`
  - `GET /api/loyalty/presence/status`
  - `GET /api/loyalty/presence/run-once`
  - `POST /api/loyalty/presence/run-once`
  - `GET /api/loyalty/runner/status`
  - `GET /api/loyalty/runner/start`
  - `POST /api/loyalty/runner/start`
  - `GET /api/loyalty/runner/stop`
  - `POST /api/loyalty/runner/stop`
  - ... plus 39 weitere erkannte Routenzeilen

### `commands.js`

- Version: keine klare Versionskennung erkannt
- Größe: 48700 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_core`
  - `http`

- erkannte Routen/Hinweise:
  - `GET ${API_PREFIX}/status`
  - `GET ${API_PREFIX}/list`
  - `GET ${API_PREFIX}/catalog`
  - `POST ${API_PREFIX}/upsert`
  - `POST ${API_PREFIX}/delete`
  - `GET ${API_PREFIX}/test`
  - `POST ${API_PREFIX}/test`
  - `GET ${API_PREFIX}/execute`
  - `POST ${API_PREFIX}/execute`
  - `GET ${API_PREFIX}/logs`
  - `GET ${API_PREFIX}/history`
  - `? /api/commands`
  - `? /api/deathcounter/v2/command`
  - `? /api/hug/command`
  - `? /api/vip-sound/command`
  - `? /api/tagebuch/entry`
  - `? /api/tagebuch/stats/top`
  - `? /api/tagebuch/stats/today`

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

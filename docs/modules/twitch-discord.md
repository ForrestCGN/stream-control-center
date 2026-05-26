# Twitch Discord

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Externe Integrationen zu Twitch, Twitch-Presence/EventSub-nahem Umfeld und Discord.

## Betroffene Backend-Dateien

- `backend\modules\twitch.js`
- `backend\modules\twitch_presence.js`
- `backend\modules\discord.js`

## Erkannte technische Merkmale

### `twitch.js`

- Version: 1, 1, 2
- Größe: 131501 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_routes`
  - `crypto`
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `GET /auth/login`
  - `GET /auth/callback`
  - `GET /auth/status`
  - `GET /auth/validate`
  - `GET /twitch/auth/validate`
  - `GET /api/twitch/auth/validate`
  - `GET /twitch/me`
  - `GET /auth/logout`
  - `GET /auth/bot/login`
  - `GET /auth/bot/callback`
  - `GET /auth/bot/status`
  - `GET /auth/bot/logout`
  - `? /api/twitch/auth/validate`
  - `? /api/twitch/user`
  - `? /api/twitch/stream`
  - `? /api/twitch/channel`
  - `? /api/twitch/user/by-id`
  - `? /api/twitch/user/resolve`
  - `? /api/twitch/channel/summary`
  - `? /api/twitch/stream/summary`
  - `? /api/twitch/chat/settings`
  - `? /api/twitch/chatters`
  - `? /api/twitch/goals`
  - `? /api/twitch/schedule`
  - `? /api/twitch/polls`
  - `? /api/twitch/predictions`
  - `? /api/twitch/followers`
  - `? /api/twitch/subscriptions`
  - `? /api/twitch/emotes`
  - `? /api/twitch/rewards`
  - ... plus 26 weitere erkannte Routenzeilen

### `twitch_presence.js`

- Version: keine klare Versionskennung erkannt
- Größe: 49451 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./commands`
  - `./helpers/helper_core`
  - `./helpers/helper_routes`
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `? /api/twitch/presence/status`
  - `? /api/twitch/presence/config`
  - `? /api/twitch/presence/settings`
  - `? /api/twitch/presence/routes`
  - `? /api/twitch/presence/integration-check`
  - `? /api/twitch/presence/reload`
  - `? /api/twitch/presence/start`
  - `? /api/twitch/presence/stop`
  - `? /api/twitch/presence/send`
  - `? /api/twitch/presence/activity`
  - `? /api/twitch/presence/activity/active`
  - `? /api/twitch/presence/activity/clear`
  - `? /api/twitch/presence/activity/test`
  - `? /api/twitch/presence`

### `discord.js`

- Version: keine klare Versionskennung erkannt
- Größe: 35323 Bytes
- Merkmale: Config-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_routes`
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `? /api/discord/status`
  - `? /api/discord/config`
  - `? /api/discord/settings`
  - `? /api/discord/routes`
  - `? /api/discord/integration-check`
  - `? /api/discord/reload`
  - `? /api/discord/sounds`
  - `? /api/discord/queue/status`
  - `? /api/discord/queue/clear`
  - `? /api/discord/join`
  - `? /api/discord/leave`
  - `? /api/discord/play`
  - `? /api/discord/post/channel`
  - `? /api/discord/post/webhook`
  - `? /api/discord/post/message`
  - `? /api/discord`

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

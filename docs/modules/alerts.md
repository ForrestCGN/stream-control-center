# Alerts

Stand: 2026-05-26 / STEP475_DOCS_MODULES_AND_PROJECT_STATE_CLEANUP

Diese Datei ist eine erste Modul-Doku auf Basis des hochgeladenen aktuellen Backend-Standes. Sie ersetzt keine Codeprüfung vor Änderungen.

## Zweck

Alert-System für Twitch/Ko-fi/Tipeee/weitere Ereignisse, inklusive Regeln, Assets, Texten, Sound-/Overlay-Kopplung und Dashboard-Verwaltung.

## Betroffene Backend-Dateien

- `backend\modules\alert_system.js`

## Erkannte technische Merkmale

### `alert_system.js`

- Version: 3.1.4, 1.0.0
- Größe: 265648 Bytes
- Merkmale: DB-Zugriff/DB-Bezug erkannt, Config-Bezug erkannt, Message/Text-Bezug erkannt, Event/WebSocket/Broadcast-Bezug erkannt, Status-Route erkannt

- erkannte lokale/systemnahe Abhängigkeiten:
  - `../core/database`
  - `./communication_bus`
  - `./helpers/helper_config`
  - `./helpers/helper_core`
  - `./helpers/helper_media`
  - `./helpers/helper_routes`
  - `./helpers/helper_security`
  - `fs`
  - `path`

- erkannte Routen/Hinweise:
  - `? /api/alerts/status`
  - `? /api/alerts/health`
  - `? /api/alerts/eventbus/status`
  - `? /api/alerts/eventbus/test`
  - `? /api/alerts/eventbus/reset`
  - `? /api/alerts/eventbus/correlation/status`
  - `? /api/alerts/eventbus/correlation/check`
  - `? /api/alerts/bus-mirror/status`
  - `? /api/alerts/bus-mirror/enable`
  - `? /api/alerts/bus-mirror/disable`
  - `? /api/alerts/overlay-watchdog/status`
  - `? /api/alerts/overlay-watchdog/check`
  - `? /api/alerts/overlay-watchdog/reset`
  - `? /api/alerts/overlay-watchdog/reset?confirm=1`
  - `? /api/alerts/overlay-watchdog/recover`
  - `? /api/alerts/overlay-watchdog/recover?confirm=1`
  - `? /api/alerts/queue`
  - `? /api/alerts/clear`
  - `? /api/alerts/reload`
  - `? /api/alerts/enqueue`
  - `? /api/alerts/test`
  - `? /api/alerts/text-variants`
  - `? /api/alerts/text-variants/:id`
  - `? /api/alerts/chat-blocks`
  - `? /api/alerts/chat-blocks/:id`
  - `? /api/alerts/chat-outbox`
  - `? /api/alerts/chat-outbox/:id/sent`
  - `? /api/alerts/chat-outbox/:id/consumed`
  - `? /api/alerts/chat-outbox/:id/error`
  - `? /api/alerts/test-presets`
  - ... plus 28 weitere erkannte Routenzeilen

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

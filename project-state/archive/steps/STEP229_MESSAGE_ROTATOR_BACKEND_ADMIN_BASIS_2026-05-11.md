# STEP229 - Message-Rotator Backend Admin Basis

Stand: 2026-05-11

## Ziel

Message-Rotator backendseitig fuer Dashboard-Verwaltung vorbereiten, ohne bestehende Runtime-, Streamer.bot- oder Chat-Funktionalitaet zu entfernen.

## Geaendert

```text
backend/modules/message_rotator.js
project-state/STEP229_MESSAGE_ROTATOR_BACKEND_ADMIN_BASIS_2026-05-11.md
project-state/CURRENT_STATUS_APPEND_STEP229.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Backend-Aenderungen

- `helper_settings` wird im Message-Rotator genutzt.
- Neue Settings-Tabelle: `message_rotator_settings` ueber vorhandenen `helper_settings`.
- JSON `config/message_rotator.json` bleibt Fallback und Seed-Grundlage.
- Effektive Config wird aus JSON + DB-Settings geladen.
- Bestehende Defaults bleiben erhalten.
- Bestehende Routen bleiben erhalten.

## Neue Admin-Routen

```text
GET  /api/message-rotator/admin/settings
POST /api/message-rotator/admin/settings
GET  /api/message-rotator/admin/texts
POST /api/message-rotator/admin/texts
```

Legacy-kompatibel ebenfalls:

```text
GET  /message-rotator/admin/settings
POST /message-rotator/admin/settings
GET  /message-rotator/admin/texts
POST /message-rotator/admin/texts
```

## Settings-Verhalten

- Read-Order:
  1. DB-Setting aus `message_rotator_settings`
  2. JSON-Fallback aus `config/message_rotator.json`
  3. Code-Defaults
- DB-Tabelle wird nur per `CREATE TABLE IF NOT EXISTS`/Helper angelegt.
- Es wird keine neue Datenbank gebaut und keine bestehende DB ersetzt.

## Textvarianten

- Textvarianten werden fuer `module_name = message_rotator` vorbereitet.
- Genutzter Helper: `helper_texts`.
- Kategorien:
  - `rotator`
  - `manual`
  - `system`
- Default-Keys:
  - `follow_reminder`
  - `discord_reminder`
  - `youtube_reminder`

## Bewusst nicht geaendert

```text
htdocs/dashboard/**
config/message_rotator.json
backend/modules/messages.js
backend/modules/twitch.js
backend/modules/alert_system.js
backend/modules/loyalty.js
backend/core/database.js
backend/modules/sqlite_core.js
app.sqlite
```

## Tests

Syntaxcheck:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\message_rotator.js
```

API-Checks nach Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/settings" | ConvertTo-Json -Depth 50
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/texts" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/integration-check" | ConvertTo-Json -Depth 80
```

## Naechster Schritt

STEP230: Dashboard-Modul fuer Message-Rotator bauen.

Betroffene Dateien dann voraussichtlich:

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.css
```

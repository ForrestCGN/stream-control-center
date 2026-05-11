# STEP177 - Tagebuch/Todo DB-Settings und DB-Texte Backend-Grundlage

Stand: 2026-05-05

## Ziel

Tagebuch und Todo werden backendseitig auf den Projektstandard vorbereitet:

- dashboardfaehige Settings primaer aus DB
- dashboardfaehige Texte primaer aus DB
- JSON-Dateien bleiben Seed/Fallback
- Dashboard greift spaeter nur ueber Backend-APIs zu
- bestehende Chat-/Discord-/Stats-/Reload-Routen bleiben erhalten
- keine Funktionalitaet wird entfernt

## Geaenderte Dateien

- `backend/modules/helpers/helper_texts.js`
- `backend/modules/tagebuch.js`
- `backend/modules/todo.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md`

## Neue/erweiterte DB-Strukturen

### module_texts

`helper_texts.js` legt bei Bedarf sanft per `CREATE TABLE IF NOT EXISTS` die Tabelle `module_texts` an.

Zweck:

- zentrale Modultexte fuer dashboardfaehige Systeme
- ein Datensatz pro Modul/Text-Key
- JSON-Texte werden als Seed eingefuegt
- vorhandene DB-Werte ueberschreiben JSON-Fallbacks

Spalten:

- `id`
- `module_name`
- `text_key`
- `text_value`
- `enabled`
- `description`
- `source`
- `created_at`
- `updated_at`

Eindeutigkeit:

- `UNIQUE(module_name, text_key)`

### Settings

Settings laufen ueber den vorhandenen Standard-Helper `helper_settings.js`.

Neue Tabellen:

- `tagebuch_settings`
- `todo_settings`

Diese Tabellen werden ueber `helper_settings.ensureSettingsTable()` sanft erstellt.

## Neue Helper-Funktionen

In `backend/modules/helpers/helper_texts.js`:

- `DEFAULT_MODULE_TEXTS_TABLE`
- `ensureModuleTextsTable()`
- `seedModuleTexts()`
- `listModuleTexts()`
- `getModuleTexts()`
- `setModuleText()`
- `setModuleTexts()`

Bestehende JSON-Message-Funktionen bleiben erhalten.

## Tagebuch Backend

### Neue DB-Settings-Grundlage

Tagebuch liest weiterhin `config/tagebuch.json` als Fallback/Seed.

Danach werden Werte aus `tagebuch_settings` ueberlagert.

Nicht in DB als editierbare Settings uebernommen werden:

- `webhookUrl`
- `configPath`
- `messagesPath`

Grund: Secret-/Pfad-/Runtime-Werte sollen nicht unkontrolliert dashboard-editierbar werden.

### Neue DB-Texte-Grundlage

Tagebuch liest weiterhin `config/messages/tagebuch.json` als Fallback/Seed.

Danach werden Texte aus `module_texts` mit `module_name = 'tagebuch'` ueberlagert.

### Neue Tagebuch Admin-Routen

- `GET /api/tagebuch/admin/settings`
- `POST /api/tagebuch/admin/settings`
- `GET /api/tagebuch/admin/texts`
- `POST /api/tagebuch/admin/texts`

Alle Routen nutzen die bestehende Security-Pruefung.

### Bestehende Tagebuch-Routen bleiben erhalten

- `/discord/stream/start`
- `/api/tagebuch/stream/start`
- `/discord/stream/end`
- `/api/tagebuch/stream/end`
- `/discord/tagebuch`
- `/api/tagebuch/entry`
- `/discord/tagebuch/status`
- `/api/tagebuch/status`
- `/api/tagebuch/stats`
- `/api/tagebuch/stats/top`
- `/api/tagebuch/stats/today`
- `/api/tagebuch/stats/user`
- `/discord/tagebuch/reset`
- `/api/tagebuch/reset`
- `/api/tagebuch/reload`

## Todo Backend

### Neue DB-Settings-Grundlage

Todo hatte bisher keine eigene `config/todo.json`.

STEP177 fuehrt keine neue JSON-Config ein.

Stattdessen werden dashboardfaehige Todo-Settings ueber `todo_settings` vorbereitet:

- `enabled`
- `userinfoBaseUrl`
- `stats.defaultLimit`
- `stats.maxLimit`
- `targets`

Die bisherigen Targets bleiben als Defaults erhalten:

- `forrest`
- `engel`
- `roxxy`
- `gecko`

### Neue DB-Texte-Grundlage

Todo liest weiterhin `config/messages/todo.json` als Fallback/Seed.

Danach werden Texte aus `module_texts` mit `module_name = 'todo'` ueberlagert.

### Neue Todo Admin-Routen

- `GET /api/todo/admin/settings`
- `POST /api/todo/admin/settings`
- `GET /api/todo/admin/texts`
- `POST /api/todo/admin/texts`

Alle Routen nutzen die bestehende Security-Pruefung.

### Bestehende Todo-Routen bleiben erhalten

- `/discord/todo/status`
- `/api/todo/status`
- `/discord/todo`
- `/api/todo/add`
- `/api/todo/stats`
- `/api/todo/stats/top`
- `/api/todo/stats/today`
- `/api/todo/reload`

## Bewusst nicht geaendert

- Keine Dashboard-Frontend-Dateien fuer Tagebuch/Todo in diesem STEP.
- Keine Entfernung von JSON-Dateien.
- Keine direkte Dashboard-Datei-/SQLite-Nutzung.
- Keine neue `config/todo.json`.
- Keine Aenderung an Discord-Channel-Konzept.
- Keine Entfernung bestehender Routen.
- Keine Secrets in DB/Status-Ausgaben.
- Keine Hardreset-UI.

## Testempfehlung nach Entpacken

```powershell
cd D:\Git\stream-control-center

node -c .\backend\modules\helpers\helper_texts.js
node -c .\backend\modules\tagebuch.js
node -c .\backend\modules\todo.js
```

Nach Deploy/Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/admin/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/admin/texts" | ConvertTo-Json -Depth 20

Invoke-RestMethod "http://127.0.0.1:8080/api/todo/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/admin/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/admin/texts" | ConvertTo-Json -Depth 20
```

## Naechster Schritt

STEP178:

- Dashboard-Module `tagebuch.js/css` und `todo.js/css` bauen
- `index.html`/`app.js` sauber anbinden
- Settings/Texte ueber die neuen Admin-Routen editierbar machen
- Community-Bereich um Tagebuch/Todo erweitern

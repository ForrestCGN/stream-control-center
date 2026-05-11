# STEP176_TAGEBUCH_TODO_DB_DASHBOARD_AUDIT_2026-05-05

## Zweck

Audit und Integrationsplanung fuer Tagebuch/Todo im Projekt `stream-control-center`.

Dieser STEP ist bewusst **Analyse und Planung**. Es wurden keine Code-Dateien geaendert.

Ziel fuer die naechsten STEPs:

- Tagebuch und Todo voll ins Dashboard integrieren.
- Configs und Texte dashboardfaehig in die Datenbank bringen.
- JSON-Dateien nur noch als Seed/Fallback/technische Config nutzen.
- Bestehende Chat-/Discord-/Streamer.bot-Funktionen erhalten.
- Vorhandene Helper nutzen und keine Parallelstrukturen bauen.

## Gepruefte Quellen

### GitHub/dev / Projekt-Dokus

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `backend/core/database.js`
- `backend/modules/sqlite_core.js`
- optional zum Muster: `backend/modules/vip_sound_overlay.js`

### Vom Nutzer bereitgestellte echte Dateien

Backend:

- `backend/modules/tagebuch.js`
- `backend/modules/todo.js`

Helper:

- `backend/modules/helpers/helper_config.js`
- `backend/modules/helpers/helper_messages.js`
- `backend/modules/helpers/helper_routes.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_texts.js`

Config/Text:

- `config/tagebuch.json`
- `config/messages/tagebuch.json`
- `config/messages/todo.json`
- `config/discord_channels.json`

Dashboard:

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.css`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/modules/sectionhome.js`
- `htdocs/dashboard/modules/controlhome.js`
- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- `htdocs/dashboard/modules/sound.js`
- `htdocs/dashboard/modules/sound.css`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Aktueller Projektstandard laut Doku

Verbindlich fuer neue/ueberarbeitete Module:

1. Dashboardfaehige Settings liegen primaer in DB.
2. Dashboardfaehige Texte liegen primaer in DB.
3. JSON-Dateien bleiben technische Config, Import oder Fallback.
4. Dashboard greift nie direkt auf SQLite oder Dateien zu.
5. Dashboard nutzt nur Backend-APIs.
6. Vorhandene Helper werden genutzt, keine Parallelstrukturen.
7. Harte Texte im Code sind nur Seed-Defaults, nicht dauerhafte Quelle.
8. Keine Funktionalitaet entfernen.

Wichtige vorhandene Helfer:

- `helper_settings.js` ist DB-Settings-Standard.
- `helper_texts.js` ist aktuell noch JSON-basiert und muss fuer DB-Texte erweitert oder sauber ergaenzt werden.
- `backend/core/database.js` ist die neue zentrale DB-Schicht und adaptiert aktuell SQLite ueber `sqlite_core.js`.
- `sqlite_core.js` schreibt in `data/sqlite/app.sqlite` und verwaltet Schema-Versionen ueber `schema_versions`.

## Tagebuch Ist-Stand

### Modul

Datei:

- `backend/modules/tagebuch.js`

Modulname:

- `tagebuch`

Schema:

- `SCHEMA_VERSION = 5`

Verwendete Helper:

- `sqlite_core.js`
- `helper_core`
- `helper_routes`
- `helper_security`
- `helper_config`

Aktuell **nicht** genutzt:

- `helper_settings.js`
- `helper_texts.js`

### Aktuelle Config-Quelle

Datei:

- `config/tagebuch.json`

Default-Config im Code:

- `enabled`
- `requireActiveStreamForEntries`
- `timezoneMode`
- `webhookUrlEnv`
- `apiKeyEnvFallbacks`
- `userinfoBaseUrl`
- `pageTitle`
- `postPageHeader`
- `useDiscordWebhook`
- `reset.allowHardReset`
- `reset.hardResetConfirm`
- `stats.enabled`
- `stats.countSystemEntries`
- `stats.defaultLimit`
- `stats.maxLimit`
- `routes.legacyDiscordRoutes`
- `routes.apiRoutes`
- `routes.apiV2Routes` im Code-Default, in aktueller JSON-Datei nicht vorhanden

Besonderheit:

- `webhookUrl` kommt ueber ENV (`DISCORD_WEBHOOK_TAGEBUCH`).
- `userinfoBaseUrl` kann ueber ENV ueberschrieben werden.
- `pageTitle` kann ueber ENV ueberschrieben werden.

Bewertung:

- Fuer Dashboard-Settings ist das noch nicht im Zielstandard.
- Die Settings sollten kuenftig per `helper_settings.js` aus DB gelesen werden, mit JSON-Fallback.
- Secrets/ENV bleiben ausserhalb der DB.

### Aktuelle Text-Quelle

Datei:

- `config/messages/tagebuch.json`

Default-Messages im Code:

- `emptyEndNotice`
- `usageNotice`
- `streamInactive`
- `entrySaved`
- `streamStartCreated`
- `streamStartExists`
- `streamEnd`
- `streamEndEmptyNotice`
- `resetSoft`
- `resetHard`
- `resetHardBlocked`
- `unauthorized`
- `entryFailed`
- `startFailed`
- `endFailed`
- `statusFailed`
- `resetFailed`

Besonderheit:

- `DISCORD_DIARY_EMPTY_END_NOTICE` und `DISCORD_DIARY_USAGE_NOTICE` koennen einzelne Texte per ENV ueberschreiben.

Bewertung:

- Texte sind dashboardfaehig.
- Texte sollten in DB migriert/gespiegelt werden.
- JSON bleibt Seed/Fallback.
- ENV-Ueberschreibungen bleiben bewusst hoechste technische Ebene, aber sollten im Dashboard als "ENV override aktiv" kenntlich gemacht werden, nicht im Klartext als Secret.

### Aktuelle DB-Tabellen

Tagebuch legt per `sqlite_core.ensureSchema('tagebuch', 5, ...)` an:

- `tagebuch_state`
- `tagebuch_runtime_events`
- `tagebuch_user_stats`
- `tagebuch_daily_user_stats`

Tabellenzweck:

- `tagebuch_state`: aktuelle Seite, Datum, Streamstatus, Ende-Hinweis-Status.
- `tagebuch_runtime_events`: Runtime-Ereignisse wie Start, Ende, Entry, Reset.
- `tagebuch_user_stats`: aggregierte User-Statistik.
- `tagebuch_daily_user_stats`: Statistik pro Tag/Seite/User.

Bewertung:

- Funktionsdaten sind bereits in DB.
- Config/Texte sind noch nicht in DB.
- Schema-Erweiterung fuer Settings/Texte sollte nicht in `tagebuch`-Schema erzwungen werden, wenn zentraler Helper genutzt wird.

### Aktuelle Routen

Tagebuch registriert:

- `POST/GET /discord/stream/start`
- `POST/GET /api/tagebuch/stream/start`
- `POST/GET /discord/stream/end`
- `POST/GET /api/tagebuch/stream/end`
- `POST/GET /discord/tagebuch`
- `POST/GET /api/tagebuch/entry`
- `GET /discord/tagebuch/status`
- `GET /api/tagebuch/status`
- `GET /api/tagebuch/stats`
- `GET /api/tagebuch/stats/top`
- `GET /api/tagebuch/stats/today`
- `GET /api/tagebuch/stats/user`
- `POST/GET /discord/tagebuch/reset`
- `POST/GET /api/tagebuch/reset`
- `POST/GET /api/tagebuch/reload`

Bewertung:

- Bestehende Routen muessen erhalten bleiben.
- Neue Dashboard-/Admin-Routen duerfen nur ergaenzt werden.

## Todo Ist-Stand

### Modul

Datei:

- `backend/modules/todo.js`

Modulname:

- `todo`

Schema:

- `SCHEMA_VERSION = 1`

Verwendete Helper:

- `helper_core`
- `helper_routes`
- `helper_security`
- `sqlite_core`

Aktuell **nicht** genutzt:

- `helper_config.js`
- `helper_settings.js`
- `helper_texts.js`

### Aktuelle Config-Quelle

Es gibt aktuell **keine** `config/todo.json` im Repo.

Stattdessen:

- `TARGETS` sind hart im Code definiert:
  - `forrest`
  - `engel`
  - `roxxy`
  - `gecko`
- pro Target:
  - `key`
  - `label`
  - `channelKey`
  - `aliases`
- Channel-IDs kommen aus:
  - `config/discord_channels.json`

Bewertung:

- Das funktioniert aktuell, ist aber nicht dashboardfaehig.
- Fuer Todo muss eine Settings-/Target-Konfiguration in DB geplant werden.
- JSON-Fallback kann optional spaeter als `config/todo.json` kommen, aber nicht blind einfuehren.
- Besser: DB-Settings/DB-Targets mit Code-Defaults als Fallback.
- `discord_channels.json` bleibt vorerst zentrale technische Kanalzuordnung, weil sie bereits mehrere Module bedient.

### Aktuelle Text-Quelle

Datei:

- `config/messages/todo.json`

Default-Messages im Code:

- `help`
- `added`
- `invalidTarget`
- `missingChannel`
- `missingText`
- `missingMessage`
- `unauthorized`
- `failed`
- `reloadOk`
- `statsEmpty`
- `statsHeader`
- `statsTodayHeader`
- `discordPost`

Bewertung:

- Texte sind dashboardfaehig.
- Texte sollten in DB migriert/gespiegelt werden.
- JSON bleibt Seed/Fallback.

### Aktuelle DB-Tabellen

Todo legt per `sqlite_core.ensureSchema('todo', 1, ...)` an:

- `todo_user_stats`
- `todo_daily_stats`

Tabellenzweck:

- `todo_user_stats`: aggregierte Todo-Anzahl pro User/Ziel.
- `todo_daily_stats`: Todo-Anzahl pro Datum/User/Ziel.

Bewertung:

- Funktionsdaten sind in DB.
- Config/Texte/Targets sind noch nicht in DB.
- Neue Dashboard-Settings sollten ueber `helper_settings.js` oder einen zentralen Text-/Config-Helper kommen.

### Aktuelle Routen

Todo registriert:

- `GET /discord/todo/status`
- `GET /api/todo/status`
- `GET /discord/todo`
- `GET /api/todo/add`
- `POST /discord/todo`
- `POST /api/todo/add`
- `GET /api/todo/stats`
- `GET /api/todo/stats/top`
- `GET /api/todo/stats/today`
- `GET /api/todo/reload`
- `POST /api/todo/reload`

Bewertung:

- Bestehende Routen muessen erhalten bleiben.
- Neue Dashboard-/Admin-Routen duerfen nur ergaenzt werden.

## Dashboard Ist-Stand

### `index.html`

Aktuell eingebunden:

- `sectionhome`
- `streamdesk`
- `controlhome`
- `alerts`
- `obs`
- `adminconfigs`
- `sound`
- `hug`
- `vip`

Noch nicht eingebunden:

- `tagebuch`
- `todo`

Navigation:

- Community-Sektion nennt bereits:
  - `VIP`
  - `Hug`
  - `Deathcounter`
  - `Challenges`
  - `Tagebuch`
  - `Todo`

Aber:

- `tagebuch` und `todo` sind im `moduleCatalog` auf `enabled: false`.
- Es gibt keine Moduleintraege in `window.CGN.modules`.
- Es gibt keine Sections in `index.html`.
- Es gibt keine `htdocs/dashboard/modules/tagebuch.js/css`.
- Es gibt keine `htdocs/dashboard/modules/todo.js/css`.

### `app.js`

Vorhandene Dashboard-Struktur:

- `window.CGN.modules`
- `window.CGN.sections`
- `window.CGN.moduleCatalog`
- `window.CGN.api()`
- `window.CGN.setActiveModule()`
- Event `cgn:module-show`

Bewertung:

- Neues Modul kann sauber ueber das bestehende Muster eingebunden werden.
- Fuer STEP178 muessen `tagebuch` und `todo` in `modules` ergaenzt und im `moduleCatalog` aktiviert werden.
- `index.html` muss neue CSS/JS-Dateien und Sections ergaenzen.

### Geeignete UI-Muster

#### Hug-Modul

Gut als Muster fuer:

- Community-System
- Tabs
- Status
- Stats
- Typen/Texte
- Diagnose
- kompakte Karten

#### VIP-Modul

Gut als Muster fuer:

- umfangreiche Admin-Ansicht
- Texte bearbeiten
- Settings anzeigen/speichern
- Events/Statistik
- Filter/Suche/Sortierung
- direkte Bearbeitung in Dashboard-Tab

#### Sound-Modul

Gut als Muster fuer:

- Settings-Grid
- Status/Queue/Listen
- klare System-/Expert-Trennung

Empfehlung:

- Tagebuch/Todo sollten schlanker als VIP werden.
- Keine ueberladenen Adminseiten.
- Ein Modul `tagebuch` und ein Modul `todo`, beide getrennt.
- Gemeinsames CSS-Muster moeglich, aber getrennte Dateien bleiben wartbarer.

## Hauptbefund

### Tagebuch

Tagebuch ist funktional relativ vollstaendig:

- Status vorhanden.
- Streamstart/-ende vorhanden.
- Entry-Route vorhanden.
- Stats vorhanden.
- Reset vorhanden.
- Reload vorhanden.
- Config vorhanden.
- Messages vorhanden.
- DB-Funktionsdaten vorhanden.

Fehlt fuer Zielstandard:

- DB-Settings.
- DB-Texte.
- Dashboard-Admin-Routen.
- Dashboard-Modul.
- Anzeige, ob Werte aus DB, JSON, ENV oder Default kommen.

### Todo

Todo ist funktional vorhanden, aber weniger dashboardfaehig:

- Status vorhanden.
- Add-Route vorhanden.
- Stats vorhanden.
- Reload vorhanden.
- Messages vorhanden.
- Discord-Channels vorhanden.
- DB-Funktionsdaten vorhanden.

Fehlt fuer Zielstandard:

- eigene settings/config-Struktur.
- Targets sind hart im Code.
- DB-Settings.
- DB-Texte.
- DB-/API-Verwaltung fuer Targets/Aliase.
- Dashboard-Admin-Routen.
- Dashboard-Modul.
- Anzeige der Channel-Konfiguration mit Zielperson.

## Geplante DB-Strategie

### Settings

Vorhandenen Helper nutzen:

- `backend/modules/helpers/helper_settings.js`

Dieser Helper unterstuetzt:

- `ensureSettingsTable(tableName)`
- `seedDefaults(tableName, defaults)`
- `getSetting(...)`
- `setSetting(...)`
- `listSettings(...)`
- `getSettingWithFallback(...)`

Empfohlene Tabellen:

- `tagebuch_settings`
- `todo_settings`

Warum eigene Tabellen statt alles in `module_settings`?

- VIP nutzt bereits ein eigenes Settings-Table-Muster (`vip_sound_settings`).
- Eigene Tabellen erleichtern Dashboard-Listen, Filter und Export.
- `helper_settings.js` unterstuetzt frei waehlbare Tabellen.
- Keine neue Parallelstruktur, weil derselbe Helper genutzt wird.

Wichtig:

- Secrets wie Webhook-URL bleiben in ENV.
- ENV-Key-Namen koennen als technische Settings/Status angezeigt werden.
- Secret-Werte duerfen nicht im Dashboard im Klartext erscheinen.

### Textes

Problem:

- `helper_texts.js` ist aktuell JSON-basiert.
- VIP nutzt modulnahe DB-Texte.
- Alerts haben eigene DB-Textbereiche.
- Es gibt noch keinen zentralen DB-Text-Helper fuer einfache Modultexte.

Empfehlung fuer STEP177:

`helper_texts.js` gezielt erweitern, ohne bestehende Funktionen zu brechen.

Neue generische Tabelle:

- `module_texts`

Vorschlag Schema:

```sql
CREATE TABLE IF NOT EXISTS module_texts (
  module_name TEXT NOT NULL,
  text_key TEXT NOT NULL,
  text_value TEXT NOT NULL,
  description TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (module_name, text_key)
);
```

Warum zentral?

- Tagebuch/Todo brauchen einfache Key->Text-Werte.
- Kuenftige Module koennen denselben Helper nutzen.
- Keine weitere pro Modul Sonderlogik.
- JSON kann als Seed/Fallback dienen.
- Bestehende `helper_texts.js`-API fuer message rotator bleibt erhalten.

Moegliche neue Helper-Funktionen:

- `ensureModuleTextTable()`
- `seedModuleTexts(moduleName, defaults, options)`
- `listModuleTexts(moduleName, options)`
- `getModuleTextMap(moduleName, fallbackMap, options)`
- `getModuleText(moduleName, key, fallback, options)`
- `setModuleText(moduleName, key, value, options)`
- `setModuleTexts(moduleName, values, options)`

Wichtig:

- Bestehende Funktionen wie `renderKey`, `buildChatResult`, `getStatus` duerfen nicht geaendert/entfernt werden.
- Neue DB-Text-Funktionen nur ergaenzen.

### Todo Targets

Todo-Targets sind aktuell Code-Defaults. Fuer Dashboardfaehigkeit sollten sie spaeter DB-faehig werden.

Option A fuer STEP177:

- Noch keine Target-Bearbeitung.
- Nur anzeigen.
- Targets bleiben Code-Fallback.
- Texte/Settings zuerst.

Option B fuer STEP178/179:

Neue Tabelle:

```sql
CREATE TABLE IF NOT EXISTS todo_targets (
  target_key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  channel_key TEXT NOT NULL,
  aliases_json TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Bewertung:

- Nicht in den ersten Patch packen.
- Erst Dashboard-Texte/Settings stabil machen.
- Danach Zielpersonen/Aliase editierbar machen.

## Empfohlene neue Backend-Routen

### Tagebuch Admin/API

Neue Routen, nur ergaenzen:

- `GET /api/tagebuch/admin/summary`
- `GET /api/tagebuch/admin/settings`
- `POST /api/tagebuch/admin/settings`
- `GET /api/tagebuch/admin/texts`
- `POST /api/tagebuch/admin/texts`

Optional spaeter:

- `GET /api/tagebuch/admin/events/recent`
- `GET /api/tagebuch/admin/pages`
- `GET /api/tagebuch/admin/user-stats`

### Todo Admin/API

Neue Routen, nur ergaenzen:

- `GET /api/todo/admin/summary`
- `GET /api/todo/admin/settings`
- `POST /api/todo/admin/settings`
- `GET /api/todo/admin/texts`
- `POST /api/todo/admin/texts`

Optional spaeter:

- `GET /api/todo/admin/targets`
- `POST /api/todo/admin/targets`
- `GET /api/todo/admin/channel-status`

## Empfohlene Dashboard-Module

### Tagebuch-Modul

Neue Dateien:

- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`

Einbindung:

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`

Empfohlene Tabs:

1. Uebersicht
   - enabled
   - activeStream
   - currentPageNumber
   - currentPageDate
   - nextPageNumberIfNewDate
   - hasEntriesForCurrentDate
   - hasWebhookUrl ja/nein
   - config/text source status

2. Statistik
   - Top User
   - Heute/aktuelles Datum
   - Suche User

3. Einstellungen
   - enabled
   - requireActiveStreamForEntries
   - postPageHeader
   - useDiscordWebhook
   - pageTitle
   - stats.enabled
   - stats.defaultLimit
   - stats.maxLimit
   - reset.allowHardReset nur vorsichtig, ggf. Expert/gesperrt

4. Texte
   - Key
   - Textarea
   - Quelle DB/JSON/Default/ENV
   - Speichern
   - Zuruecksetzen auf JSON/Default spaeter optional

5. Wartung
   - Reload
   - Reset soft
   - Hard reset nur wenn freigeschaltet und extra bestaetigt
   - letzte Runtime-Events spaeter

### Todo-Modul

Neue Dateien:

- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`

Einbindung:

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`

Empfohlene Tabs:

1. Uebersicht
   - schemaReady
   - configured channels je Target
   - loadedAt
   - lastLoadError
   - lastUserinfoError

2. Ziele/Kanaele
   - Forrest/Engel/Roxxy/Gecko anzeigen
   - label
   - channelKey
   - configured ja/nein
   - aliases anzeigen
   - Bearbeitung erst spaeter, wenn DB-Targets vorbereitet sind

3. Statistik
   - Top
   - Heute

4. Texte
   - Help/Added/Errors/DiscordPost editierbar
   - Platzhalterhinweise:
     - `{targets}`
     - `{targetLabel}`
     - `{authorDisplay}`
     - `{todoText}`

5. Einstellungen
   - enabled spaeter ergaenzen
   - userinfoBaseUrl anzeigen, ggf. DB/ENV-Fallback
   - timeout spaeter
   - stats.defaultLimit spaeter

## Konkreter STEP177 Vorschlag

STEP177 sollte nur Backend-Grundlage machen, ohne Dashboard UI.

### Betroffene Dateien

- `backend/modules/helpers/helper_texts.js`
- `backend/modules/tagebuch.js`
- `backend/modules/todo.js`
- `project-state/STEP177_...md`
- spaeter Doku:
  - `docs/current/CURRENT_SYSTEM_STATUS.md`
  - `project-state/CURRENT_STATUS.md`
  - `project-state/CHANGELOG.md`
  - `project-state/FILES.md`
  - `project-state/NEXT_STEPS.md`

### Inhalt STEP177

1. `helper_texts.js` um DB-Modultexte erweitern.
2. `tagebuch.js`
   - DB-Settings per `helper_settings.js` seed/read.
   - DB-Texte per erweitertem `helper_texts.js` seed/read.
   - alte JSON-Fallbacks erhalten.
   - bestehende Routen unveraendert lassen.
   - neue Admin-Routen ergaenzen.
3. `todo.js`
   - DB-Texte per erweitertem `helper_texts.js` seed/read.
   - Settings-Grundlage per `helper_settings.js`.
   - Targets noch nicht bearbeiten, nur Summary anzeigen.
   - bestehende Routen unveraendert lassen.
   - neue Admin-Routen ergaenzen.

### Tests STEP177

Syntax:

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\helpers\helper_texts.js
node -c .\backend\modules\tagebuch.js
node -c .\backend\modules\todo.js
```

Live/API nach Deploy:

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/status" | ConvertTo-Json -Depth 20

Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/admin/summary" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/admin/summary" | ConvertTo-Json -Depth 20

Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/admin/texts" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/admin/texts" | ConvertTo-Json -Depth 20
```

Datenbank pruefen, nur wenn noetig:

```powershell
cd D:\Streaming\stramAssets\backend
node -e "const sqlite=require('./modules/sqlite_core'); sqlite.init(); console.log(sqlite.all('SELECT module_name, version FROM schema_versions ORDER BY module_name'))"
```

## Konkreter STEP178 Vorschlag

STEP178 sollte Dashboard UI bringen.

### Betroffene Dateien

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`
- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`

### Inhalt STEP178

- Community-Kacheln `Tagebuch` und `Todo` aktivieren.
- Neue Module einbinden.
- Uebersicht/Status anzeigen.
- Texte editierbar machen.
- Settings editierbar machen.
- Reload-Buttons.
- Keine Reset-/Hardreset-Funktion direkt prominent anzeigen.

### Minimaltests STEP178

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\tagebuch.js
node -c .\htdocs\dashboard\modules\todo.js
```

Browser/Live:

- Dashboard oeffnen.
- Community -> Tagebuch.
- Community -> Todo.
- Reload testen.
- Text speichern testen.
- Status nach Reload pruefen.

## Bewusst offen

Nicht in STEP177/178 pressen:

- Todo-Targets/Aliase komplett editierbar machen.
- Todo-Kanalzuordnung in DB migrieren.
- Discord-Channel-Config zentral umbauen.
- Tagebuch-Seiten/Entries historisch im Dashboard anzeigen.
- Reset-/Hardreset-GUI bauen.
- Rollen/Rechte/Audit-Logging finalisieren.
- JSON-Dateien entfernen.
- Massenmigration alter Systeme.

## Risiken

### 1. ENV vs DB

Webhook-URL und andere Secrets duerfen nicht in DB oder Dashboard landen.

Massnahme:

- Nur `hasWebhookUrl` anzeigen.
- ENV-Key anzeigen, nicht Wert.

### 2. Zwei DB-Schichten

Tagebuch/Todo nutzen aktuell direkt `sqlite_core.js`.
`helper_settings.js` nutzt `backend/core/database.js`.

Das ist im aktuellen Projekt akzeptiert, weil `database.js` ein Adapter ueber `sqlite_core.js` ist.

Massnahme:

- Fuer neue Settings/Text-Helper `core/database.js` verwenden.
- Bestehende Funktionsdaten nicht anfassen.

### 3. Texte in ENV

Tagebuch hat ENV-Overrides fuer zwei Texte.

Massnahme:

- ENV-Override als Quelle anzeigen.
- DB-Wert bleibt vorhanden, wird aber von ENV uebersteuert, solange ENV gesetzt ist.

### 4. Todo Targets hart im Code

Massnahme:

- Erst anzeigen, nicht editieren.
- Spaeter eigene Target-Tabelle planen.

## Empfehlung

Naechster echter Code-STEP:

- **STEP177: DB-Text-/Settings-Grundlage + Admin-Routen fuer Tagebuch/Todo**

Danach:

- **STEP178: Dashboard-Module Tagebuch/Todo**

Nicht direkt Dashboard bauen, bevor Backend-Admin-Routen sauber stehen.

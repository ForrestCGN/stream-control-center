# FILES - stream-control-center

Stand: 2026-05-05

## Hauptpfade

Repo:

- `D:\Git\stream-control-center`

Live:

- `D:\Streaming\stramAssets`

GitHub:

- `https://github.com/ForrestCGN/stream-control-center`

Branch:

- `dev`

## Easy-Scripts / Deploy-Workflow

Verbindlicher Script-Pfad:

- `D:\Git\stream-control-center\tools\easy\`

Standard-Scripte:

- `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`
- `tools\easy\02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd`
- `tools\easy\03_NUR_STATUS_PRUEFEN.cmd`
- `tools\easy\04_BACKUP_ZURUECKSPIELEN.cmd`

Wichtig:

- Diese Easy-Scripts sind der Standard fuer GitHub-/Live-Arbeiten.
- Nicht auf alte Root-Script-Pfade ausweichen, wenn die Easy-Scripts vorhanden sind.
- Wenn grosse Dateien ueber GitHub/Tools nur gekuerzt gelesen werden koennen, stellt Forrest die echte Datei bereit. Diese echte Datei ist dann die Arbeitsbasis.

## STEP177 betroffene Dateien

Backend:

- `backend/modules/helpers/helper_texts.js`
- `backend/modules/tagebuch.js`
- `backend/modules/todo.js`

Doku:

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md`

## STEP177 neue/benutzte DB-Strukturen

Sanft per `CREATE TABLE IF NOT EXISTS`:

- `module_texts`
- `tagebuch_settings`
- `todo_settings`

Keine SQLite-Datei wird committed oder ersetzt.

## STEP177 neue Admin-Routen

Tagebuch:

- `GET /api/tagebuch/admin/settings`
- `POST /api/tagebuch/admin/settings`
- `GET /api/tagebuch/admin/texts`
- `POST /api/tagebuch/admin/texts`

Todo:

- `GET /api/todo/admin/settings`
- `POST /api/todo/admin/settings`
- `GET /api/todo/admin/texts`
- `POST /api/todo/admin/texts`

## Aktive bekannte Dashboard-Dateien

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/app.css`
- `htdocs/dashboard/modules/sectionhome.js`
- `htdocs/dashboard/modules/sectionhome.css`
- `htdocs/dashboard/modules/streamdesk.js`
- `htdocs/dashboard/modules/streamdesk.css`
- `htdocs/dashboard/modules/controlhome.js`
- `htdocs/dashboard/modules/controlhome.css`
- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`
- `htdocs/dashboard/modules/obs.js`
- `htdocs/dashboard/modules/obs.css`
- `htdocs/dashboard/modules/adminconfigs.js`
- `htdocs/dashboard/modules/adminconfigs.css`
- `htdocs/dashboard/modules/sound.js`
- `htdocs/dashboard/modules/sound.css`
- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

Tagebuch/Todo Dashboard-Dateien folgen erst in STEP178.

## STEP178 Tagebuch/Todo Dashboard

- `htdocs/dashboard/modules/tagebuch.js` - Dashboard-Modul fuer Tagebuch-Status, DB-Settings, DB-Texte und Statistik.
- `htdocs/dashboard/modules/tagebuch.css` - Styles fuer Tagebuch-Dashboard.
- `htdocs/dashboard/modules/todo.js` - Dashboard-Modul fuer Todo-Status, Ziele, DB-Settings, DB-Texte und Statistik.
- `htdocs/dashboard/modules/todo.css` - Styles fuer Todo-Dashboard.
- `project-state/STEP178_TAGEBUCH_TODO_DASHBOARD_INTEGRATION_2026-05-05.md` - STEP178-Dokumentation.


## STEP179 relevante Dateien

- `backend/modules/helpers/helper_texts.js` - zentrale DB-Textvarianten/Editor-Helper.
- `backend/modules/tagebuch.js` - Tagebuch-Kategorien und Varianten-Auswahl.
- `backend/modules/todo.js` - Todo-Kategorien und Varianten-Auswahl.
- `htdocs/dashboard/modules/tagebuch.js` / `.css` - Tagebuch Varianten-Editor.
- `htdocs/dashboard/modules/todo.js` / `.css` - Todo Varianten-Editor.
- `project-state/STEP179_TEXT_VARIANTS_EDITOR_2026-05-05.md` - STEP-Doku.

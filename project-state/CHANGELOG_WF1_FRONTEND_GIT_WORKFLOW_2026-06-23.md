# CHANGELOG WF1 Frontend Git Workflow

Datum: 2026-06-23  
Status: WF1 / `frontend/dashboard-v2` in Git-/Upload-Workflow aufgenommen

## Zweck

`frontend/dashboard-v2/` blieb nach `stepdone` untracked und wurde nicht nach GitHub/dev gepusht. WF1 korrigiert den Workflow.

## Geändert

- `stepdone.cmd`
- `tools/upload_streamassets_changes.ps1`
- `docs/current/WF1_FRONTEND_GIT_WORKFLOW.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `project-state/CHANGELOG_WF1_FRONTEND_GIT_WORKFLOW_2026-06-23.md`

## Details

### `stepdone.cmd`

Neu:

- `git add frontend`
- JS-Syntaxcheck für `frontend/**/*.js` und `frontend/**/*.jsx`

### `tools/upload_streamassets_changes.ps1`

Neu:

- sicherer Copy-Bereich für `frontend/dashboard-v2`
- Commit-Hinweise und Commit-Ausführung nehmen `frontend` auf

## Sicherheitsregeln

Bleiben aktiv:

- keine `.env`
- keine SQLite/DB-Dateien
- keine Archive
- keine Backups
- keine Token-/Secret-/Credential-Pfade
- kein `node_modules`
- kein `dist`
- keine `.vite`

## Design-Hinweis

Die Dashboard-v2-Designbasis bleibt Design-Test v13 / Topbar Tab inline.

## Nicht geändert

- kein Backend-Code
- kein altes Dashboard
- kein Build-Output
- keine DB
- keine OBS-Änderung
- kein Node-Neustart nötig

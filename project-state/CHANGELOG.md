# CHANGELOG

## 2026-06-23 - WF1 / Frontend Git Workflow korrigiert

Status: gebaut

Geändert:

- `stepdone.cmd` nimmt jetzt `frontend/` auf.
- JS-Syntaxcheck in `stepdone.cmd` prüft jetzt auch `frontend/**/*.js` und `frontend/**/*.jsx`.
- `tools/upload_streamassets_changes.ps1` kennt jetzt `frontend/dashboard-v2/`.
- Commit-Hinweise und Commit-Ausführung nehmen `frontend` auf.
- Doku/Projektstatus aktualisiert.

Grund:

- Nach DASHUI4B und DASHUI5 blieb `frontend/dashboard-v2/` untracked.
- GitHub/dev enthielt dadurch Doku und Designreferenz, aber nicht den React-Code.

Nicht geändert:

- kein Backend
- kein altes Dashboard
- keine produktive DB
- keine OBS-Änderung
- kein Node-Neustart nötig

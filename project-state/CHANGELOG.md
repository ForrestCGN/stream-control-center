# CHANGELOG

## 2026-06-23 - DASHUI6C / dashboard-v2 Static Route

Status: gebaut

Geändert:

- `backend/core/paths.js`: `DASHBOARD_V2_DIR` ergänzt
- `backend/server.js`: statische Route `/dashboard-v2` ergänzt
- `backend/server.js`: Index-Fallback für `/dashboard-v2` und `/dashboard-v2/` ergänzt
- Doku/Projektstatus aktualisiert

Grund:

- `http://127.0.0.1:8080/dashboard-v2/` lieferte `Cannot GET /dashboard-v2/`, obwohl Build-Dateien vorhanden waren.

Nicht geändert:

- `/dashboard` bleibt unverändert
- altes Dashboard bleibt produktiv
- keine DB
- keine OBS-Änderung

Node-Neustart:

- nötig, weil Backend-Code geändert wurde

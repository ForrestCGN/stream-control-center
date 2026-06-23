# FILES

Stand: DASHUI3.DOC1 / Parallelbetrieb und Modul-Migrationsplan dokumentiert  
Datum: 2026-06-23

## Neue/aktualisierte Doku-Dateien in diesem Step

- `docs/current/DASHBOARD_V2_PARALLEL_MIGRATION_PLAN.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `project-state/CHANGELOG_DASHUI3_PARALLEL_MIGRATION_PLAN_2026-06-23.md`

## Relevante vorhandene Doku-Dateien

- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`
- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`
- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`
- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`
- `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`
- `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`
- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`
- `docs/current/DASHBOARD_V2_FRONTEND_TECH_DECISION.md`

## Für DASHUI4 später geplante Pfade

Noch nicht angelegt durch DASHUI3.DOC1:

```text
frontend/dashboard-v2/
htdocs/dashboard-v2/
```

Geplante spätere Quellcode-Struktur:

```text
frontend/dashboard-v2/
  package.json
  vite.config.js
  index.html
  src/
    main.jsx
    app/
    layout/
    components/
    services/
    modules/
    styles/
```

Geplanter späterer Build-Output:

```text
htdocs/dashboard-v2/
```

## Nicht geändert

- `htdocs/dashboard/`
- `backend/`
- `config/`
- `htdocs/overlays/`
- produktive SQLite
- OBS
- Webserver/systemd/nginx

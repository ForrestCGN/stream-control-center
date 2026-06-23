# CHANGELOG DASHUI5 React V13 Alignment

Datum: 2026-06-23  
Status: DASHUI5 / React-Prototyp auf V13-Designbasis angeglichen

## Zweck

DASHUI5 korrigiert den React-Prototyp optisch/strukturell auf die verbindliche Design-Test-v13-Basis.

## Geändert

### Frontend

- `frontend/dashboard-v2/src/App.jsx`
- `frontend/dashboard-v2/src/app/navigation.js`
- `frontend/dashboard-v2/src/app/moduleRegistry.js`
- `frontend/dashboard-v2/src/layout/AppShell.jsx`
- `frontend/dashboard-v2/src/layout/Sidebar.jsx`
- `frontend/dashboard-v2/src/layout/Topbar.jsx`
- `frontend/dashboard-v2/src/layout/PageHeader.jsx`
- `frontend/dashboard-v2/src/layout/ModuleTabs.jsx`
- `frontend/dashboard-v2/src/components/Card.jsx`
- `frontend/dashboard-v2/src/components/StatusBadge.jsx`
- `frontend/dashboard-v2/src/modules/overview/OverviewPage.jsx`
- `frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx`
- `frontend/dashboard-v2/src/modules/shared/PlaceholderPage.jsx`
- `frontend/dashboard-v2/src/styles/theme.css`
- `frontend/dashboard-v2/src/styles/global.css`

### Design-Referenz

Neu archiviert:

- `docs/reference/dashboard-v2-design-test-v13/README.md`
- `docs/reference/dashboard-v2-design-test-v13/index.html`
- `docs/reference/dashboard-v2-design-test-v13/login.html`
- `docs/reference/dashboard-v2-design-test-v13/assets/dashboard-v2-design-test-v13.css`
- `docs/reference/dashboard-v2-design-test-v13/assets/dashboard-v2-design-test-v13.js`

### Doku/Projektstatus

- `docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md`
- `docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

## Design-Entscheidung

`DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip` ist ab jetzt verbindliche Designbasis für Dashboard-v2.

## Nicht geändert

- kein Backend-Code
- kein bestehendes lokales Dashboard unter `htdocs/dashboard/`
- kein Build-Output unter `htdocs/dashboard-v2/`
- kein Agent-Code
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Quelle
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service

## Bekannter Workflow-Punkt

Beim vorherigen `stepdone` blieb `frontend/dashboard-v2/` untracked. WF1 soll den Git-/Upload-Workflow prüfen und korrigieren.

## Node-Neustart

Nicht nötig.

Grund: nur Frontend-Quellcode und Markdown-Doku. Kein laufender Backend-Code wurde geändert.

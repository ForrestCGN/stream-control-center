# CHANGELOG DASHUI4 React-Vite-Prototyp

Datum: 2026-06-23  
Status: DASHUI4 / Minimaler React-Vite-Prototyp gebaut

## Zweck

Der Step erstellt die erste Quellcodebasis für Dashboard-v2 unter `frontend/dashboard-v2/`.

## Geändert

### Neu erstellt

- `frontend/dashboard-v2/package.json`
- `frontend/dashboard-v2/index.html`
- `frontend/dashboard-v2/vite.config.js`
- `frontend/dashboard-v2/README.md`
- `frontend/dashboard-v2/src/main.jsx`
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
- `frontend/dashboard-v2/src/services/apiClient.js`
- `frontend/dashboard-v2/src/services/authClient.js`
- `frontend/dashboard-v2/src/services/permissionClient.js`
- `frontend/dashboard-v2/src/services/lockClient.js`
- `frontend/dashboard-v2/src/services/agentClient.js`
- `frontend/dashboard-v2/src/styles/theme.css`
- `frontend/dashboard-v2/src/styles/global.css`
- `docs/current/DASHBOARD_V2_REACT_VITE_PROTOTYPE.md`
- `project-state/CHANGELOG_DASHUI4_REACT_VITE_PROTOTYPE_2026-06-23.md`

### Aktualisiert

- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

## Enthalten

- React + Vite Grundgerüst
- AppShell
- Sidebar
- Topbar
- PageHeader
- ModuleTabs
- CGN-Dark-/Neon-/Galaxy-Basisdesign
- Navigation-Registry
- Modul-Registry
- Beispielseite `Übersicht`
- Beispielseite `Remote Agent`
- Platzhalterseiten für spätere Module
- vorbereitete Service-Dateien ohne produktive Actions

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
- kein lokaler Node-Neustart

## Nächster sinnvoller Schritt

```text
DASHUI5 / Build- und lokaler Auslieferungsweg prüfen
```

## Node-Neustart

Nicht nötig.

Grund: nur Frontend-Quellcode und Markdown-Doku. Kein laufender Node-/Backend-Code wurde geändert.

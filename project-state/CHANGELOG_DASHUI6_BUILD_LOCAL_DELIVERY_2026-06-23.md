# CHANGELOG DASHUI6 Build Local Delivery

Datum: 2026-06-23  
Status: DASHUI6 / Build- und lokaler Auslieferungsweg vorbereitet

## Zweck

DASHUI6 ergänzt einen lokalen Build-Helper für Dashboard-v2.

## Geändert

Neu:

- `build-dashboard-v2.cmd`
- `docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md`
- `project-state/CHANGELOG_DASHUI6_BUILD_LOCAL_DELIVERY_2026-06-23.md`

Aktualisiert:

- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

## Neuer Ablauf

```powershell
cd D:\Git\stream-control-center
.\build-dashboard-v2.cmd
```

Der Helper nutzt bewusst `npm.cmd`, damit PowerShells `npm.ps1`-ExecutionPolicy nicht blockiert.

## Ergebnis nach erfolgreichem Build

```text
htdocs/dashboard-v2/index.html
```

Test:

```text
http://127.0.0.1:8080/dashboard-v2/
```

## Nicht geändert

- kein Backend-Code
- kein bestehendes Dashboard unter `htdocs/dashboard/`
- kein Agent-Code
- keine produktive SQLite
- keine Config
- keine OBS-Änderung
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service

## Node-/Backend-Neustart

Nicht nötig.

Grund: nur Build-Helper, Doku und statische Frontend-Dateien nach lokalem Build.

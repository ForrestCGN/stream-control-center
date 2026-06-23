# CHANGELOG DASHUI6B Build CMD Call Fix

Datum: 2026-06-23  
Status: DASHUI6B / Build-Helper Call-Fix

## Zweck

`build-dashboard-v2.cmd` endete beim Test direkt nach der npm-Version.

Grund:

In Windows-Batchdateien muss ein anderes `.cmd` mit `call` aufgerufen werden, damit die ursprüngliche Batchdatei danach weiterläuft.

## Geändert

- `build-dashboard-v2.cmd`
- `docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md`
- `project-state/CHANGELOG_DASHUI6B_BUILD_CMD_CALL_FIX_2026-06-23.md`
- `project-state/CHANGELOG.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`

## Korrektur

Vorher:

```bat
npm.cmd -v
npm.cmd install
npm.cmd run build
```

Nachher:

```bat
call npm.cmd -v
call npm.cmd install
call npm.cmd run build
```

## Nicht geändert

- kein Backend
- kein altes Dashboard
- keine DB
- keine OBS-Änderung
- kein Node-Neustart nötig

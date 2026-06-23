# CHANGELOG DASHUI6C Dashboard v2 Static Route

Datum: 2026-06-23  
Status: DASHUI6C / dashboard-v2 Static Route

## Zweck

`/dashboard-v2/` lieferte trotz vorhandenem Build nur:

```text
Cannot GET /dashboard-v2/
```

Ursache:

Das Backend kannte keine statische Route für `/dashboard-v2`.

## Geändert

- `backend/core/paths.js`
- `backend/server.js`
- `docs/current/DASHBOARD_V2_STATIC_ROUTE.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `project-state/CHANGELOG_DASHUI6C_DASHBOARD_V2_STATIC_ROUTE_2026-06-23.md`

## Details

### `backend/core/paths.js`

Neu:

```js
DASHBOARD_V2_DIR: path.join(ROOT_DIR, "htdocs", "dashboard-v2"),
```

### `backend/server.js`

Neu:

```js
app.use("/dashboard-v2", express.static(paths.DASHBOARD_V2_DIR, PUBLIC_STATIC_OPTIONS));
```

und Index-Fallback für:

```text
/dashboard-v2
/dashboard-v2/
```

## Nicht geändert

- `/dashboard` bleibt unverändert
- altes Dashboard bleibt produktiv
- kein React-Code geändert
- keine DB geändert
- keine Config geändert
- keine OBS-Änderung

## Node-Neustart

Nötig.

Grund: Backend-Dateien wurden geändert.

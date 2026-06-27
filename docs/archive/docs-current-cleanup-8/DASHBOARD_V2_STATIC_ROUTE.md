# Dashboard v2 Static Route

Stand: 2026-06-23  
Status: DASHUI6C / dashboard-v2 Static Route

## Zweck

DASHUI6C ergänzt die lokale Backend-Auslieferung für den React/Vite-Build von Dashboard-v2.

Problem vorher:

```text
http://127.0.0.1:8080/dashboard-v2/
Cannot GET /dashboard-v2/
```

Die Dateien lagen bereits korrekt:

```text
D:\Git\stream-control-center\htdocs\dashboard-v2\index.html
D:\Streaming\stramAssets\htdocs\dashboard-v2\index.html
```

Aber das Backend kannte nur `/dashboard`, nicht `/dashboard-v2`.

## Geändert

### `backend/core/paths.js`

Neu:

```js
DASHBOARD_V2_DIR: path.join(ROOT_DIR, "htdocs", "dashboard-v2"),
```

### `backend/server.js`

Neu:

```js
app.use("/dashboard-v2", express.static(paths.DASHBOARD_V2_DIR, PUBLIC_STATIC_OPTIONS));

app.get(["/dashboard-v2", "/dashboard-v2/"], (req, res) => {
  const dashboardV2Index = path.join(paths.DASHBOARD_V2_DIR, "index.html");
  if (fs.existsSync(dashboardV2Index)) return res.sendFile(dashboardV2Index);
  res.status(404).json({ ok: false, error: "dashboard_v2_index_not_found" });
});
```

## Nicht geändert

- kein altes Dashboard entfernt
- `/dashboard` bleibt unverändert
- kein React-Code geändert
- keine DB geändert
- keine Config geändert
- keine OBS-Änderung
- keine produktive Aktion ergänzt

## Node-Neustart

Nötig.

Grund:

```text
backend/server.js
backend/core/paths.js
```

wurden geändert.

## Test nach Installation und Node-Neustart

```text
http://127.0.0.1:8080/dashboard-v2/
```

Altes Dashboard gegenprüfen:

```text
http://127.0.0.1:8080/dashboard/
```

Optional PowerShell-Prüfung:

```powershell
Invoke-WebRequest "http://127.0.0.1:8080/dashboard-v2/" -UseBasicParsing | Select-Object StatusCode
```

Erwartung:

```text
200
```

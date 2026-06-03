# Current Chat Handoff - CAN37.3

## Stand

CAN-37.3 vorbereitet: Der vorhandene Hug-Tab `Diagnose` wird um eine zusätzliche Read-only-Diagnose erweitert.

## Geändert

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/hug_diagnostics_ext.js
htdocs/dashboard/modules/hug_diagnostics_ext.css
```

## Nicht geändert

```text
backend/modules/hug.js
htdocs/dashboard/modules/hug.js
```

## Genutzte Routen

```text
GET /api/hug/status
GET /api/hug/routes
GET /api/hug/integration-check
GET /api/hug/admin/text-pairs
GET /api/hug/admin/hug-all-texts
GET /api/hug/admin/response-texts
GET /api/hug/admin/top-title-texts
```

## Nicht genutzt

```text
Hug/Rehug/HugAll/on/off
stats/top command
reload
text-store reload
output-mode POST
admin POST
```

## Test

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-37.3 Hug Diagnose Tab Readonly Erweiterung"
```

Danach prüfen:

```text
Dashboard > Hug-System > Diagnose
```

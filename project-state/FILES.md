# FILES

## Aktueller Arbeitsstand CAN-27.1

Wichtige geaenderte/zuletzt relevante Dateien:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN27_1.md
```

## CAN-27.1 zu entfernende getrackte Altlasten

```text
htdocs/htdocs/dashboard/modules/overlays.js
htdocs/htdocs/overlays/Overlay Birthday.html
htdocs/htdocs/overlays/_rahmen.html
```

Diese Dateien liegen unter einem versehentlichen Doppelpfad und haben keine Runtime-Referenzen. Die echten Zielpfade bleiben erhalten:

```text
htdocs/dashboard/modules/overlays.js
htdocs/overlays/_overlay-birthday.html
htdocs/overlays/_rahmen.html
```

## CAN-27.1 ZIPs aus dem Chat

```text
CAN-27.1_remove_tracked_htdocs_htdocs_docs.zip
```

Wichtig: Die ZIP ersetzt nur Doku-/Projektstandsdateien. Die getrackten Altlast-Dateien muessen per `git rm` entfernt werden, weil ZIPs keine saubere Git-Loeschung darstellen.

## CAN-26 relevante ZIPs aus dem Chat

```text
CAN-26.1_overlay_monitor_scene_awareness_fix.zip
CAN-26.2_overlay_monitor_client_control_top_level_diagnostics.zip
CAN-26.3_documentation_handoff.zip
CAN-26.4_live_doc_sync_next_steps_cleanup.zip
CAN-26.5_deploy_docs_project_state_sync.zip
```

## CAN-26 / CAN-27 relevante Routen fuer Nachpruefung

```text
GET /api/overlay-monitor/client-control/status
GET /api/overlay-monitor/obs-inventory
GET /api/overlay-monitor/obs-inventory?refresh=1
GET /api/bus-diagnostics/status
```

## CAN-27.1 relevante Tests

```powershell
git ls-files "htdocs/htdocs/*"
Test-Path "D:\Git\stream-control-center\htdocs\htdocs"
Test-Path "D:\Git\stream-control-center\htdocs\dashboard\modules\overlays.js"
Test-Path "D:\Git\stream-control-center\htdocs\overlays\_overlay-birthday.html"
Test-Path "D:\Git\stream-control-center\htdocs\overlays\_rahmen.html"
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Dashboard: D:\Streaming\stramAssets\htdocs\dashboard\modules\bus_diagnostics.js
Overlay-Monitor: D:\Streaming\stramAssets\backend\modules\overlay_monitor.js
Alert-System: D:\Streaming\stramAssets\backend\modules\alert_system.js
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

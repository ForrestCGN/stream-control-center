# FILES

## Aktueller Arbeitsstand CAN-26.4

Wichtige geaenderte/zuletzt relevante Dateien:

```text
backend/modules/overlay_monitor.js
htdocs/dashboard/modules/bus_diagnostics.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN26_3.md
```

## CAN-26 ZIPs aus dem Chat

```text
CAN-26.1_overlay_monitor_scene_awareness_fix.zip
CAN-26.2_overlay_monitor_client_control_top_level_diagnostics.zip
CAN-26.3_documentation_handoff.zip
CAN-26.4_live_doc_sync_next_steps_cleanup.zip
```

## CAN-26 relevante Routen fuer Nachpruefung

```text
GET /api/overlay-monitor/client-control/status
GET /api/overlay-monitor/obs-inventory
GET /api/overlay-monitor/obs-inventory?refresh=1
GET /api/bus-diagnostics/status
```

## CAN-26 relevante Tests

```powershell
$o = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/client-control/status"

$o | Select-Object currentProgramSceneName,currentPreviewSceneName,currentProgramSceneKnown,sceneAwarenessMode,inventoryUpdatedAt,inventoryFromCache,inventoryFromMemory | Format-List

$o.summary | Select-Object total,online,info,warning,error,heartbeat,stale,dead,expectedInactive,expectedIdle,expectedNotActive,activeExpected | Format-List
```

## CAN-26.4 relevante Sync-Pruefung

```powershell
$repo = "D:\Git\stream-control-center"
$live = "D:\Streaming\stramAssets"

$files = @(
  "backend\modules\overlay_monitor.js",
  "htdocs\dashboard\modules\bus_diagnostics.js",
  "project-state\CURRENT_STATUS.md",
  "project-state\NEXT_STEPS.md",
  "project-state\TODO.md",
  "project-state\CHANGELOG.md",
  "project-state\FILES.md",
  "docs\current\CURRENT_CHAT_HANDOFF_CAN26_3.md"
)

$files | ForEach-Object {
  $repoPath = Join-Path $repo $_
  $livePath = Join-Path $live $_
  $repoHash = if (Test-Path $repoPath) { (Get-FileHash $repoPath -Algorithm SHA256).Hash } else { "" }
  $liveHash = if (Test-Path $livePath) { (Get-FileHash $livePath -Algorithm SHA256).Hash } else { "" }

  [pscustomobject]@{
    File = $_
    RepoExists = Test-Path $repoPath
    LiveExists = Test-Path $livePath
    Same = ($repoHash -ne "" -and $repoHash -eq $liveHash)
  }
} | Format-Table -AutoSize
```

## CAN-25.24 / CAN-25.25b ZIPs aus dem Chat

```text
CAN25_24_overlay_monitor_dashboard_scene_aware.zip
CAN25_25_busmatrix_system_layout_compact.zip
CAN25_25b_busmatrix_system_layout_really_compact.zip
```

Wichtig: CAN-25.25 war visuell noch nicht gut genug. Der nutzbare Dashboard-Fix fuer den SYSTEME-Bereich ist CAN-25.25b.

## Weitere relevante CAN-25 ZIPs aus dem Chat

```text
CAN25_5_sound_shadow_summary_card_fix_v2.zip
CAN25_6_sound_shadow_status_clarity.zip
CAN25_7_busmatrix_compact_system_rows.zip
CAN25_8c_busmatrix_readable_details.zip
CAN25_9_busmatrix_details_rawdata_ux_cleanup.zip
CAN25_10_busmatrix_view_filters.zip
CAN25_11_busmatrix_diagnosis_summary.zip
CAN25_12_alert_system_diagnosis_summary.zip
CAN25_13_overlay_monitor_diagnosis_summary.zip
CAN25_15_overlay_monitor_module_version_fix.zip
CAN25_17_overlay_monitor_client_control_time_risk_fix.zip
CAN25_19_alert_dryrun_objectvalue_fix.zip
CAN25_22_overlay_monitor_scene_aware_status.zip
CAN25_23_overlay_monitor_summary_clarity.zip
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

## Separat zu beachten

```text
Doppelte lokale Struktur D:\Git\stream-control-center\htdocs\htdocs\... wurde gefunden.
Nicht blind loeschen.
Spaeter separat pruefen, ob sie irgendwo referenziert wird.
```

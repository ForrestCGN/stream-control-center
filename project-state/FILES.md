# FILES

## Aktueller Arbeitsstand CAN-26.2

Wichtige geaenderte/zuletzt relevante Dateien:

```text
backend/modules/overlay_monitor.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN26_2.md
```

## CAN-26 ZIPs aus dem Chat

```text
CAN-26.1_overlay_monitor_scene_awareness_fix.zip
CAN-26.2_overlay_monitor_client_control_top_level_diagnostics.zip
```

CAN-26.1 ist der fachlich wichtige Scene-Awareness-Fix. CAN-26.2 ist der kleine Diagnose-Cleanup fuer Top-Level-Felder in `/api/overlay-monitor/client-control/status`.

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
CAN25_24_overlay_monitor_dashboard_scene_aware.zip
CAN25_25_busmatrix_system_layout_compact.zip
CAN25_25b_busmatrix_system_layout_really_compact.zip
```

## Relevante Routen fuer Nachpruefung

```text
GET /api/overlay-monitor/client-control/status
GET /api/overlay-monitor/obs-inventory
GET /api/alerts/eventbus/ack-status
GET /api/alerts/eventbus/command/dry-run
GET /api/alerts/eventbus/command/contract
GET /api/alerts/overlay-watchdog/status
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Dashboard: D:\Streaming\stramAssets\htdocs\dashboard\modulesus_diagnostics.js
Overlay-Monitor: D:\Streaming\stramAssetsackend\modules\overlay_monitor.js
Alert-System: D:\Streaming\stramAssetsackend\moduleslert_system.js
```

## Separat zu beachten

```text
Doppelte lokale Struktur D:\Git\stream-control-center\htdocs\htdocs\... wurde gefunden.
Nicht blind loeschen.
Spaeter separat pruefen, ob sie irgendwo referenziert wird.
```

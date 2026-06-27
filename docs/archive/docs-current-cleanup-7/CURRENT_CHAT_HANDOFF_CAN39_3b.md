# Current Chat Handoff - CAN39.3b

## Stand

CAN-39.3b vorbereitet: Overlay-Monitor Sicherheits-Hinweis stabiler einfügen.

## Geändert

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/overlay_monitor_safety_ext.js
htdocs/dashboard/modules/overlay_monitor_safety_ext.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN39_3b.md
```

## Nicht geändert

```text
backend/modules/overlay_monitor.js
htdocs/dashboard/modules/overlays.js
htdocs/dashboard/modules/overlays.css
```

## Ziel

```text
Sicherheits-Hinweis im Overlay-Monitor sichtbar.
Kein Extra-Tab.
Keine produktive Aktion.
```

## Technisch

```text
Kein MutationObserver.
Begrenzter Retry für ca. 9 Sekunden nach Navigation/Render.
Einfügeposition nach .ovm-head.
```

## Test

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-39.3b Overlay Monitor Sicherheits Hinweis Stabilitaet"
```

Danach prüfen:

```text
Dashboard > Control > Overlays / Overlay-Monitor
```

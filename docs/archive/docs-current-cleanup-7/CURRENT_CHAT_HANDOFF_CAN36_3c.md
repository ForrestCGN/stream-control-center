# Current Chat Handoff - CAN36.3c

## Stand

CAN-36.3c vorbereitet: Die erweiterte Message-Rotator Read-only-Diagnose wird in den vorhandenen Tab `Diagnose` integriert.

## Geändert

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/message_rotator_diagnostics_ext.js
htdocs/dashboard/modules/message_rotator_diagnostics_ext.css
```

## Nicht geändert

```text
backend/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.js
```

## Genutzte Routen

```text
GET /api/message-rotator/status
GET /api/message-rotator/routes
GET /api/message-rotator/integration-check
```

## Nicht genutzt

```text
start, stop, tick, next, manual, preview, reload, live-status, admin/settings POST, admin/texts POST
```

## Test

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-36.3c Message Rotator Diagnose Tab erweitern"
```

Danach prüfen:

```text
Dashboard > Message-Rotator > Diagnose
```

# NEXT_STEPS – stream_events

Stand: 2026-06-13 nach EVS-25

## Direkt als nächstes

EVS-25 einspielen und im Dashboard prüfen:

```powershell
cd /d D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-25 Overview Active Event Status"
```

Danach prüfen:

- `Event-System → Übersicht` zeigt den normalen Status.
- Der separate `Status`-Tab ist nicht mehr sichtbar.
- Keine technischen Dispatcher-/DirectSend-/Prepared-only-Blöcke in der normalen Ansicht.

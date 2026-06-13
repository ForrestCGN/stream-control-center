# NEXT STEPS

Stand: 2026-06-13 nach EVS-24a

## Jetzt testen

```powershell
cd /d D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-24a Dashboard Status Simplify"
```

Danach im Dashboard prüfen:

- Event-System → Status
- Kein technischer Block „Chat-Ausgabe Sicherheit“ in der normalen Statusansicht.
- Sichtbar bleiben nur einfacher Runtime-Status und Event-Lifecycle.

# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## Nach STEP8.10.3 ZIP

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.10.3 Streamer Mod Cleanup"
```

Dashboard prüfen:

```txt
/dashboard
Community -> 30 Tage VIP -> Aktionen
```

Erwartung:

```txt
- nur Refresh-/Status-Aktionen
- keine technischen Admin-Buttons
- keine JSON-Flut
```

## Danach: normale Nutzerseite weiterbauen

Mögliche nächste Schritte:

```txt
STEP8.11 VIP30 Alert
STEP8.12 VIP30 kompakte Mod-/Streamer-Ansicht
```

## Späterer Admin-/Systembereich

Nicht in der normalen VIP30-Seite:

```txt
Reward Sync/Ensure
Cleanup Dry-Run
Cleanup Run
Slot external_removed
manuelle Slot-Korrektur
VIP vergeben/entziehen
Redemption fulfill/cancel
Bus-Testevents
Live-Gates
Rohdiagnose/JSON
```

Diese Themen kommen später in:

```txt
Admin -> Module -> VIP30
```

oder:

```txt
System -> Diagnose -> VIP30
```

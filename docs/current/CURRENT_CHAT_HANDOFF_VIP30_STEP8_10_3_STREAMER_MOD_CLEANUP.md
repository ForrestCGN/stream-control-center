# CURRENT CHAT HANDOFF – VIP30 / 30TageVIP – STEP8.10.3 Streamer/Mod Cleanup

Stand: 2026-06-06

## Ergebnis

STEP8.10.3 korrigiert die Dashboard-Richtung:

- Die normale VIP30-Seite bleibt für Streamer/Mods schlank.
- Technische/Admin-Aktionen werden aus der normalen Ansicht herausgenommen.
- Admin-/Systemthemen werden in TODO/NEXT_STEPS dokumentiert.

## Hintergrund

STEP8.10.2 hatte leichte Admin-Aktionen direkt in die normale VIP30-Seite gebracht:

```txt
Reward Sync/Ensure
Cleanup Dry-Run
Cleanup Run
Slot external_removed
```

Das ist funktional nützlich, aber für den normalen Streamer-/Mod-Live-Betrieb zu technisch und zu überladen.

## Aktueller Stand der normalen VIP30-Seite

Der Tab `Aktionen` enthält nur noch sichere Refresh-Aktionen:

```txt
Status neu laden
Slots neu laden
Logs neu laden
Settings neu laden
Cleanup Check neu laden
External VIP Remove Status neu laden
EventSub VIP Status neu laden
Alles neu laden
```

Diese Aktionen schreiben nicht in Twitch, führen keinen Cleanup aus und rechnen keine Redemption ab.

## In Admin/TODO verschoben

```txt
Reward Sync/Ensure
Cleanup Dry-Run
Cleanup Run
Slot external_removed
VIP manuell vergeben
VIP manuell entziehen
Redemption fulfill/cancel
Bus-Testevents
Live-Gates umschalten
Rohdiagnose/JSON-Details
```

## Geänderte Dateien

```txt
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

## Nicht geändert

```txt
backend/modules/vip30.js
backend/modules/twitch.js
backend/modules/communication_bus.js
htdocs/dashboard/app.js
htdocs/dashboard/index.html
```

## Test

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.10.3 Streamer Mod Cleanup"
```

Danach:

```txt
/dashboard
Community -> 30 Tage VIP -> Aktionen
```

Erwartung:

```txt
nur Refresh-/Diagnosebuttons
keine Reward-Sync-/Cleanup-Run-/Slot-Korrektur-Buttons
```

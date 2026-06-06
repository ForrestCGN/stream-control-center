# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## Nach STEP8.10.1 ZIP

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.10.1 Admin Refresh Actions"
```

Dashboard testen:

```txt
/dashboard
Community -> 30 Tage VIP -> Aktionen
```

Prüfen:

```txt
- Tab Aktionen sichtbar
- einzelne Refresh-Buttons funktionieren
- Alles neu laden funktioniert
- keine JS-Fehler
```

## Danach

STEP8.10.2 planen:

```txt
Confirm-/Audit-Konzept für gefährliche Aktionen
```

Gefährliche Aktionen bleiben bis dahin gesperrt:

```txt
Cleanup Run
Reward Sync/Ensure
manuelle Slot-Korrektur
VIP vergeben/entziehen
Redemption fulfill/cancel
Bus-Testevent
Live-Gates ändern
```

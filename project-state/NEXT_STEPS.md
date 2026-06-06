# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## Nach STEP8.9.1 ZIP

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.9.1 Config UX Polish"
```

Dann Dashboard testen:

```txt
/dashboard
Community -> 30 Tage VIP -> Config
```

Prüfen:

```txt
- sichere Settings oben als Cards
- kritische Settings getrennt/aufklappbar
- Save funktioniert weiter
- kein JS-Fehler
```

## Danach

STEP8.10 planen:

```txt
Dashboard manuelle Admin-Aktionen
```

Noch nicht ohne Confirm/Audit bauen:

```txt
Cleanup Run
Reward Sync/Ensure
manuelle Slot-Korrektur
VIP vergeben/entziehen
Live-Gates umschalten
```

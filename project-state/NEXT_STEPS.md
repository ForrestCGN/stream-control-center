# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## Direkt nach STEP8.9 ZIP

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.9 Dashboard Settings"
```

Danach testen:

```txt
/dashboard
Community -> 30 Tage VIP -> Config
```

Sicherer Test:

```txt
reward.prompt ändern
speichern
Dashboard neu laden
prüfen, ob Wert bleibt
```

## Danach: STEP8.10 planen

Thema:

```txt
VIP30 Dashboard manuelle Admin-Aktionen
```

Mögliche read-only/ungefährliche Aktionen:

```txt
Status refresh
Settings refresh
Slots refresh
Logs refresh
Cleanup Check refresh
External Remove Status refresh
```

Mögliche spätere Aktionen mit Confirm/Audit:

```txt
Cleanup Run
Manuelle External-Remove-Korrektur
Reward Sync/Ensure
```

Weiterhin hart blockieren, bis separat geplant:

```txt
VIP manuell vergeben
VIP manuell entziehen
Redemption fulfill/cancel
Bus-Testevent auslösen
Live-Gates direkt umschalten
```

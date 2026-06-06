# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## STEP8.18.2 einspielen

```powershell
cd /d D:\Git\stream-control-center
node --check backend\modules\vip30.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.18.2 Avatar Resolve"
```

Danach:

```txt
Node neu starten
Dashboard mit Strg+F5 neu laden
```

## Testplan

1. Tab `Aktionen` öffnen.
2. Anzeigename/Login `AkiGhosty` eintragen.
3. `VIP30 Alert testen` klicken.
4. Prüfen:
   - Avatar geladen?
   - Dashboard-Meldung `Avatar: geladen`?
   - Overlay zeigt echten Avatar?
5. Danach ggf. weitere Namen testen.

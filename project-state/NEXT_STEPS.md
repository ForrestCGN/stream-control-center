# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## STEP8.18 einspielen

```powershell
cd /d D:\Git\stream-control-center
node --check backend\modules\vip30.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.18 Alert Test"
```

Danach:

```txt
Node neu starten
Dashboard mit Strg+F5 neu laden
```

## Testplan

1. Tab `Sounds`: prüfen, dass mehrere Sounds aktiv sind.
2. Tab `Texte`: prüfen, dass mehrere Textsets aktiv sind.
3. Tab `Aktionen`: mehrfach `VIP30 Alert testen` klicken.
4. Prüfen:
   - VIP30 Overlay erscheint
   - Sound wechselt
   - Textset wechselt
   - Dashboard zeigt Sound/Textset-Auswahl

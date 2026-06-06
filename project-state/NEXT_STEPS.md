# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## STEP8.18.1 einspielen

```powershell
cd /d D:\Git\stream-control-center
node --check backend\modules\vip30.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.18.1 Auto Sound Duration"
```

Danach:

```txt
Node neu starten
Dashboard mit Strg+F5 neu laden
```

## Testplan

1. Tab `Sounds` öffnen.
2. Bei allen Sounds `Dauer ms` auf `0` lassen/setzen.
3. Speichern.
4. Tab `Aktionen` öffnen.
5. Mehrfach `VIP30 Alert testen` klicken.
6. Prüfen:
   - Sound läuft vollständig
   - Overlay kommt mit
   - Sound/Text wechseln
   - Meldung zeigt `Dauer: Media-System Auto`

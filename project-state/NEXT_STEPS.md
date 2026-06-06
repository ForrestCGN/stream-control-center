# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## STEP8.16 testen

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.16 Texte Tab"
```

Danach:

```txt
Dashboard mit Strg+F5 neu laden
VIP30 öffnen
Tab „Texte“ prüfen
Config-Tab prüfen
```

## Testplan

1. Im Tab „Texte“ ein Textset ändern.
2. 10+ Sekunden warten.
3. Prüfen, dass Eingabe nicht überschrieben wird.
4. Speichern.
5. VIP30-Alert testen.
6. Prüfen, ob neuer Text im Overlay erscheint.

## Danach

```txt
VIP30_STABLE_V1_0_FINAL dokumentieren
```

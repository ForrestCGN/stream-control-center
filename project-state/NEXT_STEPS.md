# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## Direkt nächster Schritt

STEP8.14 einspielen und testen:

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.14 Design05 OverlaySets"
```

Danach Node neu starten.

## Test

1. Sound-System-Overlay in OBS aktiv lassen.
2. Testbundle über `/api/sound/bundle` auslösen.
3. Prüfen:
   - Sound läuft
   - Design 05 erscheint
   - Avatar/Initiale links
   - Kicker/Headline/Subline rechts
   - Perks unten
   - zufälliges OverlaySet

## Später

```txt
STEP8.15 – komfortabler Dashboard-Editor für VIP30 OverlaySets
```

## Design bei späteren Modulen

Bei passenden neuen Overlay-/Alert-Modulen zuerst prüfen:

```txt
docs/design/CGN_SPLIT_LOUNGE_DESIGN.md
```

Dann situationsbezogen anpassen.

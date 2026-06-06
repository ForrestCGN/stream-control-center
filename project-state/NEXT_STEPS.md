# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## STEP8.17 einspielen

```powershell
cd /d D:\Git\stream-control-center
node --check backend\modules\vip30.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.17 Sound Pool"
```

Danach:

```txt
Node neu starten
Dashboard mit Strg+F5 neu laden
```

## Testplan

1. VIP30 Dashboard öffnen.
2. Tab `Sounds` öffnen.
3. Mindestens zwei Sounds hinzufügen/auswählen.
4. Gewichte setzen.
5. Speichern.
6. VIP30 Alert mehrfach testen.
7. Prüfen, ob zufällig verschiedene Sounds gewählt werden.
8. Tab `Config` prüfen: Sound-Auswahl ist dort nicht mehr groß sichtbar.
9. Tab `Texte` prüfen: Textsets bleiben erhalten.

## Danach

```txt
VIP30_STABLE_V1_0_FINAL dokumentieren
```

# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## STEP8.15 testen

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.15 OverlaySet Editor"
```

Danach:

```txt
Node muss für Dashboard-JS nicht zwingend wegen JS neu gestartet werden, aber Hard-Refresh im Browser ist wichtig.
Bei statischem Cache: Node/Webserver neu starten.
```

## Testplan

1. VIP30 Dashboard öffnen.
2. Config Tab öffnen.
3. OverlaySets als Karten prüfen.
4. Headline/Subline ändern.
5. 10+ Sekunden warten.
6. Prüfen, dass Eingabe nicht gelöscht wurde.
7. Speichern.
8. VIP30-Testbundle oder echten Reward testen.

## Danach

```txt
- finale Texte feinjustieren
- Reward-Kosten final setzen
- Reward für echten Betrieb bewusst aktivieren
```

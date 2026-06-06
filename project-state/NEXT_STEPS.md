# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06

## Nach Entpacken

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\vip30.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.13 Dashboard Media Field"
```

## Dashboard-Test

1. Dashboard öffnen.
2. VIP30 öffnen.
3. Config öffnen.
4. Karte „VIP30 Alert-Sound“ nutzen.
5. Sound hochladen oder vorhandenen Audio-Sound auswählen.
6. „Sichere Settings speichern“ klicken.
7. Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/alert/status" | ConvertTo-Json -Depth 6
```

## Danach

- Sound-System-Overlay in OBS prüfen.
- `live.allowAlert` bewusst aktivieren.
- VIP30-Live-Test durchführen.

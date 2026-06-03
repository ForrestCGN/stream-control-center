# Next Steps

1. CAN-42.21 lokal entpacken.
2. `./stepdone.cmd "CAN-42.21 OBS status diagnostics-standard"` ausführen.
3. `node -c backend/modules/obs.js` prüfen.
4. `/api/obs/status` per PowerShell testen.
5. Dashboard mit STRG+F5 neu laden und `Admin > Diagnose > OBS` prüfen.
6. Danach nächstes Modul aus der Diagnose-Liste prüfen.


## Nach CAN-42.21b
- Prüfen, ob Dashboard-Dropdown jetzt alle bisher umgestellten Module enthält.
- Als Folge-CAN prüfen: echte automatische Diagnose-Registry aus Backend-Modul-Metadaten/API statt statischer Frontend-Liste.

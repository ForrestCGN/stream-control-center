# NEXT STEPS — CAN-42.28b

1. ZIP entpacken.
2. `./stepdone.cmd "CAN-42.28b Diagnostics registry coverage normalization fix"` ausführen.
3. `node -c backend/modules/diagnostics.js` ausführen.
4. Backend neu starten.
5. `/api/diagnostics/registry` erneut prüfen.

Erwartung: `coveredLoadedModules` ist nicht mehr 0 und `missingLoadedModules` enthält nicht mehr alle technischen `_js`-Modulnamen.

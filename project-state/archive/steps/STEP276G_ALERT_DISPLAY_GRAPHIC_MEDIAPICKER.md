# STEP276G – Alert-Design-Grafik per Media-Registry

## Ziel

Die Grafik über dem Alert in den Display-/Design-Profilen kann jetzt über die zentrale Media-Registry ausgewählt werden.

## Geändert

- `htdocs/dashboard/modules/alerts.js`
- Im Bereich `Design / Live-Vorschau` → `4. Grafik über dem Alert` gibt es jetzt eine Auswahl `Grafik aus Media-Registry`.
- Die alte Alert-Grafik-Auswahl bleibt als `Alte Grafik / Fallback` erhalten.

## Verhalten

1. Wenn `topGraphicMediaId` gesetzt ist, wird `topGraphicMediaUrl` als `topGraphicUrl` gespeichert und vom Overlay verwendet.
2. Wenn keine Media-Registry-Grafik gesetzt ist, wird weiterhin `topGraphicAssetId` über die alte Alert-Asset-Liste benutzt.
3. Bestehende Design-Profile bleiben kompatibel.

## Nicht geändert

- Keine Backend-Logik.
- Keine Overlay-Datei.
- Keine alten Assets entfernt.
- Keine bestehende Fallback-Funktion entfernt.

## Test

- `node --check htdocs/dashboard/modules/alerts.js` OK
- Funktionenzählung: 153 → 158, entfernte Funktionen: 0

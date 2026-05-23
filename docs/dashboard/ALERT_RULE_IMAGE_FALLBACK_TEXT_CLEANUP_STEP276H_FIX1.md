# STEP276H_FIX1 – Alert-Regel-Grafik Fallback Text-Cleanup

Dieser Schritt entfernt unnötige Erklärungstexte aus den Grafik-Fallback-Boxen im Alert-Dashboard.

## Geändert

- `htdocs/dashboard/modules/alerts.js`
- Design-Grafik-Fallback: langer Hilfetext entfernt
- Regel-Grafik-Fallback: langer Hilfetext entfernt
- Auswahl/Save-Logik unverändert

## Nicht geändert

- Media-Registry-Grafik hat weiterhin Vorrang
- alte Grafik bleibt Fallback
- keine Backend-Änderung
- keine Overlay-Änderung

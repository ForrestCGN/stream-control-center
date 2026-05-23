# STEP276G_FIX1 – Alert Display Grafik MediaPicker Layout

## Ziel

Der Bereich „Alte Grafik / Fallback“ im Design-Grid darf beim Öffnen keine darunterliegenden Grafik-Regler überlagern.

## Änderung

- `htdocs/dashboard/modules/alerts.js`
- Media-Registry-Grafikfeld spannt im Design-Grid breiter.
- Legacy-Grafik/Fallback wird im Design-Bereich als normale, stabile Box gerendert.
- Die allgemeine Sound-Fallback-Logik im Regel-Editor bleibt unverändert.

## Verhalten

- Media-Registry-Grafik hat weiterhin Vorrang.
- Alte Grafik bleibt Fallback.
- Keine Speicher-/Backend-/Overlay-Logik geändert.

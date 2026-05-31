# STEP624 – Overlay-Monitor nach aktueller OBS-Szene

## Ziel
Der Overlay-Monitor zeigt nicht mehr primär alle OBS-/Bus-Daten auf einmal, sondern fokussiert den Quellenstatus auf die aktuell geladene OBS-Program-Szene.

## Änderungen
- Aktuelle OBS-Program-Szene wird aus den vorhandenen OBS-Read-only-Endpunkten gelesen.
- Dropdown zur Szenenauswahl ergänzt.
- Standardauswahl: „Aktuelle Szene automatisch folgen“.
- Bei Auto-Follow wechselt die Anzeige mit, sobald OBS eine andere Program-Szene meldet.
- Im Tab `Quellenstatus` werden nur Browser-/Overlayquellen der ausgewählten Szene angezeigt.
- Sichtbare Quellen werden oben sortiert, ausgeblendete darunter.
- OBS-API-Wrapperdaten werden korrekt entpackt (`data.browserSources`, `data.scenes`, `data.sceneItems`).

## Nicht geändert
- Keine OBS-Aktionen.
- Kein Cache-Refresh.
- Keine Reparaturbuttons.
- Keine Automatik/Reparatur.
- Keine DB-Migration.
- Kein Backend-Code.

## Betroffene Dateien
- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

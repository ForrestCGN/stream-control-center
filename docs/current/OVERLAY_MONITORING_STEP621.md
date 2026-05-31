# Overlay Monitoring – STEP621

STEP621 ergänzt im Dashboard unter `Control → Overlays` den Quellenstatus.

## Tabs

- Übersicht
- Quellenstatus
- Bus-Clients
- OBS-Rohquellen
- Probleme
- Rohdaten

## Quellenstatus

Der neue Quellenstatus verbindet read-only Daten aus:

- `/api/obs/browser-sources`
- `/api/obs/scenes`
- `/api/obs/scene-items?scene=<sceneName>`
- `/api/overlay-monitor/status`

Ziel ist eine praktische Übersicht für Event-Overlays wie Alerts, Sound, VIP oder Deathcounter.

## Grenzen

Es gibt noch keine gespeicherte Mapping-Tabelle. Die Zuordnung zwischen OBS-Quelle und Bus-Client erfolgt nur anhand von Name, URL und Dateiname.

Der nächste sinnvolle Schritt ist STEP622: manuelle Reparaturaktionen wie Browser-Cache neu laden und Quelle kurz aus/ein.

# Overlay Monitoring – STEP627 Rahmen Overlay Redesign

STEP627 betrifft nur das visuelle Rahmen-Overlay.

## Ergebnis

`htdocs/overlays/_rahmen.html` wurde auf den aktuellen Neon-Galaxy-v2-/ForrestCGN-Look umgestellt. Die bestehende EventBus-Anbindung wurde beibehalten.

## Monitoring-Relevanz

Der Rahmen bleibt im Overlay-Monitor als eigener CGN-Client sichtbar:

- Anzeigename: `Rahmen Overlay`
- Client-ID: `overlay:frame_overlay`
- Modul: `frame_overlay`
- Mode: `obs_overlay`
- Heartbeat: alle 5 Sekunden

## Abgrenzung

Nicht Teil dieses Steps:

- OBS-Quellen ändern
- Backend verändern
- Dashboard verändern
- Reparatur-/Refresh-Buttons
- weitere Overlays redesignen

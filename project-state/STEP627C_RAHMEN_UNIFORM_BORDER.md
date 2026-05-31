# STEP627C – Rahmen gleichmäßige Randstärke

## Ziel
Der Rahmen des OBS-Spielefensters wurde nach dem STEP627B-Feedback angepasst: Die untere Kante war optisch richtig, sollte aber nicht stärker als der Rest sein.

## Änderung
- Die separate untere Verstärkung wurde entfernt.
- Der komplette Rahmen nutzt nun eine einheitliche Stärke.
- Die einheitliche Stärke orientiert sich an der bisherigen unteren Kante.
- Der dezente Neon-Lila/Cyan-Glow bleibt erhalten.
- Die Mitte bleibt vollständig transparent.
- Der Stil bleibt näher am Deathcounter-Rahmen als am Panel-Look.

## Betroffene Datei
- `htdocs/overlays/_rahmen.html`

## Unverändert
- OBS-Quellen wurden nicht geändert.
- Backend/Dashboard wurden nicht geändert.
- EventBus/Heartbeat bleibt erhalten.
- Client-ID bleibt `overlay:frame_overlay`.

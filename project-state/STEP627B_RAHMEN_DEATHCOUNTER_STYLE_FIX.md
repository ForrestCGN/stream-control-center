# STEP627B – Rahmen Deathcounter-Style Fix

Stand: 2026-05-31
Version: v0.2.1

## Ziel

Der Rahmen wurde nach dem ersten Redesign optisch korrigiert, damit er mehr wie ein sauberer Fensterrahmen wirkt und weniger wie ein Panel/Widget.

## Änderungen

- Neon-Lichtpunkte oben links/unten rechts entfernt
- Runner-/Umlauf-Effekt entfernt
- Rahmen näher am Deathcounter-Stil ausgerichtet
- Rand etwas dicker als der Deathcounter-Rahmen
- dezenter Lila/Cyan-Glow nach außen
- untere Kante leicht kräftiger als optische Begrenzung des Spielfensters
- transparente Mitte bleibt erhalten
- EventBus/Heartbeat bleibt unverändert
- Client-ID bleibt `overlay:frame_overlay`

## Betroffene Datei

- `htdocs/overlays/_rahmen.html`

## Nicht geändert

- keine OBS-Quellen
- kein Backend
- kein Dashboard
- keine Monitoring-Logik
- keine Reparaturbuttons

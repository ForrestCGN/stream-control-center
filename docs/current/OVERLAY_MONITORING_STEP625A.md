# Overlay-Monitoring STEP625A

STEP625A verbessert die Lesbarkeit des Tabs `Quellenstatus`.

Die Karten wurden in kompakte Zeilen umgebaut. Sichtbarkeit, Bus-Status und Heartbeat stehen direkt nebeneinander. Detailinformationen wie Pfad, Container, direkte Szenen, letzter Hello und letzter Heartbeat sind weiterhin vorhanden, aber einklappbar.

## Zielzustand der Anzeige

- Sichtbare Quellen stehen weiterhin oben.
- Externe Quellen werden weiterhin als extern behandelt.
- CGN-Overlays zeigen Bus/Heartbeat komprimiert an.
- Detaildaten bleiben für Diagnose verfügbar.

## Folgearbeit

Das geplante Monitoring-Issue-Lifecycle-Log gehört in einen separaten Backend-Step, damit Warnungen dauerhaft und dedupliziert gespeichert werden können.


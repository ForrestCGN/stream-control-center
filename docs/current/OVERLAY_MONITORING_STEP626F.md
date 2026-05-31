# Overlay Monitoring – STEP626F

STEP626F korrigiert die Bewertung des OBS-Inventars.

## Regel

Warnungen entstehen nur noch für echte aktive Fälle:

```text
aktuelle Program-Szene
+ effektiv sichtbar
+ eigene CGN-Quelle
+ Bus/Heartbeat fehlt oder ist veraltet
= Warnung/Fehler
```

Keine Warnung mehr für:

```text
CGN-Quelle mit Bus online und HB OK
Quellen in nicht aktiven Szenen
ausgeblendete Event-Overlays
externe Browserquellen
about:blank-/Platzhalterquellen
```

## Ergebnis

Das Inventar kann als zuverlässige Grundlage genutzt werden, um wirklich fehlende CGN-Overlay-Anbindungen zu finden, ohne dass alle vorhandenen Szenen/Quellen pauschal warnen.

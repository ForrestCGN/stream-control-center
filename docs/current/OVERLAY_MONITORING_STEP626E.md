# Overlay Monitoring – STEP626E

Aktueller Stand: OBS-Inventar mit logisch lesbarer Strukturansicht.

## Ergebnis

Der Overlay-Monitor kann nun ein vollständiges OBS-Inventar erzeugen:

- OBS-Szenen
- verschachtelte Szenen
- Browserquellen
- URLs/Dateinamen
- direkte und effektive Sichtbarkeit
- Klassifizierung CGN / extern / Platzhalter
- Bus-Client- und Heartbeat-Zuordnung

## Dashboard

Neuer Tab:

```text
Control → Overlays → OBS-Inventar
```

Die Ansicht zeigt die ausgewählte Szene als Baum inklusive Unter-Szenen. Pro Quelle werden Status, Sichtbarkeit, Typ und Bus/Heartbeat angezeigt.

## Backend

Neue Route:

```text
GET /api/overlay-monitor/obs-inventory
```

Optional:

```text
?refresh=1  erzwingt neuen OBS-Read
?cache=1    nutzt nur Cache/letzten Stand
```

## Cache

Ein erfolgreicher Inventarstand wird im RAM und zusätzlich in SQLite gespeichert. Wenn OBS beim Start oder später nicht erreichbar ist, kann der letzte gespeicherte Stand weiter angezeigt werden.

## Grenzen

Dieser Step bleibt read-only. Reparaturaktionen, OBS-Source-Toggle, Browsercache-Refresh und automatische Korrekturen sind ausdrücklich nicht enthalten.

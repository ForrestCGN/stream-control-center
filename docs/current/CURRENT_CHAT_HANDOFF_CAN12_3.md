# Current Chat Handoff - CAN-12.3

## Stand

CAN-12.3 definiert die technische Umsetzungsgrenze fuer die Guard-Anzeige im Dashboard.

## Entscheidung

CAN-12.4 darf nur folgende Datei aendern:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Geplante UI

Bereich:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Karte:

```text
Recovery Guards
```

## Erlaubt

- lokale Guard-Normalisierung
- lokale GuardSummary
- Guard-Tabelle
- Fallback-Anzeige
- keine Backend-Aenderung

## Naechster Schritt

CAN-12.4:

```text
Manual Recovery Guard Display Dashboard UI
```

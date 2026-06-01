# Current Chat Handoff - CAN-11.3

## Stand

CAN-11.3 definiert die technische Umsetzungsgrenze fuer:

```text
manual_status_resync_request
```

## Entscheidung

Die erste Umsetzung soll nur im Dashboard passieren.

Erlaubte Datei fuer CAN-11.4:

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
Manueller Status-Resync
```

Button:

```text
Status neu synchronisieren
```

## Wichtige Grenze

Keine Backend-Aenderung, keine neue Route, keine Recovery-Ausfuehrung.

## Naechster Schritt

CAN-11.4:

```text
Manual Status Resync Dashboard UI
```

Erlaubt: additive Dashboard-Datei-Aenderung.

# EVENTBUS CAN-9.7 – Recovery-Preflight Dashboard Route Consumption

## Ziel

CAN-9.7 setzt die in CAN-9.6 geplante read-only Dashboard-Anbindung an die dedizierte Preflight-Route um.

Das Dashboard lädt weiterhin den normalen Bus-Diagnostics-Status, ergänzt ihn aber additiv um:

```text
GET /api/bus-diagnostics/recovery-preflight
```

Die Route wird nur gelesen. Es gibt keine Recovery-Aktion, keinen Command, kein Prepare und kein Execute.

## Geänderte Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Umsetzung

Additiv ergänzt:

- `loadRecoveryPreflightRoute()` lädt die neue read-only Route.
- `state.lastData.recoveryPreflightRoute` speichert die Routenantwort.
- `recoveryPreflight` im Dashboard bevorzugt die Daten aus der dedizierten Route.
- Fallback auf den bestehenden Status bleibt erhalten.
- Der Preflight-Untertab zeigt zusätzlich:
  - Preflight-Route-Kontext
  - Preflight-Route-Safety
  - Route-Version
  - Route-Step
  - Route-Next-Step
  - Source-Step
  - Source-Next-Step
  - Route-only
  - Read-only

## Sicherheitsgrenze

Unverändert hart ausgeschlossen:

- keine POST-Route
- keine Command-Route
- keine Prepare-Route
- keine Execute-Route
- keine Recovery-Ausführung
- keine Simulation-Buttons
- keine Recovery-Buttons
- keine DB-Änderung
- keine Config-Änderung
- keine produktive Flow-Änderung

## Erwartung im Dashboard

Pfad:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Erwartet sichtbar:

- Recovery-Preflight weiterhin read-only
- Prepare bleibt `nein`
- Execute bleibt `nein`
- Check-Matrix bleibt sichtbar
- Preflight-Route-Kontext sichtbar
- Preflight-Route-Safety sichtbar
- RouteVersion CAN-9.4 oder neuer
- RouteStep CAN-9.4 oder neuer

## Tests

Syntax-Test:

```cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Live-Test:

1. Backend neu starten, falls nötig.
2. Dashboard öffnen.
3. Event-Bus / Communication Bus öffnen.
4. Recovery -> Preflight öffnen.
5. Prüfen, dass Route-Kontext und Route-Safety sichtbar sind.
6. Prüfen, dass weiterhin keine Aktionsbuttons sichtbar sind.

## Ergebnis

CAN-9.7 bleibt ein read-only Dashboard-Schritt. Das Dashboard konsumiert die dedizierte Preflight-Route, ohne Recovery-Funktionalität auszulösen oder produktive Systeme zu berühren.

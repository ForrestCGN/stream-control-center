# EVENTBUS CAN-23.2 - Dashboard Bus-Integration-Matrix View

## Zweck

CAN-23.2 macht die read-only Bus-Integration-Matrix im bestehenden Bus-Diagnostics-Dashboard sichtbar.

## Geaendert

```text
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
```

## Neue Dashboard-Funktion

Im Bus-Diagnostics-Modul gibt es jetzt den Tab:

```text
Bus-Matrix
```

Der Tab liest:

```text
GET /api/bus-integration-matrix/status
```

und zeigt pro System:

```text
Bus-Client
Heartbeat
Statusroute
EventBus-Status
Command/ACK
Legacy/direct
Risiko
naechster Schritt
```

## Sicherheitsgrenze

```text
read-only
keine DB
keine Queue-Mutation
keine Sound-Mutation
keine Alert-Mutation
keine Overlay-Mutation
kein EventBus-Emit
keine Recovery
keine Selbstheilung
```

## Tests

```bat
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Beide Syntax-Checks waren erfolgreich.

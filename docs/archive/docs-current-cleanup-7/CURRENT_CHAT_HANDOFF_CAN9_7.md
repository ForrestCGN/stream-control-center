# CURRENT CHAT HANDOFF – CAN-9.7

## Stand

CAN-9.7 wurde umgesetzt.

Das Dashboard-Modul `htdocs/dashboard/modules/bus_diagnostics.js` lädt jetzt zusätzlich read-only:

```text
GET /api/bus-diagnostics/recovery-preflight
```

Die Antwort wird in `state.lastData.recoveryPreflightRoute` gespeichert. Die Preflight-Anzeige bevorzugt die Route-Daten, behält aber den bestehenden Status-Fallback.

## Geändert

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Sichtbar im Dashboard

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Neu sichtbar:

- Preflight-Route-Kontext
- Preflight-Route-Safety
- Route Version
- Route Step
- Route Next
- Source Step
- Source Next
- Route only
- Read-only

## Nicht geändert

- Keine Backend-Datei
- Keine neue API-Route
- Keine POST-/Command-/Prepare-/Execute-Route
- Keine Config
- Keine DB
- Keine Recovery-Ausführung
- Keine produktive Flow-Änderung

## Nächster Schritt

CAN-9.8: Live-Test und Abnahme der Dashboard-Anbindung an die read-only Preflight-Route.

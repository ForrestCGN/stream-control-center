# EVENTBUS CAN-9.8 – Recovery-Preflight Dashboard Route Consumption Live-Test Acceptance

## Ziel

CAN-9.8 dokumentiert den erfolgreichen Live-Test von CAN-9.7.

Das Dashboard konsumiert die dedizierte read-only Route:

```text
GET /api/bus-diagnostics/recovery-preflight
```

und zeigt die Routendaten im Recovery/Preflight-Untertab an.

## Live-Test Ergebnis

Sichtprüfung im Dashboard erfolgreich.

Pfad:

```text
Admin / Bus-Diagnose -> Event-Bus / Communication Bus -> Recovery -> Preflight
```

Bestätigt sichtbar:

- Recovery-Preflight
- Preflight-Safety
- Preflight-Route-Kontext
- Preflight-Route-Safety
- Preflight-Check-Matrix
- Preflight-Scope
- Preflight-Blocker
- Preflight-Warnungen
- Preflight-Checks
- Hart blockierte Preflight-Aktionen

## Bestätigte Routendaten

```text
Route Version: CAN-9.4
Route Step: CAN-9.4
Route Next: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
Source Step: CAN-8.9
Source Next: CAN-8.10_preflight_check_matrix_live_test_acceptance
Route Only: ja
Read-only: ja
```

## Bestätigte Route-Safety

```text
Method: GET
Read-only: ja
Command Route: nein
Prepare Route: nein
Execute Route: nein
Recovery Exec: nein
```

## Bestätigte Check-Matrix

```text
Checks: 13
OK: 13
Warnings: 0
Blocking: 0
Blocked: 0
Scope: 6
```

## Bestätigte Safety-Grenze

```text
Prepare: nein
Execute: nein
Automation: nein
Productive: nein
Flow touched: nein
Queue touched: nein
Sound touched: nein
Alert touched: nein
Overlay touched: nein
```

## Wichtig

Es wurden keine produktiven Aktionen ausgeführt.

Es gibt weiterhin:

- keine Recovery-Ausführung
- keine Command-Route
- keine Prepare-Route
- keine Execute-Route
- keine Recovery-Buttons
- keine Simulation-Buttons
- kein Alert-Replay
- kein Sound-Replay
- keinen Overlay-Retry
- keine Queue-Steuerung

## Bewertung

CAN-9.7 ist damit live abgenommen.

Die read-only Preflight-Route wird im Dashboard korrekt verwendet und sichtbar getrennt vom älteren Source-Preflight dargestellt.

## Nächster Schritt

CAN-9.9 sollte als Abschluss/Startgrenze für den nächsten Block dienen.

Empfohlener nächster Block:

```text
CAN-10.0 – Erste harmlose manuelle Recovery-Aktion planen
```

Als erste mögliche Aktion sollte nur ein ungefährlicher Diagnose-/Refresh-Vorgang betrachtet werden, zum Beispiel:

```text
Preflight neu bewerten / Diagnose neu laden
```

Noch keine echte Recovery-Ausführung.

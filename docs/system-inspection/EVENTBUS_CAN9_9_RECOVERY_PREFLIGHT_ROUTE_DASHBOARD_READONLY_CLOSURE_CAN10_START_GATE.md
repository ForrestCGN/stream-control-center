# EVENTBUS CAN-9.9 – Recovery-Preflight Route/Dashboard Read-only Abschluss und CAN-10 Startgrenze

## Ziel

CAN-9.9 schließt den CAN-9.x-Strang ab.

Der Strang hat die dedizierte read-only Recovery-Preflight-Route aufgebaut, ihren Route-Kontext bereinigt und die Anzeige im Dashboard live bestätigt.

```text
GET /api/bus-diagnostics/recovery-preflight
```

## Abgeschlossener Stand

- CAN-9.0: Startgrenze für dedizierte read-only Preflight-Route dokumentiert.
- CAN-9.1: Route-Vertrag geplant.
- CAN-9.2: read-only Route umgesetzt.
- CAN-9.3: Route live getestet und abgenommen.
- CAN-9.4: Route-Kontext und NextStep saubergezogen.
- CAN-9.5: Route-Kontext live getestet und abgenommen.
- CAN-9.6: Dashboard-Consumption geplant.
- CAN-9.7: Dashboard konsumiert die dedizierte Route.
- CAN-9.8: Dashboard-Consumption live getestet und abgenommen.

## Aktuell bestätigte Werte

```text
Route Version: CAN-9.4
Route Step: CAN-9.4
Route Next: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
Source Step: CAN-8.9
Source Next: CAN-8.10_preflight_check_matrix_live_test_acceptance
Route Only: ja
Read-only: ja
```

```text
Method: GET
Command Route: nein
Prepare Route: nein
Execute Route: nein
Recovery Exec: nein
```

```text
Checks: 13
OK: 13
Warnings: 0
Blocking: 0
Blocked: 0
Scope: 6
```

## Harte Grenze bleibt aktiv

Bis zu einer separaten Freigabe darf weiterhin nichts Produktives umgesetzt werden.

Verboten bleiben:

- automatische Recovery
- manuelle Recovery-Ausführung
- Alert-Replay
- Sound-Replay
- Overlay-Retry
- Queue-Reset
- Prepare-Route
- Execute-Route
- Command-Route
- produktive Änderungen an Alert-/Sound-/Overlay-/Queue-Flows

## CAN-10 Startgrenze

CAN-10.x darf als nächster Block nur eine harmlose manuelle Recovery-nahe Aktion planen.

Empfohlener erster Kandidat:

```text
Diagnose neu bewerten / Preflight refresh / Status reload
```

Diese Aktion darf in der ersten CAN-10-Phase weiterhin nur read-only wirken:

- Status neu laden
- Preflight erneut abfragen
- Check-Matrix erneut darstellen
- Dashboard manuell aktualisieren

Sie darf nicht:

- Queues leeren
- Sounds erneut abspielen
- Alerts erneut auslösen
- Overlay-Zustände verändern
- Events replayen
- DB- oder Config-Werte ändern

## Nächster erlaubter Schritt

CAN-10.0 sollte ein Planungsstep sein:

```text
CAN-10.0 – Manual Diagnostic Refresh Start Boundary
```

Ziel: Die erste harmlose manuelle Aktion als Vertrag planen, bevor Code angefasst wird.

## Nicht geändert in CAN-9.9

```text
Keine Backend-Datei
Keine Dashboard-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausführung
Keine produktive Flow-Änderung
```

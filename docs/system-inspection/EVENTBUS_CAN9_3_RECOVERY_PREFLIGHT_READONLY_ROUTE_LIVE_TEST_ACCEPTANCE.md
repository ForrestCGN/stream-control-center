# EVENTBUS – CAN-9.3 Recovery-Preflight read-only Route Live-Test Acceptance

Stand: 2026-06-01  
Marker: `STEP_CAN9_3_RECOVERY_PREFLIGHT_READONLY_ROUTE_LIVE_TEST_ACCEPTANCE`

## Ziel

CAN-9.3 dokumentiert den erfolgreichen Live-Test der in CAN-9.2 eingefuehrten read-only Route:

```text
GET /api/bus-diagnostics/recovery-preflight
```

Dieser STEP ist ein reiner Abnahme-/Dokumentationsstep.

## Live-Test Ergebnis

Der Live-Test wurde in `D:\git\stream-control-center` ausgefuehrt.

### Route-Basis

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
$r | Select-Object module,version,feature,routeVersion,mode,readOnly,canPrepare,canExecute
```

Ergebnis:

```text
module       : bus_diagnostics
version      : 1.2.8
feature      : recovery_preflight
routeVersion : CAN-9.2
mode         : read_only_preflight_route
readOnly     : True
canPrepare   : False
canExecute   : False
```

Abnahme:

```text
OK: Route ist erreichbar.
OK: Modulversion ist 1.2.8.
OK: Route-Version ist CAN-9.2.
OK: Route meldet readOnly = true.
OK: Prepare bleibt deaktiviert.
OK: Execute bleibt deaktiviert.
```

### Route-Safety

```powershell
$r.routeSafety | Select-Object method,readOnly,commandRoute,executeRoute,prepareRoute,recoveryExecution
```

Ergebnis:

```text
method            : GET
readOnly          : True
commandRoute      : False
executeRoute      : False
prepareRoute      : False
recoveryExecution : False
```

Abnahme:

```text
OK: Nur GET.
OK: Keine Command-Route.
OK: Keine Execute-Route.
OK: Keine Prepare-Route.
OK: Keine Recovery-Ausfuehrung.
```

### Summary

```powershell
$r.summary | Select-Object recoveryPreflightStatus,recoveryPreflightCheckCount,recoveryPreflightBlockingCheckCount,recoveryPreflightWarningCheckCount,recoveryPreflightNextStep
```

Ergebnis:

```text
recoveryPreflightStatus             : ready
recoveryPreflightCheckCount         : 13
recoveryPreflightBlockingCheckCount : 0
recoveryPreflightWarningCheckCount  : 0
recoveryPreflightNextStep           : CAN-8.10_preflight_check_matrix_live_test_acceptance
```

Abnahme:

```text
OK: Preflight-Status ist ready.
OK: 13 Checks werden gemeldet.
OK: Keine Blocking-Checks.
OK: Keine Warning-Checks.
HINWEIS: recoveryPreflightNextStep ist noch historisch aus dem CAN-8 Preflight-Objekt.
```

Der historische `recoveryPreflightNextStep` ist fuer CAN-9.3 nicht blockierend, weil die Route selbst korrekt `routeVersion: CAN-9.2` meldet und keine Ausfuehrungsfunktion freischaltet.

### Check-Matrix

```powershell
$r.recoveryPreflight.checkSummary | Select-Object total,ok,warnings,blocking,blocked
```

Ergebnis:

```text
total    : 13
ok       : 13
warnings : 0
blocking : 0
blocked  : 0
```

Abnahme:

```text
OK: Check-Matrix ist vollstaendig vorhanden.
OK: Alle 13 Checks sind ok.
OK: Keine Warnungen.
OK: Keine blockierenden Checks.
OK: Keine blockierten Checks.
```

## Sicherheitsgrenze

CAN-9.3 aendert nichts an produktiven Systemen.

Weiterhin verboten:

```text
Keine POST-Route
Keine Command-Route
Keine Prepare-Route
Keine Execute-Route
Keine Recovery-Ausfuehrung
Keine Auto-Recovery
Keine Alert-Replays
Keine Sound-Replays
Keine Overlay-Retry-Aktion
Keine Dashboard-Aktionsbuttons
Keine DB-/Config-Migration
```

## Nicht geaendert

```text
Keine Backend-Datei
Keine Dashboard-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
```

## Abnahmestatus

```text
CAN-9.3: ABGENOMMEN
```

Die CAN-9.2 Route ist live getestet und als read-only bestaetigt.

## Naechster sinnvoller Schritt

```text
CAN-9.4: Route-Kontext/NextStep read-only bereinigen und dokumentieren.
```

Moegliches Ziel von CAN-9.4:

```text
Die Route darf im eigenen Route-Kontext klarer melden, dass der naechste Schritt CAN-9.3/CAN-9.4 ist,
ohne das zugrundeliegende recoveryPreflight-Objekt produktiv umzubauen.
```

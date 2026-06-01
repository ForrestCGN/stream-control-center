# EVENTBUS CAN-15.0 - Recovery/Safety Documentation Consolidation

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-15.0

## Zweck

CAN-15.0 konsolidiert die lange Recovery-/Safety-Strecke von CAN-8 bis CAN-14.

Wichtig:

```text
Dies ist nur Dokumentation/Konsolidierung.
Keine Code-Aenderung.
Keine API.
Keine Route.
Keine DB-Migration.
Keine Dashboard-Aenderung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-14.6 wurde abgeschlossen als:

```text
read-only Safety Status View
```

Der aktuelle Dashboard-Ort ist:

```text
Event-Bus / Communication Bus
Recovery
Safety Status
```

## Konsolidierte CAN-Strecke

### CAN-8.x

Schwerpunkt:

```text
Recovery-Preflight Statusfelder und Dashboard-Basis
```

Ergebnis:

```text
Recovery-nahe Statusfelder wurden sichtbar.
Kein produktiver Recovery-Flow.
```

### CAN-9.x

Schwerpunkt:

```text
Dedizierte read-only Recovery-Preflight Route
```

Ergebnis:

```text
GET /api/bus-diagnostics/recovery-preflight
readOnly true
canPrepare false
canExecute false
keine Recovery-Ausfuehrung
```

### CAN-10.x

Schwerpunkt:

```text
Manual Diagnostics Refresh
```

Ergebnis:

```text
Manueller read-only Refresh vorhandener Diagnosewerte.
Keine Recovery-Ausfuehrung.
```

### CAN-11.x

Schwerpunkt:

```text
Manual Status Resync
```

Ergebnis:

```text
Read-only Status-Resync.
Lokale Bewertung vorhandener Diagnosequellen.
Keine produktive Mutation.
```

### CAN-12.x

Schwerpunkt:

```text
Manual Recovery Guard Framework / Recovery Guards Dashboard-Karte
```

Ergebnis:

```text
Recovery Guards sichtbar.
Live-Test: 16 Guards / 16 OK / 0 Warnings / 0 Blocked / 0 Errors / 0 Blocking Failed.
Keine Recovery-Ausfuehrung.
```

### CAN-13.x

Schwerpunkt:

```text
Recovery Safety Planning
```

Abgeschlossen wurden:

```text
Audit-Konzept
Rollen-/Rechte-Konzept
Confirm-/Bestaetigungs-Konzept
SafetyStop-/Cancel-Konzept
Recovery-Kandidatenmatrix
Closure/Handoff
```

Ergebnis:

```text
Sicherheitskonzepte dokumentiert.
Produktive Recovery bleibt hart blockiert.
```

### CAN-14.x

Schwerpunkt:

```text
Read-only Safety Status View
```

Abgeschlossen wurden:

```text
Safety Status View Planning
Safety Status Contract read-only
Backend Status Shape read-only Planning
Dashboard Safety Status View Planning
Dashboard Safety Status View read-only Implementation
Live-Test
UI-Cleanup
Closure/Handoff
```

Ergebnis:

```text
Dashboard Safety Status View sichtbar.
Keine Backend-Aenderung.
Keine neue API.
Keine produktiven Buttons.
Keine Recovery-Ausfuehrung.
```

## Aktueller technischer Sicherheitsstand

```text
readOnly: true
canPrepare: false
canExecute: false
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
dashboardRecoveryButtons: false
safetyStatusApi: false
backendSafetyStatusShapeImplemented: false
```

## Aktuelle sichtbare Dashboard-Elemente

```text
Event-Bus / Communication Bus
Recovery
Safety Status
Recovery Guards
Preflight neu laden
Status neu synchronisieren
```

Wichtig:

```text
Preflight neu laden = GET/read-only
Status neu synchronisieren = vorhandene Diagnosequellen read-only bewerten
Safety Status = passive Anzeige
```

## Weiterhin hart blockiert

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
Auto Recovery
Auto Retry Overlay
Streamer.bot Action Retry
OBS Source Refresh
SafetyStop Clear
Audit Write Route
Confirm API
Rollen-/Rechte-Mutation
```

## Was weiterhin NICHT existiert

```text
Keine POST-/Command-/Prepare-/Execute-Route
Keine Recovery-Ausfuehrung
Keine Recovery-Queue
Keine SafetyStop-API
Keine Cancel-API
Keine Audit-API
Keine Confirm-API
Keine Rechte-API
Keine Backend Safety Status API
Keine produktiven Recovery-Buttons
Keine Replay-/Repair-/Clear-Buttons
```

## Wichtige Dateien

Technisch relevant:

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
backend/modules/communication_bus.js
```

Aktuelle Abschluss-/Handoff-Datei:

```text
docs/current/CURRENT_CHAT_HANDOFF_CAN14_6_FINAL.md
```

Neue Konsolidierung:

```text
docs/system-inspection/EVENTBUS_CAN15_0_RECOVERY_SAFETY_DOCUMENTATION_CONSOLIDATION.md
docs/current/CURRENT_CHAT_HANDOFF_CAN15_0.md
```

## Empfohlene naechste Richtung

CAN-15.0 ist bewusst nur Konsolidierung.

Naechste sinnvolle Option:

```text
CAN-15.1 - Recovery/Safety Next Candidate Decision
```

Ziel:

```text
entscheiden, welcher rein sichere naechste Schritt folgt
```

Empfohlene Kandidaten:

```text
A) Dokumentation/Struktur weiter konsolidieren
B) Audit-Konzept weiter planen, aber weiterhin no-write
C) Rechte-/Rollen-Konzept weiter planen, aber weiterhin no-mutation
D) SafetyStop Anzeige read-only planen, aber keine API/Mutation
```

Nicht empfohlen als direkter naechster Schritt:

```text
produktive Recovery
Alert Replay
Sound Replay
Queue Clear
Overlay Repair
SafetyStop Clear
Audit Write Route
Confirm API
```

## Abschlussbewertung

Der Stand nach CAN-15.0 ist stabil als:

```text
read-only Recovery/Safety Diagnose- und Anzeige-Strang
```

Nicht freigegeben ist:

```text
jede produktive Recovery-Aktion
```

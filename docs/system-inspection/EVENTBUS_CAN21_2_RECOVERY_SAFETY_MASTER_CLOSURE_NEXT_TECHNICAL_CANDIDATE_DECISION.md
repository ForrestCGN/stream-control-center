# EVENTBUS CAN-21.2 - Recovery Safety Master Closure / Next Technical Candidate Decision

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-21.2

## Zweck

CAN-21.2 schliesst den Recovery-Safety-Master-Dokumentationsstrang ab und entscheidet, welcher naechste sichere Kandidat vorbereitet werden soll.

Wichtig:

```text
Dies ist nur Dokumentation/Konsolidierung/Entscheidung.
Keine Code-Aenderung.
Keine API.
Keine Route.
Keine Middleware.
Kein EventBus-Emit.
Keine DB-Migration.
Keine Speicherung.
Keine Dashboard-Aenderung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
Kein Validation-Code.
```

## Ausgangslage

CAN-21.0 hat die Recovery Safety Master Documentation Consolidation erstellt.

CAN-21.1 hat die Recovery Safety Master Index / File Map Consolidation erstellt.

CAN-21.2 schliesst diesen Master-Doku-Strang ab und legt den naechsten sicheren Kandidaten fest.

## Harte Grenze fuer CAN-21.2

CAN-21.2 darf nicht enthalten:

```text
API
Route
DB
Middleware
Dashboard-Aenderung
EventBus-Emit
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rollen-/Rechte-Mutation
Queue-/Sound-/Alert-/Overlay-Mutation
Validation-Code
```

## Master-Dokumentation abgeschlossen

Der Safety-Master-Strang gilt nach CAN-21.2 als abgeschlossen.

Abgedeckt sind:

```text
CAN-13 Recovery Safety Planning
CAN-14 Safety Status View read-only
CAN-15 Audit Planning no-write/no-data
CAN-16 SafetyStop Planning read-only/no-api
CAN-17 Roles/Rights Planning no-mutation/no-implementation
CAN-18 Confirm Planning no-action/no-implementation
CAN-19 Recovery Safety Architecture Planning / Consolidation
CAN-20 Safety Architecture Backend Shape Planning read-only/no-route/no-code
CAN-21 Recovery Safety Master Documentation / Index / Closure
```

## Aktueller Gesamtstatus

```text
masterDocumentationConsolidation: true
masterIndexFileMap: true
masterClosureDecision: true
```

## Weiterhin technische Nicht-Umsetzung

Weiterhin nicht vorhanden:

```text
Safety Architecture API
Safety Architecture Route
Safety Architecture DB
Safety Architecture Middleware
Safety Architecture Dashboard-Aenderung
Safety Architecture EventBus-Emit
Validation-Code
Recovery Prepare Route
Recovery Execute Route
Recovery Execution
SafetyStop Clear
Confirm Trigger
Roles/Rights Mutation
```

## Weiterhin harte Blocker

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
SafetyStop Reset
Audit Write Route
Audit Read Route
Confirm API
Confirm Execution
Rollen-/Rechte-Mutation
Prepare Route
Execute Route
POST Command Route
```

## Entscheidung: naechster Kandidat

Bewertete Optionen:

### Option A - weiter reine Dokumentation

```text
Recovery Safety Master Documentation weiter ausbauen
```

Bewertung:

```text
Sicher, aber aktuell ausreichend konsolidiert.
```

### Option B - echte Implementierung

```text
Safety Architecture Backend Shape technisch bauen
```

Bewertung:

```text
Noch zu frueh, weil erst eine Implementierungsplanung mit echten Dateien, Tests und Grenzen noetig ist.
```

### Option C - technische Umsetzung vorbereiten, aber noch kein Code

```text
Safety Architecture Backend Shape Implementation Planning no-code
```

Bewertung:

```text
Sicherster naechster Schritt.
```

## Entscheidung

Der naechste sichere Kandidat ist:

```text
CAN-22.0 - Safety Architecture Backend Shape Implementation Planning no-code
```

## Ziel CAN-22.0

CAN-22.0 soll vorbereiten, welche echten Dateien spaeter betroffen waeren, welche Funktionen benoetigt wuerden und welche Tests zwingend waeren.

Aber:

```text
noch kein Code
keine API
keine Route
keine DB
keine Dashboard-Aenderung
keine Recovery
```

## Erwartete Inhalte fuer CAN-22.0

CAN-22.0 soll klaeren:

```text
welche echten Dateien betroffen waeren
ob backend/modules/bus_diagnostics.js betroffen waere
ob backend/modules/communication_bus.js betroffen waere
ob htdocs/dashboard/modules/bus_diagnostics.js betroffen waere
welche Helper genutzt werden muessten
welche Funktion spaeter ein internes Shape bauen duerfte
welche Validierung spaeter noetig waere
welche node -c Tests spaeter noetig waeren
welche Runtime-Tests spaeter noetig waeren
welche No-Go-Grenzen weiter gelten
```

## Noch nicht freigegeben fuer CAN-22.0

CAN-22.0 darf nicht tun:

```text
Dateien aendern
Funktionen bauen
Route bauen
API bauen
Dashboard aendern
EventBus Emit bauen
DB anfassen
Recovery vorbereiten
Recovery ausfuehren
```

## Technische Dateien, die fuer CAN-22.0 geprueft werden muessten

Vor jeder echten Implementierung oder detaillierten Implementierungsplanung muessen reale Dateien geprueft werden:

```text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
htdocs/dashboard/modules/bus_diagnostics.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Wichtig:

```text
GitHub/dev und reale Dateien sind Single Source of Truth.
Keine erfundenen Helper.
Keine Annahmen ueber vorhandene Funktionen ohne Dateipruefung.
```

## Erforderliche CAN-22.0-Grenzen

CAN-22.0 muss weiterhin bleiben:

```text
no-code
no-route
no-api
no-db
no-dashboard-change
no-eventbus-emit
no-recovery
no-mutation
```

## Abschlussbewertung CAN-21.2

CAN-21 ist abgeschlossen als:

```text
Recovery Safety Master Documentation / Index / Closure
```

CAN-21 ist nicht:

```text
technische Umsetzung
API
Route
DB
Middleware
Dashboard-Aenderung
Recovery-System
Validation-Code
```

## Naechster Schritt

```text
CAN-22.0 - Safety Architecture Backend Shape Implementation Planning no-code
```

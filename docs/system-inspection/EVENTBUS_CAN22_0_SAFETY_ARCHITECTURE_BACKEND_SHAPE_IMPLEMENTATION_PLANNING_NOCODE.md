# EVENTBUS CAN-22.0 - Safety Architecture Backend Shape Implementation Planning no-code

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-22.0

## Zweck

CAN-22.0 plant, welche echten Dateien, Funktionen, Tests und Grenzen spaeter fuer ein internes Safety-Architecture-Backend-Shape relevant waeren.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
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

CAN-21.2 wurde abgeschlossen als:

```text
Recovery Safety Master Documentation / Index / Closure
```

Dort wurde als naechster sicherer Kandidat entschieden:

```text
CAN-22.0 - Safety Architecture Backend Shape Implementation Planning no-code
```

## Harte Grenze fuer CAN-22.0

CAN-22.0 darf nicht enthalten:

```text
Code-Aenderung
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

## Ziel CAN-22.0

CAN-22.0 klaert:

```text
welche echten Dateien spaeter betroffen waeren
welche vorhandenen Dateien zuerst geprueft werden muessen
welche interne Funktion spaeter denkbar waere
welche Shape-/Validation-Grenzen gelten
welche Tests spaeter Pflicht waeren
welche No-Go-Grenzen unveraendert bleiben
```

## Echte Dateien, die vor spaeterer Umsetzung geprueft werden muessen

Vor jeder technischen Umsetzung muessen echte Dateien aus GitHub/dev gelesen werden:

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
GitHub/dev ist Single Source of Truth.
Keine Annahmen ueber vorhandene Helper oder Funktionen ohne Dateipruefung.
Keine erfundenen Helper.
Keine Parallelstruktur.
```

## Wahrscheinlich betroffene Datei fuer spaetere Backend-Shape-Logik

Wahrscheinlich betroffen:

```text
backend/modules/bus_diagnostics.js
```

Begruendung:

```text
bus_diagnostics ist bereits der zentrale read-only Diagnose-/Safety-Bereich.
Die bestehende Safety-/Recovery-Diagnose liegt dort nahe.
```

Aber:

```text
CAN-22.0 aendert diese Datei nicht.
```

## Moeglich betroffene Datei fuer spaetere Dashboard-Anzeige

Moeglich betroffen:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Begruendung:

```text
Die Safety Status View ist bereits dort sichtbar.
Eine spaetere Safety Architecture Anzeige koennte dort nur read-only erscheinen.
```

Aber:

```text
CAN-22.0 aendert diese Datei nicht.
```

## Moeglich betroffene Datei fuer spaetere EventBus-Kommunikation

Moeglich betroffen:

```text
backend/modules/communication_bus.js
```

Begruendung:

```text
EventBus-/Kommunikationsstatus koennte spaeter lesend einbezogen werden.
```

Aber:

```text
CAN-22.0 baut keinen EventBus-Emit und keine neue Kommunikation.
```

## Denkbare interne Funktion fuer spaeter

Nur Planung:

```text
buildSafetyArchitectureStatus()
```

Moegliche Eigenschaften:

```text
pure/read-only
keine Side Effects
keine DB
keine Config Writes
keine Queue/Sound/Alert/Overlay Mutation
keine OBS/Streamer.bot Aktion
keine Route
```

## Denkbare Validierungsfunktion fuer spaeter

Nur Planung:

```text
validateSafetyArchitectureStatusShape(shape)
```

Moegliche Eigenschaften:

```text
pure/read-only
nur Objekt pruefen
keine Side Effects
keine Logs mit Secrets
keine Mutation
```

Aber:

```text
CAN-22.0 baut keine Funktion.
```

## Denkbare interne Shape-Felder fuer spaeter

Aus CAN-20 uebernommen:

```text
ok
module
contract
contractVersion
readOnly
hasRoute
hasApi
hasMutation
generatedAt
overall
modules
hardBlockedActions
technicalBoundaries
warnings
notes
```

Pflichtwerte fuer ersten technischen Kandidaten spaeter:

```text
readOnly: true
hasRoute: false
hasApi: false
hasMutation: false
```

## Spaetere Tests vor technischer Umsetzung

### Syntax-Tests

Wenn spaeter Code geaendert wird:

```bat
node -c backend\modules\bus_diagnostics.js
node -c backend\modules\communication_bus.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Nur ausfuehren, wenn diese Dateien tatsaechlich geaendert wurden.

### Runtime-Read-only-Pruefungen

Spaeter denkbar:

```text
bestehende /api/bus-diagnostics/status Route bleibt unveraendert
bestehende /api/bus-diagnostics/recovery-preflight Route bleibt unveraendert
keine neue POST Route
keine Prepare/Execute Route
keine Mutation im Response-Shape
```

### Negative Checks

Spaeter zwingend pruefen:

```text
keine neue POST-/PUT-/PATCH-/DELETE-Route
keine DB-Zugriffe
keine Queue-Mutation
keine Sound-Mutation
keine Alert-Mutation
keine Overlay-Mutation
kein OBS Action Call
kein Streamer.bot Action Call
```

## Spaetere Rollback-Grenze

Wenn spaeter Code kommt, muss Rollback einfach sein:

```text
nur wenige klar benannte Dateien
keine DB-Migration
keine Config-Migration
keine produktiven Side Effects
```

## Spaetere Abnahme-Grenze

Eine spaetere erste technische Umsetzung duerfte nur akzeptiert werden, wenn:

```text
node -c bestanden
bestehende Diagnose-Routen weiter funktionieren
keine neuen Mutationsrouten existieren
readOnly true
canPrepare false
canExecute false
hasMutation false
Hard Blocker vollstaendig
Dashboard unveraendert oder nur separat freigegeben read-only
```

## No-Go-Grenzen bleiben unveraendert

```text
Keine Recovery-Ausfuehrung
Keine Prepare Route
Keine Execute Route
Keine Command Route
Kein SafetyStop Clear
Kein Confirm Trigger
Keine Rollen-/Rechte-Mutation
Keine Audit Writes
Keine Queue-/Sound-/Alert-/Overlay-Mutation
Keine OBS-/Streamer.bot-Aktion
```

## Entscheidung CAN-22.0

CAN-22.0 bereitet nur vor.

Naechster sinnvoller Schritt:

```text
CAN-22.1 - Safety Architecture Backend Shape File Inspection Planning
```

Ziel:

```text
Vor einer spaeteren technischen Planung die echten GitHub/dev-Dateien gezielt pruefen und dokumentieren, welche vorhandenen Strukturen genutzt werden koennen.
```

## Ergebnis CAN-22.0

CAN-22.0 definiert:

```text
betroffene echte Dateien
Single-Source-of-Truth-Regel
moegliche interne Funktion
moegliche Validierungsfunktion
Shape-Felder
spaetere Syntax-/Runtime-/Negative-Tests
Rollback-Grenzen
Abnahme-Grenzen
unveraenderte No-Go-Grenzen
naechste sichere Planungsrichtung
```

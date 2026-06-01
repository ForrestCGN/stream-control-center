# EVENTBUS CAN-14.0 - Read-only Safety Status View Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-14.0

## Zweck

Dieses Dokument startet die Planung fuer eine read-only Safety-Status-Anzeige.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Es aktiviert keine Recovery.
Es fuegt keine API hinzu.
Es fuegt keine Dashboard-Buttons hinzu.
Es fuehrt keine Queue-, Sound-, Alert-, Overlay-, DB- oder Config-Mutation aus.
```

## Ausgangslage

Bis CAN-12.6 wurde der Recovery-/Preflight-/Guard-Framework-Strang read-only abgeschlossen.

Bis CAN-13.6 wurde die Sicherheitsplanung fuer spaetere manuelle Recovery abgeschlossen:

```text
Audit-Konzept
Rollen-/Rechte-Konzept
Confirm-/Bestaetigungs-Konzept
SafetyStop-/Cancel-Konzept
Recovery-Kandidatenmatrix
CAN-13 Abschluss/Handoff
```

CAN-14.0 beginnt jetzt nicht mit produktiver Recovery, sondern mit der Planung einer reinen Safety-Status-Anzeige.

## Ziel CAN-14

CAN-14 soll einen Safety-Status sichtbar machen, ohne produktive Aktionen auszufuehren.

Zielrichtung:

```text
read-only Safety Status View
```

Diese Anzeige soll spaeter helfen, Sicherheitszustand und Blocker klarer zu sehen.

## Nicht-Ziele

CAN-14.0 ist nicht:

```text
SafetyStop-Implementierung
Cancel-Implementierung
Audit-Implementierung
Rollen-/Rechte-Implementierung
Confirm-Implementierung
Recovery-Implementierung
POST-/Command-/Prepare-/Execute-Route
Dashboard-Button-Implementierung
```

## Safety Status View Grundidee

Eine spaetere Safety-Status-Anzeige soll mindestens sichtbar machen:

```text
readOnly
canPrepare
canExecute
recoveryExecution
commandRoute
prepareRoute
executeRoute
safetyStopKnown
safetyStopActive
cancelKnown
auditReady
rightsReady
confirmReady
guardSummary
preflightSummary
candidateSummary
hardBlockedActions
```

In CAN-14.0 wird nur geplant, welche Felder sinnvoll sind.

## Read-only Grenze

Die Safety-Status-Anzeige darf nur lesen/anzeigen.

Erlaubt fuer spaetere CAN-14 Schritte:

```text
GET Status lesen
lokale Anzeige rendern
bestehende read-only Statusdaten zusammenfassen
Guard-/Preflight-Zusammenfassung anzeigen
harte Blocker sichtbar machen
```

Nicht erlaubt:

```text
POST
PUT
PATCH
DELETE
Queue veraendern
Sound veraendern
Alert veraendern
Overlay veraendern
OBS/Streamer.bot ausloesen
DB schreiben
Config schreiben
Recovery ausfuehren
SafetyStop setzen
SafetyStop clearen
Cancel ausloesen
```

## Moegliche Statusgruppen

### 1. Recovery Execution Safety

```text
readOnly
canPrepare
canExecute
recoveryExecution
```

Ziel:

```text
Sofort sichtbar machen, dass keine produktive Recovery aktiv ist.
```

### 2. Route Safety

```text
commandRoute
prepareRoute
executeRoute
routeSafety.method
```

Ziel:

```text
Sofort sichtbar machen, ob gefaehrliche Routen vorhanden waeren.
```

### 3. Guard / Preflight Safety

```text
guardCount
guardOk
guardWarnings
guardBlocked
guardErrors
preflightOk
preflightWarnings
preflightBlocked
```

Ziel:

```text
Bestehende Guard-/Preflight-Auswertung kompakt darstellen.
```

### 4. Manual Recovery Prerequisite Safety

```text
auditReady
rightsReady
confirmReady
safetyStopReady
cancelReady
duplicateLockReady
```

Ziel:

```text
Zeigen, welche Sicherheitsbausteine nur geplant und noch nicht technisch umgesetzt sind.
```

Wichtig:

```text
false bedeutet nicht Fehler.
false bedeutet: noch nicht implementiert / nicht freigegeben.
```

### 5. Hard Blocked Actions

```text
alertReplayBlocked
soundReplayBlocked
queueClearBlocked
overlayRepairBlocked
executeRecoveryBlocked
autoRecoveryBlocked
obsActionBlocked
streamerbotActionBlocked
```

Ziel:

```text
Klar anzeigen, welche Aktionen weiterhin hart blockiert bleiben.
```

## Ampel-Logik

Eine spaetere Anzeige darf keine falsche Sicherheit erzeugen.

Empfohlene Logik:

```text
green = read-only sicher / keine gefaehrliche Route / keine Ausfuehrung
yellow = geplant oder unvollstaendig, aber nicht aktiv gefaehrlich
red = produktive Recovery waere aktiv oder gefaehrliche Route vorhanden
gray = nicht implementiert / nicht vorhanden
```

Wichtig:

```text
Nicht implementiert ist nicht automatisch rot.
Produktive Mutation waere rot.
Read-only ohne Mutation ist gruen.
```

## Dashboard-Grenze

Eine spaetere Dashboard-Karte darf zunaechst nur anzeigen.

Keine Aktionen:

```text
Kein Refresh-Button, wenn nicht separat geplant
Kein Set SafetyStop Button
Kein Clear SafetyStop Button
Kein Cancel Button
Kein Prepare Button
Kein Execute Button
Kein Replay Button
Kein Repair Button
```

Falls ein Refresh spaeter geplant wird, muss er wieder nur GET/read-only bleiben.

## Backend-Grenze

Ein spaeterer Backend-Status darf zunaechst vorhandene read-only Informationen zusammenfassen.

Er darf nicht:

```text
neue Schreibzustaende erzeugen
Recovery vorbereiten
Recovery ausfuehren
Sicherheitsstatus mutieren
Audit schreiben
DB schreiben
Config schreiben
```

## EventBus-Grenze

CAN-14.0 legt keine neuen produktiven EventBus-Events fest.

Falls spaeter Events genutzt werden, muessen sie vorhandene Muster respektieren.

Erlaubt waere spaeter nur read-only Status/Diagnose.

## Technisch relevante Dateien fuer spaetere CAN-14 Schritte

Vor jeder Umsetzung pruefen:

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
backend/modules/communication_bus.js
docs/system-inspection/EVENTBUS_CAN13_6_RECOVERY_SAFETY_PLANNING_CLOSURE.md
docs/current/CURRENT_CHAT_HANDOFF_CAN13_6_FINAL.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Empfohlene CAN-14 Reihenfolge

```text
CAN-14.0 - Read-only Safety Status View Planning
CAN-14.1 - Safety Status Contract read-only
CAN-14.2 - Backend Status Shape read-only planen
CAN-14.3 - Dashboard Safety Status Anzeige planen
CAN-14.4 - Dashboard Safety Status Anzeige umsetzen, falls freigegeben
CAN-14.5 - Live-Test read-only
CAN-14.6 - Handoff
```

## Harte Regeln bleiben

Weiterhin verboten:

```text
Keine POST-/Command-/Prepare-/Execute-Route
Keine Recovery-Ausfuehrung
Keine Queue-Mutation
Keine Sound-Mutation
Keine Alert-Mutation
Keine Overlay-Mutation
Keine DB-/Config-Schreibzugriffe
Keine Streamer.bot-/OBS-Aktion
Keine Auto-Recovery
Kein Alert Replay
Kein Sound Replay
Kein Queue Clear
Kein Overlay State Repair
```

## Ergebnis CAN-14.0

CAN-14.0 legt fest:

```text
CAN-14 bleibt zunaechst read-only.
Safety Status View soll nur anzeigen.
Keine produktiven Aktionen.
Keine Mutationen.
Naechster Schritt ist CAN-14.1 Safety Status Contract read-only.
```

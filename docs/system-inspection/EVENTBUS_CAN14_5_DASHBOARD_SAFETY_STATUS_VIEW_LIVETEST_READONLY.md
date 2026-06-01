# EVENTBUS CAN-14.5 - Dashboard Safety Status View Live-Test read-only

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-14.5

## Zweck

Dieses Dokument beschreibt den lokalen Live-Test fuer die in CAN-14.4 umgesetzte Dashboard Safety Status View.

Wichtig:

```text
Der Live-Test kann nur auf dem lokalen Forrest-System erfolgen.
Diese Datei markiert den Test nicht automatisch als bestanden.
Status: lokal ausstehend.
```

## Ausgangslage

CAN-14.4 hat die Dashboard Safety Status Anzeige umgesetzt:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Neuer Recovery-Subtab:

```text
Safety Status
```

## Teststatus

```text
Status: pending_local_test
Bestanden: nein / noch nicht lokal bestaetigt
```

## Was geprueft werden soll

### 1. Syntax-Test

Ausfuehren:

```bat
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Erwartung:

```text
keine Ausgabe
Exit Code 0
```

### 2. Backend laeuft

Pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
```

Erwartung:

```text
ok vorhanden
module vorhanden
readOnly true
flowTouched false
queueTouched false
soundSystemTouched false
alertSystemTouched false
overlayTouched false
```

### 3. Recovery-Preflight laeuft

Pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
```

Erwartung:

```text
ok vorhanden
module bus_diagnostics
readOnly true
canPrepare false
canExecute false
routeSafety.method GET
routeSafety.commandRoute false
routeSafety.prepareRoute false
routeSafety.executeRoute false
routeSafety.recoveryExecution false
```

### 4. Dashboard oeffnen

Im Browser / Dashboard:

```text
Event-Bus / Communication Bus
```

Dann:

```text
Recovery
```

Erwartung:

```text
Recovery-Tab laedt ohne JS-Fehler.
Bestehende Subtabs bleiben sichtbar.
Neuer Subtab "Safety Status" ist sichtbar.
```

### 5. Safety Status Subtab

Subtab oeffnen:

```text
Safety Status
```

Erwartung:

```text
Safety Status Gesamt sichtbar
Recovery-Ausfuehrung sichtbar
Routen-Sicherheit sichtbar
Guards / Preflight sichtbar
Sicherheitsbausteine sichtbar
Harte Blocker sichtbar
Hinweis sichtbar
```

### 6. Keine produktiven Buttons

Im Safety Status Subtab duerfen keine Buttons sichtbar sein fuer:

```text
Recovery starten
Recovery vorbereiten
SafetyStop setzen
SafetyStop clearen
Cancel
Alert Replay
Sound Replay
Queue Clear
Overlay Repair
OBS Refresh
Streamer.bot Retry
```

### 7. Hard-Blocker sichtbar

Mindestens sichtbar:

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
```

Die Anzeige soll sinngemaess zeigen:

```text
bewusst blockiert
```

### 8. False richtig dargestellt

Sichere False-Werte sollen nicht als Fehler wirken:

```text
canPrepare false
canExecute false
recoveryExecution false
commandRoute false
prepareRoute false
executeRoute false
```

Erwartung:

```text
als sicher / nein / keine Ausfuehrung dargestellt
```

Geplante/nicht aktive Sicherheitsbausteine duerfen nicht als kaputt wirken:

```text
auditReady false
rightsReady false
confirmReady false
safetyStopReady false
cancelReady false
duplicateLockReady false
```

Erwartung:

```text
noch nicht aktiv / geplant
```

### 9. Bestehende Recovery-Subtabs

Folgende Subtabs pruefen:

```text
Übersicht
Details
Readiness
Preflight
Sperren & Simulation
Safety Status
```

Erwartung:

```text
alle laden weiter
keine JS-Fehler
keine verlorene Funktionalitaet
```

### 10. Network / Mutationscheck

Im Browser DevTools Network pruefen:

Erlaubt:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
bestehende read-only GETs
```

Nicht erlaubt:

```text
POST
PUT
PATCH
DELETE
Recovery-Route
Prepare-Route
Execute-Route
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Abnahmekriterien

CAN-14.5 darf erst als bestanden markiert werden, wenn lokal bestaetigt ist:

```text
node -c OK
Dashboard laedt
Safety Status sichtbar
keine produktiven Buttons
Hard-Blocker sichtbar
keine Mutation
bestehende Subtabs funktionieren
```

## Aktueller Status

```text
pending_local_test
```

## Nach erfolgreichem lokalen Test

Wenn Forrest den Test lokal bestaetigt, kann der Status spaeter auf:

```text
accepted_local_test
```

gesetzt werden.

Dann waere der naechste sinnvolle Schritt:

```text
CAN-14.6 - Handoff / Abschluss Safety Status View read-only
```

## Wenn Fehler auftreten

Nicht weiterbauen.

Zuerst benoetigt:

```text
Browser-Konsole Screenshot/Text
Network-Auffaelligkeiten
Node-Log
welcher Subtab betroffen ist
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

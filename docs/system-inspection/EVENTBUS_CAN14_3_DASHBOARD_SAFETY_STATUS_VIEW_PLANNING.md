# EVENTBUS CAN-14.3 - Dashboard Safety Status View Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-14.3

## Zweck

Dieses Dokument plant die spaetere Dashboard-Anzeige fuer den read-only Safety Status.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Es aktiviert keine Recovery.
Es fuegt keine API hinzu.
Es fuegt keine Route hinzu.
Es aendert keine Dashboard-Datei.
Es fuegt keine Dashboard-Karte hinzu.
Es fuegt keine Dashboard-Buttons hinzu.
Es fuehrt keine Queue-, Sound-, Alert-, Overlay-, DB- oder Config-Mutation aus.
```

## Ausgangslage

CAN-14.0 hat die read-only Safety Status View geplant.

CAN-14.1 hat den Safety Status Contract read-only definiert.

CAN-14.2 hat den spaeteren Backend Status Shape read-only geplant.

CAN-14.3 plant jetzt, wie eine spaetere Dashboard-Anzeige aussehen darf.

## Grundregel

Die spaetere Dashboard Safety Status Anzeige darf nur lesen und anzeigen.

Sie darf nicht:

```text
Recovery vorbereiten
Recovery ausfuehren
SafetyStop setzen
SafetyStop clearen
Cancel ausloesen
Audit schreiben
Rechte veraendern
Confirm ausloesen
Queue veraendern
Sound veraendern
Alert veraendern
Overlay veraendern
OBS/Streamer.bot ausloesen
DB schreiben
Config schreiben
```

## Platzierung

Naheliegender Bereich:

```text
Dashboard-Modul bus_diagnostics / Recovery-Bereich
```

Technisch relevante Datei fuer spaetere Umsetzung:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

CAN-14.3 aendert diese Datei noch nicht.

## Anzeigename

Empfohlener Kartenname:

```text
Safety Status
```

Alternativ deutsch:

```text
Sicherheitsstatus
```

Empfehlung:

```text
Sicherheitsstatus
```

Weil das Dashboard fuer Forrest primaer deutsch genutzt wird.

## Kartenstruktur

Eine spaetere Karte sollte kompakt und eindeutig sein.

Empfohlene Abschnitte:

```text
1. Gesamtstatus
2. Recovery-Ausfuehrung
3. Routen-Sicherheit
4. Guards / Preflight
5. Sicherheitsbausteine
6. Harte Blocker
7. Hinweise
```

## Abschnitt 1 - Gesamtstatus

Anzeigen:

```text
overallLevel
overallText
readOnly
generatedAt
```

Beispiel:

```text
Status: Gruen
Read-only: Ja
Recovery-Ausfuehrung: Nein
Letzte Auswertung: 2026-...
```

Regel:

```text
Gesamtstatus darf niemals gruen sein, wenn recoveryExecution true ist.
Gesamtstatus darf niemals gruen sein, wenn gefaehrliche Routen vorhanden sind.
```

## Abschnitt 2 - Recovery-Ausfuehrung

Anzeigen:

```text
readOnly
canPrepare
canExecute
recoveryExecution
productiveMutationPresent
```

Erwarteter sicherer Zustand:

```text
readOnly: true
canPrepare: false
canExecute: false
recoveryExecution: false
productiveMutationPresent: false
```

Wichtig:

```text
false ist hier gut/sicher.
```

## Abschnitt 3 - Routen-Sicherheit

Anzeigen:

```text
routeSafetyMethod
commandRoute
prepareRoute
executeRoute
postRoutePresent
```

Erwarteter sicherer Zustand:

```text
routeSafetyMethod: GET
commandRoute: false
prepareRoute: false
executeRoute: false
postRoutePresent: false
```

Wichtig:

```text
false ist hier gut/sicher.
```

## Abschnitt 4 - Guards / Preflight

Anzeigen:

```text
guardCount
guardOk
guardWarnings
guardBlocked
guardErrors
preflightKnown
preflightOk
preflightWarnings
preflightBlocked
```

Wenn Werte unbekannt sind:

```text
Nicht verfuegbar
```

Nicht raten.

## Abschnitt 5 - Sicherheitsbausteine

Anzeigen:

```text
auditReady
rightsReady
confirmReady
safetyStopReady
cancelReady
duplicateLockReady
```

Wichtig:

```text
false ist hier nicht automatisch Fehler.
false bedeutet: geplant, aber noch nicht technisch implementiert/freigegeben.
```

Empfohlener UI-Text:

```text
Geplant / noch nicht technisch aktiv
```

Nicht anzeigen als:

```text
kaputt
Fehler
rot
```

Solange keine produktive Recovery aktiv ist.

## Abschnitt 6 - Harte Blocker

Anzeigen als Liste:

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

Wichtig:

```text
Blockiert ist hier gut.
Diese Aktionen sind bewusst gesperrt.
```

Empfohlener UI-Text:

```text
Bewusst blockiert
```

## Abschnitt 7 - Hinweise

Anzeigen:

```text
notes[]
unknown fields
data source notes
read-only Hinweise
```

Keine technischen Dumps im Standard.

## Farb-/Level-Logik

Level aus CAN-14.1:

```text
green  = read-only sicher / keine gefaehrliche Route / keine Ausfuehrung
yellow = geplant, unvollstaendig oder beobachtungswuerdig, aber nicht aktiv gefaehrlich
red    = produktive Recovery aktiv oder gefaehrliche Route vorhanden
gray   = nicht implementiert / nicht vorhanden / nicht anwendbar
```

Dashboard-Regel:

```text
green -> OK / sicher read-only
yellow -> geplant/offen/hinweis
red -> Gefahr / produktive Mutation / gefaehrliche Route
gray -> nicht verfuegbar / nicht implementiert
```

## UI-Texte fuer false

False muss kontextabhaengig dargestellt werden.

### Sicheres false

Beispiele:

```text
canExecute: false
recoveryExecution: false
executeRoute: false
```

Anzeige:

```text
Nein / sicher
```

### Geplantes false

Beispiele:

```text
auditReady: false
rightsReady: false
safetyStopReady: false
```

Anzeige:

```text
Noch nicht aktiv
```

### Blockiertes true

Beispiel:

```text
hardBlockedAction.blocked: true
```

Anzeige:

```text
Bewusst blockiert
```

## Unknown-Anzeige

Unknown darf nicht als OK verkauft werden.

Anzeige:

```text
Unbekannt
```

mit grauem Level.

Beispieltext:

```text
Keine belastbare read-only Datenquelle vorhanden.
```

## Keine Buttons

CAN-14.3 legt fest:

In der spaeteren Safety Status Anzeige duerfen keine Buttons enthalten sein fuer:

```text
Recovery starten
Recovery vorbereiten
SafetyStop setzen
SafetyStop clearen
Cancel
Replay Alert
Replay Sound
Queue Clear
Overlay Repair
OBS Refresh
Streamer.bot Retry
```

Auch nicht als deaktivierte produktive Buttons.

Grund:

```text
Produktive Aktionen duerfen nicht visuell normalisiert werden.
```

## Refresh-Frage

Ein spaeterer Refresh-Button waere nur dann akzeptabel, wenn separat geplant und weiterhin nur GET/read-only.

CAN-14.3 entscheidet:

```text
Kein Refresh-Button in der ersten Safety-Status-Anzeige.
```

Begruendung:

```text
Bestehende Dashboard-Funktionen haben bereits read-only Aktualisierungsmuster.
Die Safety-Karte soll zuerst rein passiv bleiben.
```

## Kompakte Anzeige statt Dump

Die Anzeige soll keine riesigen JSON-Dumps zeigen.

Empfohlene UI:

```text
kleine Status-Chips
kurze Zeilen
Gruppen mit klaren Labels
Hard-Blocker als Liste
Detail-Dump hoechstens spaeter separat und read-only
```

## Erwarteter sicherer Standardzustand

```text
Overall: green oder yellow
readOnly: true
canPrepare: false
canExecute: false
recoveryExecution: false
dangerousRoutesPresent: false
productiveMutationPresent: false
hardBlockedActions: vorhanden und blocked=true
```

Yellow ist akzeptabel, wenn Sicherheitsbausteine nur geplant sind.

## Fehlerzustand

Red ist Pflicht bei:

```text
recoveryExecution: true
canExecute: true
executeRoute: true
prepareRoute: true
commandRoute: true
postRoutePresent: true
productiveMutationPresent: true
```

## Dashboard-Testplanung fuer spaetere Umsetzung

Wenn spaeter umgesetzt, mindestens pruefen:

```text
Karte zeigt readOnly true
Karte zeigt canExecute false als sicher
Karte zeigt recoveryExecution false als sicher
Karte zeigt executeRoute false als sicher
Karte zeigt auditReady false nicht als Fehler
Karte zeigt Hard-Blocker als bewusst blockiert
Keine produktiven Buttons vorhanden
Keine POST-Aufrufe aus dem Dashboard
Keine Queue/Sound/Alert/Overlay-Aenderung
```

## Technisch relevante Dateien fuer spaetere Umsetzung

Vor jeder Umsetzung pruefen:

```text
htdocs/dashboard/modules/bus_diagnostics.js
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
docs/system-inspection/EVENTBUS_CAN14_1_SAFETY_STATUS_CONTRACT_READONLY.md
docs/system-inspection/EVENTBUS_CAN14_2_BACKEND_STATUS_SHAPE_READONLY_PLANNING.md
```

## Versionen

CAN-14.3 ist ein reiner Doku-/Planungsschritt.

Daher:

```text
Keine Modulversion erhoehen.
Keine routeVersion erhoehen.
Keine Backend-Datei aendern.
Keine Dashboard-Datei aendern.
```

Wenn spaeter Dashboard-Code umgesetzt wird, muss dann separat geprueft werden:

```text
Gibt es Dashboard-Modulversion?
Gibt es sichtbare Version im Status?
Muss bus_diagnostics Dashboard-Doku angepasst werden?
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

## Ergebnis CAN-14.3

CAN-14.3 definiert:

```text
Dashboard Safety Status Anzeige bleibt read-only.
Kartenstruktur und UI-Bedeutung sind geplant.
False, unknown und blocked werden kontextabhaengig angezeigt.
Keine Buttons in der ersten Safety-Status-Anzeige.
Naechster Schritt ist CAN-14.4 Dashboard Safety Status Anzeige umsetzen, falls freigegeben.
```

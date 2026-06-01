# EVENTBUS CAN-15.1 - Recovery/Safety Next Candidate Decision

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-15.1

## Zweck

CAN-15.1 entscheidet, welcher sichere naechste Kandidat nach der CAN-8 bis CAN-14 Konsolidierung weiter geplant werden soll.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Keine Code-Aenderung.
Keine API.
Keine Route.
Keine DB-Migration.
Keine Dashboard-Aenderung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-15.0 hat die Recovery-/Safety-Strecke CAN-8 bis CAN-14 konsolidiert.

Aktueller stabiler Stand:

```text
read-only Recovery/Safety Diagnose- und Anzeige-Strang
```

Aktuell sichtbar:

```text
Event-Bus / Communication Bus
Recovery
Safety Status
Recovery Guards
Preflight neu laden
Status neu synchronisieren
```

## Bewertete Kandidaten

### Kandidat A - weitere Doku-/Struktur-Konsolidierung

Beschreibung:

```text
Doku weiter aufraeumen, Querverweise staerken, aktuelle Safety-Grenzen zentraler machen.
```

Risiko:

```text
low
```

Vorteile:

```text
kein technisches Risiko
hilft gegen Parallelstaende
stabilisiert Projektuebergaben
```

Nachteile:

```text
bringt keine neue Dashboard-Funktion
```

Bewertung:

```text
sicher, aber nach CAN-15.0 nicht zwingend sofort noetig
```

### Kandidat B - Audit-Konzept weiter planen, aber no-write

Beschreibung:

```text
Audit-Struktur weiter vorbereiten, aber ohne DB, ohne Write-Route, ohne Speicherung.
```

Risiko:

```text
low bis medium
```

Vorteile:

```text
bereitet spaetere manuelle Recovery sicher vor
passt zu CAN-13.1 Audit-Konzept
kann weiterhin read-only bleiben
```

Nachteile:

```text
muss sehr klar von echter Audit-Speicherung getrennt bleiben
```

Bewertung:

```text
sinnvoller naechster Safety-Baustein, solange strikt no-write
```

### Kandidat C - Rollen-/Rechte-Konzept weiter planen, aber no-mutation

Beschreibung:

```text
Rollen-/Rechte-Struktur weiter definieren, aber keine Rechte-API, keine DB-Mutation, keine aktive Durchsetzung.
```

Risiko:

```text
medium
```

Vorteile:

```text
wichtig fuer spaetere Admin-/Owner-Aktionen
passt zu Dashboard-Zukunft
```

Nachteile:

```text
kann schnell in produktive Rechteverwaltung kippen
braucht spaeter DB-/Usermodell und Audit
```

Bewertung:

```text
wichtig, aber besser nach Audit-No-Write-Struktur
```

### Kandidat D - SafetyStop Anzeige read-only planen, aber keine API/Mutation

Beschreibung:

```text
SafetyStop-Status nur als geplantes/read-only Anzeigeobjekt weiterdenken.
```

Risiko:

```text
medium
```

Vorteile:

```text
passt zu Safety Status View
bereitet spaetere Stop-/Cancel-Grenzen vor
```

Nachteile:

```text
ohne echte API nur Anzeige/Planung
mit API waere es direkt riskanter
```

Bewertung:

```text
sinnvoll, aber erst nach Audit-/Entscheidungsgrundlage
```

## Nicht als naechster Schritt freigegeben

Weiterhin nicht direkt umsetzen:

```text
Produktive Recovery
Alert Replay
Sound Replay
Queue Clear
Overlay Repair
SafetyStop Clear
Audit Write Route
Confirm API
Rollen-/Rechte-Mutation
Prepare Route
Execute Route
POST Command Route
```

## Entscheidung

Empfohlener naechster Kandidat:

```text
CAN-15.2 - Audit Boundary no-write Planning
```

## Begruendung

Audit ist die sauberste naechste Grundlage, bevor spaeter irgendeine Recovery-nahe Aktion, SafetyStop-/Cancel-Logik, Confirm oder Rollen-/Rechte-Durchsetzung sinnvoll geplant werden kann.

Wichtig:

```text
Audit in CAN-15.2 bleibt no-write.
Keine DB-Tabelle.
Keine Audit-API.
Keine POST-Route.
Keine Speicherung.
Keine produktive Ausfuehrung.
```

CAN-15.2 soll nur festlegen:

```text
welche Audit-Ereignisse spaeter benoetigt werden
welche Felder spaeter Pflicht waeren
welche Daten niemals gespeichert werden duerfen
welche Events/Entscheidungen nur geplant sind
welche Grenzen fuer eine spaetere Write-Phase gelten
```

## CAN-15.2 harte Grenze

CAN-15.2 darf nicht enthalten:

```text
CREATE TABLE
INSERT
UPDATE
DELETE
POST /audit
API-Route
Dashboard-Button
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rechte-Mutation
```

## Erwartetes Ergebnis von CAN-15.2

```text
Audit Boundary ist geplant.
No-write-Grenze ist dokumentiert.
Spaetere Audit-Write-Phase bleibt blockiert.
```

## Aktueller Sicherheitsstand bleibt

```text
readOnly: true
canPrepare: false
canExecute: false
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
dashboardRecoveryButtons: false
```

## Abschluss CAN-15.1

CAN-15.1 entscheidet:

```text
Naechster sicherer Kandidat ist Audit Boundary no-write Planning.
Naechster Schritt: CAN-15.2.
```

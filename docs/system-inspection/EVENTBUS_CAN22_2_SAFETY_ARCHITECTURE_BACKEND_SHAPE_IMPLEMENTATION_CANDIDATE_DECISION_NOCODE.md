# EVENTBUS CAN-22.2 - Safety Architecture Backend Shape Implementation Candidate Decision no-code

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-22.2

## Zweck

CAN-22.2 entscheidet auf Basis der CAN-22.1 Datei-Inspektion, welche spaetere technische Variante fuer ein internes Safety-Architecture-Backend-Shape am sichersten waere.

Wichtig:

```text
Dies ist nur Planung/Dokumentation/Entscheidung.
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

CAN-22.1 hat echte GitHub/dev-Dateien geprueft:

```text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
htdocs/dashboard/modules/bus_diagnostics.js
```

Wichtigste Feststellung:

```text
backend/modules/bus_diagnostics.js ist der wahrscheinlich sinnvollste spaetere Ort fuer eine interne read-only Shape-Funktion.
backend/modules/communication_bus.js ist eher Statusquelle, aber wegen Emits/Replay/Reset/Settings nicht der erste Ort fuer Shape-Logik.
htdocs/dashboard/modules/bus_diagnostics.js hat bereits Safety-Status-Anzeige-Logik, sollte aber erst spaeter separat geplant werden.
```

## Harte Grenze fuer CAN-22.2

CAN-22.2 darf nicht enthalten:

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

## Bewertete Kandidaten

### Kandidat A - nur interne Funktion, nicht eingebunden

Beschreibung:

```text
Eine spaetere interne Funktion in backend/modules/bus_diagnostics.js wird gebaut, aber noch nicht in eine Response eingebunden.
```

Moeglicher Name:

```text
buildSafetyArchitectureStatusShape(statusResult)
```

Vorteile:

```text
geringstes Risiko
keine API-Aenderung
keine Route-Aenderung
keine Dashboard-Auswirkung
keine Response-Vertragsaenderung
gut isolierbar
```

Nachteile:

```text
ohne Export/Response schwer live sichtbar
Tests muessten zunaechst Syntax/Code-Review bleiben
```

Bewertung:

```text
sicherster erster technischer Kandidat
```

### Kandidat B - interne Funktion plus bestehende Status-Response erweitern

Beschreibung:

```text
backend/modules/bus_diagnostics.js baut intern ein Safety-Architecture-Shape und haengt es an die bestehende GET /api/bus-diagnostics/status Response.
```

Vorteile:

```text
direkt read-only sichtbar
bestehende Dashboard-/API-Struktur kann spaeter darauf zugreifen
kein neuer Route-Pfad
```

Nachteile:

```text
bestehender Response-Vertrag wird erweitert
Dashboard/Clients koennten groessere Payload erhalten
mehr Tests noetig
```

Bewertung:

```text
moeglicher zweiter technischer Kandidat, aber nicht als erster Schritt
```

### Kandidat C - neue GET Route

Beschreibung:

```text
Neue Route z. B. GET /api/bus-diagnostics/safety-architecture
```

Vorteile:

```text
sauber getrennt
eigener Contract
```

Nachteile:

```text
neue API/Route
muss separat abgesichert werden
aktuell gegen no-route-Grenze
```

Bewertung:

```text
aktuell nicht freigegeben
```

### Kandidat D - Dashboard-Anzeige direkt bauen

Beschreibung:

```text
Dashboard bekommt direkt eine neue Safety Architecture Anzeige.
```

Vorteile:

```text
sichtbar fuer User
```

Nachteile:

```text
Dashboard-Aenderung
braucht Backend-Shape/Contract zuerst
erhoeht UI-Komplexitaet
```

Bewertung:

```text
aktuell nicht freigegeben
```

### Kandidat E - communication_bus.js erweitern

Beschreibung:

```text
Safety-Architecture-Shape in communication_bus.js einbauen.
```

Vorteile:

```text
Communication Bus ist zentrale Kommunikationsquelle
```

Nachteile:

```text
communication_bus.js enthaelt Emits, Replay, Reset, Settings und DB-bezogene Logik
unnötig hohes Risiko fuer Shape-Logik
nicht passend als erster Ort
```

Bewertung:

```text
nicht empfohlen
```

## Entscheidung

Sicherster naechster technischer Kandidat fuer spaetere Umsetzung:

```text
Kandidat A - nur interne Funktion in backend/modules/bus_diagnostics.js, nicht eingebunden
```

## Entscheidung begruendet

Warum Kandidat A:

```text
kein neuer Route-Pfad
keine API-Aenderung
keine Dashboard-Aenderung
keine DB
kein EventBus-Emit
keine Response-Aenderung
keine Recovery
klarer isolierter Codebereich
```

## Noch nicht freigegeben

Auch Kandidat A ist in CAN-22.2 noch nicht freigegeben.

Nicht tun:

```text
Funktion schreiben
Datei aendern
Response erweitern
Route bauen
Dashboard aendern
Tests ausfuehren als angeblich bestanden
```

## Naechster Planungsschritt vor Code

Vor einer echten Umsetzung muss ein genauer Code-Plan erstellt werden:

```text
CAN-22.3 - Safety Architecture Backend Shape Internal Function Code Plan no-code
```

## CAN-22.3 Ziel

CAN-22.3 soll konkret planen:

```text
wo in backend/modules/bus_diagnostics.js die Funktion spaeter stehen duerfte
welche Eingaben sie bekommt
welche Ausgabe sie liefert
welche bestehenden Felder genutzt werden
welche harten Defaults gesetzt werden
welche No-Mutation-Grenzen eingebaut werden
welche Tests spaeter laufen muessen
```

Aber:

```text
weiterhin kein Code
keine Datei-Aenderung
```

## Spaetere Pflicht-Tests bei echter Umsetzung

Wenn spaeter eine echte Umsetzung freigegeben wird:

```bat
node -c backend\modules\bus_diagnostics.js
```

Falls andere Dateien betroffen waeren:

```bat
node -c backend\modules\communication_bus.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Aber:

```text
CAN-22.2 fuehrt keine Tests aus.
```

## Weiterhin harte No-Go-Grenzen

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
Keine neue API
Keine neue Route
Keine Dashboard-Aenderung
Keine DB
Keine Middleware
Kein EventBus-Emit
Kein Validation-Code
```

## Ergebnis CAN-22.2

CAN-22.2 definiert:

```text
bewertete Implementierungskandidaten
Entscheidung fuer Kandidat A
Begruendung der Entscheidung
nicht freigegebene Punkte
naechster no-code Code-Plan-Schritt
spaetere Pflicht-Tests
weiterhin harte No-Go-Grenzen
```

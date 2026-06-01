# EVENTBUS CAN-15.5 - Audit Display Planning read-only/no-data Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-15.5

## Zweck

CAN-15.5 plant eine spaetere Audit-Anzeige im Dashboard, bleibt aber strikt read-only/no-data.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Keine Code-Aenderung.
Keine API.
Keine Route.
Kein EventBus-Emit.
Keine DB-Migration.
Keine Speicherung.
Keine Dashboard-Aenderung.
Keine echten Audit-Daten.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-15.2 hat die Audit-Boundary no-write geplant.

CAN-15.3 hat den Audit-Event-Katalog no-write geplant.

CAN-15.4 hat die Audit-Data-Minimization-Policy no-write geplant.

CAN-15.5 plant nun, wie eine spaetere Audit-Anzeige aussehen koennte, ohne sie technisch zu bauen und ohne Datenquelle.

## Harte no-data/no-write-Grenze

CAN-15.5 darf nicht enthalten:

```text
CREATE TABLE
INSERT
UPDATE
DELETE
POST /audit
GET /audit
API-Route
Dashboard-Button mit Datenabruf
EventBus-Emit
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rechte-Mutation
echte Audit-Daten
Mock-Daten, die wie echte Daten wirken
```

## Zielbild fuer spaeter

Eine spaetere Audit-Anzeige koennte ein Dashboard-Bereich sein fuer:

```text
sicherheitsnahe Entscheidungen
read-only Recovery-/Safety-Aktionen
blockierte High-Risk-Anfragen
Cancel-/Failed-Ergebnisse
Guard-/Preflight-Entscheidungen
```

Aber:

```text
CAN-15.5 baut diese Anzeige nicht.
```

## Moeglicher spaeterer Ort im Dashboard

Planungsoption:

```text
Event-Bus / Communication Bus
Recovery
Audit
```

Alternative langfristig:

```text
Admin / System
Audit
```

Entscheidung fuer spaeter:

```text
Noch offen.
Keine Dashboard-Datei aendern.
```

## Anzeigezustaende fuer spaeter

### 1. No Data / Nicht implementiert

Pflichtzustand fuer die erste spaetere Anzeige:

```text
Audit-Anzeige ist geplant, aber noch nicht aktiv.
Es werden keine Audit-Daten geladen.
Keine Audit-API vorhanden.
```

### 2. Keine Berechtigung

Spaeterer Zustand:

```text
Du hast keine Berechtigung, Audit-Daten zu sehen.
```

Wichtig:

```text
Nur Anzeige planen.
Keine Rechtepruefung bauen.
```

### 3. Datenquelle nicht vorhanden

Spaeterer Zustand:

```text
Audit-Datenquelle ist nicht eingerichtet.
```

### 4. Datenquelle vorhanden, aber leer

Spaeterer Zustand:

```text
Keine Audit-Eintraege im gewaehlten Zeitraum.
```

### 5. Fehler beim Laden

Spaeterer Zustand:

```text
Audit-Daten konnten nicht geladen werden.
```

Aber:

```text
CAN-15.5 baut keinen Load.
```

## Spaetere Filter-Ideen

Nur Planung:

```text
Zeitraum
Event
Kategorie
Risk Level
Decision
Result
Actor
Scope
Source
Read-only ja/nein
Blocked ja/nein
```

## Spaetere Spalten-Ideen

Nur Planung:

```text
Zeit
Event
Phase
Kategorie
Risk
Actor
Action
Scope
Decision
Result
Reason
Correlation ID
```

## Spaetere Detailansicht

Nur Planung:

```text
Audit-ID
Event
Phase
Zeit
Quelle
Actor
Action
Scope
Route
Read-only Flags
Guard Summary
Preflight Summary
Decision
Result
Reason
redigierte Metadata
```

## Datenschutzanzeige fuer spaeter

Eine spaetere Audit-Anzeige sollte klar zeigen:

```text
Secrets werden nicht angezeigt.
Sensitive Werte werden redigiert.
Audit zeigt nur minimierte Daten.
```

## Rollen-/Rechtehinweis fuer spaeter

Eine spaetere Anzeige sollte enthalten:

```text
Audit-Anzeige ist nur fuer berechtigte Rollen vorgesehen.
```

Voraussichtlich:

```text
Admin
Owner
```

Aber:

```text
CAN-15.5 baut keine Rollen-/Rechte-Logik.
```

## Keine Datenabrufe

CAN-15.5 plant ausdruecklich keine Route:

```text
GET /api/audit
GET /api/audit/events
GET /api/audit/logs
GET /api/system/audit
```

Diese bleiben blockiert.

## Keine Buttons

CAN-15.5 plant keine produktiven Buttons.

Nicht erlaubt:

```text
Audit laden
Audit exportieren
Audit loeschen
Audit bereinigen
Audit speichern
Recovery starten
Replay ausfuehren
Queue leeren
SafetyStop clearen
```

## Spaetere Export-Grenze

Audit-Export braucht eigene Planung.

Nicht Teil von CAN-15.5:

```text
CSV Export
JSON Export
Download
Copy All
Send to Discord
Send to File
```

## Spaetere Retention-Anzeige

Nur Planung:

```text
Retention-Konfiguration anzeigen
Retention-Status anzeigen
naechste Bereinigung anzeigen
```

Aber:

```text
Keine Retention-Implementierung.
Keine Loeschlogik.
```

## No-Mock-Regel

Keine Fake-Audit-Daten verwenden, die spaeter mit echten Daten verwechselt werden koennen.

Erlaubt waere spaeter nur:

```text
leerer Zustand
statischer Hinweistext
Schema-Hinweis ohne Eintraege
```

Nicht erlaubt:

```text
Beispiel-Logs im Live-Dashboard
Pseudo-Audit-Eintraege
zufaellige Testdaten
```

## Abgrenzung zu bestehenden Bereichen

Safety Status View bleibt:

```text
passive Sicherheitsanzeige
```

Recovery Guards bleibt:

```text
Guard-/Preflight-Anzeige
```

Spaetere Audit-Anzeige waere:

```text
Nachvollziehbarkeit von Anfragen, Entscheidungen und Ergebnissen
```

## Minimaler spaeterer erster technischer Schritt

Noch nicht freigegeben, nur Orientierung:

```text
Dashboard-Hinweiskarte ohne API und ohne Daten
```

Diese duerfte spaeter nur anzeigen:

```text
Audit-Anzeige geplant.
Noch keine Audit-Datenquelle.
Keine Daten werden geladen.
```

Aber:

```text
CAN-15.5 baut das nicht.
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
Keine Audit Write Route
Keine Audit Read Route
```

## Ergebnis CAN-15.5

CAN-15.5 definiert:

```text
moeglichen spaeteren Dashboard-Ort
Anzeigezustaende
Filter-Ideen
Spalten-Ideen
Detailansicht-Ideen
Datenschutz-/Rechtehinweise
No-data/no-mock/no-route-Grenze
Export-/Retention-Abgrenzung
```

## Naechster sinnvoller Schritt

```text
CAN-15.6 - Audit Planning Closure / Handoff
```

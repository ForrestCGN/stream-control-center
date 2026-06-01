# EVENTBUS CAN-16.3 - SafetyStop Integration Boundary read-only/no-api Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-16.3

## Zweck

CAN-16.3 plant, an welchen bestehenden Recovery-/Safety-Bereichen SafetyStop spaeter andocken duerfte.

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
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-16.0 hat das SafetyStop-Statuskonzept geplant.

CAN-16.1 hat die SafetyStop-State-Matrix geplant.

CAN-16.2 hat den SafetyStop Display Contract geplant.

CAN-16.3 legt nun Integrationsgrenzen fest, ohne irgendeine Integration technisch umzusetzen.

## Harte Grenze fuer CAN-16.3

CAN-16.3 darf nicht enthalten:

```text
SafetyStop API
SafetyStop setzen
SafetyStop clearen
SafetyStop resetten
Dashboard-Button
DB-Tabelle
GET-Route
POST-Route
EventBus-Emit
Recovery-Ausfuehrung
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Potentielle spaetere Integrationspunkte

Nur Planung:

```text
Safety Status View
Recovery Guards
Recovery Preflight
Audit Planning
Confirm Planning
Rights/Roles Planning
Manual Recovery Candidate Matrix
```

## Integration Boundary: Safety Status View

SafetyStop duerfte spaeter als reine Anzeige in Safety Status View erscheinen.

Erlaubte spaetere Anzeigeinformationen:

```text
state
known
active
level
label
message
blocksRecovery
blocksHighRiskActions
clearAllowed=false
clearVisible=false
reason
source
```

Nicht erlaubt ohne separate Freigabe:

```text
Clear-Button
Set-Button
Reset-Button
Refresh-Button mit SafetyStop API
Recovery-Aktion
```

CAN-16.3 baut keine Safety Status View Erweiterung.

## Integration Boundary: Recovery Guards

SafetyStop darf spaeter als Guard-Eingang betrachtet werden.

Planungsregel:

```text
SafetyStop active/unknown/degraded/contradictory muss spaeter Guard/Readiness blockierend beeinflussen.
```

Aber:

```text
CAN-16.3 fuegt keinen Guard hinzu.
CAN-16.3 aendert keine Guard-Auswertung.
```

Moeglicher spaeterer Guard-Name:

```text
safetystop_state_guard
```

Nicht umgesetzt.

## Integration Boundary: Recovery Preflight

SafetyStop darf spaeter als Preflight-Sicherheitsfeld beruecksichtigt werden.

Moegliche spaetere Felder:

```text
preflight.safetyStopKnown
preflight.safetyStopState
preflight.safetyStopActive
preflight.safetyStopBlocksRecovery
preflight.safetyStopBlocksHighRiskActions
```

Aber:

```text
CAN-16.3 aendert keinen Preflight.
CAN-16.3 aendert keine Route.
```

## Integration Boundary: Audit Planning

Aus CAN-15 gilt:

```text
SafetyStop-relevante Entscheidungen sollen spaeter auditierbar sein.
```

Moegliche spaetere Audit-Events:

```text
audit.safetystop.status.view.request
audit.safetystop.status.view.decision
audit.safetystop.status.view.result
audit.safetystop.active.blocked.decision
audit.safetystop.clear.request
audit.safetystop.clear.blocked.decision
```

Aber:

```text
CAN-16.3 erzeugt keine Audit-Events.
CAN-16.3 baut keine Audit-API.
CAN-16.3 schreibt keine Audit-Daten.
```

## Integration Boundary: Confirm Planning

SafetyStop Clear braucht spaeter Confirm.

Planungsregel:

```text
Clear ohne Confirm bleibt verboten.
Confirm selbst ist noch nicht implementiert.
```

CAN-16.3 baut nicht:

```text
Confirm API
Confirm UI
Confirm Token
Confirm TTL
Confirm Speicherung
```

## Integration Boundary: Rights/Roles Planning

SafetyStop Clear duerfte spaeter nur fuer Owner/Admin planbar sein.

Planungsregel:

```text
Clear ohne Rechtepruefung bleibt verboten.
```

CAN-16.3 baut nicht:

```text
Rechte-API
Rollen-DB
Dashboard-Rechtepruefung
Owner/Admin-Durchsetzung
```

## Integration Boundary: Manual Recovery Candidate Matrix

SafetyStop muss spaeter bei Recovery-Kandidaten als Blocker erscheinen.

Beispiel spaeter:

```text
candidate.safetyStopRequired = true
candidate.safetyStopMustBeInactive = true
candidate.blockedIfSafetyStopUnknown = true
```

Aber:

```text
CAN-16.3 aendert keine Kandidatenmatrix technisch.
```

## Erlaubte spaetere Datenrichtung

Nur Planung:

```text
SafetyStop Status -> Anzeige
SafetyStop Status -> Guard-Bewertung
SafetyStop Status -> Preflight-Bewertung
SafetyStop Entscheidung -> Audit
```

Nicht erlaubt:

```text
Anzeige -> SafetyStop setzen
Anzeige -> SafetyStop clearen
Anzeige -> Recovery starten
Guard -> SafetyStop veraendern
Preflight -> SafetyStop veraendern
Audit -> SafetyStop veraendern
```

## No-Mutation-Integrationsregel

SafetyStop darf spaeter in diesem Sicherheitsstrang zunaechst nur gelesen/bewertet werden.

Nicht erlaubt ohne eigenen spaeteren Planungsstrang:

```text
setzen
clearen
resetten
auto-clearen
auto-setzen
```

## API-Grenze

CAN-16.3 plant keine API.

Nicht existierende Routen:

```text
GET /api/safety-stop
GET /api/bus-diagnostics/safety-stop
GET /api/bus-diagnostics/safety-status/safetystop
POST /api/safety-stop
POST /api/safety-stop/clear
POST /api/safety-stop/reset
```

## Dashboard-Grenze

CAN-16.3 plant keine Dashboard-Aenderung.

Nicht gebaut:

```text
SafetyStop Card
SafetyStop Tab
SafetyStop Button
SafetyStop Badge
SafetyStop Refresh
SafetyStop Clear
```

## EventBus-Grenze

CAN-16.3 plant kein EventBus-Emit.

Nicht gebaut:

```text
eventBus.emit('safetystop:*')
eventBus.on('safetystop:*')
SafetyStop status event
SafetyStop clear event
SafetyStop block event
```

## DB-/Config-Grenze

CAN-16.3 plant keine Speicherung.

Nicht gebaut:

```text
safetystop table
safetystop config
runtime state file
audit write
retention
```

## Fail-safe-Integrationsregel

Wenn eine spaetere Integration SafetyStop nicht lesen kann:

```text
unknown
blockieren
nicht als OK anzeigen
nicht als inactive behandeln
```

## Reihenfolge fuer spaetere technische Phasen

Noch nicht freigegeben, nur Orientierung:

```text
1. SafetyStop read-only Dummy/No-data Anzeigeplanung abschliessen
2. Backend Status Shape Planung ohne API
3. Dashboard Anzeigeplanung ohne Buttons
4. Erst spaeter echte read-only Datenquelle planen
5. Noch spaeter API/DB nur mit separater Freigabe
```

## Ergebnis CAN-16.3

CAN-16.3 definiert:

```text
Integrationsgrenzen zu Safety Status View
Integrationsgrenzen zu Recovery Guards
Integrationsgrenzen zu Recovery Preflight
Integrationsgrenzen zu Audit Planning
Integrationsgrenzen zu Confirm Planning
Integrationsgrenzen zu Rights/Roles Planning
Integrationsgrenzen zur Candidate Matrix
erlaubte Datenrichtung
No-Mutation-Regel
API-/Dashboard-/EventBus-/DB-Grenzen
Fail-safe-Integrationsregel
```

## Naechster sinnvoller Schritt

```text
CAN-16.4 - SafetyStop Planning Closure / Handoff
```

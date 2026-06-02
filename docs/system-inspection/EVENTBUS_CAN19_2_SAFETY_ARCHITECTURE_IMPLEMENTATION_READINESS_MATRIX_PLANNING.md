# EVENTBUS CAN-19.2 - Safety Architecture Implementation Readiness Matrix Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-19.2

## Zweck

CAN-19.2 plant eine Readiness-Matrix fuer die Sicherheitsarchitektur. Es wird bewertet, welche Bausteine theoretisch umsetzungsnah waeren und welche Vorbedingungen fehlen.

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
```

## Ausgangslage

CAN-19.1 hat die Safety Architecture Status Display Planung read-only/no-api abgeschlossen.

Geplante Sicherheitsbausteine:

```text
Audit
SafetyStop
Roles/Rights
Confirm
```

CAN-19.2 bewertet nur die Bereitschaft und Abhaengigkeiten. Es wird nichts gebaut.

## Harte Grenze fuer CAN-19.2

CAN-19.2 darf nicht enthalten:

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
```

## Readiness-Werte

```text
ready_for_readonly_design
needs_more_planning
blocked_until_prerequisites
blocked_high_risk
not_ready
```

Bedeutung:

```text
ready_for_readonly_design = nur read-only Design/Contract koennte als naechstes geplant werden
needs_more_planning = weitere Planung noetig
blocked_until_prerequisites = Vorbedingungen fehlen
blocked_high_risk = wegen Risiko blockiert
not_ready = aktuell nicht umsetzungsbereit
```

## Gesamtmatrix

| Baustein | Readiness | Fehlende Voraussetzungen | Risiko | Naechster sicherer Schritt |
|---|---|---|---|---|
| Audit Display read-only | ready_for_readonly_design | echte Datenquelle fehlt | niedrig/mittel | Display Contract weiter konsolidieren |
| Audit Write | blocked_until_prerequisites | DB, Retention, Rechte, Datenschutz, Confirm | hoch | blockiert |
| SafetyStop Display read-only | ready_for_readonly_design | echte Statusquelle fehlt | niedrig | Display Contract weiter konsolidieren |
| SafetyStop Set/Clear/Reset | blocked_high_risk | Rechte, Audit, Confirm, Guards, klare Operator-Regeln | kritisch | blockiert |
| Roles/Rights Display read-only | ready_for_readonly_design | echte Rollenquelle fehlt | niedrig/mittel | Display Contract weiter konsolidieren |
| Roles/Rights Enforcement | blocked_until_prerequisites | Auth, Rollenquelle, DB/Config, Middleware, Audit | hoch | blockiert |
| Confirm Display read-only | ready_for_readonly_design | echte Confirm-Quelle fehlt | niedrig | Display Contract weiter konsolidieren |
| Confirm API/Execution | blocked_high_risk | Rechte, Audit, SafetyStop, Token, TTL, Execute-Phase | kritisch | blockiert |
| Recovery Prepare | blocked_high_risk | alle Sicherheitsbausteine technisch noetig | kritisch | blockiert |
| Recovery Execute | blocked_high_risk | alle Sicherheitsbausteine technisch noetig | kritisch | blockiert |

## Read-only Kandidaten

Sichere Kandidaten fuer weitere Planung, aber noch nicht Umsetzung:

```text
Safety Architecture Status Display Contract
Audit Display Contract
SafetyStop Display Contract
Roles/Rights Display Contract
Confirm Display Contract
Hard Blocker Display Contract
```

Wichtig:

```text
Auch diese Kandidaten sind erst Planung.
Keine API.
Keine Dashboard-Aenderung.
Keine Datenquelle.
```

## Nicht bereit fuer Umsetzung

```text
Audit DB
Audit API
Audit Write Events
SafetyStop API
SafetyStop Clear
Roles/Rights API
Roles/Rights Middleware
Auth/Login
Confirm API
Confirm Token
Confirm Execute
Recovery Prepare
Recovery Execute
```

## Vorbedingungen fuer spaetere Umsetzung

### Audit

Fehlend:

```text
Datenspeicher-Entscheidung
Retention-Konzept technisch
Rechtekonzept technisch
Masking/Sanitizing technisch
Audit Event Emitter
Read API
Dashboard Anzeige
```

### SafetyStop

Fehlend:

```text
Statusquelle
Set/Clear-Regeln
Clear-Rechte
Audit-Kopplung
Confirm-Kopplung
Dashboard Anzeige
Fail-safe Runtime
```

### Roles/Rights

Fehlend:

```text
Identity/Auth-Quelle
Rollenquelle
Rechtemodell technisch
Middleware
Audit-Kopplung
Dashboard Anzeige
Owner/Admin-Regeln
```

### Confirm

Fehlend:

```text
Confirm Request Modell
Token/Nonce Konzept
TTL/Timeout Runtime
Cancel/Expire Handling
Audit-Kopplung
Rights/SafetyStop/Guards Kopplung
Dashboard Anzeige
```

## Empfehlung fuer sichere Reihenfolge

Vor jeder technischen Umsetzung sollte zuerst weiter geplant werden:

```text
1. Gemeinsame Display Contracts konsolidieren
2. Read-only Backend Shape planen, aber noch keine Route bauen
3. No-button Dashboard Darstellung planen, aber noch nicht bauen
4. Danach erst entscheiden, ob eine echte read-only Route sinnvoll ist
5. Write-/Action-/Mutation-Phasen weiter blockiert lassen
```

## Harte Blocker bleiben

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

## Entscheidung CAN-19.2

Die sichere naechste Richtung ist keine Umsetzung, sondern:

```text
CAN-19.3 - Safety Architecture Contracts Consolidation Planning
```

Ziel:

```text
Die bisherigen Display-/Status-Contracts fuer Audit, SafetyStop, Roles/Rights, Confirm und Hard Blocker zu einem gemeinsamen Contract-Konzept zusammenfuehren.
```

## Ergebnis CAN-19.2

CAN-19.2 definiert:

```text
Readiness-Werte
Gesamtmatrix
read-only Kandidaten
nicht umsetzungsbereite Bereiche
fehlende Voraussetzungen je Baustein
empfohlene sichere Reihenfolge
weiterhin harte Blocker
naechste Planungsrichtung
```

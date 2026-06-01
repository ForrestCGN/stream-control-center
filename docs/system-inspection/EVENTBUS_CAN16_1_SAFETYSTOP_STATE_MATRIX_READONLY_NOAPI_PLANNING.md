# EVENTBUS CAN-16.1 - SafetyStop State Matrix read-only/no-api Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-16.1

## Zweck

CAN-16.1 plant die SafetyStop-State-Matrix fuer spaetere Blockierentscheidungen.

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

Definiert wurden dort:

```text
SafetyStop-Grundidee
SafetyStop-Statusmodell
Statusfelder
Reason Codes
Sources
Entscheidungsregel
Anzeige-Idee fuer Safety Status View
Audit-/Confirm-/Rights-Abgrenzung
Clear-/Reset-Grenze
Fail-safe-Regel
```

CAN-16.1 ergaenzt nun die Matrix fuer moegliche SafetyStop-Zustaende.

## Harte Grenze fuer CAN-16.1

CAN-16.1 darf nicht enthalten:

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

## Grundregel

SafetyStop muss spaeter fail-safe arbeiten.

Das bedeutet:

```text
Nur eindeutig sicherer Zustand darf riskante Aktionen nicht blockieren.
Unbekannte, widerspruechliche oder degradierte Zustaende muessen blockieren.
```

## Bewertete Felder

Die Matrix bewertet spaeter diese Felder:

```text
known
state
active
blocksRecovery
blocksHighRiskActions
clearAllowed
```

## Zulaessige States

```text
inactive
active
unknown
degraded
```

## Hauptmatrix

| known | state | active | blocksRecovery | blocksHighRiskActions | Bewertung | Entscheidung |
|---|---|---|---|---|---|---|
| true | inactive | false | true | true | sicherer inaktiver Zustand | read-only OK, high-risk bleibt durch andere Guards pruefpflichtig |
| true | active | true | true | true | SafetyStop aktiv | riskante Aktionen blockieren |
| false | unknown | false | true | true | Zustand unbekannt | riskante Aktionen blockieren |
| false | unknown | true | true | true | Zustand unbekannt/aktiv | riskante Aktionen blockieren |
| true | degraded | false | true | true | SafetyStop eingeschraenkt auswertbar | riskante Aktionen blockieren |
| true | degraded | true | true | true | SafetyStop eingeschraenkt und aktiv | riskante Aktionen blockieren |
| true | inactive | true | true | true | widerspruechlich | riskante Aktionen blockieren |
| true | active | false | true | true | widerspruechlich | riskante Aktionen blockieren |
| false | inactive | false | true | true | widerspruechlich, weil nicht bekannt aber inactive | riskante Aktionen blockieren |
| false | active | true | true | true | widerspruechlich, weil nicht bekannt aber active | riskante Aktionen blockieren |

## Einziger spaeter nicht-blockierender SafetyStop-Zustand

Nur diese Kombination darf SafetyStop-seitig als nicht blockierend gelten:

```text
known=true
state=inactive
active=false
```

Aber auch dann gilt:

```text
Guards muessen OK sein.
Preflight muss OK sein.
Rechte muessen OK sein.
Confirm muss, falls noetig, OK sein.
Audit muss, falls noetig, OK sein.
```

## Widerspruchsregeln

### inactive + active=true

```text
state=inactive und active=true ist widerspruechlich.
```

Entscheidung:

```text
blockieren
```

### active + active=false

```text
state=active und active=false ist widerspruechlich.
```

Entscheidung:

```text
blockieren
```

### known=false + state nicht unknown

```text
known=false mit state=inactive/active/degraded ist widerspruechlich.
```

Entscheidung:

```text
blockieren
```

### degraded darf nie als OK gelten

```text
state=degraded bedeutet eingeschraenkte Auswertbarkeit.
```

Entscheidung:

```text
blockieren
```

## Clear-Matrix

SafetyStop Clear bleibt hart blockiert.

| state | clearAllowed | clearRequiresConfirm | clearRequiresAudit | Entscheidung |
|---|---|---|---|---|
| inactive | false | true | true | kein Clear noetig / kein Button |
| active | false | true | true | Clear blockiert |
| unknown | false | true | true | Clear blockiert |
| degraded | false | true | true | Clear blockiert |
| active | true | true | true | spaetere separate Planung noetig, in CAN-16.1 blockiert |
| unknown | true | true | true | widerspruechlich, blockieren |
| degraded | true | true | true | widerspruechlich, blockieren |

## Recovery-Blockiermatrix

| SafetyStop-Bewertung | Recovery Prepare | Recovery Execute | Entscheidung |
|---|---|---|---|
| inactive/known | weiterhin false im aktuellen System | false | keine Ausfuehrung |
| active | false | false | blockieren |
| unknown | false | false | blockieren |
| degraded | false | false | blockieren |
| widerspruechlich | false | false | blockieren |

Wichtig:

```text
CAN-16.1 gibt Recovery Prepare/Execute nicht frei.
```

## High-Risk-Aktionsmatrix

Diese Aktionen bleiben blockiert, unabhaengig vom SafetyStop-Zustand:

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
Rollen-/Rechte-Mutation
```

Auch bei SafetyStop inactive gilt:

```text
keine Freigabe fuer high-risk Aktionen.
```

## Anzeige-Matrix fuer spaeter

Nur Planung.

| state | Anzeige | Farbe/Level | Text |
|---|---|---|---|
| inactive | Inaktiv | ok | Kein SafetyStop aktiv |
| active | Aktiv | error | SafetyStop blockiert riskante Aktionen |
| unknown | Unbekannt | warning/error | Zustand unbekannt, fail-safe blockiert |
| degraded | Eingeschraenkt | warning/error | SafetyStop nicht voll auswertbar, fail-safe blockiert |
| widerspruechlich | Widerspruechlich | error | SafetyStop-Daten pruefen, fail-safe blockiert |

## Reason-Code-Matrix

| reason | Bedeutung | Default-Entscheidung |
|---|---|---|
| manual_operator | manuell durch Operator/Owner/Admin | blockieren bis explizit separat geplant |
| guard_failure | Guard hat Problem erkannt | blockieren |
| preflight_failure | Preflight hat Problem erkannt | blockieren |
| system_error | Systemfehler | blockieren |
| config_error | Config-Problem | blockieren |
| unknown_state | Zustand unbekannt | blockieren |
| security_policy | Sicherheitsregel greift | blockieren |
| duplicate_risk | Doppel-/Replay-Risiko | blockieren |
| audit_unavailable | Audit fehlt | blockieren fuer riskante Aktionen |
| confirm_unavailable | Confirm fehlt | blockieren fuer riskante Aktionen |
| rights_unavailable | Rechtepruefung fehlt | blockieren fuer riskante Aktionen |

## Source-Matrix

| source | Vertrauen | Entscheidung |
|---|---|---|
| system | technisch auswertbar, aber pruefen | je nach state |
| owner | spaeter hoher Trust, aber auditpflichtig | blockieren/anzeigen, keine Clear-Freigabe |
| admin | spaeter Trust, aber auditpflichtig | blockieren/anzeigen, keine Clear-Freigabe |
| guard | sicherheitsrelevant | bei Problem blockieren |
| preflight | sicherheitsrelevant | bei Problem blockieren |
| config | technisch relevant | bei Fehler blockieren |
| startup | initialer Zustand | unknown/degraded blockiert |
| unknown | unklar | blockieren |

## Fail-safe-Default

Wenn ein Feld fehlt:

```text
blockieren
```

Wenn ein Feld ungueltig ist:

```text
blockieren
```

Wenn eine Kombination widerspruechlich ist:

```text
blockieren
```

Wenn der SafetyStop-Zustand nicht gelesen werden kann:

```text
blockieren
```

## Keine technische Umsetzung in CAN-16.1

CAN-16.1 erstellt nicht:

```text
safetystop.js
safetystop route
safetystop table
safetystop dashboard
safetystop state
eventbus event
button
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
Kein SafetyStop Clear
Kein SafetyStop Reset
```

## Ergebnis CAN-16.1

CAN-16.1 definiert:

```text
SafetyStop-Hauptmatrix
Widerspruchsregeln
Clear-Matrix
Recovery-Blockiermatrix
High-Risk-Aktionsmatrix
Anzeige-Matrix
Reason-Code-Matrix
Source-Matrix
Fail-safe-Default
```

## Naechster sinnvoller Schritt

```text
CAN-16.2 - SafetyStop Display Contract read-only/no-api Planning
```

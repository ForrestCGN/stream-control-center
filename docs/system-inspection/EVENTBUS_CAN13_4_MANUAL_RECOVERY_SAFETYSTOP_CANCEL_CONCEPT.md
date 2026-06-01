# EVENTBUS CAN-13.4 - Manual Recovery SafetyStop / Cancel Concept

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-13.4

## Zweck

Dieses Dokument definiert das SafetyStop-/Cancel-Konzept fuer spaetere manuelle Recovery-Aktionen.

Wichtig:

```text
Dies ist ein Planungs- und Sicherheitskonzept.
Es aktiviert keine Recovery.
Es fuegt keine API hinzu.
Es fuegt keine Dashboard-Aktion hinzu.
Es fuehrt keine Queue-, Sound-, Alert- oder Overlay-Mutation aus.
```

## Ausgangslage

Bis CAN-12.6 wurde der Recovery-/Preflight-/Guard-Framework-Strang read-only abgeschlossen.

Bis CAN-13.3 wurden geplant:

- CAN-13.0: Next Recovery Candidate Planning Start
- CAN-13.1: Audit-Konzept
- CAN-13.2: Rollen-/Rechte-Konzept
- CAN-13.3: Confirm-/Bestaetigungs-Konzept

CAN-13.4 ergaenzt jetzt die Pflichtgrenze fuer SafetyStop und Cancel.

## Grundsatz

SafetyStop ist ein globaler Sicherheitszustand fuer Recovery-nahe Aktionen.

Cancel ist eine bewusst ausgeloeste Abbruchentscheidung fuer laufende oder vorbereitete Recovery-nahe Ablaeufe.

Beides sind Schutzmechanismen.

Beides ersetzt nicht:

```text
Backend-Rechtepruefung
Audit
Confirm
Guards
Preflight
Duplikat-Sperren
Read-only Diagnose
```

## SafetyStop Definition

SafetyStop bedeutet:

```text
Recovery-nahe Aktionen sind blockiert, solange der SafetyStop aktiv ist.
```

SafetyStop darf spaeter nur explizit und nachvollziehbar deaktiviert werden.

SafetyStop muss spaeter im Backend als harte Sperre wirken, nicht nur im Dashboard.

## SafetyStop Pflichtgruende

Ein SafetyStop muss spaeter mindestens aktiv werden oder aktiv bleiben bei:

```text
missing_owner_permission
missing_admin_permission
missing_confirm
failed_preflight
failed_guard
unknown_recovery_candidate
duplicate_risk
active_sound_or_alert_risk
unknown_overlay_state
untrusted_client_state
manual_operator_cancel
system_integrity_error
audit_unavailable
```

## SafetyStop Statusfelder

Ein spaeterer SafetyStop-Status sollte mindestens enthalten:

```text
enabled
reason
source
createdAt
createdBy
updatedAt
updatedBy
scope
affectedCandidate
recoverable
clearRequirement
lastAuditId
```

## SafetyStop Scope

Moegliche Scopes:

```text
global
module
candidate
session
single_action
```

CAN-13.4 entscheidet noch nicht, welcher Scope technisch umgesetzt wird.

Empfohlene Reihenfolge fuer spaetere Umsetzung:

1. read-only Anzeige des SafetyStop-Konzepts
2. read-only Statusfeld
3. manuelle Set/Clear-Planung
4. erst danach produktive Sperrwirkung fuer echte Recovery-Kandidaten

## SafetyStop Clear-Regel

Ein SafetyStop darf spaeter nicht automatisch still verschwinden.

Clear muss nachvollziehbar sein:

```text
Owner/Admin je nach Risiko
Confirm erforderlich
Audit erforderlich
Grund erforderlich
Zeitpunkt erforderlich
betroffener Scope erforderlich
```

Bei hoeherem Risiko:

```text
Typed Confirm erforderlich
```

## Cancel Definition

Cancel bedeutet:

```text
Eine vorbereitete oder laufende Recovery-nahe Aktion wird bewusst abgebrochen.
```

Cancel darf keine Nebenwirkung ausloesen wie:

```text
Alert erneut senden
Sound erneut spielen
Queue veraendern
Overlay reparieren
Status hart ueberschreiben
```

## Cancel Arten

```text
operator_cancel
preflight_cancel
guard_cancel
confirm_timeout_cancel
rights_cancel
audit_cancel
safetystop_cancel
system_cancel
```

## Cancel Ergebnis

Ein Cancel-Ergebnis muss spaeter klar unterscheidbar sein von:

```text
failed
blocked
skipped
finished
executed
```

Empfohlenes Ergebnisfeld:

```text
cancelled
```

## Cancel Audit-Pflicht

Jeder Cancel muss spaeter auditiert werden.

Pflichtangaben:

```text
who
role
when
candidate
reason
stage
previousState
result
correlationId
```

## Harte Grenzen

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
```

CAN-13.4 plant nur.

## SafetyStop gegen automatische Recovery

Solange keine separate Planung existiert, gilt:

```text
auto_recovery bleibt hart blockiert
auto_retry_overlay bleibt hart blockiert
auto_replay_alert bleibt hart blockiert
auto_replay_sound bleibt hart blockiert
```

SafetyStop darf spaeter nicht als Schalter missverstanden werden, der automatische Recovery erlaubt.

## SafetyStop gegen manuelle Recovery

Auch fuer spaetere manuelle Aktionen gilt:

```text
Kein SafetyStop Clear ohne Audit
Kein SafetyStop Clear ohne Rechte
Kein SafetyStop Clear ohne Confirm
Kein SafetyStop Clear ohne Grund
Kein SafetyStop Clear ohne Scope
```

## Dashboard-Grenze

Ein spaeteres Dashboard darf SafetyStop zunaechst nur anzeigen.

Keine Buttons ohne separate Planung:

```text
Kein SafetyStop setzen Button
Kein SafetyStop clear Button
Kein Cancel Button
Kein Recovery Button
Kein Execute Button
```

## Backend-Grenze

Ein spaeteres Backend muss SafetyStop serverseitig pruefen.

Dashboard-Sichtbarkeit reicht nicht.

Ein spaeterer API-Aufruf muss blockiert werden, wenn SafetyStop aktiv ist.

## EventBus-Grenze

SafetyStop-/Cancel-Events duerfen spaeter nur vorhandene EventBus-Muster nutzen.

Keine frei erfundenen produktiven Eventnamen ohne Repo-Pruefung.

Moegliche semantische Actions spaeter:

```text
blocked
cancelled
skipped
failed
module.status
module.event
```

CAN-13.4 legt keine technische EventBus-Ausgabe fest.

## Recovery-Kandidaten bleiben blockiert

Weiterhin nicht direkt umsetzen:

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
```

## Ergebnis CAN-13.4

CAN-13.4 definiert:

```text
SafetyStop ist Pflichtschutz
Cancel ist auditpflichtiger Abbruch
Clear darf nicht still/automatisch passieren
Dashboard darf zunaechst nur anzeigen
Backend muss spaeter serverseitig sperren
produktive Recovery bleibt weiterhin aus
```

## Naechster sinnvoller Schritt

```text
CAN-13.5 - Recovery-Kandidatenmatrix fuer spaetere manuelle Recovery
```

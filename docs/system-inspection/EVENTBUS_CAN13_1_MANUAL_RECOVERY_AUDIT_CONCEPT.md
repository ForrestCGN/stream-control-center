# EVENTBUS CAN-13.1 - Audit-Konzept fuer spaetere manuelle Recovery

## Projekt

ForrestCGN `stream-control-center`

Arbeitsbereich:

```text
Event-Bus / Communication Bus -> Recovery -> Audit Planning
```

## Ausgangsstand

CAN-13.0 ist abgeschlossen.

CAN-13.0 hat festgelegt, dass vor jeder spaeteren produktiven Recovery zuerst Sicherheitskonzepte geplant werden muessen.

Geplante CAN-13.x Reihenfolge:

```text
CAN-13.1 Audit-Konzept fuer spaetere manuelle Recovery
CAN-13.2 Rollen-/Rechte-Konzept
CAN-13.3 Confirm-/Bestaetigungs-Konzept
CAN-13.4 SafetyStop-/Cancel-Konzept
CAN-13.5 Recovery-Kandidatenmatrix
CAN-13.6 Abschluss/Handoff, weiterhin ohne produktive Recovery
```

## Ziel von CAN-13.1

CAN-13.1 definiert das Audit-Konzept fuer spaetere manuelle Recovery-Aktionen.

Wichtig:

```text
CAN-13.1 fuehrt keine Recovery aus.
CAN-13.1 erstellt keine Recovery-API.
CAN-13.1 erstellt keine POST-/Command-/Prepare-/Execute-Route.
CAN-13.1 erstellt keine DB-Migration.
CAN-13.1 schreibt keine Audit-Eintraege.
CAN-13.1 veraendert keine produktiven Flows.
CAN-13.1 veraendert keine Queue-, Sound-, Alert-, Overlay-, OBS- oder Streamer.bot-Zustaende.
```

CAN-13.1 ist nur ein Planungs- und Vertragsstand.

## Grundsatz

Spaetere manuelle Recovery darf niemals ohne nachvollziehbares Audit laufen.

Jede spaetere Aktion muss beantworten koennen:

```text
Wer hat was wann angefordert?
Mit welcher Rolle/Berechtigung?
Auf welches Modul / welchen Recovery-Kandidaten?
Welche Schutzpruefungen waren aktiv?
Wurde die Aktion nur vorbereitet oder wirklich ausgefuehrt?
Was war der vorherige Status?
Was war das Ergebnis?
Warum wurde eine Aktion blockiert oder abgebrochen?
```

## Audit-Stufen

Das Audit-Konzept unterscheidet spaeter mindestens drei Stufen.

### 1. Request Audit

Wird geschrieben, wenn eine spaetere manuelle Recovery-Aktion angefragt wird.

Beispiel:

```text
Actor klickt spaeter im Dashboard auf "Recovery vorbereiten".
```

Pflichtziel:

```text
Nachvollziehen, dass eine Aktion ueberhaupt angefragt wurde.
```

### 2. Decision Audit

Wird geschrieben, wenn Guards, Rechte, Confirm, SafetyStop und Kandidatenregeln ausgewertet wurden.

Beispiel:

```text
Aktion wurde erlaubt, blockiert oder nur als read-only Diagnose bewertet.
```

Pflichtziel:

```text
Nachvollziehen, warum eine Aktion erlaubt oder blockiert wurde.
```

### 3. Result Audit

Wird geschrieben, wenn eine spaetere Aktion beendet, abgebrochen, fehlgeschlagen oder gar nicht gestartet wurde.

Beispiel:

```text
Execute wurde blockiert, Confirm fehlte, SafetyStop aktiv, Guard fehlgeschlagen.
```

Pflichtziel:

```text
Nachvollziehen, welches konkrete Ergebnis entstanden ist.
```

## Pflichtfelder

Spaetere Audit-Eintraege muessen mindestens folgende Felder abdecken.

```text
auditId
timestamp
correlationId
eventBusEventId
source
actorId
actorName
actorRole
actorPermissionState
actionType
actionStage
targetModule
targetResource
recoveryCandidate
requestedOperation
previousStateSummary
guardSummary
guardResults
safetyStopState
confirmState
duplicateProtectionState
decision
decisionReason
result
resultReason
errorCode
errorMessage
dryRun
readOnly
routeMethod
routePath
clientContext
dashboardContext
ipOrSessionReference
createdBySystemVersion
```

## Feldbeschreibung

### auditId

Eindeutige ID des Audit-Eintrags.

Soll spaeter serverseitig erzeugt werden.

### timestamp

Zeitpunkt der Audit-Erstellung.

Format spaeter vorzugsweise ISO-8601.

### correlationId

Gemeinsame ID fuer zusammenhaengende Request-/Decision-/Result-Eintraege.

Wichtig fuer spaetere Diagnose, damit alle Eintraege einer Aktion zusammengefunden werden.

### eventBusEventId

Optionaler Bezug zu einem EventBus-Event, falls vorhanden.

### source

Quelle der Aktion.

Erlaubte Planungswerte:

```text
dashboard
api
system
diagnostics
simulation
unknown
```

### actorId / actorName

Der spaetere ausloesende User.

Wenn kein echter User vorhanden ist, muss `system` oder `unknown` explizit gesetzt werden.

### actorRole

Rolle des spaeteren Akteurs.

Beispiele:

```text
owner
admin
mod
viewer
system
unknown
```

### actorPermissionState

Ergebnis der spaeteren Rechtepruefung.

Beispiele:

```text
allowed
denied
missing
unknown
not_checked
```

### actionType

Art der spaeteren Recovery-Operation.

Planungswerte:

```text
diagnose
prepare
execute
cancel
safety_stop
clear
retry
replay
repair
```

Wichtig:

```text
execute, retry, replay, repair und clear bleiben aktuell weiterhin blockiert.
```

### actionStage

Phase der Aktion.

Planungswerte:

```text
request
decision
result
blocked
cancelled
failed
finished
```

### targetModule

Zielmodul der spaeteren Aktion.

Beispiele:

```text
bus_diagnostics
communication_bus
alert_system
sound_system
overlay
queue
unknown
```

### targetResource

Optionaler Zielbezug.

Beispiele:

```text
alertId
soundId
queueId
overlayClientId
correlationId
```

### recoveryCandidate

Der spaeter geplante Recovery-Kandidat.

Beispiele:

```text
alert_replay
sound_replay
queue_clear
overlay_state_repair
status_resync
preflight_refresh
unknown
```

### requestedOperation

Die konkrete angefragte Operation.

Beispiele:

```text
refresh_preflight
resync_status
prepare_overlay_repair
execute_overlay_repair
cancel_recovery
```

### previousStateSummary

Kompakter vorheriger Zustand vor der spaeteren Entscheidung.

Keine riesigen Dumps.

Beispiele:

```text
readOnly=true; canExecute=false; guardsOk=16; guardsBlocked=0
```

### guardSummary / guardResults

Zusammenfassung und Details der geprueften Guards.

Mindestens:

```text
guardsTotal
guardsOk
guardsWarnings
guardsBlocked
guardsErrors
blockingFailed
```

### safetyStopState

Status der spaeteren Sicherheitsbremse.

Planungswerte:

```text
enabled
disabled
active
unknown
not_checked
```

### confirmState

Status der spaeteren Bestaetigung.

Planungswerte:

```text
not_required
required_missing
required_confirmed
required_expired
not_checked
```

### duplicateProtectionState

Status der spaeteren Duplikat-Sperre.

Planungswerte:

```text
not_required
allowed
blocked_duplicate
unknown
not_checked
```

### decision

Entscheidung der spaeteren Sicherheitsauswertung.

Planungswerte:

```text
allowed
blocked
read_only
denied
cancelled
failed
```

### decisionReason

Kurze maschinen- und menschenlesbare Begruendung.

Beispiele:

```text
read_only_mode
missing_owner_permission
safety_stop_active
confirm_missing
duplicate_blocked
candidate_hard_blocked
guard_failed
```

### result

Endstatus.

Planungswerte:

```text
not_started
prepared
executed
blocked
cancelled
failed
finished
```

### resultReason

Kurze Begruendung zum Ergebnis.

### errorCode / errorMessage

Nur bei Fehlern.

Keine sensiblen Secrets loggen.

### dryRun / readOnly

Boolean-Felder fuer spaetere sichere Tests und read-only-Diagnose.

### routeMethod / routePath

Technischer Bezug zur spaeteren API-Route.

Aktuell muessen fuer Recovery weiterhin gelten:

```text
routeMethod: GET
POST-/Command-/Prepare-/Execute-Routen: nicht vorhanden
```

### clientContext / dashboardContext

Kompakte Kontextdaten fuer Dashboard-/Client-Ausloeser.

Keine Tokens, keine Secrets.

### ipOrSessionReference

Nur eine sichere Referenz, kein unnoetiger personenbezogener Dump.

### createdBySystemVersion

Version des Moduls oder Systems, das den Audit-Eintrag spaeter erzeugt.

## Audit-Zeitpunkte

Spaeter zu loggende Zeitpunkte:

```text
1. request_received
2. permissions_checked
3. guards_checked
4. safety_stop_checked
5. confirm_checked
6. duplicate_checked
7. decision_made
8. action_started
9. action_finished
10. action_blocked
11. action_cancelled
12. action_failed
```

Aktuell wird nichts davon technisch umgesetzt.

CAN-13.1 dokumentiert nur den Vertrag.

## Audit-Ergebnisse

Spaetere Audit-Ergebnisse sollen streng und eindeutig sein.

```text
allowed
blocked
denied
cancelled
failed
finished
read_only
```

Nicht erlaubt:

```text
unklare Freitext-Ergebnisse
stille Abbrueche ohne Audit
Recovery-Ausfuehrung ohne Result-Audit
```

## Minimaler Audit-Datensatz fuer spaetere read-only Aktionen

Fuer bereits existierende read-only Aktionen waere spaeter mindestens sinnvoll:

```text
timestamp
source
actor
actionType
targetModule
routeMethod
routePath
readOnly
decision
result
```

Beispiele:

```text
Preflight neu laden
Status neu synchronisieren
Recovery Guards anzeigen
```

Wichtig:

```text
CAN-13.1 baut das nicht ein.
```

## Minimaler Audit-Datensatz fuer spaetere gefaehrliche Aktionen

Fuer spaetere manuelle Recovery-Aktionen waere mindestens erforderlich:

```text
timestamp
correlationId
actorId
actorName
actorRole
actorPermissionState
actionType
targetModule
recoveryCandidate
previousStateSummary
guardSummary
safetyStopState
confirmState
duplicateProtectionState
decision
decisionReason
result
resultReason
```

Ohne diese Daten darf spaeter keine produktive Recovery freigegeben werden.

## Harte Audit-Regeln

```text
Keine Execute-Recovery ohne Audit.
Keine Replay-Recovery ohne Audit.
Keine Queue-/Sound-/Alert-/Overlay-Mutation ohne Audit.
Keine Admin-/Owner-Aktion ohne Actor/Rolle.
Keine blockierte Aktion ohne decisionReason.
Keine fehlgeschlagene Aktion ohne errorCode oder errorMessage.
Keine produktive Aktion ohne correlationId.
Keine Aktion gegen SafetyStop ohne Audit-Block.
Keine Aktion ohne Result-Audit, wenn sie gestartet wurde.
```

## Datenschutz / Secrets

Audit darf keine sensiblen Daten speichern.

Nicht speichern:

```text
Tokens
OAuth Secrets
API Keys
Session Cookies
vollstaendige Header
vollstaendige Config-Dumps
vollstaendige DB-Dumps
unnoetige personenbezogene Daten
```

Erlaubt:

```text
technische IDs
kompakte Statussummaries
Rollen-/Rechte-Ergebnis
sichere Session-Referenz
```

## Spaetere Speicherentscheidung

CAN-13.1 entscheidet noch nicht final, ob Audit spaeter in SQLite, Datei oder EventBus-State gespeichert wird.

Wahrscheinliche spaetere Richtung:

```text
primaer SQLite
optional Dashboard-Anzeige
optional Export/Log-Ansicht
Retention konfigurierbar
```

Vor jeder DB-Aenderung gilt weiterhin:

```text
Produktive app.sqlite niemals neu bauen, ueberschreiben oder ersetzen.
Schemaaenderungen nur sanft und separat geplant.
```

## Dashboard-Grenze

CAN-13.1 baut keine Dashboard-Ansicht.

Spaeter sinnvoll:

```text
Audit-Status sichtbar machen
letzte Recovery-Audit-Eintraege anzeigen
Filter nach Kandidat / Modul / Ergebnis
klare Markierung read-only vs produktiv
keine produktiven Buttons ohne Rechte, Confirm und SafetyStop
```

## Backend-Grenze

CAN-13.1 baut keine Backend-Route.

Spaeter sinnvoll:

```text
read-only Audit-Statusroute
read-only Audit-Listroute
separate Schreiblogik erst nach DB-/Rechte-/Confirm-/SafetyStop-Planung
```

## Weiterhin hart blockiert

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
Auto-Recovery
POST-/Command-/Prepare-/Execute-Routen
produktive Dashboard-Recovery-Buttons
DB-Migrationen
Config-Schreibzugriffe
```

## Ergebnis CAN-13.1

CAN-13.1 legt das Audit-Konzept fest.

Naechster sinnvoller Schritt:

```text
CAN-13.2 - Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery
```

CAN-13.2 soll weiterhin keine produktive Recovery umsetzen.

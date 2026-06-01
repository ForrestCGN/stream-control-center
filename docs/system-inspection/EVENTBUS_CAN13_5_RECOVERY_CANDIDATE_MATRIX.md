# EVENTBUS CAN-13.5 - Recovery Candidate Matrix

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-13.5

## Zweck

Dieses Dokument definiert eine Kandidatenmatrix fuer spaetere manuelle Recovery-Aktionen.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Es aktiviert keine Recovery.
Es fuegt keine API hinzu.
Es fuegt keine Dashboard-Buttons hinzu.
Es fuehrt keine Queue-, Sound-, Alert-, Overlay-, DB- oder Config-Mutation aus.
```

## Ausgangslage

Bis CAN-12.6 wurde der Recovery-/Preflight-/Guard-Framework-Strang read-only abgeschlossen.

Bis CAN-13.4 wurden die Sicherheitskonzepte fuer spaetere manuelle Recovery geplant:

```text
CAN-13.0 Next Recovery Candidate Planning Start
CAN-13.1 Audit-Konzept
CAN-13.2 Rollen-/Rechte-Konzept
CAN-13.3 Confirm-/Bestaetigungs-Konzept
CAN-13.4 SafetyStop-/Cancel-Konzept
```

CAN-13.5 sammelt und bewertet jetzt moegliche Recovery-Kandidaten.

## Grundsatz

Ein Recovery-Kandidat ist keine Freigabe zur Umsetzung.

Ein Kandidat bedeutet nur:

```text
Dieser Bereich darf spaeter genauer geplant werden.
```

Auch Kandidaten bleiben blockiert, solange nicht separat umgesetzt, getestet und freigegeben.

## Bewertungsfelder

Jeder Kandidat wird anhand dieser Felder bewertet:

```text
candidateId
candidateName
currentStatus
riskLevel
allowedLater
requiredRole
requiredConfirm
auditRequired
safetyStopBehavior
duplicateLockRequired
mutationType
hardBlockedNow
notes
```

## Statuswerte

```text
diagnostic_only
planning_candidate
blocked_candidate
hard_blocked
not_recommended
```

## Risikostufen

```text
low
medium
high
critical
```

## Confirm-Typen

```text
none
info
risk
destructive
typed
```

## Rollen

```text
viewer
moderator
admin
owner
system
```

## Kandidatenmatrix

| candidateId | Kandidat | Status | Risiko | Spaeter erlaubt? | Rolle | Confirm | Audit | SafetyStop | Duplikat-Sperre | Mutation | Jetzt hart blockiert? | Notiz |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| diagnostics_refresh | Diagnose neu laden | diagnostic_only | low | ja | admin | info | ja | blockiert bei global stop | nein | keine produktive Mutation | nein | Bestehende read-only Diagnose bleibt bevorzugt |
| status_resync_readonly | Status neu synchronisieren / lokal neu bewerten | diagnostic_only | low | ja | admin | info | ja | blockiert bei global stop | nein | keine produktive Mutation | nein | Nur GET/lokale Guard-Auswertung, keine Reparatur |
| preflight_recheck | Preflight erneut pruefen | planning_candidate | low | ja | admin | info | ja | blockiert bei global stop | nein | keine produktive Mutation | nein | Sinnvoll als naechster sicherer Diagnose-Ausbau |
| guard_recheck | Guards erneut bewerten | planning_candidate | low | ja | admin | info | ja | blockiert bei global stop | nein | keine produktive Mutation | nein | Nur erneute Bewertung, keine Aktion |
| safety_state_view | SafetyStop/Cancel Status anzeigen | planning_candidate | low | ja | admin | info | ja | nur Anzeige | nein | keine produktive Mutation | nein | Darf spaeter als read-only Anzeige kommen |
| safety_stop_set | SafetyStop manuell setzen | blocked_candidate | medium | spaeter moeglich | owner | risk | ja | setzt Stop | nein | Sicherheitsstatus-Mutation | ja | Erst nach separater Planung |
| safety_stop_clear | SafetyStop manuell loeschen | blocked_candidate | high | spaeter moeglich | owner | typed | ja | loescht Stop | nein | Sicherheitsstatus-Mutation | ja | Kritisch, da Schutz aufgehoben wird |
| cancel_pending_action | Vorbereitete Recovery abbrechen | blocked_candidate | medium | spaeter moeglich | admin | risk | ja | bleibt/aktiviert Stop je nach Grund | nein | Status-Mutation | ja | Nur fuer spaetere Prepare-Zustaende relevant |
| overlay_client_ping_recheck | Overlay-Client erneut pruefen | planning_candidate | low | ja | admin | info | ja | blockiert bei global stop | nein | keine produktive Mutation | nein | Nur Diagnose, kein Refresh |
| overlay_state_repair | Overlay State Repair | hard_blocked | high | nein, nicht jetzt | owner | typed | ja | muss blockieren bis freigegeben | ja | Overlay-Mutation | ja | Darf nicht direkt umgesetzt werden |
| queue_state_clear | Queue Clear | hard_blocked | critical | nein, nicht jetzt | owner | typed | ja | muss blockieren | ja | Queue-Mutation | ja | Hohe Gefahr fuer Daten-/Flow-Verlust |
| alert_replay | Alert Replay | hard_blocked | critical | nein, nicht jetzt | owner | typed | ja | muss blockieren | ja | Alert-Mutation | ja | Duplikat-/Peinlichkeits-/Kostenrisiko |
| sound_replay | Sound Replay | hard_blocked | critical | nein, nicht jetzt | owner | typed | ja | muss blockieren | ja | Sound-Mutation | ja | Duplikat-/Lautstaerke-/Streamrisiko |
| alert_queue_repair | Alert Queue Repair | blocked_candidate | high | spaeter moeglich | owner | typed | ja | muss pruefen/blockieren | ja | Queue-/Alert-Mutation | ja | Nur nach separater Matrix und Test |
| sound_queue_repair | Sound Queue Repair | blocked_candidate | high | spaeter moeglich | owner | typed | ja | muss pruefen/blockieren | ja | Queue-/Sound-Mutation | ja | Nur nach separater Matrix und Test |
| execute_recovery | Execute Recovery | hard_blocked | critical | nein, nicht jetzt | owner | typed | ja | muss blockieren | ja | produktive Mutation | ja | Keine Execute-Route ohne eigene CAN-Serie |
| auto_recovery | Auto Recovery | hard_blocked | critical | nein | system | typed | ja | muss blockieren | ja | produktive Mutation | ja | Weiterhin verboten |
| auto_retry_overlay | Auto Retry Overlay | hard_blocked | critical | nein | system | typed | ja | muss blockieren | ja | Overlay-Mutation | ja | Weiterhin verboten |
| streamerbot_action_retry | Streamer.bot Aktion erneut ausloesen | hard_blocked | critical | nein | owner | typed | ja | muss blockieren | ja | Streamer.bot-/OBS-Aktion | ja | Weiterhin verboten |
| obs_source_refresh | OBS Quelle refreshen | hard_blocked | high | nein, nicht jetzt | owner | typed | ja | muss blockieren | ja | OBS-/Overlay-Mutation | ja | Spaeter nur mit eigener Planung |

## Kandidaten-Gruppen

### Gruppe A - weiterhin sicher / read-only

Diese Kandidaten duerfen spaeter zuerst betrachtet werden:

```text
diagnostics_refresh
status_resync_readonly
preflight_recheck
guard_recheck
safety_state_view
overlay_client_ping_recheck
```

Eigenschaft:

```text
Keine produktive Mutation
Keine Wiederholung von Alerts/Sounds
Keine Queue-Aenderung
Keine OBS-/Streamer.bot-Aktion
```

### Gruppe B - blockierte Sicherheitsstatus-Mutationen

Diese Kandidaten sind nicht fuer sofortige Umsetzung freigegeben:

```text
safety_stop_set
safety_stop_clear
cancel_pending_action
```

Sie brauchen vorher:

```text
Audit
Rollen/Rechte
Confirm
SafetyStop-Regeln
klare Statusmodellierung
separate Tests
```

### Gruppe C - produktive Recovery-Mutationen

Diese Kandidaten bleiben hart blockiert:

```text
overlay_state_repair
queue_state_clear
alert_replay
sound_replay
alert_queue_repair
sound_queue_repair
execute_recovery
auto_recovery
auto_retry_overlay
streamerbot_action_retry
obs_source_refresh
```

## Empfehlung fuer naechste CAN-Serie

Nicht direkt mit produktiver Recovery starten.

Empfohlene naechste Reihenfolge:

```text
CAN-13.6 Abschluss/Handoff fuer CAN-13 Sicherheitsplanung
CAN-14.0 Read-only Safety Status View planen
CAN-14.1 Safety Status Contract read-only
CAN-14.2 Dashboard-Anzeige read-only
CAN-14.3 Live-Test read-only
```

Damit bleibt die Linie sauber:

```text
erst anzeigen
dann verstehen
dann testen
erst viel spaeter manuell mutieren
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

## Ergebnis CAN-13.5

CAN-13.5 definiert:

```text
Recovery-Kandidaten sind bewertet.
Read-only Diagnosekandidaten sind die einzigen niedrigen Risiken.
Sicherheitsstatus-Mutationen bleiben blockiert.
Produktive Recovery-Mutationen bleiben hart blockiert.
Naechster sinnvoller Schritt ist CAN-13.6 Abschluss/Handoff.
```

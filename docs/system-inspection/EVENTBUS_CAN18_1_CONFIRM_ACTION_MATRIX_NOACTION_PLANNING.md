# EVENTBUS CAN-18.1 - Confirm Action Matrix no-action Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-18.1

## Zweck

CAN-18.1 plant, welche spaeteren Aktionen welche Confirm-Art benoetigen wuerden.

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
Keine Confirm-Ausfuehrung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-18.0 hat die Confirm Boundary no-action geplant.

Definiert wurden dort:

```text
Confirm-Grundregel
Confirm-Arten
spaetere Confirm-Pflicht fuer high-risk Aktionen
Confirm-State-Modell
Confirm States
TTL-/Timeout-Planung
Audit-/Roles-/SafetyStop-/Preflight-Abgrenzung
UI-/Button-/Token-/Route-/Speicher-Grenzen
Fail-safe-Regeln
Confirm ist keine Ausfuehrung
```

CAN-18.1 ergaenzt nun eine Action Matrix.

## Harte Grenze fuer CAN-18.1

CAN-18.1 darf nicht enthalten:

```text
Confirm API
Confirm Token
Confirm DB
Confirm Route
Confirm Button
Confirm Ausfuehrung
Recovery-Ausfuehrung
POST-Route
SafetyStop Clear
Rollen-/Rechte-Mutation
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Matrix-Werte

```text
none
info_confirm
risk_confirm
destructive_confirm
typed_confirm
owner_confirm
dual_confirm
blocked_even_with_confirm
separate_planning_required
```

Bedeutung:

```text
none = kein Confirm noetig, wenn anderweitig erlaubt
info_confirm = einfache Bestaetigung fuer informative/read-only Aktion
risk_confirm = Risiko-Bestaetigung
destructive_confirm = destruktive Bestaetigung
typed_confirm = Eingabe eines festen Textes erforderlich
owner_confirm = nur Owner-Bestaetigung denkbar
dual_confirm = zwei unabhaengige Bestaetigungen
blocked_even_with_confirm = bleibt trotz Confirm blockiert
separate_planning_required = eigener Planungsstrang noetig
```

## Read-only Aktionen

| Aktion | Confirm-Art | Status | Bemerkung |
|---|---|---|---|
| view:safety_status | none | spaeter moeglich | reine Anzeige |
| view:recovery_guards | none/info_confirm | spaeter moeglich | je nach Sichtbarkeits-/Rechtekonzept |
| view:recovery_preflight | none/info_confirm | spaeter moeglich | read-only |
| view:safetystop | none/info_confirm | spaeter moeglich | read-only Status |
| view:audit_summary | none/info_confirm | spaeter moeglich | braucht Rechteplanung |
| view:audit_details | info_confirm | spaeter moeglich | sensible Anzeige, Rechte/Audit noetig |
| view:roles_rights_status | none/info_confirm | spaeter moeglich | Anzeige, keine Durchsetzung |

## Read-only Diagnoseaktionen

| Aktion | Confirm-Art | Status | Bemerkung |
|---|---|---|---|
| action:diagnostics_refresh_readonly | none/info_confirm | spaeter moeglich | nur read-only |
| action:status_resync_readonly | info_confirm | spaeter moeglich | liest/bewertet vorhandene Diagnosequellen |
| action:preflight_reload_readonly | info_confirm | spaeter moeglich | GET/read-only |
| action:guard_recheck_readonly | info_confirm | spaeter moeglich | read-only Bewertung |
| action:safety_status_recompute_readonly | info_confirm | spaeter moeglich | keine Mutation |

## High-risk Aktionen

Diese Aktionen bleiben in CAN-18.1 trotz Confirm blockiert.

| Aktion | Confirm-Art spaeter | Status | Bemerkung |
|---|---|---|---|
| request:recovery_prepare | risk_confirm/typed_confirm | separate_planning_required | bleibt blockiert |
| request:recovery_execute | typed_confirm/owner_confirm/dual_confirm | blocked_even_with_confirm | bleibt blockiert |
| request:safetystop_clear | typed_confirm/owner_confirm/dual_confirm | blocked_even_with_confirm | bleibt blockiert |
| request:safetystop_reset | typed_confirm/owner_confirm/dual_confirm | blocked_even_with_confirm | bleibt blockiert |
| request:queue_clear | destructive_confirm/typed_confirm/owner_confirm | blocked_even_with_confirm | bleibt blockiert |
| request:alert_replay | risk_confirm/typed_confirm | blocked_even_with_confirm | bleibt blockiert |
| request:sound_replay | risk_confirm/typed_confirm | blocked_even_with_confirm | bleibt blockiert |
| request:overlay_repair | risk_confirm/typed_confirm | separate_planning_required | bleibt blockiert |
| request:obs_source_refresh | risk_confirm/typed_confirm | separate_planning_required | bleibt blockiert |
| request:streamerbot_action_retry | risk_confirm/typed_confirm | blocked_even_with_confirm | bleibt blockiert |

## Audit-nahe Aktionen

| Aktion | Confirm-Art | Status | Bemerkung |
|---|---|---|---|
| view:audit_summary | none/info_confirm | spaeter moeglich | Rechte erforderlich |
| view:audit_details | info_confirm | spaeter moeglich | Datenschutz beachten |
| export:audit | typed_confirm/owner_confirm | blocked_even_with_confirm | eigene Planung noetig |
| delete:audit | typed_confirm/owner_confirm/dual_confirm | blocked_even_with_confirm | bleibt blockiert |
| configure:audit_retention | typed_confirm/owner_confirm | separate_planning_required | bleibt blockiert |
| write:audit_event | blocked_even_with_confirm | blocked_even_with_confirm | keine manuelle Write-Aktion |

## Rollen-/Rechte-Aktionen

| Aktion | Confirm-Art | Status | Bemerkung |
|---|---|---|---|
| view:roles | none/info_confirm | spaeter moeglich | read-only |
| view:permissions | none/info_confirm | spaeter moeglich | read-only |
| assign:role | typed_confirm/owner_confirm | blocked_even_with_confirm | eigene Planung noetig |
| remove:role | typed_confirm/owner_confirm | blocked_even_with_confirm | eigene Planung noetig |
| create:role | typed_confirm/owner_confirm | blocked_even_with_confirm | eigene Planung noetig |
| delete:role | typed_confirm/owner_confirm/dual_confirm | blocked_even_with_confirm | eigene Planung noetig |
| configure:permissions | typed_confirm/owner_confirm/dual_confirm | blocked_even_with_confirm | eigene Planung noetig |

## Dashboard-/Config-Aktionen

| Aktion | Confirm-Art | Status | Bemerkung |
|---|---|---|---|
| view:dashboard_config | none/info_confirm | spaeter moeglich | read-only |
| view:module_config | none/info_confirm | spaeter moeglich | read-only |
| edit:dashboard_config | risk_confirm/typed_confirm | separate_planning_required | keine Umsetzung |
| edit:module_config | risk_confirm/typed_confirm | separate_planning_required | keine Umsetzung |
| edit:secrets | typed_confirm/owner_confirm/dual_confirm | blocked_even_with_confirm | bleibt blockiert |

## Confirm darf nicht allein erlauben

Fuer jede spaetere Aktion gilt:

```text
Confirm vorhanden != Aktion erlaubt
```

Zusatzbedingungen spaeter:

```text
Rolle/Recht OK
SafetyStop OK
Guards OK
Preflight OK
Audit-Faehigkeit OK
separate Planung OK
```

## Confirm-Reihenfolge

Spaetere Reihenfolge fuer high-risk Aktionen:

```text
1. Identity klaeren
2. Rolle/Recht pruefen
3. SafetyStop pruefen
4. Guards/Preflight pruefen
5. Audit-Faehigkeit pruefen
6. Confirm anfordern
7. separate Execute-Phase
```

CAN-18.1 baut keine dieser Phasen.

## Fail-safe-Regeln

Blockieren bei:

```text
Confirm fehlt, obwohl noetig
Confirm abgelaufen
Confirm abgebrochen
Confirm falscher Actor
Confirm falscher Typ
Confirm falsche Phrase
Confirm-System unknown/degraded
Rights unknown
SafetyStop active/unknown/degraded/contradictory
Guards/Preflight nicht OK
Audit nicht verfuegbar fuer riskante Aktion
```

## Kein Button/Token/Route

CAN-18.1 erstellt nicht:

```text
Confirm Button
Confirm Token
Confirm ID
Confirm Nonce
Confirm Route
Confirm API
Confirm State
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
Keine Rechte-Mutation
Keine Confirm-Ausfuehrung
```

## Ergebnis CAN-18.1

CAN-18.1 definiert:

```text
Matrix-Werte
Read-only Action Matrix
Read-only Diagnose Action Matrix
High-risk Action Matrix
Audit-nahe Action Matrix
Rollen-/Rechte Action Matrix
Dashboard-/Config Action Matrix
Confirm-Reihenfolge
Fail-safe-Regeln
No-Button-/Token-/Route-Grenze
```

## Naechster sinnvoller Schritt

```text
CAN-18.2 - Confirm Display Boundary no-action Planning
```

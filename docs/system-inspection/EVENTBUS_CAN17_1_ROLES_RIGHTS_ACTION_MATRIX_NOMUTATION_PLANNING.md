# EVENTBUS CAN-17.1 - Roles/Rights Action Matrix no-mutation Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-17.1

## Zweck

CAN-17.1 plant eine detailliertere Rollen-/Rechte-Aktionsmatrix fuer spaetere Dashboard-/Recovery-nahe Bereiche.

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
Keine Rechte-Durchsetzung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-17.0 hat die Roles/Rights Boundary no-mutation geplant.

Definiert wurden dort:

```text
Rollen viewer/moderator/admin/owner/system
Grundregel Backend statt UI-Trust
Rechte-Kategorien
erste Rechte-Matrix
High-risk Blocker unabhaengig von Rollen
Audit-/SafetyStop-/Confirm-Abgrenzung
Systemrollen-Grenzen
No-mutation-Regel
Fail-safe-Regel
```

CAN-17.1 verfeinert nun die Aktionsmatrix, ohne Rechte technisch umzusetzen.

## Harte Grenze fuer CAN-17.1

CAN-17.1 darf nicht enthalten:

```text
Rollen-API
Rechte-API
Login-/User-System
DB-Tabelle
Dashboard-Rechte-Durchsetzung
Mutation
Recovery-Ausfuehrung
POST-Route
GET-Route fuer Rechte
SafetyStop Clear
Confirm Trigger
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Rollen

Aus CAN-17.0:

```text
viewer
moderator
admin
owner
system
```

## Entscheidungskategorien

Die Matrix nutzt folgende Planungswerte:

```text
allowed_later_readonly
maybe_later_readonly
blocked
separate_planning_required
never_silent
not_applicable
```

Bedeutung:

```text
allowed_later_readonly = spaeter fuer diese Rolle als read-only denkbar
maybe_later_readonly = spaeter moeglich, braucht genaue Freigabe
blocked = bleibt blockiert
separate_planning_required = eigener spaeterer Planungsstrang noetig
never_silent = darf nie still/automatisch passieren
not_applicable = fuer Rolle/System nicht sinnvoll
```

## Read-only Anzeigeaktionen

| Aktion | viewer | moderator | admin | owner | system | Status |
|---|---:|---:|---:|---:|---:|---|
| view:safety_status | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |
| view:recovery_guards | blocked/maybe | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |
| view:recovery_preflight | blocked/maybe | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |
| view:safetystop | blocked/maybe | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |
| view:audit | blocked | blocked | maybe_later_readonly | allowed_later_readonly | limited | geplant |
| view:system_health | blocked/maybe | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |

## Read-only Diagnoseaktionen

| Aktion | viewer | moderator | admin | owner | system | Status |
|---|---:|---:|---:|---:|---:|---|
| action:diagnostics_refresh_readonly | blocked | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |
| action:status_resync_readonly | blocked | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |
| action:preflight_reload_readonly | blocked | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |
| action:guard_recheck_readonly | blocked | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |
| action:safety_status_recompute_readonly | blocked | maybe_later_readonly | allowed_later_readonly | allowed_later_readonly | allowed_later_readonly | geplant |

Wichtig:

```text
Auch read-only Aktionen brauchen spaeter serverseitige Rechtepruefung.
CAN-17.1 baut diese Rechtepruefung nicht.
```

## High-risk Request-Aktionen

Diese Aktionen bleiben blockiert und brauchen separate Planung. Rolle allein reicht nie.

| Aktion | viewer | moderator | admin | owner | system | Status |
|---|---:|---:|---:|---:|---:|---|
| request:recovery_prepare | blocked | blocked | separate_planning_required | separate_planning_required | never_silent | blockiert |
| request:recovery_execute | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |
| request:safetystop_clear | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |
| request:safetystop_reset | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |
| request:queue_clear | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |
| request:alert_replay | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |
| request:sound_replay | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |
| request:overlay_repair | blocked | blocked | separate_planning_required | separate_planning_required | never_silent | blockiert |
| request:obs_source_refresh | blocked | blocked | separate_planning_required | separate_planning_required | never_silent | blockiert |
| request:streamerbot_action_retry | blocked | blocked | separate_planning_required | separate_planning_required | never_silent | blockiert |

## Audit-nahe Aktionen

| Aktion | viewer | moderator | admin | owner | system | Status |
|---|---:|---:|---:|---:|---:|---|
| view:audit_summary | blocked | blocked | maybe_later_readonly | allowed_later_readonly | limited | geplant |
| view:audit_details | blocked | blocked | maybe_later_readonly | allowed_later_readonly | limited | geplant |
| export:audit | blocked | blocked | separate_planning_required | separate_planning_required | never_silent | blockiert |
| delete:audit | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |
| configure:audit_retention | blocked | blocked | separate_planning_required | separate_planning_required | never_silent | blockiert |
| write:audit_event | blocked | blocked | blocked | separate_planning_required | limited/separate | blockiert |

## Rollenverwaltung

Rollenverwaltung ist high-risk und bleibt blockiert.

| Aktion | viewer | moderator | admin | owner | system | Status |
|---|---:|---:|---:|---:|---:|---|
| view:roles | blocked | blocked | maybe_later_readonly | allowed_later_readonly | limited | geplant |
| assign:role | blocked | blocked | blocked/separate | separate_planning_required | never_silent | blockiert |
| remove:role | blocked | blocked | blocked/separate | separate_planning_required | never_silent | blockiert |
| create:role | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |
| delete:role | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |
| configure:permissions | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |

## Dashboard-Konfiguration

Nur Planung, keine Umsetzung.

| Aktion | viewer | moderator | admin | owner | system | Status |
|---|---:|---:|---:|---:|---:|---|
| view:dashboard_config | blocked | blocked | maybe_later_readonly | allowed_later_readonly | limited | geplant |
| edit:dashboard_config | blocked | blocked | separate_planning_required | separate_planning_required | never_silent | blockiert |
| view:module_config | blocked | blocked | maybe_later_readonly | allowed_later_readonly | limited | geplant |
| edit:module_config | blocked | blocked | separate_planning_required | separate_planning_required | never_silent | blockiert |
| edit:secrets | blocked | blocked | blocked | separate_planning_required | never_silent | blockiert |

## Wichtige Sicherheitsregeln

### Rolle allein reicht nie

Auch `owner` darf high-risk Aktionen nicht allein freigeben.

Zusaetzlich spaeter noetig:

```text
Audit
Confirm
SafetyStop inactive/known
Guards OK
Preflight OK
separate Freigabe
```

### System darf nie still produktiv handeln

Die Rolle `system` darf read-only pruefen, aber nicht still ausfuehren:

```text
keine Auto-Recovery
kein Auto-Clear
kein Replay
kein Queue Clear
kein OBS Refresh
kein Streamer.bot Retry
```

### UI ist nicht Autoritaet

Nicht ausreichend:

```text
Button verstecken
Frontend-Rolle
localStorage
Query-Parameter
CSS-Klasse
```

Spaeter erforderlich:

```text
serverseitige Rechtepruefung
auditierbare Entscheidung
fail-safe Default
```

## Fail-safe-Regel

Wenn Rolle/Recht unbekannt ist:

```text
blockieren
```

Wenn Rechtepruefung nicht verfuegbar ist:

```text
blockieren
```

Wenn Client-Rolle nicht serverseitig bestaetigt ist:

```text
blockieren
```

Wenn Rechte widerspruechlich sind:

```text
blockieren
```

## No-mutation-Regel

CAN-17.1 darf nichts veraendern:

```text
keine DB
keine Config
keine Runtime-State-Aenderung
keine EventBus-State-Aenderung
keine Queue/Sound/Alert/Overlay-Aenderung
keine OBS-/Streamer.bot-Aktion
```

## Keine technische Umsetzung in CAN-17.1

CAN-17.1 erstellt nicht:

```text
roles.js
rights.js
permissions.js
auth.js
role table
permission table
login page
session middleware
dashboard rights UI
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
```

## Ergebnis CAN-17.1

CAN-17.1 definiert:

```text
Read-only Anzeigeaktionsmatrix
Read-only Diagnoseaktionsmatrix
High-risk Request-Aktionsmatrix
Audit-nahe Aktionsmatrix
Rollenverwaltungs-Matrix
Dashboard-Konfigurations-Matrix
Sicherheitsregeln fuer Rollen
Fail-safe-Regel
No-mutation-Regel
```

## Naechster sinnvoller Schritt

```text
CAN-17.2 - Roles/Rights Backend Boundary no-implementation Planning
```

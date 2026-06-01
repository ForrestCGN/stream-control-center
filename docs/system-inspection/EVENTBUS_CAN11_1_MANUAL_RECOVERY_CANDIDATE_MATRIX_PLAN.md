# CAN-11.1 - Manual Recovery Candidate Matrix Plan

## Zweck

CAN-11.1 erstellt eine detaillierte Kandidatenmatrix fuer moegliche spaetere manuelle Recovery-Aktionen.

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Ausgangslage

Abgeschlossen:

- CAN-8.x: read-only Recovery-Preflight Statusfelder und Dashboard-Anzeige
- CAN-9.x: dedizierte read-only Route `GET /api/bus-diagnostics/recovery-preflight`
- CAN-10.x: Button `Preflight neu laden` als reine Diagnose-Aktualisierung
- CAN-11.0: Startgrenze fuer Kandidatenauswahl

Aktueller sicherer Stand:

```text
readOnly: true
canPrepare: false
canExecute: false
keine Recovery-Ausfuehrung
```

## Bewertungsregeln

Jeder Kandidat wird bewertet nach:

- Kandidatenname
- Kurzbeschreibung
- Risikoklasse
- erlaubte Datenquellen
- verbotene Mutationen
- benoetigte Guards
- Audit-Bedarf
- Dashboard-Sichtbarkeit
- Status fuer Umsetzung

## Statuswerte

```text
implemented_readonly
planned_readonly
planned_local_only
blocked_productive_touch
blocked_execution
```

## Kandidatenmatrix

| Kandidat | Klasse | Risiko | Status | Kurzbewertung |
|---|---:|---:|---|---|
| `manual_diagnostics_refresh` | 0 | sehr niedrig | implemented_readonly | Bereits umgesetzt; nur GET/Render |
| `manual_status_resync_request` | 1 | niedrig | planned_readonly | Kann als naechster read-only Kandidat geplant werden |
| `manual_dashboard_local_state_clear` | 2 | niedrig-mittel | planned_local_only | Nur lokaler UI-State, kein Backend |
| `manual_route_context_reload` | 1 | niedrig | planned_readonly | Dedizierte Route neu lesen, kein Systemtouch |
| `manual_check_matrix_rebuild_view` | 1 | niedrig | planned_readonly | Matrix aus bestehenden Daten neu anzeigen |
| `manual_audit_preview` | 1 | niedrig | planned_readonly | Nur Vorschau, kein Audit-Schreibvorgang |
| `manual_overlay_state_refresh` | 3 | mittel | blocked_productive_touch | Overlay-State koennte produktiv beruehrt werden |
| `manual_sound_status_refresh` | 3 | mittel | blocked_productive_touch | Sound-System-Naehe, noch blockiert |
| `manual_alert_status_refresh` | 3 | mittel | blocked_productive_touch | Alert-System-Naehe, noch blockiert |
| `manual_queue_status_refresh` | 3 | mittel | blocked_productive_touch | Queue-Naehe, noch blockiert |
| `manual_unlock_stale_bundle` | 4 | hoch | blocked_execution | Echte Recovery-/State-Mutation |
| `manual_clear_stale_visual_wait` | 4 | hoch | blocked_execution | Echte Recovery-/State-Mutation |
| `manual_replay_alert` | 4 | hoch | blocked_execution | Produktiver Alert-Replay |
| `manual_replay_sound` | 4 | hoch | blocked_execution | Produktiver Sound-Replay |
| `manual_execute_recovery` | 4 | sehr hoch | blocked_execution | Vollstaendige Recovery-Ausfuehrung |

## Kandidat: manual_diagnostics_refresh

Status:

```text
implemented_readonly
```

Erlaubt:

- `GET /api/bus-diagnostics/status`
- `GET /api/bus-diagnostics/recovery-preflight`
- Dashboard neu rendern

Verboten:

- POST
- Prepare
- Execute
- Queue-/Sound-/Alert-/Overlay-Mutation

Audit:

- kein produktives Recovery-Audit notwendig
- lokaler UI-Status ausreichend

## Kandidat: manual_status_resync_request

Status:

```text
planned_readonly
```

Ziel:

- bekannte Statusquellen kontrolliert neu lesen
- Ergebnis als read-only Resync-Status anzeigen
- keine produktive Mutation

Erlaubte Datenquellen:

- Bus-Diagnostics Status
- Recovery-Preflight Route
- bereits vorhandene Modulstatus-Felder, sofern sie nur gelesen werden

Verboten:

- Module aktiv neu starten
- Queues leeren
- Sounds stoppen/starten
- Alerts neu ausloesen
- Overlays steuern
- DB schreiben
- Config schreiben

Benoetigte Guards:

- ReadOnlyGuard
- RouteSafetyGuard
- ProductiveTouchGuard
- NoPostGuard
- NoMutationGuard

Audit:

- kein Recovery-Execution-Audit
- maximal UI-/diagnostics-log mit `readOnly: true`

Dashboard:

- spaeter als eigener read-only Kandidat sichtbar
- kein Execute-Button

## Kandidat: manual_dashboard_local_state_clear

Status:

```text
planned_local_only
```

Ziel:

- nur lokale Dashboard-Anzeigefehler bereinigen
- z. B. lokaler Fehlertext, Loading-State oder letzter Refresh-Status

Erlaubt:

- Browser-State loeschen
- UI neu rendern

Verboten:

- Backend-Aufruf mit Mutation
- DB/Config
- Recovery
- Modulstatus aendern

Benoetigte Guards:

- LocalOnlyGuard
- NoBackendMutationGuard

Audit:

- kein Recovery-Audit
- optional lokales Debug-Log

## Blockierte produktive Kandidaten

Folgende Kandidaten bleiben blockiert, weil sie produktive oder modulnahe Zustaende beruehren koennten:

```text
manual_overlay_state_refresh
manual_sound_status_refresh
manual_alert_status_refresh
manual_queue_status_refresh
```

Sie duerfen erst spaeter geplant werden, wenn pro Modul ein eigener Guard- und Audit-Vertrag existiert.

## Hart blockierte Ausfuehrungskandidaten

Folgende Kandidaten bleiben hart blockiert:

```text
manual_unlock_stale_bundle
manual_clear_stale_visual_wait
manual_replay_alert
manual_replay_sound
manual_execute_recovery
```

Sie duerfen in CAN-11 nicht umgesetzt werden.

## Empfehlung fuer CAN-11.2

CAN-11.2 soll den Kandidaten `manual_status_resync_request` genauer planen.

Begruendung:

- niedriges Risiko
- weiterhin read-only
- sinnvoller naechster Schritt nach `manual_diagnostics_refresh`
- noch keine echte Recovery
- gute Vorbereitung fuer spaetere Guards

## CAN-11.2 Grenze

CAN-11.2 bleibt reine Dokumentation.

Keine Code-Aenderung in CAN-11.2.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

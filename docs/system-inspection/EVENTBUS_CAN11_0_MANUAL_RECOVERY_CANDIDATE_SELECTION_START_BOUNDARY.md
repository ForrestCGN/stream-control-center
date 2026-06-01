# CAN-11.0 - Manual Recovery Candidate Selection Start Boundary

## Zweck

CAN-11.0 startet den Block zur Auswahl moeglicher spaeterer manueller Recovery-Kandidaten.

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Ausgangslage

Abgeschlossen:

- CAN-8.x: Recovery-Preflight read-only Statusfelder und Dashboard-Anzeige
- CAN-9.x: dedizierte read-only Preflight-Route und Dashboard-Konsum
- CAN-10.x: manueller Diagnose-Refresh `Preflight neu laden`

Aktueller sicherer Stand:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
readOnly: true
canPrepare: false
canExecute: false
keine Recovery-Ausfuehrung
```

## Ziel von CAN-11.x

CAN-11.x soll moegliche manuelle Recovery-Kandidaten sammeln, bewerten und nach Risiko sortieren.

Noch nicht Ziel:

- keine Umsetzung echter Recovery
- keine Prepare-Route
- keine Execute-Route
- keine POST-Route
- keine produktive Mutation
- keine Buttons fuer echte Recovery

## Kandidatenklassen

### Klasse 0 - Read-only Diagnose

Bereits umgesetzt:

```text
manual_diagnostics_refresh
```

Eigenschaft:

- nur GET
- nur Dashboard-Refresh
- keine produktive Beruehrung

### Klasse 1 - Read-only Resync Request

Moeglicher naechster harmloser Kandidat:

```text
manual_status_resync_request
```

Bedeutung:

- System liest bekannte Statusquellen neu
- System bewertet Diagnose-/Bus-Zustaende erneut
- keine Queue-/Sound-/Alert-/Overlay-Mutation
- keine Recovery-Ausfuehrung

Klasse 1 waere noch keine echte Recovery, sondern ein kontrollierter Status-Resync auf Diagnoseebene.

### Klasse 2 - Soft Reset / Local UI Reset

Moeglicher spaeterer Kandidat, aber noch nicht fuer Umsetzung freigegeben:

```text
manual_dashboard_local_state_clear
```

Bedeutung:

- nur lokaler Dashboard-State wird bereinigt
- keine Backend-Mutation
- keine produktive Systemaenderung

### Klasse 3 - Productive State Touch

Noch blockiert:

```text
manual_overlay_state_refresh
manual_sound_status_refresh
manual_alert_status_refresh
manual_queue_status_refresh
```

Diese Kandidaten koennten produktive oder modulnahe Zustaende beruehren und duerfen noch nicht umgesetzt werden.

### Klasse 4 - Recovery Execution

Weiterhin hart blockiert:

```text
manual_replay_alert
manual_replay_sound
manual_clear_queue
manual_unlock_bundle
manual_recover_overlay
manual_execute_recovery
```

Diese Kandidaten duerfen in CAN-11 nicht umgesetzt werden.

## Risikomatrix

| Klasse | Kandidat | Risiko | Darf in CAN-11 umgesetzt werden? |
|---|---|---:|---|
| 0 | manual_diagnostics_refresh | sehr niedrig | bereits umgesetzt |
| 1 | manual_status_resync_request | niedrig | nur nach weiterer Planung |
| 2 | manual_dashboard_local_state_clear | niedrig bis mittel | nur nach weiterer Planung |
| 3 | Modulstatus-Refresh mit Systemnaehe | mittel | nein |
| 4 | echte Recovery-Ausfuehrung | hoch | nein |

## Harte Blockaden bleiben aktiv

Weiterhin hart blockiert:

- `auto_replay_alert`
- `manual_replay_alert`
- `auto_replay_sound`
- `manual_replay_sound`
- `auto_retry_overlay`
- `auto_recovery`
- `manual_recovery_execution`
- `prepare_recovery`
- `execute_recovery`
- `manual_unlock_stale_bundle`
- `clear_stale_visual_wait`
- `refresh_overlay_state`

## Empfohlener naechster Schritt

CAN-11.1 soll eine detaillierte Kandidatenmatrix erstellen:

```text
Manual Recovery Candidate Matrix Plan
```

Diese Matrix soll fuer jeden Kandidaten definieren:

- Name
- Beschreibung
- Risikoklasse
- erlaubte Datenquellen
- verbotene Mutationen
- benoetigte Guards
- benoetigte Audit-Regeln
- Dashboard-Sichtbarkeit
- Entscheidung: erlaubt / geplant / blockiert

## CAN-11.1 Grenze

CAN-11.1 bleibt reine Dokumentation.

Keine Code-Aenderung in CAN-11.1.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

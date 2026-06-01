# CAN-10.0 - Manual Recovery Safe Action Start Boundary

## Zweck

CAN-10.0 startet den naechsten Recovery-Block nach dem abgeschlossenen read-only Preflight-/Route-/Dashboard-Strang aus CAN-8.x und CAN-9.x.

Dieser Step fuehrt noch keine Recovery aus. Er definiert nur die Grenze fuer die erste spaetere harmlose manuelle Aktion.

## Ausgangslage

Abgeschlossen und live abgenommen:

- `recoveryReadiness` ist sichtbar.
- `recoveryPreflight` ist sichtbar.
- Die Preflight-Check-Matrix liefert `13/13 ok`.
- `GET /api/bus-diagnostics/recovery-preflight` existiert.
- Das Dashboard konsumiert die dedizierte read-only Route.
- Route-Safety zeigt weiterhin:
  - `method: GET`
  - `readOnly: true`
  - `commandRoute: false`
  - `prepareRoute: false`
  - `executeRoute: false`
  - `recoveryExecution: false`

## Harte Grenze fuer CAN-10.x

CAN-10.x darf nicht mit Replay, Queue-Clear, Alert-Reset, Sound-Reset oder Overlay-Recovery beginnen.

Die erste erlaubte Idee ist nur eine harmlose Diagnose-Aktion:

```text
Preflight neu bewerten / Status neu laden / Diagnose refreshen
```

Diese Aktion darf nur bereits vorhandene Diagnose-Daten neu lesen und neu darstellen. Sie darf keine produktiven Systeme beruehren.

## Erlaubte erste Action-Klasse

Name der geplanten Action-Klasse:

```text
manual_diagnostics_refresh
```

Bedeutung:

- Diagnose-Status neu laden
- Preflight-Route erneut abrufen
- Dashboard-Anzeige aktualisieren
- keine Daten veraendern
- keine Recovery vorbereiten
- keine Recovery ausfuehren
- keine Queue anfassen
- keine Sound-/Alert-/Overlay-Steuerung anfassen

## Explizit nicht erlaubt

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

Wichtig: Auch `refresh_overlay_state` bleibt noch blockiert, weil es bereits ein produktives Overlay-State-Thema beruehren koennte. CAN-10 startet nur mit Diagnose-/Preflight-Refresh.

## Sicherheitsregeln fuer spaetere CAN-10.x Umsetzung

Eine spaetere Umsetzung darf nur dann beginnen, wenn alle folgenden Regeln gelten:

- nur read-only Route oder Dashboard-Refresh
- keine POST-Route fuer Recovery-Ausfuehrung
- keine Execute-/Prepare-Route
- keine Queue-/Sound-/Alert-/Overlay-Mutation
- keine DB-Aenderung
- keine Config-Aenderung
- keine automatische Wiederholung
- kein Timer
- kein Auto-Retry
- keine Streamer.bot-Aktion
- kein OBS-Befehl

## Moegliche spaetere technische Form

Noch nicht umgesetzt, nur Grenze:

```text
Dashboard-Button: "Preflight neu laden"
```

Dieser Button waere kein Recovery-Button. Er duerfte nur die bereits existierenden GET-Endpunkte erneut abrufen.

Moegliche spaetere Endpunkte:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Nicht erlaubt:

```text
POST /api/bus-diagnostics/recovery/*
POST /api/bus-diagnostics/recovery-preflight/*
POST /api/bus-diagnostics/execute/*
```

## CAN-10.1 Startgrenze

CAN-10.1 darf nur den genauen UI-/Route-Vertrag fuer diesen Diagnose-Refresh planen.

CAN-10.1 darf noch keinen Code aendern.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

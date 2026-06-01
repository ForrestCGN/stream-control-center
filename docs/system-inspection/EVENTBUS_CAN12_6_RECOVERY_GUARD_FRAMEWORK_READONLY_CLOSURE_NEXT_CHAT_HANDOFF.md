# CAN-12.6 - Recovery Guard Framework Read-only Closure / Next Chat Handoff

## Zweck

CAN-12.6 schliesst den aktuellen Recovery-/Preflight-/Guard-Framework-Arbeitsblock ab und dokumentiert den Stand fuer den naechsten Chat.

Dieser Step ist reine Dokumentation und Projektstand-Aktualisierung. Es werden keine Code-Dateien geaendert.

## Abgeschlossene Bloecke

### CAN-8.x - Recovery Preflight read-only Statusfelder und Dashboard

Umgesetzt und abgenommen:

- `recoveryPreflight` im Backend-Status
- Preflight-Safety
- Preflight-Scope
- Preflight-Check-Matrix
- Dashboard-Anzeige im Recovery/Preflight-Tab

### CAN-9.x - Dedizierte read-only Preflight-Route

Umgesetzt und abgenommen:

```text
GET /api/bus-diagnostics/recovery-preflight
```

Wichtiger Stand:

```text
version: 1.2.9
routeVersion: CAN-9.4
currentStep: CAN-9.4
nextAllowedStep: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
readOnly: true
canPrepare: false
canExecute: false
```

Route-Safety:

```text
method: GET
readOnly: true
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
```

### CAN-10.x - Manual Diagnostics Refresh

Umgesetzt und abgenommen:

```text
manual_diagnostics_refresh
```

Dashboard:

```text
Button: Preflight neu laden
```

Erlaubt nur:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Keine produktive Mutation.

### CAN-11.x - Manual Status Resync

Umgesetzt und abgenommen:

```text
manual_status_resync_request
```

Dashboard:

```text
Karte: Manueller Status-Resync
Button: Status neu synchronisieren
```

Lokale Guards:

```text
readOnlyGuard
noMutationGuard
routeSafetyGuard
noPrepareExecuteGuard
dashboardOnlyGuard
```

Keine Backend-Aenderung, keine neue Route, keine Recovery-Ausfuehrung.

### CAN-12.x - Manual Recovery Guard Framework

Umgesetzt und abgenommen:

```text
Karte: Recovery Guards
```

Sichtbarer Live-Test-Stand:

```text
Guards: 16
OK: 16
Warnings: 0
Blocked: 0
Errors: 0
Blocking Failed: 0
```

Die Karte nutzt lokale Guard-Ergebnisse aus:

```text
manual_diagnostics_refresh
manual_status_resync_request
```

## Aktueller technischer Stand

Geaenderte technische Dateien in den letzten umgesetzten Code-Steps:

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
```

Wichtige Backend-Staende:

```text
bus_diagnostics Version: 1.2.9
Build: STEP_CAN9_4
GET /api/bus-diagnostics/recovery-preflight aktiv
```

Wichtige Dashboard-Staende:

```text
Recovery -> Preflight Tab
Preflight neu laden
Status neu synchronisieren
Recovery Guards
```

## Harte Sicherheitsgrenzen bleiben aktiv

Weiterhin hart verboten:

- auto_replay_alert
- manual_replay_alert
- auto_replay_sound
- manual_replay_sound
- auto_retry_overlay
- auto_recovery
- manual_recovery_execution
- prepare_recovery
- execute_recovery
- manual_unlock_stale_bundle
- clear_stale_visual_wait
- refresh_overlay_state als produktive Overlay-State-Recovery

## Wichtige Projektregeln fuer neuen Chat

- Immer zuerst echten Dateistand pruefen.
- GitHub/dev und lokales Repo sind Single Source of Truth.
- Keine Funktionalitaet entfernen.
- Keine Patch-/Apply-Scripte.
- Vollstaendige Ersatzdateien liefern.
- ZIPs mit echten Zielpfaden ab Repo-Root.
- SQLite `D:\Streaming\stramAssets\data\sqlite\app.sqlite` niemals neu bauen, ueberschreiben oder loeschen.
- Bei JS-Aenderungen immer:
  ```cmd
  node -c <datei>
  ```
- Danach:
  ```cmd
  .\stepdone.cmd "<Step-Text>"
  ```

## Naechster sinnvoller Block

Empfehlung fuer neuen Chat:

```text
CAN-13.0 Recovery Guard Framework Closure / Next Recovery Candidate Planning Start
```

Oder, wenn der Recovery-Strang erstmal pausieren soll:

```text
Stream-Control-Center Dokumentation konsolidieren und GitHub/Live-Abgleich vorbereiten
```

## Nicht mehr weiter eskalieren ohne neue Entscheidung

Vor produktiven Recovery-Schritten muss neu entschieden werden:

- Welcher Kandidat darf als erster produktiver Recovery-Kandidat geplant werden?
- Brauchen wir Audit zuerst?
- Brauchen wir Rollen/Rechte zuerst?
- Brauchen wir Bestätigung/Confirm-Code zuerst?
- Brauchen wir Safety-Stop/Cancel zuerst?

Empfehlung: Vor echter Recovery zuerst **Audit + Rollen/Rechte + Confirm-Konzept** technisch planen.

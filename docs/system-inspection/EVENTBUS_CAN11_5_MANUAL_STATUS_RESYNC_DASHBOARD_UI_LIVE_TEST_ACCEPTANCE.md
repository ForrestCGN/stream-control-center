# CAN-11.5 - Manual Status Resync Dashboard UI Live-Test Acceptance

## Zweck

CAN-11.5 dokumentiert den Live-Test und die Abnahme der in CAN-11.4 umgesetzten Dashboard-UI fuer:

```text
manual_status_resync_request
```

Dieser Step ist reine Dokumentation. Es werden keine Code-Dateien geaendert.

## Getesteter Bereich

Dashboard:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Neue Karte:

```text
Manueller Status-Resync
```

Button:

```text
Status neu synchronisieren
```

## Erwartetes Verhalten

Beim Klick darf der Button nur vorhandene read-only Daten neu laden:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Danach darf das Dashboard nur eine lokale Guard-/Status-Auswertung rendern.

## Erwartete sichtbare Angaben

Nach dem Klick sollen sichtbar sein:

- Status des Resyncs
- letzter Resync-Zeitpunkt
- verwendete Quellen
- Read-only: ja
- produktive Beruehrung: nein
- Prepare: nein
- Execute: nein
- Guards sichtbar:
  - readOnlyGuard
  - noMutationGuard
  - routeSafetyGuard
  - noPrepareExecuteGuard
  - dashboardOnlyGuard
- Fehleranzeige nur bei fehlgeschlagenem GET

## Sicherheitsgrenze

Der Button bleibt eine read-only Diagnose-/Status-Aktion und ist keine Recovery-Ausfuehrung.

Weiterhin nicht erlaubt:

- keine POST-Route
- keine Command-Route
- keine Prepare-Route
- keine Execute-Route
- keine Recovery-Ausfuehrung
- keine Queue-Mutation
- keine Sound-Mutation
- keine Alert-Mutation
- keine Overlay-Mutation
- keine DB-Aenderung
- keine Config-Aenderung
- keine Streamer.bot-Aktion
- keine OBS-Aktion

## Erwartete Route-Safety

Die Route-Safety muss weiterhin read-only bleiben:

```text
method: GET
readOnly: true
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
```

## Erwartete Preflight-Werte

Im Normalfall bleiben die Preflight-Werte:

```text
readOnly: true
canPrepare: false
canExecute: false
Checks: 13
OK: 13
Warnings: 0
Blocking: 0
Blocked: 0
```

## Abnahmekriterien

CAN-11.5 gilt als bestanden, wenn:

- Karte `Manueller Status-Resync` sichtbar ist
- Button `Status neu synchronisieren` sichtbar ist
- Klick aktualisiert die Karte
- Quellen sichtbar sind
- lokale Guards sichtbar sind
- Read-only bleibt `ja`
- Produktive Beruehrung bleibt `nein`
- Prepare bleibt `nein`
- Execute bleibt `nein`
- keine Recovery-/Prepare-/Execute-/Simulation-Buttons erscheinen
- keine produktive Systemaenderung sichtbar wird

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

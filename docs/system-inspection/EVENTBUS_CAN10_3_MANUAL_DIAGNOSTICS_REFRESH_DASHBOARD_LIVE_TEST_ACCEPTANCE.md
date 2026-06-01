# CAN-10.3 - Manual Diagnostics Refresh Dashboard Live-Test Acceptance

## Zweck

CAN-10.3 dokumentiert den Live-Test und die Abnahme des in CAN-10.2 umgesetzten Dashboard-Buttons:

```text
Preflight neu laden
```

Dieser Step ist reine Dokumentation. Es werden keine Code-Dateien geaendert.

## Getesteter Bereich

Dashboard:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Neue Karte:

```text
Manueller Diagnose-Refresh
```

Button:

```text
Preflight neu laden
```

## Erwartetes Verhalten

Beim Klick darf der Button nur vorhandene read-only Daten neu laden:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Danach darf das Dashboard nur neu gerendert werden.

## Sicherheitsgrenze

Der Button ist kein Recovery-Button.

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

## Erwartete sichtbare Werte nach Klick

Die Werte koennen sich inhaltlich aktualisieren, muessen aber weiterhin read-only bleiben.

Erwartet:

```text
readOnly: true
canPrepare: false
canExecute: false
routeSafety.method: GET
routeSafety.commandRoute: false
routeSafety.prepareRoute: false
routeSafety.executeRoute: false
routeSafety.recoveryExecution: false
```

Check-Matrix bleibt im Normalfall:

```text
Checks: 13
OK: 13
Warnings: 0
Blocking: 0
Blocked: 0
```

## Abnahmekriterien

CAN-10.3 gilt als bestanden, wenn:

- Karte `Manueller Diagnose-Refresh` sichtbar ist
- Button `Preflight neu laden` sichtbar ist
- Klick aktualisiert die Anzeige
- keine Recovery-/Prepare-/Execute-/Simulation-Buttons erscheinen
- Route-Safety bleibt GET/read-only
- keine Fehler im Dashboard sichtbar werden
- Backend bleibt unveraendert produktiv unberuehrt

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

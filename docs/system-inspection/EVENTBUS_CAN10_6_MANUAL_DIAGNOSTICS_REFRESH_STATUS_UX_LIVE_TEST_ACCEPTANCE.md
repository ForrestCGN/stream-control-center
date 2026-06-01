# CAN-10.6 - Manual Diagnostics Refresh Status/UX Live-Test Acceptance

## Zweck

CAN-10.6 dokumentiert den Live-Test und die Abnahme des in CAN-10.5 umgesetzten Status-/UX-Cleanups fuer den Button:

```text
Preflight neu laden
```

Dieser Step ist reine Dokumentation. Es werden keine Code-Dateien geaendert.

## Getesteter Bereich

Dashboard:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Karte:

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

## Erwartete UI-Anzeigen

Nach dem Klick sollen in der Karte sichtbar bzw. aktualisiert sein:

- Status des letzten Refreshs
- letzter Refresh-Zeitpunkt
- verwendete Route
- Read-only: ja
- produktive Beruehrung: nein
- Prepare: nein
- Execute: nein
- Fehleranzeige nur bei fehlgeschlagenem GET
- Button kehrt aus Loading-State zurueck

## Sicherheitsgrenze

Der Button bleibt ein Diagnose-Refresh und ist keine Recovery-Aktion.

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

CAN-10.6 gilt als bestanden, wenn:

- Button `Preflight neu laden` sichtbar ist
- Klick aktualisiert die Anzeige
- letzter Refresh-Zeitpunkt sichtbar ist
- verwendete Route sichtbar ist
- Status wird erfolgreich oder mit Fehler angezeigt
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

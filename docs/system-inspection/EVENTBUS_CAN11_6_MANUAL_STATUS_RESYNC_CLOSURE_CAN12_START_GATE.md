# CAN-11.6 - Manual Status Resync Closure / CAN-12 Start Gate

## Zweck

CAN-11.6 schliesst den Block `manual_status_resync_request` ab und definiert die Startgrenze fuer CAN-12.

Dieser Step ist reine Dokumentation. Es werden keine Code-Dateien geaendert.

## Abgeschlossener CAN-11.x Block

Im CAN-11.x Block wurde die Auswahl und Umsetzung eines weiteren read-only Kandidaten abgeschlossen:

```text
manual_status_resync_request
```

Sichtbare Karte:

```text
Manueller Status-Resync
```

Sichtbarer Button:

```text
Status neu synchronisieren
```

Bereich:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

## Was der Button darf

Der Button darf nur bestehende read-only GET-Endpunkte neu abrufen:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Danach fuehrt das Dashboard nur eine lokale Guard-/Status-Auswertung durch und rendert die Anzeige neu.

## Lokale Guards

Die Dashboard-UI wertet lokal folgende Guards aus:

```text
readOnlyGuard
noMutationGuard
routeSafetyGuard
noPrepareExecuteGuard
dashboardOnlyGuard
```

## Was der Button nicht darf

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
- kein Auto-Refresh
- kein Retry-Loop

## Abgenommener Sicherheitsstand

Der Recovery-/Preflight-Bereich ist weiterhin read-only.

Erwartete zentrale Werte:

```text
readOnly: true
canPrepare: false
canExecute: false
routeSafety.method: GET
routeSafety.commandRoute: false
routeSafety.prepareRoute: false
routeSafety.executeRoute: false
routeSafety.recoveryExecution: false
productiveTouch: false
```

## CAN-12 Startgrenze

CAN-12 darf den naechsten sinnvollen Block planen, aber weiterhin keine echte Recovery-Ausfuehrung starten.

Empfohlener CAN-12 Start:

```text
Manual Recovery Guard Framework Planning
```

Ziel: Die bisher nur geplanten Guard-Begriffe strukturiert als wiederverwendbares Konzept vorbereiten.

## Warum Guard Framework als naechster Block sinnvoll ist

Bisher existieren mehrere read-only Aktionen:

- `manual_diagnostics_refresh`
- `manual_status_resync_request`

Beide benutzen Sicherheitsbegriffe wie:

- ReadOnlyGuard
- NoMutationGuard
- RouteSafetyGuard
- NoPrepareExecuteGuard
- DashboardOnlyGuard

Bevor echte produktive Recovery-Kandidaten geplant werden, sollte CAN-12 definieren, wie diese Guards spaeter einheitlich beschrieben, angezeigt und ausgewertet werden.

## CAN-12 darf noch nicht

CAN-12 darf noch nicht:

- produktive Recovery ausfuehren
- POST-/Prepare-/Execute-Routen einfuehren
- Queue/Sound/Alert/Overlay veraendern
- DB/Config schreiben
- Streamer.bot oder OBS steuern

## CAN-12.0 Grenze

CAN-12.0 soll als reiner Planungsstep starten:

```text
CAN-12.0 Manual Recovery Guard Framework Start Boundary
```

Keine Code-Aenderung in CAN-12.0.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

# CAN-10.7 - Manual Diagnostics Refresh Closure / CAN-11 Start Gate

## Zweck

CAN-10.7 schliesst den CAN-10.x Block `manual_diagnostics_refresh` ab und definiert die Startgrenze fuer CAN-11.

Dieser Step ist reine Dokumentation. Es werden keine Code-Dateien geaendert.

## Abgeschlossener CAN-10.x Block

Im CAN-10.x Block wurde die erste harmlose manuelle Aktion im Recovery-Bereich eingefuehrt:

```text
manual_diagnostics_refresh
```

Sichtbarer Button:

```text
Preflight neu laden
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

Danach rendert das Dashboard die Diagnose-/Preflight-Daten neu.

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
```

## CAN-11 Startgrenze

CAN-11 darf den naechsten sinnvollen Block planen, aber noch nicht automatisch produktive Systeme beruehren.

Empfohlener CAN-11 Start:

```text
Manual Recovery Candidate Selection
```

Ziel: Auswaehlen, welche erste echte Recovery-Kandidatenklasse spaeter ueberhaupt geplant werden darf.

## Erlaubte CAN-11 Planungsfragen

CAN-11 darf nur planen und bewerten:

- Welche Recovery-Kandidaten gibt es?
- Welche Kandidaten sind komplett harmlos?
- Welche Kandidaten beruehren produktive Systeme?
- Welche Kandidaten muessen weiterhin blockiert bleiben?
- Welche Guards waeren pro Kandidat notwendig?
- Welche Audit-Regeln waeren spaeter notwendig?
- Welche Dashboard-Anzeige waere sinnvoll?

## Nicht als erster echter Kandidat empfohlen

Nicht zuerst starten mit:

- Alert replay
- Sound replay
- Queue clear
- Overlay state repair
- Streamer.bot trigger
- OBS scene/source command

Diese Kandidaten koennen spaeter geplant werden, aber nicht als erster technischer Ausfuehrungsblock.

## Empfohlener erster CAN-11 Kandidat

Wenn CAN-11 spaeter ueber eine erste echte Kandidatenklasse spricht, dann maximal:

```text
manual_status_resync_request
```

Bedeutung nur als Planung:

- System fragt Status neu an
- System prueft vorhandene Diagnose-/Bus-Zustaende
- keine produktive Mutation
- keine Recovery-Ausfuehrung

Alternativ kann CAN-11 zuerst eine reine Kandidatenmatrix erstellen, ohne Code.

## CAN-11.0 Grenze

CAN-11.0 soll als reiner Planungsstep starten:

```text
CAN-11.0 Manual Recovery Candidate Selection Start Boundary
```

Keine Code-Aenderung in CAN-11.0.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

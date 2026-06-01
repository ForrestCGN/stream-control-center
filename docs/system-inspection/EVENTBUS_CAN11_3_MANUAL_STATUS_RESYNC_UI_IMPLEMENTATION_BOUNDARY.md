# CAN-11.3 - Manual Status Resync UI / Implementation Boundary

## Zweck

CAN-11.3 definiert die technische Umsetzungsgrenze fuer den geplanten Kandidaten:

```text
manual_status_resync_request
```

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Ausgangslage

CAN-11.2 hat den Vertrag fuer `manual_status_resync_request` geplant.

Der Kandidat bleibt strikt read-only:

```text
readOnly: true
productiveTouch: false
canPrepare: false
canExecute: false
```

## Entscheidung fuer die erste Umsetzung

Die erste technische Umsetzung soll keine neue Backend-Route bekommen.

Stattdessen soll sie nur im Dashboard als zweite read-only Karte erscheinen.

## Geplanter UI-Bereich

Dashboard:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Geplante neue Karte:

```text
Manueller Status-Resync
```

Geplanter Button:

```text
Status neu synchronisieren
```

## Unterschied zu `Preflight neu laden`

Bestehender Button:

```text
Preflight neu laden
```

Bedeutung:

- reine Aktualisierung der bestehenden Anzeige
- GET Status
- GET Recovery-Preflight
- direkt neu rendern

Neuer Kandidat:

```text
Status neu synchronisieren
```

Bedeutung:

- strukturierter read-only Resync-Vorgang im Dashboard
- Ergebnisobjekt mit Guards/Safety-Auswertung
- klare Anzeige:
  - Quellen
  - Route-Safety
  - Check-Matrix
  - Prepare/Execute weiterhin nein
  - produktive Beruehrung nein
- weiterhin kein Backend-Schreibzugriff

## Erlaubter technischer Scope fuer CAN-11.4

Nur diese Datei darf geaendert werden:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Erlaubt:

- lokale UI-State-Felder fuer `manual_status_resync_request`
- neue Karte `Manueller Status-Resync`
- Button `Status neu synchronisieren`
- Abruf bestehender GET-Routen:
  - `GET /api/bus-diagnostics/status`
  - `GET /api/bus-diagnostics/recovery-preflight`
- lokale Guard-Auswertung auf Basis der GET-Antworten
- Anzeige von:
  - Status
  - letzter Resync-Zeitpunkt
  - verwendete Quellen
  - Read-only
  - produktive Beruehrung
  - Prepare
  - Execute
  - Route-Safety
  - CheckSummary
  - Fehlertext bei Fetch-Fehler

## Nicht erlaubt fuer CAN-11.4

- keine Backend-Datei
- keine neue API-Route
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
- kein Auto-Refresh
- kein Timer
- kein Retry-Loop
- keine Streamer.bot-Aktion
- keine OBS-Aktion

## Lokale Ergebnisstruktur

CAN-11.4 darf lokal im Dashboard ein Ergebnisobjekt halten:

```json
{
  "action": "manual_status_resync_request",
  "status": "idle|loading|success|error",
  "readOnly": true,
  "productiveTouch": false,
  "canPrepare": false,
  "canExecute": false,
  "sources": [
    "GET /api/bus-diagnostics/status",
    "GET /api/bus-diagnostics/recovery-preflight"
  ],
  "guards": {
    "readOnlyGuard": true,
    "noMutationGuard": true,
    "routeSafetyGuard": true,
    "noPrepareExecuteGuard": true,
    "dashboardOnlyGuard": true
  },
  "startedAt": "ISO timestamp",
  "completedAt": "ISO timestamp",
  "error": null
}
```

Dieses Objekt bleibt rein im Browser-/Dashboard-State.

## Guard-Auswertung

### ReadOnlyGuard

Erfolgreich, wenn:

```text
route.readOnly === true
preflight.readOnly === true
```

### NoMutationGuard

Erfolgreich, wenn:

```text
productiveTouch === false
```

Da es keine produktive Aktion gibt, muss das Dashboard diesen Wert fest auf `false` halten.

### RouteSafetyGuard

Erfolgreich, wenn:

```text
method === GET
commandRoute === false
prepareRoute === false
executeRoute === false
recoveryExecution === false
```

### NoPrepareExecuteGuard

Erfolgreich, wenn:

```text
canPrepare === false
canExecute === false
```

### DashboardOnlyGuard

Erfolgreich, wenn nur UI-State veraendert wurde.

## Testgrenze fuer CAN-11.4

Nach Umsetzung soll getestet werden:

1. Dashboard oeffnen:
   ```text
   Event-Bus / Communication Bus -> Recovery -> Preflight
   ```
2. Karte `Manueller Status-Resync` sichtbar.
3. Button `Status neu synchronisieren` klicken.
4. Karte zeigt:
   - Erfolg
   - letzter Resync-Zeitpunkt
   - Quellen
   - Guards OK
   - read-only ja
   - produktive Beruehrung nein
   - Prepare nein
   - Execute nein
5. Keine Recovery-/Prepare-/Execute-/Simulation-Buttons erscheinen.

## CAN-11.4 Startgrenze

CAN-11.4 darf die Dashboard-UI additiv umsetzen.

Keine Backend-Aenderung in CAN-11.4.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

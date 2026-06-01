# CAN-10.4 - Manual Diagnostics Refresh Status/UX Cleanup Plan

## Zweck

CAN-10.4 plant einen kleinen Status-/UX-Cleanup fuer den in CAN-10.2 eingebauten Button:

```text
Preflight neu laden
```

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Problem

Der Button ist technisch korrekt, aber fuer die spaetere Nutzung soll klarer sichtbar sein:

- dass es nur ein Diagnose-Refresh ist
- wann zuletzt neu geladen wurde
- welche Route zuletzt verwendet wurde
- ob der letzte Refresh erfolgreich war
- dass keine Recovery ausgefuehrt wurde

## Zielbild

Im Bereich:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

soll die Karte `Manueller Diagnose-Refresh` spaeter klarer anzeigen:

```text
Letzter Refresh: <Zeitpunkt>
Status: Erfolgreich / Fehlgeschlagen / Noch nicht ausgefuehrt
Quelle: GET /api/bus-diagnostics/recovery-preflight
Read-only: ja
Produktive Beruehrung: nein
```

## Erlaubte UI-Erweiterungen

CAN-10.5 darf spaeter additiv folgende lokale Dashboard-Felder anzeigen:

- `lastManualDiagnosticsRefreshAt`
- `lastManualDiagnosticsRefreshStatus`
- `lastManualDiagnosticsRefreshRoute`
- `lastManualDiagnosticsRefreshError`
- `lastManualDiagnosticsRefreshReadOnly`
- `lastManualDiagnosticsRefreshProductiveTouch`

Diese Felder duerfen nur im Browser-/Dashboard-State existieren. Kein Backend-Schreibzugriff.

## Erlaubte Button-Zustaende

Der Button darf spaeter lokale UI-Zustaende zeigen:

- normal
- laedt
- erfolgreich
- fehlgeschlagen

Beispieltexte:

```text
Preflight neu laden
Lade Preflight...
Preflight aktualisiert
Refresh fehlgeschlagen
```

## Verbotene Erweiterungen

Nicht erlaubt:

- kein zweiter Button fuer Recovery
- kein Prepare-Button
- kein Execute-Button
- kein Replay-Button
- kein Queue-Clear-Button
- kein Overlay-Repair-Button
- kein Sound-/Alert-Reset
- kein Auto-Refresh
- kein Timer
- kein Retry-Loop
- kein Backend-Schreibzugriff
- keine neue API-Route

## Erlaubte technische Umsetzung fuer CAN-10.5

Nur diese Datei darf geaendert werden:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Erlaubt:

- lokale UI-State-Felder
- Statusanzeige in der bestehenden Karte
- Button-Loading-State
- Anzeige der zuletzt verwendeten GET-Route
- Anzeige von Fehlertexten aus dem Fetch
- erneutes Rendern nach Erfolg/Fehler

Nicht erlaubt:

- Backend-Code
- neue Route
- POST
- DB
- Config
- Recovery-Ausfuehrung

## Testgrenze fuer CAN-10.5

Nach Umsetzung soll getestet werden:

1. Dashboard oeffnen:
   ```text
   Event-Bus / Communication Bus -> Recovery -> Preflight
   ```
2. Button `Preflight neu laden` klicken.
3. Karte zeigt Erfolg/Letzter Refresh/Route.
4. Route-Safety bleibt:
   ```text
   GET / read-only
   commandRoute: nein
   prepareRoute: nein
   executeRoute: nein
   recoveryExecution: nein
   ```
5. Keine neuen Recovery-Buttons sichtbar.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

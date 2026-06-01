# CAN-10.5 - Manual Diagnostics Refresh Dashboard Status UX Cleanup

## Zweck

CAN-10.5 setzt den in CAN-10.4 geplanten Status-/UX-Cleanup fuer den Button um:

```text
Preflight neu laden
```

Die Umsetzung bleibt rein dashboardseitig und read-only.

## Geaenderte Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Umsetzung

Die Karte `Manueller Diagnose-Refresh` zeigt jetzt klarer:

- Status des letzten Refreshs
- Zeitpunkt des letzten Refreshs
- verwendete Route
- Read-only-Status
- produktive Beruehrung
- Prepare/Execute bleiben nein
- Fehlertext bei fehlgeschlagenem Refresh
- Button-Status beim Laden

## Verhalten des Buttons

Der Button ruft weiterhin nur bestehende GET-Daten ab:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Danach wird nur das Dashboard neu gerendert.

## Keine Recovery-Funktion

Der Button ist weiterhin kein Recovery-Button.

Weiterhin nicht enthalten:

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

## Test

Syntax-Test:

```cmd
node -c htdocs\dashboard\modulesus_diagnostics.js
```

Dashboard-Test:

1. Dashboard oeffnen:
   ```text
   Event-Bus / Communication Bus -> Recovery -> Preflight
   ```
2. Button `Preflight neu laden` klicken.
3. Erwartung:
   - Status aendert sich kurz auf Ladezustand
   - letzter Refresh-Zeitpunkt wird gesetzt
   - Route wird angezeigt
   - Read-only bleibt ja
   - produktive Beruehrung bleibt nein
   - Prepare bleibt nein
   - Execute bleibt nein
   - keine neuen Recovery-Buttons sichtbar

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

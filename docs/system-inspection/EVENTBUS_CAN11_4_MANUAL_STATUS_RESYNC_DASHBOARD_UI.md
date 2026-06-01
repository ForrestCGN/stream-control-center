# CAN-11.4 - Manual Status Resync Dashboard UI

## Zweck

CAN-11.4 setzt den read-only Dashboard-Kandidaten um:

```text
manual_status_resync_request
```

Die Umsetzung bleibt strikt im Dashboard und fuehrt keine Recovery aus.

## Geaenderte Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Umgesetzt

Im Bereich:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

wurde additiv eine neue Karte eingefuegt:

```text
Manueller Status-Resync
```

Neuer Button:

```text
Status neu synchronisieren
```

## Verhalten

Der Button ruft nur bestehende read-only GET-Daten neu ab:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Danach werden lokale Dashboard-Guards bewertet und die Anzeige neu gerendert.

## Lokale Guard-Auswertung

Umgesetzt als lokaler Dashboard-State:

- `readOnlyGuard`
- `noMutationGuard`
- `routeSafetyGuard`
- `noPrepareExecuteGuard`
- `dashboardOnlyGuard`

Diese Guards schreiben nichts ins Backend.

## Sichtbare Felder

Die Karte zeigt:

- Action: `manual_status_resync_request`
- Status
- letzter Resync-Zeitpunkt
- Read-only
- produktive Beruehrung
- Prepare
- Execute
- verwendete Quellen
- Guard-Ergebnis
- Fehlertext bei fehlgeschlagenem Resync

## Sicherheitsgrenze

Weiterhin gilt:

- keine Backend-Datei geaendert
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

## Syntax-Test

```cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

## Test

Dashboard oeffnen:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Erwartung:

- Karte `Manueller Status-Resync` sichtbar
- Button `Status neu synchronisieren` sichtbar
- Klick aktualisiert die Karte
- Quellen werden angezeigt
- Guards werden angezeigt
- Read-only bleibt ja
- produktive Beruehrung bleibt nein
- Prepare bleibt nein
- Execute bleibt nein
- keine Recovery-/Prepare-/Execute-/Simulation-Buttons erscheinen

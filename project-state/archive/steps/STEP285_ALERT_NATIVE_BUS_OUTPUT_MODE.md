# STEP285 – Alert Native Bus Output Mode

Datum: 2026-05-24T13:12:30Z

## Ziel

Das Alert-System hat einen echten nativen visuellen Ausgabeweg für den Communication Bus bekommen. Der bisherige Real Alert Bus Mirror bleibt als Diagnose-/Testwerkzeug erhalten, ist aber nicht mehr der einzige Weg, um echte Alert-Visuals an die Bus-Bridge zu senden.

## Geändert

### `backend/modules/alert_system.js`

- `MODULE_STEP` auf `285` gesetzt.
- Neue Config-Sektion `alertOutput` ergänzt.
- Unterstützte Modi vorbereitet:
  - `legacy`
  - `legacy_and_bus`
  - `bus_first`
  - `bus_only`
- Standard bleibt bewusst `legacy`.
- Neue native Ausgabelogik ergänzt:
  - `sendAlertVisualOutput(...)`
  - `sendAlertVisualClear(...)`
  - `emitAlertBusOutput(...)`
  - `emitAlertBusControl(...)`
  - `buildAlertOutputStatus(...)`
- `/api/alerts/status` zeigt jetzt zusätzlich:
  - `alertOutput`
  - `alertBusMirror`
- Alert-Timing wurde um `alertOutputBusSentAt` und `playingToAlertOutputBusMs` erweitert.
- `saveAlertConfig(...)` kann nun auch verschachtelte Config-Blöcke wie `alertOutput`, `communicationBusMirror`, `alertOverlayWatchdog`, `preview`, `liveAlert` und `dashboardSettings` übernehmen.
- DB-Runtime-Settings können jetzt `alertOutput` ebenfalls anwenden.

## Bewusst nicht geändert

- Keine Sound-System-Änderung.
- Keine TTS-Änderung.
- Keine Sound-/Alert-Queue-Änderung.
- Keine DB-Migration.
- Keine Overlay-Datei geändert.
- Keine Funktionalität entfernt.
- Real Alert Bus Mirror bleibt erhalten.

## Modus-Verhalten

### `legacy`

Nur alter Alert-System-WebSocket. Das ist der Standard nach STEP285.

### `legacy_and_bus`

Alter WebSocket plus regulärer Bus-Output. Geeignet für Vergleichstests mit Bridge-Dedup.

### `bus_first`

Bus wird primär verwendet. Falls kein Bus-Ziel erreicht wird, fällt das Alert-System auf Legacy zurück.

### `bus_only`

Nur Bus. Dieser Modus ist vorbereitet, aber noch nicht als Produktivmodus empfohlen, weil Watchdog/Finish-ACK-Verhalten final erst nach weiteren Tests entschieden werden soll.

## Testempfehlung

Nach Entpacken und `stepdone.cmd`:

1. Backend starten/neustarten.
2. Status prüfen:
   `/api/alerts/status`
3. Prüfen, dass `alertOutput.mode` standardmäßig `legacy` ist.
4. Legacy-Testalert auslösen.
5. Für Bridge-Test optional `alertOutput.mode` testweise auf `legacy_and_bus` setzen.
6. Bridge-Overlay öffnen:
   `/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge`
7. Communication Debug View prüfen:
   `/public/tools/communication_debug_view.html`

## Nächster sinnvoller Schritt

STEP286 sollte der Live-Test und die Entscheidung sein, ob `legacy_and_bus` als nächster Teststandard genutzt wird oder ob zuerst die Debug View die neue `alertOutput`-Statussektion sichtbar machen soll.

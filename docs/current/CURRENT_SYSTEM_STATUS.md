# Current System Status

Stand: STEP287 – Alert Native Output bus_first Live-Test
Aktualisiert: 2026-05-24T13:30:00Z

## Alert-/Communication-Stand

Der Alert-Kommunikations-Audit ist abgeschlossen. Der aktuelle bestätigte Stand umfasst:

- Communication Bus Helper `0.8.1`
- Alert Bus Mirror als Diagnose-/Testwerkzeug
- Alert Timing Diagnostics
- Alert Overlay Delivery Watchdog
- Alert Overlay Recovery Clear
- Communication Debug View mit Snapshot und Normalbetrieb-Check
- Alert Bus Bridge `_overlay-alerts-v2-bus.html` Version `0.1.1`
- Nativer Alert Visual Output Mode im Alert-System
- STEP286 Timing-/Status-Cleanup für native Alert-Outputs
- STEP287 bestätigter `bus_first` Live-Test

## Produktiver Status

Das bisherige Alert-System bleibt erhalten. Der native Output Mode ist vorbereitet und live mit `legacy`, `legacy_and_bus` und `bus_first` getestet.

Der sichere Standardmodus bleibt bewusst `legacy`.

Der Real Alert Mirror bleibt erhalten und ist weiter als Diagnose-/Bridge-Testwerkzeug nutzbar. Der reguläre Migrationspfad läuft über `alertOutput` im Alert-System.

## Bestätigte Tests

- `alertOutput.mode = legacy`: bestanden.
- `alertOutput.mode = legacy_and_bus`: bestanden.
- `alertOutput.mode = bus_first`: bestanden.
- Native Bus-Ausgabe erzeugte Bus-Events.
- Bridge rendert Bus-Alerts und sendet `finished` zurück.
- Watchdog meldete `acknowledged`.
- Keine Watchdog-Issues, kein Timeout.
- Sound-/TTS-/Bundle-Verhalten blieb unverändert stabil.

## STEP287 Testwerte

Im bestätigten `bus_first` Test:

- `mode = bus_first`
- `legacyEnabled = false`
- `legacyFallbackEnabled = true`
- `busEnabled = true`
- `lastMode = bus_first`
- `errors = 0`
- `playingToAlertOutputBusMs = 2`
- Watchdog: `status = acknowledged`, `timedOut = false`, `issue` leer

## Alert Output Modes

Vorbereitete Modi:

- `legacy` – alter Alert-System-WebSocket, aktueller sicherer Standard.
- `legacy_and_bus` – alter WebSocket plus regulärer Communication-Bus-Output.
- `bus_first` – Bus primär, Legacy-Fallback wenn kein Bus-Ziel erreicht wird. Live-Test bestanden, aber noch nicht Standard.
- `bus_only` – vorbereitet, aber noch nicht als Produktivmodus empfohlen.

## Wichtig

STEP287 ist ein Test-/Dokumentationsstand ohne Codeänderung gegenüber STEP286. Es wurden keine Sound-, TTS- oder Queue-Änderungen gemacht. Das stabile Sound-/Bundle-Verhalten aus STEP268B/STEP268C bleibt unberührt.

## Nächste Entwicklungsrichtung

1. Sicherer Standard bleibt `legacy`.
2. Optional Communication Debug View um native `alertOutput`-Statusanzeige erweitern.
3. Danach Sound-System als zentrale Audio-/Medien-Schicht auditieren.
4. Erst danach Module stufenweise auf den Bus umziehen.

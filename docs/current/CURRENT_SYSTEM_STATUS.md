# Current System Status

Stand: STEP285 – Alert Native Bus Output Mode
Aktualisiert: 2026-05-24T13:12:30Z

## Alert-/Communication-Stand

Der Alert-Kommunikations-Audit ist abgeschlossen. Der aktuelle Stand umfasst:

- Communication Bus Helper `0.8.1`
- Alert Bus Mirror als Diagnose-/Testwerkzeug
- Alert Timing Diagnostics
- Alert Overlay Delivery Watchdog
- Alert Overlay Recovery Clear
- Communication Debug View mit Snapshot und Normalbetrieb-Check
- Alert Bus Bridge `_overlay-alerts-v2-bus.html` Version `0.1.1`
- Nativer Alert Visual Output Mode im Alert-System

## Produktiver Status

Das bisherige Alert-System bleibt erhalten. Der neue native Output Mode ist vorbereitet, aber der Standardmodus bleibt bewusst `legacy`.

Der Real Alert Mirror bleibt erhalten und ist weiter als Diagnose-/Bridge-Testwerkzeug nutzbar. Für den regulären Migrationspfad steht jetzt zusätzlich `alertOutput` im Alert-System zur Verfügung.

## Alert Output Modes

Vorbereitete Modi:

- `legacy` – alter Alert-System-WebSocket, aktueller Standard.
- `legacy_and_bus` – alter WebSocket plus regulärer Communication-Bus-Output.
- `bus_first` – Bus primär, Legacy-Fallback wenn kein Bus-Ziel erreicht wird.
- `bus_only` – vorbereitet, aber noch nicht als Produktivmodus empfohlen.

## Wichtig

STEP285 ändert keine Sound-, TTS- oder Queue-Logik. Das stabile Sound-/Bundle-Verhalten aus STEP268B/STEP268C bleibt unberührt.

## Nächste Entwicklungsrichtung

1. STEP285 live testen und entscheiden, welcher Alert-Output-Testmodus als nächstes genutzt wird.
2. Optional Debug View um native `alertOutput`-Statusanzeige erweitern.
3. Danach Sound-System als zentrale Audio-/Medien-Schicht auditieren.
4. Erst danach Module stufenweise auf den Bus umziehen.

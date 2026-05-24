# Current System Status

Stand: STEP290 – SoundBus Basistests bestätigt
Aktualisiert: 2026-05-24T14:05:00Z

## Alert-/Communication-Stand

Der Alert-Kommunikations-Audit ist abgeschlossen. Der bestätigte Alert-Stand bleibt:

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

## Produktiver Alert-Status

Das bisherige Alert-System bleibt erhalten. Der native Output Mode ist vorbereitet und live mit `legacy`, `legacy_and_bus` und `bus_first` getestet.

Der sichere Standardmodus bleibt bewusst `legacy`.

Der Real Alert Mirror bleibt erhalten und ist weiter als Diagnose-/Bridge-Testwerkzeug nutzbar. Der reguläre Migrationspfad läuft über `alertOutput` im Alert-System.

## Sound-System-Stand nach STEP290

Das Sound-System wurde in STEP288 analysiert, in STEP289 additiv mit einem SoundBus-Event-Ausgang vorbereitet und in STEP289B um den fehlenden Top-Level-Status `soundBus` in `/api/sound/status` korrigiert.

STEP290 bestätigt die ersten Live-Basistests mit aktivem `soundBus`:

- `/api/sound/status` meldet `step = 289` und sichtbaren Top-Level-Block `soundBus`.
- `soundBus.enabled = true` konnte über `/api/sound/settings` aktiviert werden.
- Communication Bus war verfügbar.
- Test-Sound `test_ping` wurde erfolgreich abgespielt.
- SoundBus sendete Events und meldete `errors = 0`.
- Alert-Bundle-Test mit Hauptsound + Alert-TTS lief erfolgreich.
- Alert-Bundle erzeugte `bundlesQueued = 1` und `bundleItemsQueued = 2`.
- `activeBundleLock` war am Ende wieder leer.
- `queuedCount = 0` am Ende.
- Alert Overlay Watchdog meldete `acknowledged`.
- Keine Sound-, Device-, Discord- oder Watchdog-Fehler im Test.

## Sound-Bus Default

Der sichere Config-Default bleibt:

- `soundBus.enabled = false`

Für gezielte Tests kann `soundBus.enabled` über `/api/sound/settings` aktiviert werden. Nach Tests soll der Wert wieder bewusst geprüft bzw. auf den gewünschten sicheren Zustand gesetzt werden.

## Bestätigte SoundBus-Testwerte

### Status-Fix

- `step = 289`
- Top-Level `soundBus` sichtbar.
- `soundBus.feature = sound_bus_event_output`
- `soundBus.communicationBusAvailable = true`

### Aktivierung

Nach Aktivierung:

- `soundBus.enabled = true`
- `soundBus.stats.emitted = 1`
- `soundBus.stats.skipped = 2`
- `soundBus.stats.errors = 0`
- `lastAction = state.updated`

### Test-Ping

`GET /api/sound/play?id=test_ping`:

- `ok = true`
- `started = true`
- `queued = false`
- `dropped = false`
- Danach: `soundBus.stats.emitted = 7`
- Danach: `soundBus.stats.errors = 0`
- Danach: `lastAction = finished`
- Danach: `lastReason = item_finished`

### Alert-Bundle-Test

Nach Gift-Sub-Test-Alert mit TTS:

- `started = 3`
- `queued = 1`
- `failed = 0`
- `deviceStarted = 2`
- `deviceFailed = 0`
- `discordStarted = 2`
- `discordFailed = 0`
- `bundlesQueued = 1`
- `bundleItemsQueued = 2`
- `queuedCount = 0`
- `currentBundle = null`
- `activeBundleLock = null`
- Alert Watchdog: `status = acknowledged`
- Alert Watchdog: `timedOut = false`
- Alert Watchdog: `issue` leer

## Nicht geändert

- Keine Caller-Module auf Bus-Input umgebaut.
- Keine Sound-API entfernt.
- Alter WebSocket `op: sound_system` bleibt erhalten.
- Keine Queue-Sortierung geändert.
- Keine Bundle-/`activeBundleLock`-Logik geändert.
- Keine Dedupe-/Cooldown-/Interrupt-Regeln geändert.
- Keine Alert-Bundle-Logik geändert.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## Nächste Entwicklungsrichtung

1. SoundBus-Zustand nach Test bewusst sichern (`enabled` prüfen, ggf. auf `false` zurücksetzen).
2. STEP291 – V5 Real Queue/Bundle Regression Test mit aktivem SoundBus durchführen.
3. Danach Communication Debug View/Dashboard um Sound-Bus-Events erweitern.
4. Erst danach über Bus-Input `sound.play` nachdenken, der intern dieselben Sound-System-APIs/Queue-Wege nutzt.

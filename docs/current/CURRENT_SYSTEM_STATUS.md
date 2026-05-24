# Current System Status

Stand: STEP289 – Sound-System Bus Event Mirror / Native Status Output
Aktualisiert: 2026-05-24T13:45:00Z

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

## STEP289 Sound-System Bus Event Mirror

Das Sound-System wurde additiv busfähig vorbereitet.

Geändert wurde nur `backend/modules/sound_system.js`:

- neuer `MODULE_STEP = 289`
- neuer Config-Block `soundBus`
- neuer Statusblock `soundBus` in `/api/sound/status`
- `soundBus` ist DB-/Settings-fähig über `/api/sound/settings`
- strukturierte Communication-Bus-Events können zusätzlich zum bestehenden alten WebSocket-Weg gesendet werden
- bestehender WebSocket-Status `op: sound_system` bleibt erhalten
- bestehende Sound-APIs bleiben unverändert

## Sound-Bus Default

Der sichere Default ist:

- `soundBus.enabled = false`

Damit ändert sich nach Deploy kein produktives Sound-Verhalten. Der Bus-Ausgang kann gezielt für Tests über `/api/sound/settings` aktiviert werden.

## Vorbereitete Sound-Bus-Events

- `sound.state.updated`
- `sound.queue.updated`
- `sound.queued`
- `sound.starting`
- `sound.started`
- `sound.finished`
- `sound.failed`
- `sound.stopped`
- `sound.skipped`
- `sound.cleared`
- `sound.paused`
- `sound.resumed`
- `sound.bundle.queued`
- `sound.bundle.lock_started`
- `sound.bundle.lock_finished`
- `sound.device.started`
- `sound.device.finished`
- `sound.device.failed`
- `sound.discord.started`
- `sound.discord.queued`
- `sound.discord.failed`
- `sound.client.ready`
- `sound.client.audio_started`
- `sound.client.audio_ended`
- `sound.client.error`

## Nicht geändert

- keine Änderung an `/api/sound/play`
- keine Änderung an `/api/sound/bundle`
- keine Änderung an `/api/sound/play-media`
- keine Änderung an Queue-Sortierung
- keine Änderung an Dedupe/Cooldowns
- keine Änderung an Interrupt-Regeln
- keine Änderung an `activeBundleLock`
- keine Caller-Module auf Bus-Input umgestellt
- keine DB-Migration außerhalb bestehender `sound_settings`-Nutzung
- keine Funktionalität entfernt

## Nächste Entwicklungsrichtung

1. STEP289 deployen und Syntax/Status prüfen.
2. `soundBus.enabled` testweise aktivieren.
3. Test-Ping auslösen und Bus-Events prüfen.
4. Alert-Bundle-Test mit Hauptsound + Alert-TTS prüfen.
5. V5-Real-Mod-Test erneut ausführen.
6. Danach Debug View/Dashboard um Sound-Bus-Events erweitern.

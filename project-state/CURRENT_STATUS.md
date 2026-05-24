# Current Status – stream-control-center

Stand: STEP290 – SoundBus Basistests bestätigt
Aktualisiert: 2026-05-24T14:05:00Z

## Aktueller Fokus

Der Alert-Bereich ist nach STEP287 busfähig vorbereitet und live getestet. Der sichere Alert-Standard bleibt `alertOutput.mode = legacy`.

Der nächste große Block ist das Sound-System. STEP288 hat den Ist-Stand analysiert, STEP289 hat einen additiven SoundBus-Event-Ausgang eingebaut, STEP289B hat den Runtime-Status sichtbar gemacht und STEP290 bestätigt die ersten Basistests.

## Bestätigter SoundBus-Stand

- `backend/modules/sound_system.js` läuft auf `step = 289`.
- `/api/sound/status` enthält Top-Level `soundBus`.
- `soundBus.feature = sound_bus_event_output`.
- `soundBus.communicationBusAvailable = true`.
- `soundBus.enabled` konnte über `/api/sound/settings` aktiviert werden.
- Test-Sound `test_ping` wurde erfolgreich abgespielt.
- SoundBus erzeugte Events bis `finished`.
- `soundBus.stats.errors = 0`.

## Bestätigter Alert-Bundle-Test mit SoundBus aktiv

Ein Gift-Sub-Test-Alert mit Hauptsound + Alert-TTS lief erfolgreich:

- `bundlesQueued = 1`
- `bundleItemsQueued = 2`
- `failed = 0`
- `deviceFailed = 0`
- `discordFailed = 0`
- `queuedCount = 0` am Ende
- `currentBundle = null` am Ende
- `activeBundleLock = null` am Ende
- Alert Watchdog: `acknowledged`
- Watchdog: kein Timeout, kein Issue

## Bewertung

Der SoundBus stört die bestehende Sound-/Queue-/Bundle-Logik in den Basistests nicht. Das ist die Voraussetzung für den nächsten Regressionstest.

## Noch nicht freigegeben

- Kein produktiver Bus-Input `sound.play`.
- Keine Modul-Migration auf Bus-Input.
- Kein Entfernen alter REST-/WebSocket-Wege.
- `soundBus.enabled = true` ist testweise bestätigt, aber noch nicht endgültig als Dauerbetrieb freigegeben.

## Nächster Schritt

STEP291 – SoundBus V5 Real Queue/Bundle Regression Test.

Ziel:

- V5-Real-Mod-Test mit aktivem SoundBus laufen lassen.
- Prüfen, dass Alert-Hauptsound + passende Alert-TTS zusammenbleiben.
- Prüfen, dass SoundAlerts, Mod-/VIP-Sounds und normales TTS nicht in Alert-Bundles rutschen.
- Prüfen, dass SoundBus-Events keine Queue-/Bundle-Reihenfolge verändern.

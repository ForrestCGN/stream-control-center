# STEP290 – SoundBus Basistests bestätigt

Datum: 2026-05-24T14:05:00Z
Status: Test-/Dokumentationsstand, keine Codeänderung

## Zweck

STEP290 dokumentiert die ersten Live-Basistests des in STEP289/STEP289B vorbereiteten SoundBus-Event-Ausgangs.

Ziel war nicht, Caller-Module auf den Bus umzubauen, sondern zu prüfen, ob der zusätzliche Bus-Ausgang das bestehende Sound-System-Verhalten nicht stört.

## Ausgangspunkt

Vor STEP290:

- STEP288 analysierte das Sound-System als zentrale Audio-/Medien-Schicht.
- STEP289 ergänzte einen additiven `soundBus`-Event-Ausgang in `sound_system.js`.
- STEP289B machte den Runtime-Status als Top-Level-Feld `soundBus` in `/api/sound/status` sichtbar.

## Test 1 – Status-Fix bestätigt

Befehl:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" |
  Select-Object step, soundBus
```

Ergebnis:

- `step = 289`
- `soundBus` war als Top-Level-Feld sichtbar.
- `soundBus.ok = true`
- `soundBus.feature = sound_bus_event_output`
- `soundBus.enabled = false` vor Aktivierung.

Bewertung: bestanden.

## Test 2 – SoundBus aktiviert

`soundBus.enabled` wurde über `/api/sound/settings` auf `true` gesetzt.

Status danach:

- `soundBus.enabled = true`
- `soundBus.communicationBusAvailable = true`
- `soundBus.stats.emitted = 1`
- `soundBus.stats.skipped = 2`
- `soundBus.stats.errors = 0`
- `soundBus.stats.lastAction = state.updated`
- `soundBus.stats.lastReason = reloaded`

Bewertung: bestanden.

## Test 3 – Einzel-Sound `test_ping`

Befehl:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?id=test_ping"
```

Ergebnis:

- `ok = true`
- `message = Sound wird abgespielt.`
- `result.started = true`
- `result.queued = false`
- `result.dropped = false`
- `soundId = test_ping`
- `category = system`
- `priority = 100`

SoundBus danach:

- `soundBus.stats.emitted = 7`
- `soundBus.stats.errors = 0`
- `soundBus.stats.lastAction = finished`
- `soundBus.stats.lastReason = item_finished`

Bewertung: bestanden.

## Test 4 – Alert-Bundle mit Hauptsound + Alert-TTS

Ein Gift-Sub-Test-Alert mit TTS wurde ausgelöst.

Sound-System-Ergebnis nach Ablauf:

- `current = null`
- `queuedCount = 0`
- `currentBundle = null`
- `activeBundleLock = null`
- `stats.started = 3`
- `stats.queued = 1`
- `stats.stopped = 0`
- `stats.skipped = 0`
- `stats.failed = 0`
- `stats.deviceStarted = 2`
- `stats.deviceFailed = 0`
- `stats.discordStarted = 2`
- `stats.discordFailed = 0`
- `stats.bundlesQueued = 1`
- `stats.bundleItemsQueued = 2`
- `stats.levelCorrected = 1`
- `stats.levelCorrectionSkipped = 2`
- `stats.levelCorrectionFailed = 0`

Alert-System-Ergebnis:

- `queueLength = 0`
- Alert-History enthält `al_1779631033238_81f4b0aa`.
- `finished_at` gesetzt.
- `finishReason = client_ack`.

Watchdog-Ergebnis:

- `status = acknowledged`
- `ackEvent = finished`
- `timedOut = false`
- `issue` leer
- `overlayClientCountAtSend = 1`

Bewertung: bestanden.

## Gesamtbewertung

Die SoundBus-Basistests sind bestanden.

Der zusätzliche Bus-Ausgang hat in diesen Tests nicht gestört:

- Einzel-Sound funktioniert.
- Alert-Bundle funktioniert.
- Hauptsound + Alert-TTS liefen durch.
- Bundle-Lock wurde am Ende sauber gelöst.
- Queue war am Ende leer.
- Keine Sound-/Device-/Discord-Fehler.
- Alert Watchdog blieb grün.

## Bewusst nicht geändert

- Keine Codeänderung in STEP290.
- Keine Caller-Module geändert.
- Keine Sound-API geändert.
- Keine Queue-/Bundle-/activeBundleLock-Logik geändert.
- Keine Dedupe-/Cooldown-/Interrupt-Regeln geändert.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## Offene Punkte

- `soundBus.enabled = true` ist testweise bestätigt, aber noch nicht als Dauerbetrieb freigegeben.
- V5-Real-Mod-Test mit aktivem SoundBus fehlt noch.
- Debug View/Dashboard zeigt SoundBus-Events noch nicht komfortabel an.
- Bus-Input `sound.play` ist noch nicht vorgesehen und darf erst später geplant werden.

## Nächster Schritt

STEP291 – SoundBus V5 Real Queue/Bundle Regression Test.

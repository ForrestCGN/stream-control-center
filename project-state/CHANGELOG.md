# Changelog

## STEP291 – SoundBus V5 Regression bestanden mit Discord-Warnung

Datum: 2026-05-24T14:10:00Z

- V5 Real Queue/Bundle Regression Test mit aktivem `soundBus.enabled = true` durchgeführt.
- Drei Alert-Bundles mit Hauptsound + Alert-TTS getestet.
- SoundAlerts, Real-Mod-Sounds und normale TTS-Queue im selben Testlauf geprüft.
- SoundBus erzeugte fortlaufend Events, `soundBus.stats.errors = 0`.
- Alert-Hauptsound und passende Alert-TTS blieben zusammen.
- SoundAlerts/Mod-Sounds/Normal-TTS rutschten nicht zwischen Alert-Hauptsound und passende Alert-TTS.
- Queue war am Ende leer.
- `activeBundleLock` und `currentBundle` waren am Ende leer.
- `failed = 0`, `deviceFailed = 0`.
- Nebenbefund dokumentiert: `discordFailed = 3` wegen `sound nicht gefunden: media/alerts/bits/100-249.mp3`.
- Keine Codeänderung.
- Keine Queue-/Bundle-/Caller-Logik geändert.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## STEP290 – SoundBus Basistests bestätigt

Datum: 2026-05-24T14:05:00Z

- STEP289B-Statusfix live bestätigt: `/api/sound/status` enthält Top-Level `soundBus`.
- SoundBus testweise über `/api/sound/settings` aktiviert.
- `test_ping` erfolgreich über `/api/sound/play?id=test_ping` abgespielt.
- SoundBus-Events wurden erzeugt, `soundBus.stats.errors = 0`.
- Alert-Bundle-Test mit Hauptsound + Alert-TTS erfolgreich durchgeführt.
- `bundlesQueued = 1`, `bundleItemsQueued = 2`, keine Sound-/Device-/Discord-Fehler.
- `activeBundleLock`, `currentBundle` und Queue waren am Ende sauber leer.
- Alert Overlay Watchdog meldete `acknowledged`, kein Timeout, kein Issue.
- Keine Codeänderung.
- Keine Sound-/Queue-/Bundle-/Caller-Logik geändert.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## STEP289B – SoundBus Status Exposure Fix

Datum: 2026-05-24T14:00:00Z

- SoundBus-Runtime-Status in `/api/sound/status` als Top-Level-Feld `soundBus` ergänzt.
- `config.soundBus` bleibt unverändert als Effective-Config sichtbar.
- Keine Sound-/Queue-/Bundle-/Playback-Logik geändert.
- Keine Caller-Module geändert.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## STEP289 – Sound-System Bus Event Mirror / Native Status Output

Datum: 2026-05-24T13:45:00Z

- `backend/modules/sound_system.js` auf STEP289 erweitert.
- Additiven `soundBus`-Config-Block ergänzt.
- `soundBus` als erlaubten DB-Settings-Block für `/api/sound/settings` ergänzt.
- `/api/sound/status` um `step` und `soundBus`-Status erweitert.
- Communication-Bus-Events für Sound-State, Queue, Items, Bundles, Device, Discord und Client-Acks vorbereitet.
- Bestehenden WebSocket-Status `op: sound_system` erhalten.
- Bestehende Sound-APIs nicht verändert.
- Keine Queue-, Bundle-, Dedupe-, Cooldown- oder Interrupt-Logik verändert.
- Keine Caller-Module umgestellt.
- Keine Funktionalität entfernt.

## STEP288 – Sound-System Bus Audit & Migrationsplan

Datum: 2026-05-24T13:40:00Z

- Sound-System als zentralen nächsten Bus-Migrationsblock analysiert.
- Sound-System-Nutzer dokumentiert.
- Schutzregeln für Queue, Bundles, activeBundleLock, Dedupe, Cooldowns und Interrupts dokumentiert.
- Sicheren Migrationspfad festgelegt: Sound-System bleibt Master, Bus zuerst nur Event-/Status-Schicht.
- Keine Code-Änderung.

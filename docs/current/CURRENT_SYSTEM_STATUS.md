# Current System Status

Stand: STEP291 – SoundBus V5 Regression bestanden mit Discord-Warnung
Aktualisiert: 2026-05-24T14:10:00Z

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

## Sound-System-Stand

Das Sound-System besitzt seit STEP289 einen additiven SoundBus-Event-Ausgang. STEP289B hat den Top-Level-Status `soundBus` in `/api/sound/status` ergänzt. STEP290 hat Basistests bestätigt.

STEP291 hat den großen V5-Real-Queue-/Bundle-Regressionstest mit aktivem `soundBus.enabled = true` bestätigt.

## Bestätigter STEP291-Test

Bestanden:

- SoundBus aktiv.
- `soundBus.communicationBusAvailable = true`.
- `soundBus.stats.errors = 0`.
- V5-Test mit drei Alert-Bundles, SoundAlerts, Real-Mod-Sounds und normaler TTS-Queue durchgeführt.
- Alert-Hauptsound und passende Alert-TTS blieben zusammen.
- SoundAlerts/Mod-Sounds/Normal-TTS rutschten nicht zwischen Alert-Hauptsound und passende Alert-TTS.
- `queuedCount = 0` am Ende.
- `activeBundleLock = null` am Ende.
- `currentBundle = null` am Ende.
- `failed = 0`.
- `deviceFailed = 0`.

## Nebenbefund

Im V5-Test gab es `discordFailed = 3` mit dem Fehler:

```text
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

Das betrifft Discord-Dateipfad-/Media-Registry-Auflösung und wird als separater Folgepunkt behandelt.

## Nächste Entwicklungsrichtung

1. Discord Media Path/Routing Audit für `media/alerts/...` bei Discord-Ausgabe.
2. Danach entscheiden, ob `soundBus.enabled = true` länger im Testbetrieb bleiben soll.
3. Danach stufenweise weitere Module über Bus-Status/Events anbinden.

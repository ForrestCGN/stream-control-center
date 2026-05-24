# Current Status – stream-control-center

Stand: STEP297 – SoundBus Debug View Test dokumentiert
Aktualisiert: 2026-05-24T14:40:00Z

## Zusammenfassung

Der SoundBus-Ausbau ist bis einschließlich STEP291 stabil getestet. STEP292 hat den Discord-Pfadfehler analysiert. STEP293 hat die Discord-Dateiauflösung für Media-Registry-Alert-Dateien behoben. STEP294 bestätigt den Retest nach STEP293. STEP295 legt fest, dass `soundBus.enabled = true` im Dev-/Testbetrieb aktiv bleibt. STEP296 ergänzt eine beobachtende SoundBus Debug View. STEP297 dokumentiert den ersten Debug-View-Test.

## Bestätigt

- SoundBus Top-Level-Status sichtbar.
- SoundBus aktivierbar und aktuell aktiv getestet.
- Einzel-Sound-Test bestanden.
- Alert-Bundle-Test bestanden.
- V5 Real Queue/Bundle Regression mit SoundBus bestanden.
- STEP293 Discord Resolver Fix erfolgreich live getestet.
- `discordFailed = 0` im Retest.
- `soundBus.enabled = true` im Retest.
- `failed = 0`, `deviceFailed = 0`, `levelCorrectionFailed = 0`.
- Queue/Bundle/`activeBundleLock` am Ende sauber.
- Debug View zeigt `sound.*` Events live.
- Debug View Test mit `test_ping` bestätigt.

## STEP297 Diagnose

Bei `test_ping` zeigte die View zwei `sound.finished`-artige Ereignisse:

```text
sound.finished Test Ping
sound.finished auto_finished
```

Dies ist aktuell als Darstellungs-/Diagnosebefund dokumentiert, nicht als Playback-Fehler. Es gab keine Hinweise auf doppelte Wiedergabe, Queue-Reste oder Bundle-Lock-Probleme.

## Aktueller technischer Stand

`backend/modules/discord.js` löst jetzt neben klassischen Sounds auch Media-Registry-Pfade korrekt auf:

```text
media/...  -> htdocs/assets/media/...
assets/... -> htdocs/assets/...
sounds/... -> htdocs/assets/sounds/...
```

Der Fix betrifft nur Discord-Dateipfade. Sound-System-Queue, Bundles, SoundBus und Alert-Output bleiben unverändert.

## Betriebsentscheidung

`soundBus.enabled = true` bleibt im aktuellen Dev-/Teststand aktiv.

Diese Entscheidung erlaubt weitere Debug-/Monitoring-/Dashboard-Arbeiten mit aktivem SoundBus. Sie erlaubt noch nicht, alte WebSocket-/HTTP-Wege zu entfernen oder Module direkt auf Bus-only umzubauen.

## Nächster Schritt

STEP298 – SoundBus Consumer-/Dashboard-Planung.

Empfehlung:

1. SoundBus aktiv lassen.
2. Debug-View weiter nutzen.
3. Nächsten Migrationsblock planen, bevor Code geändert wird.

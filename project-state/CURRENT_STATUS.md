# Current Status – stream-control-center

Stand: STEP295 – SoundBus Betriebsentscheidung
Aktualisiert: 2026-05-24T14:35:00Z

## Zusammenfassung

Der SoundBus-Ausbau ist bis einschließlich STEP291 stabil getestet. STEP292 hat den Discord-Pfadfehler analysiert. STEP293 hat die Discord-Dateiauflösung für Media-Registry-Alert-Dateien behoben. STEP294 bestätigt den Retest nach STEP293. STEP295 legt fest, dass `soundBus.enabled = true` im Dev-/Testbetrieb aktiv bleibt.

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

STEP296 – SoundBus Debug/Monitoring View.

Empfehlung:

1. SoundBus aktiv lassen.
2. Sichtbarkeit/Debugging ausbauen.
3. Erst danach weitere Consumer/Migrationsblöcke planen.

# Current Status – stream-control-center

Stand: STEP294 – Discord Resolver Retest bestätigt
Aktualisiert: 2026-05-24T14:30:00Z

## Zusammenfassung

Der SoundBus-Ausbau ist bis einschließlich STEP291 stabil getestet. STEP292 hat den Discord-Pfadfehler analysiert. STEP293 hat die Discord-Dateiauflösung für Media-Registry-Alert-Dateien behoben. STEP294 bestätigt den Retest nach STEP293.

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

## Nächster Schritt

STEP295 – SoundBus Betriebsentscheidung / nächster Migrationsblock.

Empfehlung:

1. Entscheiden, ob `soundBus.enabled = true` aktiv bleiben soll.
2. Danach gezielt den nächsten Bus-Block planen, ohne Queue/Bundle-Logik anzufassen.
3. Mögliche nächste Kandidaten: SoundBus-Debug-View, Sound-System Overlay-Consumer, Modul-Event-Mapping oder Dashboard-Anzeige.

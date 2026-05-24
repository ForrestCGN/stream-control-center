# Current Status – stream-control-center

Stand: STEP293 – Discord Media Path Resolver Fix
Aktualisiert: 2026-05-24T14:20:00Z

## Zusammenfassung

Der SoundBus-Ausbau ist bis einschließlich STEP291 stabil getestet. STEP292 hat den Discord-Pfadfehler analysiert. STEP293 behebt die Discord-Dateiauflösung für Media-Registry-Alert-Dateien.

## Bestätigt

- SoundBus Top-Level-Status sichtbar.
- SoundBus aktivierbar.
- Einzel-Sound-Test bestanden.
- Alert-Bundle-Test bestanden.
- V5 Real Queue/Bundle Regression mit SoundBus bestanden.
- Keine SoundBus-Fehler im V5-Test.
- Queue/Bundle/`activeBundleLock` am Ende sauber.

## Neu in STEP293

`backend/modules/discord.js` löst jetzt zusätzlich auf:

```text
media/...  -> htdocs/assets/media/...
assets/... -> htdocs/assets/...
sounds/... -> htdocs/assets/sounds/...
```

Der Fix betrifft nur Discord-Dateipfade. Sound-System-Queue, Bundles und SoundBus bleiben unverändert.

## Nächster Schritt

STEP294 – V5 Regression Retest nach Discord Resolver Fix.

Ziel: Bestätigen, dass `discordFailed = 0` ist und die SoundBus-/Bundle-Reihenfolge weiter stabil bleibt.

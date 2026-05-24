# Next Steps

Stand: 2026-05-24T14:20:00Z

## STEP294 – V5 Regression Retest nach Discord Resolver Fix

Ziel:

- V5 Real Queue/Bundle Regression erneut ausführen.
- Prüfen, dass der Discord-Fehler aus STEP291/STEP292 behoben ist.
- Prüfen, dass SoundBus/Queue/Bundle-Reihenfolge unverändert stabil bleiben.

Test:

```cmd
tools\easy\05_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd
```

Erwartung:

```text
discordFailed = 0
soundBus.errors = 0
queuedCount = 0
activeBundleLock = leer
currentBundle = leer
failed = 0
deviceFailed = 0
Alert-Hauptsound + passende Alert-TTS bleiben zusammen
```

Nicht ändern:

- keine Sound-Queue-Logik
- keine Bundle-/`activeBundleLock`-Logik
- keine SoundBus-Logik
- keine Alert-Output-Modi
- keine DB-Migration

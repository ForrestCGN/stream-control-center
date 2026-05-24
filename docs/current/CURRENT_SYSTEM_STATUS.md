# CURRENT_SYSTEM_STATUS

Stand: STEP293 – Discord Media Path Resolver Fix
Aktualisiert: 2026-05-24T14:20:00Z

## Aktueller Fokus

STEP293 behebt ausschließlich die Discord-Dateiauflösung für Media-Registry-Alert-Dateien (`media/alerts/...`). Der SoundBus-/Queue-/Bundle-Stand aus STEP291 bleibt unverändert stabil.

## Nächster Test

STEP294: V5 Regression Retest nach Discord Resolver Fix.

---

# Current System Status

Stand: STEP292 – Discord Media Path/Routing Audit
Aktualisiert: 2026-05-24T14:15:00Z

## Aktueller Stand

- STEP289/289B: SoundBus Event Output und Top-Level-Status sind aktivierbar und getestet.
- STEP290: SoundBus-Basistests bestanden.
- STEP291: V5 Real Queue/Bundle Regression mit aktiviertem SoundBus bestanden.
- STEP292: Discord Media Path/Routing Audit abgeschlossen.

## Bestätigte Stabilität

Der aktivierte SoundBus beschädigt die stabile Sound-/Queue-/Bundle-Reihenfolge nicht:

- Alert-Hauptsound und passende Alert-TTS bleiben zusammen.
- Fremde SoundAlerts, Mod-/VIP-Sounds und normales TTS rutschen nicht zwischen Alert-Sound und Alert-TTS.
- `activeBundleLock` ist am Ende leer.
- Queue ist am Ende leer.
- SoundBus meldete keine Fehler.

## Offener Nebenbefund

Discord kann Media-Registry-Alert-Dateien aktuell nicht auflösen, wenn sie als `media/alerts/...` an die Discord-Bridge gehen.

Beobachteter Fehler:

```text
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

Root Cause laut STEP292: Discord löst derzeit primär gegen `MEDIA_DIR` auf, während Alert-Media-Registry-Dateien unter `htdocs/assets/media/...` liegen. Klassische Sounds/TTS/VIP liegen unter `htdocs/assets/sounds/...` und funktionieren daher eher.

## Nächster Schritt

STEP293 – Discord Media Path Resolver Fix

Ziel: Discord-Bridge soll klassische Sounds und Media-Registry-Assets sicher auflösen, ohne SoundBus, Queue, Bundle-Lock oder Alert-Output-Modi zu ändern.

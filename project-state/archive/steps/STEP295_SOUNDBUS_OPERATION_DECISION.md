# STEP295 – SoundBus Betriebsentscheidung

Stand: 2026-05-24T14:35:00Z
Typ: Entscheidung / Doku
Codeänderung: nein

## Entscheidung

`soundBus.enabled = true` bleibt im aktuellen Dev-/Teststand aktiv.

Dies ist eine Test-/Dev-Betriebsfreigabe für den SoundBus als Event-/Status-Schicht, keine vollständige Produktiv-Migration aller Module auf Bus-only.

## Grundlage

Bestätigte Vorarbeiten:

- STEP289/289B: SoundBus Event Output + sichtbarer Top-Level-Status.
- STEP290: Einzel-Sound und Alert-Bundle Basistests bestanden.
- STEP291: V5 Real Queue/Bundle Regression bestanden.
- STEP292: Discord-Media-Pfadfehler analysiert.
- STEP293: Discord Resolver Fix gebaut.
- STEP294: Retest bestätigt, `discordFailed = 0`.

Bestätigter Retest-Zustand:

```text
queuedCount = 0
currentBundle = leer
activeBundleLock = leer
failed = 0
deviceFailed = 0
discordFailed = 0
bundlesQueued = 3
bundleItemsQueued = 6
soundBus.enabled = true
```

## Konsequenz

Der SoundBus darf für die nächsten Debug-/Monitoring-/Dashboard-Schritte aktiv bleiben.

Noch nicht freigegeben:

- alte Sound-System-WebSocket-Wege entfernen
- Overlays auf Bus-only umstellen
- Caller-Module direkt auf Bus umbauen
- Alert `bus_only` produktiv setzen
- Queue-/Bundle-Logik anfassen

## Nächster Schritt

STEP296 – SoundBus Debug/Monitoring View.

Ziel: Sichtbarkeit schaffen, bevor weitere Module oder Overlays migriert werden.

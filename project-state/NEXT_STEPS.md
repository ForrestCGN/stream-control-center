# Next Steps

Stand: 2026-05-24T14:35:00Z

## STEP296 – SoundBus Debug/Monitoring View

Ausgangslage:

- STEP289/289B/290/291 SoundBus-Basistests und Regression bestanden.
- STEP293 Discord Media Path Resolver Fix ist in STEP294 bestätigt.
- STEP295 legt fest: `soundBus.enabled = true` bleibt im Dev-/Testbetrieb aktiv.

## Ziel

Sichtbarkeit schaffen, bevor weitere Module oder Overlays migriert werden.

Umfang:

- Communication Debug View oder eigenes Debug-Panel um `sound.*` Events erweitern.
- Eventfilter für Channel `sound` ergänzen.
- `soundBus.stats` übersichtlich anzeigen:
  - emitted
  - skipped
  - errors
  - lastAction
  - lastReason
  - lastEventId
  - lastError
- Queue-/Bundle-Status nur lesen, nicht ändern.
- Keine Playback-/Queue-/Bundle-Logik ändern.

## Danach mögliche Blöcke

### Option A – Sound-System Overlay Consumer Audit

- Prüfen, welche Overlays noch altes `op:sound_system` WebSocket brauchen.
- Bus-kompatible Overlay-Strategie planen.
- Noch keine Produktivumstellung.

### Option B – Dashboard-Anzeige

- SoundBus-Status im Dashboard anzeigen.
- Queue-/Bundle-/Discord-Failures sichtbar machen.
- Keine direkte DB-/Datei-Zugriffe, nur Backend-API.

### Option C – Alert/Sound Event-Korrelation

- Alert-EventUid, BundleId und SoundBus EventId besser korrelieren.
- Ziel: spätere Diagnose bei Sound ja / Overlay nein / Discord nein.

## Nicht ändern ohne neuen Testplan

- keine Sound-Queue-Logik
- keine Bundle-/`activeBundleLock`-Logik
- keine Alert-Output-Modi
- keine Caller-Module direkt auf Bus umbauen
- keine DB-Migration ohne vorherigen Plan

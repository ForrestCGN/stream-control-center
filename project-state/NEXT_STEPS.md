# Next Steps

Stand: 2026-05-24T14:30:00Z

## STEP295 – SoundBus Betriebsentscheidung / nächster Migrationsblock

Ausgangslage:

- STEP289/289B/290/291 SoundBus-Basistests und Regression bestanden.
- STEP293 Discord Media Path Resolver Fix ist in STEP294 bestätigt.
- `discordFailed = 0` im Retest.
- SoundBus/Queue/Bundle bleiben stabil.

## Entscheidungspunkt

Vor dem nächsten Umbau festlegen:

```text
soundBus.enabled = true dauerhaft für Test-/Dev-Betrieb aktiv lassen
oder
soundBus.enabled = false setzen und nur bei gezielten Tests aktivieren
```

Empfehlung: Für weitere Bus-Arbeiten `soundBus.enabled = true` aktiv lassen, solange die Umgebung Dev/Test ist und die Communication Debug View genutzt wird.

## Mögliche nächste technische Blöcke

### Option A – SoundBus Debug/Monitoring

- Debug View um SoundBus-Filter/Anzeige erweitern.
- Events `sound.*` übersichtlich anzeigen.
- Fehler-/Skipped-/LastAction-Anzeige verbessern.

### Option B – Sound-System Overlay Consumer Audit

- Prüfen, welche Overlays noch altes `op:sound_system` WebSocket brauchen.
- Bus-kompatible Overlay-Strategie planen.
- Noch keine Produktivumstellung.

### Option C – Dashboard-Anzeige

- SoundBus-Status im Dashboard anzeigen.
- Queue-/Bundle-/Discord-Failures sichtbar machen.
- Keine direkte DB-/Datei-Zugriffe, nur Backend-API.

## Nicht ändern ohne neuen Testplan

- keine Sound-Queue-Logik
- keine Bundle-/`activeBundleLock`-Logik
- keine Alert-Output-Modi
- keine Caller-Module direkt auf Bus umbauen
- keine DB-Migration ohne vorherigen Plan

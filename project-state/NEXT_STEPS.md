# Next Steps

Stand: 2026-05-24T14:40:00Z

## Aktueller Stand nach STEP297

- `soundBus.enabled = true` bleibt im Dev-/Testbetrieb aktiv.
- SoundBus Basistests bestanden.
- V5 Queue/Bundle Regression bestanden.
- Discord Media Resolver Fix bestätigt.
- SoundBus Debug View vorhanden und getestet.
- Doppelt sichtbares `sound.finished` ist dokumentiert und aktuell kein Playback-/Queue-Fehler.

## STEP298 – SoundBus Consumer-/Dashboard-Planung

Ziel: Gezielt entscheiden, welcher nächste Block umgesetzt wird, bevor weitere Codeänderungen erfolgen.

Optionen:

### Option A – Dashboard-Anzeige

- SoundBus-Status im Dashboard anzeigen.
- `soundBus.stats`, Queue, Current, Bundle Lock, Device/Discord-Fails sichtbar machen.
- Nur Backend-API nutzen, keine direkten Datei-/SQLite-Zugriffe.

### Option B – Event-Korrelation

- Alert-EventUid, BundleId, Sound requestId und Bus EventId besser zusammenführen.
- Ziel: Diagnose bei „Sound ja / Overlay nein / Discord nein“.

### Option C – Overlay-/Consumer-Audit

- Prüfen, welche Overlays noch altes `op:sound_system` WebSocket brauchen.
- Bus-kompatible Consumer-Strategie planen.
- Keine alte Strecke entfernen.

### Option D – Debug-View UI Cleanup

- `auto_finished` in der View als System-/Lifecycle-Event markieren.
- Optional gruppieren oder weniger prominent darstellen.
- Nur UI-Darstellung, keine Sound-Logik.

## Nicht ändern ohne neuen Testplan

- keine Sound-Queue-Logik
- keine Bundle-/`activeBundleLock`-Logik
- keine Alert-Output-Modi
- keine Caller-Module direkt auf Bus umbauen
- keine alten HTTP/WebSocket-Wege entfernen
- keine DB-Migration ohne vorherigen Plan

# STEP340 – Alert-System Bus Dev-Migration + SoundBus-Korrelation

Stand: 2026-05-24

## Ziel

Alert-System, SoundBundle und SoundBus werden besser korrelierbar, ohne die bestehende Produktivlogik auf Bus-only umzustellen.

## Änderungen

- `alert_system.js` meldet Alert/SoundBundle-Korrelationen im Status.
- Alert-SoundBundles bekommen eine explizite `meta.correlation` mit `alertEventUid`, `bundleId`, `bundleType` und erwarteten Rollen.
- `sound_system.js` liefert im SoundBus-Status eine aggregierte `correlation` aus den letzten SoundBus-Events.
- Das Sound-Dashboard zeigt im Bus-Monitor zusätzlich `Alert/SoundBus-Korrelation`.

## Nicht geändert

- keine Sound-Queue-Logik
- keine Bundle-/activeBundleLock-Logik
- keine Playback-Logik
- keine Alert-Bus-only-Umstellung
- Legacy-Alert-Ausgabe bleibt Standard/Fallback
- keine DB-Migration

## Erwarteter Test

1. Backend neu starten.
2. V5 Real-Mod-Test ausführen.
3. `/api/sound/status` prüfen: `step=340`, `soundBus.errors=0`, `queuedCount=0`, `activeBundleLock=null`.
4. Dashboard: `System → Sound-System → Bus-Monitor` öffnen.
5. Im Abschnitt `Alert/SoundBus-Korrelation` sollten Alert-Bundles mit Rollen `main` und `tts` sichtbar sein.

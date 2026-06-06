# CURRENT CHAT HANDOFF – VIP30 STEP8.18.1 Auto Sound Duration

Stand: 2026-06-06

## Ergebnis

VIP30 gibt bei SoundPool-Sounds nicht mehr pauschal `durationMs: 9000` an. Dadurch kann das Sound-System die echte Dauer aus dem Media-System/ffprobe verwenden.

## Problem

Einige Sounds wirkten abgehackt, weil VIP30 im Sound-Bundle bisher fest `durationMs: 9000` übergeben hat.

## Fix

Neue Version:

```txt
moduleVersion: 0.8.13
moduleBuild: step8.18.1-auto-sound-duration
```

### Backend

Bei `alerts.soundPool` gilt jetzt:

```txt
durationMs > 0  -> manuelle Dauer verwenden
durationMs = 0  -> keine explizite Dauer ans Sound-System senden
                  Sound-System ermittelt Dauer aus Media-System/ffprobe
```

### Dashboard

Im Tab `Sounds` gibt es pro Sound ein Feld:

```txt
Dauer ms
0 = Auto
```

## Wichtig

Für normale Media-System-Sounds sollte `Dauer ms` auf `0` bleiben.

Nur wenn eine Datei falsche Metadaten hat, kann dort manuell überschrieben werden.

## Test

```txt
Sounds -> Dauer ms = 0
Aktionen -> VIP30 Alert testen
```

Erwartung:

```txt
Sound läuft vollständig
Overlay verschwindet erst beim Audio-Ende
Dashboard-Meldung: Dauer: Media-System Auto
```

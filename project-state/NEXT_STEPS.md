# Next Steps

## Sicherer Stand nach STEP291

- Alert-Visual-Migration ist vorbereitet und getestet.
- Alert-Standard bleibt `alertOutput.mode = legacy`.
- `legacy`, `legacy_and_bus` und `bus_first` wurden live bestätigt.
- `bus_only` ist vorbereitet, aber nicht als Produktiv-/Normalmodus freigegeben.
- Sound-System besitzt einen additiven Bus-Event-Ausgang.
- `/api/sound/status` enthält sichtbaren Top-Level-Block `soundBus`.
- SoundBus-Basistests sind bestanden.
- SoundBus V5 Queue-/Bundle-Regression ist bestanden mit Discord-Warnung.
- Sound-System bleibt Master für Audio/Media, Queue, Bundles und Ausgabe.

## Wichtigster offener Punkt

### STEP292 – Discord Media Path/Routing Audit

Im STEP291-Test gab es:

```text
discordFailed = 3
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

Ziel von STEP292:

- Prüfen, wie Discord-Routing Dateien auflöst.
- Media-Registry-Pfade `media/alerts/...` für Discord korrekt behandeln.
- Kein Umbau der Queue-/Bundle-Logik.
- Kein Umbau des SoundBus, solange nicht zwingend.
- Keine Caller-Module ändern, bevor der Pfad-Resolver verstanden ist.

## Danach

Nach STEP292:

1. entscheiden, ob `soundBus.enabled = true` im längeren Testbetrieb bleiben darf,
2. Debug View/Dashboard um SoundBus-Status ergänzen,
3. Module stufenweise busfähig machen, ohne direkte Audio-Kontrolle aus dem Sound-System herauszulösen.

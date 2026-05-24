# Next Steps

## Sicherer Stand nach STEP289

- Alert-Visual-Migration ist vorbereitet und getestet.
- Alert-Standard bleibt `alertOutput.mode = legacy`.
- `legacy`, `legacy_and_bus` und `bus_first` wurden live bestätigt.
- `bus_only` ist vorbereitet, aber nicht als Produktiv-/Normalmodus freigegeben.
- Sound-System besitzt jetzt einen additiven Bus-Event-Ausgang.
- Sound-System bleibt Master für Audio/Media, Queue, Bundles und Ausgabe.
- `soundBus.enabled` ist standardmäßig `false`.

## STEP289 Minimaltests

1. Backend starten.
2. `/api/sound/status` prüfen:
   - `step = 289`
   - `soundBus.enabled = false`
   - `soundBus.communicationBusAvailable = true`
3. Test-Ping im Default prüfen, Sound-Verhalten muss unverändert bleiben.
4. `soundBus.enabled` über `/api/sound/settings` aktivieren.
5. Test-Ping erneut auslösen.
6. Prüfen:
   - `soundBus.stats.emitted` steigt.
   - `soundBus.stats.errors = 0`.
   - `soundBus.stats.lastAction` passt zum letzten Event.
7. Alert-Bundle-Test ausführen:
   - Hauptsound + Alert-TTS bleiben zusammen.
   - `activeBundleLock` bleibt stabil.
   - keine fremden Sounds zwischen Hauptsound und TTS.
8. V5-Real-Mod-Test erneut ausführen.

## SoundBus testweise aktivieren

POST auf `/api/sound/settings` mit:

```json
{
  "settings": {
    "soundBus": {
      "enabled": true
    }
  }
}
```

Zurück auf sicheren Standard:

```json
{
  "settings": {
    "soundBus": {
      "enabled": false
    }
  }
}
```

## Danach

- Communication Debug View/Dashboard um Sound-Bus-Events erweitern.
- Sound-Bus-Events im Debug View gruppieren: Queue, Items, Bundles, Device, Discord, Client.
- Module dürfen Bus-Status lesen, aber noch nicht direkt Sounds per Bus auslösen.
- Optional später Bus-Input `sound.play`, der intern dieselbe Sound-System-Queue nutzt.
- Module erst danach stufenweise migrieren.

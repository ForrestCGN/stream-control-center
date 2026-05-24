# Next Steps

## Sicherer Stand nach STEP290

- Alert-Visual-Migration ist vorbereitet und getestet.
- Alert-Standard bleibt `alertOutput.mode = legacy`.
- `legacy`, `legacy_and_bus` und `bus_first` wurden live bestätigt.
- `bus_only` ist vorbereitet, aber nicht als Produktiv-/Normalmodus freigegeben.
- Sound-System besitzt einen additiven Bus-Event-Ausgang.
- `/api/sound/status` enthält sichtbaren Top-Level-Block `soundBus`.
- SoundBus-Basistests sind bestanden:
  - Status-Fix bestätigt.
  - Aktivierung über `/api/sound/settings` bestätigt.
  - `test_ping` bestätigt.
  - Alert-Bundle mit Hauptsound + TTS bestätigt.
- Sound-System bleibt Master für Audio/Media, Queue, Bundles und Ausgabe.

## Wichtiger Hinweis zu soundBus.enabled

Der sichere Config-Default bleibt `soundBus.enabled = false`.

Nach Tests muss bewusst entschieden werden, ob `soundBus.enabled` testweise aktiv bleiben soll oder wieder auf `false` gesetzt wird.

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

## STEP291 – SoundBus V5 Real Queue/Bundle Regression Test

Ziel:

- SoundBus aktiviert lassen.
- V5-Real-Mod-Test ausführen:
  - `tools/easy/05_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd`
- Prüfen, ob die bekannte stabile Reihenfolge aus STEP268C weiterhin erhalten bleibt.

Zu prüfen:

- Alert-Hauptsound + passende Alert-TTS bleiben zusammen.
- Kein SoundAlert, Mod-Sound oder normales TTS rutscht zwischen Alert-Hauptsound und passende Alert-TTS.
- `activeBundleLock` wird gesetzt und wieder sauber gelöst.
- Queue am Ende leer.
- `soundBus.stats.errors = 0`.
- Device-/Discord-Fehler bleiben `0`.
- Alert Watchdog bleibt `acknowledged`.

## Danach

Wenn STEP291 bestanden ist:

1. Communication Debug View/Dashboard um Sound-Bus-Events erweitern.
2. Sound-Bus-Events gruppieren: Queue, Items, Bundles, Device, Discord, Client.
3. Module dürfen Bus-Status lesen, aber noch nicht direkt Sounds per Bus auslösen.
4. Optional später Bus-Input `sound.play`, der intern dieselbe Sound-System-Queue nutzt.
5. Module erst danach stufenweise migrieren.

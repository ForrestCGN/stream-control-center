# STEP200.7 Status-Notiz – test_ping / Sound-Presets

Stand: 2026-05-08

## Ergebnis

`test_ping` bleibt vorerst in `config/sound_system.json`.

Begründung:

```text
technisches Diagnose-/Seed-Preset
keine Dateiabhängigkeit
generated_beep
wird über /api/sound/list sichtbar
kann per soundId vom Dashboard abgespielt werden
kein fachlicher Hartbezug in Alert/TTS/SoundAlerts gefunden
```

## Regel

```text
test_ping nicht blind entfernen.
sounds[] in JSON nicht als wachsende Hauptverwaltung missbrauchen.
Langfristig Sound-Presets als Seed/DB-Konzept planen.
```

## Nächster Schritt

```text
STEP200.8 – globaler Installer-/Seed-Plan
```
